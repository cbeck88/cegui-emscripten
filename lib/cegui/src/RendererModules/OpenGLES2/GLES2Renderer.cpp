/***********************************************************************
    created:    Wed, 8th Feb 2012
    author:     Lukas E Meindl (based on code by Paul D Turner)
*************************************************************************/
/***************************************************************************
 *   Copyright (C) 2004 - 2012 Paul D Turner & The CEGUI Development Team
 *
 *   Permission is hereby granted, free of charge, to any person obtaining
 *   a copy of this software and associated documentation files (the
 *   "Software"), to deal in the Software without restriction, including
 *   without limitation the rights to use, copy, modify, merge, publish,
 *   distribute, sublicense, and/or sell copies of the Software, and to
 *   permit persons to whom the Software is furnished to do so, subject to
 *   the following conditions:
 *
 *   The above copyright notice and this permission notice shall be
 *   included in all copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 *   EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 *   MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 *   IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 *   OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 *   ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 *   OTHER DEALINGS IN THE SOFTWARE.
 ***************************************************************************/

#include "GLES2_headers.hpp"

#include "CEGUI/RendererModules/OpenGLES2/ShaderManager.h"
#include "CEGUI/RendererModules/OpenGLES2/GLES2Renderer.h"
#include "CEGUI/RendererModules/OpenGLES2/Texture.h"
#include "CEGUI/RendererModules/OpenGLES2/Shader.h"
#include "CEGUI/Exceptions.h"
#include "CEGUI/ImageCodec.h"
#include "CEGUI/DynamicModule.h"
#include "CEGUI/RendererModules/OpenGLES2/ViewportTarget.h"
#include "CEGUI/RendererModules/OpenGLES2/GLES2GeometryBuffer.h"
#include "CEGUI/GUIContext.h"
#include "CEGUI/RendererModules/OpenGLES2/FBOTextureTarget.h"
#include "CEGUI/System.h"
#include "CEGUI/DefaultResourceProvider.h"
#include "CEGUI/Logger.h"
#include "CEGUI/RendererModules/OpenGLES2/StateChangeWrapper.h"

#include <sstream>
#include <algorithm>
#include <cstring>

// Start of CEGUI namespace section
namespace CEGUI
{
//----------------------------------------------------------------------------//
// The following are some GL extension / version dependant related items.
// This is all done totally internally here; no need for external interface
// to show any of this.
//----------------------------------------------------------------------------//
// we only really need this with MSVC / Windows(?) and by now it should already
// be defined on that platform, so we just define it as empty macro so the
// compile does not break on other systems.
#ifndef APIENTRY
#   define APIENTRY
#endif
//! Dummy function for if real ones are not present (saves testing each render)
static void APIENTRY activeTextureDummy(GLenum) {}

//----------------------------------------------------------------------------//
// template specialised class that does the real work for us
template<typename T>
class OGLTemplateTargetFactory : public OGLTextureTargetFactory
{
    TextureTarget* create(OpenGLRendererBase& r) const
        { return CEGUI_NEW_AO T(static_cast<OpenGLES2Renderer&>(r)); }
};

//----------------------------------------------------------------------------//
OpenGLES2Renderer& OpenGLES2Renderer::bootstrapSystem(const int abi)
{
    System::performVersionTest(CEGUI_VERSION_ABI, abi, CEGUI_FUNCTION_NAME);

    if (System::getSingletonPtr())
        CEGUI_THROW(InvalidRequestException(
            "CEGUI::System object is already initialised."));

    OpenGLES2Renderer& renderer(create());
    DefaultResourceProvider* rp = CEGUI_NEW_AO CEGUI::DefaultResourceProvider();
    System::create(renderer, rp);

    return renderer;
}

//----------------------------------------------------------------------------//
OpenGLES2Renderer& OpenGLES2Renderer::bootstrapSystem(const Sizef& display_size,
                                                  const int abi)
{
    System::performVersionTest(CEGUI_VERSION_ABI, abi, CEGUI_FUNCTION_NAME);

    if (System::getSingletonPtr())
        CEGUI_THROW(InvalidRequestException(
            "CEGUI::System object is already initialised."));

    OpenGLES2Renderer& renderer(create(display_size));
    DefaultResourceProvider* rp = CEGUI_NEW_AO CEGUI::DefaultResourceProvider();
    System::create(renderer, rp);

    return renderer;
}

//----------------------------------------------------------------------------//
void OpenGLES2Renderer::destroySystem()
{
    System* sys;
    if (!(sys = System::getSingletonPtr()))
        CEGUI_THROW(InvalidRequestException(
            "CEGUI::System object is not created or was already destroyed."));

    OpenGLES2Renderer* renderer = static_cast<OpenGLES2Renderer*>(sys->getRenderer());
    DefaultResourceProvider* rp =
        static_cast<DefaultResourceProvider*>(sys->getResourceProvider());

    System::destroy();
    CEGUI_DELETE_AO rp;
    destroy(*renderer);
}

//----------------------------------------------------------------------------//
OpenGLES2Renderer& OpenGLES2Renderer::create(const int abi)
{
    System::performVersionTest(CEGUI_VERSION_ABI, abi, CEGUI_FUNCTION_NAME);

    return *CEGUI_NEW_AO OpenGLES2Renderer();
}

//----------------------------------------------------------------------------//
OpenGLES2Renderer& OpenGLES2Renderer::create(const Sizef& display_size,
                                         const int abi)
{
    System::performVersionTest(CEGUI_VERSION_ABI, abi, CEGUI_FUNCTION_NAME);

    return *CEGUI_NEW_AO OpenGLES2Renderer(display_size);
}

//----------------------------------------------------------------------------//
void OpenGLES2Renderer::destroy(OpenGLES2Renderer& renderer)
{
    CEGUI_DELETE_AO &renderer;
}

//----------------------------------------------------------------------------//
OpenGLES2Renderer::OpenGLES2Renderer() :
    d_shaderStandard(0),
    d_openGLStateChanger(0),
    d_shaderManager(0)
{
    initialiseRendererIDString();
    initialiseGLExtensions();
    initialiseTextureTargetFactory();
    initialiseOpenGLShaders();

    d_openGLStateChanger = CEGUI_NEW_AO OpenGL3StateChangeWrapper();
}

//----------------------------------------------------------------------------//
OpenGLES2Renderer::OpenGLES2Renderer(const Sizef& display_size) :
    OpenGLRendererBase(display_size),
    d_shaderStandard(0),
    d_openGLStateChanger(0),
    d_shaderManager(0)
{
    initialiseRendererIDString();
    initialiseGLExtensions();
    initialiseTextureTargetFactory();
    initialiseOpenGLShaders();

    d_openGLStateChanger = CEGUI_NEW_AO OpenGL3StateChangeWrapper();
}

//----------------------------------------------------------------------------//
OpenGLES2Renderer::~OpenGLES2Renderer()
{
    CEGUI_DELETE_AO d_textureTargetFactory;
    CEGUI_DELETE_AO d_openGLStateChanger;
    CEGUI_DELETE_AO d_shaderManager;
}

//----------------------------------------------------------------------------//
void OpenGLES2Renderer::initialiseRendererIDString()
{
    d_rendererID = 
        "CEGUI::OpenGLES2Renderer - Official OpenGLES2 / WebGL based "
        "renderer module.";
}
//----------------------------------------------------------------------------//
OpenGLGeometryBufferBase* OpenGLES2Renderer::createGeometryBuffer_impl()
{
    return CEGUI_NEW_AO OpenGLES2GeometryBuffer(*this);
}

//----------------------------------------------------------------------------//
TextureTarget* OpenGLES2Renderer::createTextureTarget_impl()
{
    return d_textureTargetFactory->create(*this);
}

//----------------------------------------------------------------------------//
void OpenGLES2Renderer::beginRendering()
{
    // do required set-up.  yes, it really is this minimal ;)
    glEnable(GL_SCISSOR_TEST);
    glEnable(GL_BLEND);

    // force set blending ops to get to a known state.
    setupRenderingBlendMode(BM_NORMAL, true);

    // if enabled, restores a subset of the GL state back to default values.
    if (d_initExtraStates)
        setupExtraStates();

    d_shaderStandard->bind();

    d_openGLStateChanger->reset();
}

//----------------------------------------------------------------------------//
void OpenGLES2Renderer::endRendering()
{
    d_shaderStandard->unbind();
}

//----------------------------------------------------------------------------//
void OpenGLES2Renderer::setupExtraStates()
{
    glActiveTexture(GL_TEXTURE0);

//  This is unnecessary c.f. http://stackoverflow.com/questions/4627770/any-glpolygonmode-alternative-on-iphone-opengl-es
//    glPolygonMode(GL_FRONT_AND_BACK, GL_FILL);

    glDisable(GL_CULL_FACE);
    glDisable(GL_DEPTH_TEST);

    glUseProgram(0);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
}

//----------------------------------------------------------------------------//
void OpenGLES2Renderer::initialiseTextureTargetFactory()
{
    //Use OGL core implementation for FBOs
    d_rendererID += "  TextureTarget support enabled via FBO OpenGLES2 implementation.";
    d_textureTargetFactory = CEGUI_NEW_AO OGLTemplateTargetFactory<OpenGLES2FBOTextureTarget>;
}

//----------------------------------------------------------------------------//
void OpenGLES2Renderer::setupRenderingBlendMode(const BlendMode mode,
                                             const bool force)
{
    // exit if mode is already set up (and update not forced)
    if ((d_activeBlendMode == mode) && !force)
        return;

    d_activeBlendMode = mode;

    if (d_activeBlendMode == BM_RTT_PREMULTIPLIED)
    {
        glBlendFunc(GL_ONE, GL_ONE_MINUS_SRC_ALPHA);
    }
    else
    {
        glBlendFuncSeparate(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA, GL_ONE_MINUS_DST_ALPHA, GL_ONE);
    }
}

//----------------------------------------------------------------------------//
Sizef OpenGLES2Renderer::getAdjustedTextureSize(const Sizef& sz) const
{
    return Sizef(sz);
}

//----------------------------------------------------------------------------//
OpenGLES2Shader*& OpenGLES2Renderer::getShaderStandard()
{
    return d_shaderStandard;
}

//----------------------------------------------------------------------------//
GLint OpenGLES2Renderer::getShaderStandardPositionLoc()
{
    return d_shaderStandardPosLoc;
}

//----------------------------------------------------------------------------//
GLint OpenGLES2Renderer::getShaderStandardTexCoordLoc()
{
    return d_shaderStandardTexCoordLoc;
}

//----------------------------------------------------------------------------//
GLint OpenGLES2Renderer::getShaderStandardColourLoc()
{
    return d_shaderStandardColourLoc;
}

//----------------------------------------------------------------------------//
GLint OpenGLES2Renderer::getShaderStandardMatrixUniformLoc()
{
    return d_shaderStandardMatrixLoc;
}

//----------------------------------------------------------------------------//
OpenGL3StateChangeWrapper* OpenGLES2Renderer::getOpenGLStateChanger()
{
    return d_openGLStateChanger;
}

//----------------------------------------------------------------------------//
void OpenGLES2Renderer::initialiseOpenGLShaders()
{
    checkGLErrors();
    d_shaderManager = CEGUI_NEW_AO OpenGLES2ShaderManager();
    d_shaderManager->initialiseShaders();
    d_shaderStandard = d_shaderManager->getShader(SHADER_ID_STANDARDSHADER);
    GLuint texLoc = d_shaderStandard->getUniformLocation("texture0");
    d_shaderStandard->bind();
    glUniform1i(texLoc, 0);
    d_shaderStandard->unbind();

    d_shaderStandardPosLoc = d_shaderStandard->getAttribLocation("inPosition");
    d_shaderStandardTexCoordLoc = d_shaderStandard->getAttribLocation("inTexCoord");
    d_shaderStandardColourLoc = d_shaderStandard->getAttribLocation("inColour");

    d_shaderStandardMatrixLoc = d_shaderStandard->getUniformLocation("modelViewPerspMatrix");
}

//----------------------------------------------------------------------------//
void OpenGLES2Renderer::initialiseGLExtensions()
{
	// TODO: Figure out how to make any of this work with GLES2 :/
/*    glewExperimental = GL_TRUE;

    GLenum err = glewInit();
    if(err != GLEW_OK)
    {
        std::ostringstream err_string;
        //Problem: glewInit failed, something is seriously wrong.
        err_string << "failed to initialise the GLEW library. "
            << glewGetErrorString(err);

        CEGUI_THROW(RendererException(err_string.str().c_str()));
    }
    //Clear the useless error glew produces as of version 1.7.0, when using OGLES2.2 Core Profile
    glGetError();*/

/*
    // Assume we don't have this extension
    // Why do we do this and not use GLEW_EXT_texture_compression_s3tc?
    // Because of glewExperimental, of course!
    int ext_count;
    glGetIntegerv(GL_NUM_EXTENSIONS, &ext_count);
    for(int i = 0; i < ext_count; ++i)
    { // NOTE: In release this was glGetStringi
        if (const char * ext_str = reinterpret_cast<const char*>(glGetString(GL_EXTENSIONS, i)))
        {
            if (!std::strcmp(ext_str, "GL_EXT_texture_compression_s3tc"))
            {
                d_s3tcSupported = true;
                break;
            }
        } else {
		assert(false && "glGetString returned a null string, this indicates a library problem (not originally handled in CEGUI release)");
	}
    }*/
}

//----------------------------------------------------------------------------//
bool OpenGLES2Renderer::isS3TCSupported() const
{
    return false; //d_s3tcSupported;
}

//----------------------------------------------------------------------------//

} // End of  CEGUI namespace section
