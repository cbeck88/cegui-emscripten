/***********************************************************************
created:    12/2/2012
author:     Paul D Turner
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
#if defined(__linux__) || defined(__FreeBSD__) || defined(__NetBSD__) || defined(__HAIKU__)
# include <unistd.h>
#endif

#include <SDL2/SDL.h>
#include <GLES2/gl2.h>

#ifdef EMSCRIPTEN
#include <emscripten/emscripten.h>
#endif

#include <iostream>

#include "CEGUI/RendererModules/OpenGLES2/GLES2Renderer.h"


#include "CEGUISamplesConfig.h"
#include "CEGuiGLES2BaseApplication.h"
#include "SamplesFrameworkBase.h"
#include "CEGUI/CEGUI.h"

#include <stdexcept>
#include <sstream>

#ifdef USE_HUMBLE_API
#include "humble_api.h"
#endif

//----------------------------------------------------------------------------//
CEGuiGLES2BaseApplication* CEGuiGLES2BaseApplication::d_appInstance = 0;
double  CEGuiGLES2BaseApplication::d_frameTime = 0;
int CEGuiGLES2BaseApplication::d_modifiers = 0;
bool CEGuiGLES2BaseApplication::d_windowSized = false;
int CEGuiGLES2BaseApplication::d_newWindowWidth = CEGuiGLES2BaseApplication::s_defaultWindowWidth;
int CEGuiGLES2BaseApplication::d_newWindowHeight = CEGuiGLES2BaseApplication::s_defaultWindowWidth;
bool CEGuiGLES2BaseApplication::d_mouseLeftWindow = false;
bool CEGuiGLES2BaseApplication::d_mouseDisableCalled = false;
int CEGuiGLES2BaseApplication::d_oldMousePosX = 0;
int CEGuiGLES2BaseApplication::d_oldMousePosY = 0;

#define enum_case(str)\
	case str:\
	std::cerr << SDL_GetTicks() << "--" << file << ", " << line << ": " #str "\n";\
	break;

void gl_error_check(const std::string & file, int line)
{
	GLenum err = glGetError();

	switch (err) {
		enum_case(GL_INVALID_ENUM)
		enum_case(GL_INVALID_VALUE)
		enum_case(GL_INVALID_OPERATION)
		enum_case(GL_INVALID_FRAMEBUFFER_OPERATION)
		enum_case(GL_OUT_OF_MEMORY)
		default:
			break;
	}
}

#define GL_ERR_CHECK \
do {\
gl_error_check(__FILE__, __LINE__); \
} while(0)


#define GET_GL_VAL( str ) \
do {\
if (SDL_GL_GetAttribute( str, &val )) { \
	GL_ERR_CHECK; \
} \
} while(0)

struct SDL_graphics {
	int width_;
	int height_;
	SDL_Window * window_;
	SDL_Renderer * renderer_;

	SDL_graphics(int width, int height)
		: width_(width)
		, height_(height)
		, window_(nullptr)
	{

		SDL_GL_SetAttribute( SDL_GL_RED_SIZE, 8 );
		SDL_GL_SetAttribute( SDL_GL_GREEN_SIZE, 8 );
		SDL_GL_SetAttribute( SDL_GL_BLUE_SIZE, 8 );
		SDL_GL_SetAttribute( SDL_GL_ALPHA_SIZE, 8 );
		SDL_GL_SetAttribute( SDL_GL_DEPTH_SIZE, 16 );
		SDL_GL_SetAttribute( SDL_GL_DOUBLEBUFFER, 1 );
		// Request 4 bytes per pixel worth of color info, and at least 16 bits of depth buffer, and double buffer.

		SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_ES);
		SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 2); 
		// Probably not necessary but can't hurt

		SDL_CreateWindowAndRenderer(width, height, SDL_WINDOW_OPENGL | SDL_WINDOW_RESIZABLE | SDL_WINDOW_ALLOW_HIGHDPI, &window_, &renderer_);

		if (window_ == nullptr) {
			fprintf(stderr, "Could not create SDL window...\n%s\n", SDL_GetError());
			throw 42;
		}

		int val = 0;

		fprintf(stderr, "Created SDL GL context:\n");
			GET_GL_VAL( SDL_GL_RED_SIZE );
		fprintf(stderr, " Red   Size    = %d\n", val);
			GET_GL_VAL( SDL_GL_BLUE_SIZE );
		fprintf(stderr, " Blue  Size    = %d\n", val);
			GET_GL_VAL( SDL_GL_GREEN_SIZE );
		fprintf(stderr, " Green Size    = %d\n", val);
			GET_GL_VAL( SDL_GL_ALPHA_SIZE );
		fprintf(stderr, " Alpha Size    = %d\n", val);
			GET_GL_VAL( SDL_GL_DEPTH_SIZE );
		fprintf(stderr, " Depth Size    = %d\n", val);
			GET_GL_VAL( SDL_GL_DOUBLEBUFFER );
		fprintf(stderr, " Double Buffer = %d\n", val);

		int w, h;
		SDL_GetWindowSize(window_, &w, &h);		

		if (w != width || h != height) {
			fprintf(stderr, "Warning: Tried to make a window of dimensions %d x %d, but got a window of dimensions %d x %d.\n", width, height, w, h);
		}

		SDL_ShowCursor(0);
	}

	~SDL_graphics() {
		SDL_DestroyRenderer(renderer_);
		SDL_DestroyWindow(window_);
	}
};

SDL_graphics * CEGuiGLES2BaseApplication::d_SDL_Graphics = nullptr;

//----------------------------------------------------------------------------//
CEGuiGLES2BaseApplication::CEGuiGLES2BaseApplication()
{
	if (d_appInstance)
		throw CEGUI::InvalidRequestException(
		"CEGuiGLES2BaseApplication instance already exists!");

#ifdef USE_HUMBLE_API
	humble_init();
#endif

	SDL_Init(SDL_INIT_VIDEO);

	int width = 800, height = 600;
#ifdef USE_HUMBLE_API
	if (humble_get_player_size(&width, &height) == 0) {
		width = 800;
		height = 600;
	}
#endif
	d_SDL_Graphics = new SDL_graphics(width, height);

	CEGUI::OpenGLES2Renderer * r = &CEGUI::OpenGLES2Renderer::create();
	r->enableExtraStateSettings(true);
	d_renderer = r;

	d_appInstance = this;
}

//----------------------------------------------------------------------------//
CEGuiGLES2BaseApplication::~CEGuiGLES2BaseApplication()
{
	CEGUI::OpenGLES2Renderer::destroy(static_cast<CEGUI::OpenGLES2Renderer&>(*d_renderer));
}

void CEGuiGLES2BaseApplication::destroyWindow()
{
	delete d_SDL_Graphics;
}

namespace {

void loop_iteration(CEGuiGLES2BaseApplication * app) {
	app->main_loop_body();
}

} // end anonymous namespace

void CEGuiGLES2BaseApplication::main_loop_body() {
	if (d_sampleApp->isQuitting()) {
		d_quitting = true;
		return;
	}
	if (d_windowSized)
	{
		d_windowSized = false;
		CEGUI::System::getSingleton().notifyDisplaySizeChanged(CEGUI::Sizef(static_cast<float>(d_newWindowWidth), static_cast<float>(d_newWindowHeight)));
		glViewport(0, 0, d_newWindowWidth, d_newWindowHeight);
	}

	SDL_Event event;
	while (SDL_PollEvent(&event)) {
		process_SDL_event(event, &d_quitting);
	}

        drawFrame();

}

//----------------------------------------------------------------------------//
void CEGuiGLES2BaseApplication::run()
{
	d_sampleApp->initialise();

	d_windowSized = false; //The resize callback is being called immediately after setting it in this version of glfw
	glClearColor(0.0f, 0.0f, 0.0f, 0.0f);

	// set starting time
	d_frameTime = static_cast<float>(SDL_GetTicks())/ 1000.f;


#ifdef EMSCRIPTEN
	emscripten_set_main_loop_arg((em_arg_callback_func)loop_iteration, this, 0, 1);
#else
	while (!d_quitting) {
		loop_iteration(this);
	}

	d_sampleApp->deinitialise();

	SDL_Quit();
#endif
}

//----------------------------------------------------------------------------//
void CEGuiGLES2BaseApplication::beginRendering(const float /*elapsed*/)
{
	glClear(GL_COLOR_BUFFER_BIT);
}

//----------------------------------------------------------------------------//
void CEGuiGLES2BaseApplication::endRendering()
{
	SDL_GL_SwapWindow(d_SDL_Graphics->window_); //->swap_buffers();
}

//----------------------------------------------------------------------------//
void CEGuiGLES2BaseApplication::drawFrame()
{
	// calculate time elapsed since last frame
	double time_now = static_cast<double>(SDL_GetTicks()) / 1000.f;
	const double elapsed = time_now - d_frameTime;
	d_frameTime = time_now;

	d_appInstance->renderSingleFrame(static_cast<float>(elapsed));
}

CEGUI::Key::Scan CEGuiGLES2BaseApplication::SDLtoCEGUIKey(SDL_Scancode key)
{
	switch (key) {
	case SDL_SCANCODE_ESCAPE:
		return CEGUI::Key::Escape;
	case SDL_SCANCODE_F1:
		return CEGUI::Key::F1;
	case SDL_SCANCODE_F2:
		return CEGUI::Key::F2;
	case SDL_SCANCODE_F3:
		return CEGUI::Key::F3;
	case SDL_SCANCODE_F4:
		return CEGUI::Key::F4;
	case SDL_SCANCODE_F5:
		return CEGUI::Key::F5;
	case SDL_SCANCODE_F6:
		return CEGUI::Key::F6;
	case SDL_SCANCODE_F7:
		return CEGUI::Key::F7;
	case SDL_SCANCODE_F8:
		return CEGUI::Key::F8;
	case SDL_SCANCODE_F9:
		return CEGUI::Key::F9;
	case SDL_SCANCODE_F10:
		return CEGUI::Key::F10;
	case SDL_SCANCODE_F11:
		return CEGUI::Key::F11;
	case SDL_SCANCODE_F12:
		return CEGUI::Key::F12;
	case SDL_SCANCODE_F13:
		return CEGUI::Key::F13;
	case SDL_SCANCODE_F14:
		return CEGUI::Key::F14;
	case SDL_SCANCODE_F15:
		return CEGUI::Key::F15;
	case SDL_SCANCODE_UP:
		return CEGUI::Key::ArrowUp;
	case SDL_SCANCODE_DOWN:
		return CEGUI::Key::ArrowDown;
	case SDL_SCANCODE_LEFT:
		return CEGUI::Key::ArrowLeft;
	case SDL_SCANCODE_RIGHT:
		return CEGUI::Key::ArrowRight;
	case SDL_SCANCODE_LSHIFT:
		return CEGUI::Key::LeftShift;
	case SDL_SCANCODE_RSHIFT:
		return CEGUI::Key::RightShift;
	case SDL_SCANCODE_LCTRL:
		return CEGUI::Key::LeftControl;
	case SDL_SCANCODE_RCTRL:
		return CEGUI::Key::RightControl;
	case SDL_SCANCODE_LALT:
		return CEGUI::Key::LeftAlt;
	case SDL_SCANCODE_RALT:
		return CEGUI::Key::RightAlt;
	case SDL_SCANCODE_TAB:
		return CEGUI::Key::Tab;
	case SDL_SCANCODE_RETURN:
		return CEGUI::Key::Return;
	case SDL_SCANCODE_BACKSPACE:
		return CEGUI::Key::Backspace;
	case SDL_SCANCODE_INSERT:
		return CEGUI::Key::Insert;
	case SDL_SCANCODE_DELETE:
		return CEGUI::Key::Delete;
	case SDL_SCANCODE_PAGEUP:
		return CEGUI::Key::PageUp;
	case SDL_SCANCODE_PAGEDOWN:
		return CEGUI::Key::PageDown;
	case SDL_SCANCODE_HOME:
		return CEGUI::Key::Home;
	case SDL_SCANCODE_END:
		return CEGUI::Key::End;
	case SDL_SCANCODE_KP_ENTER:
		return CEGUI::Key::NumpadEnter;
	case SDL_SCANCODE_SPACE:
		return CEGUI::Key::Space;
	case SDL_SCANCODE_A:
		return CEGUI::Key::A;
	case SDL_SCANCODE_B:
		return CEGUI::Key::B;
	case SDL_SCANCODE_C:
		return CEGUI::Key::C;
	case SDL_SCANCODE_D:
		return CEGUI::Key::D;
	case SDL_SCANCODE_E:
		return CEGUI::Key::E;
	case SDL_SCANCODE_F:
		return CEGUI::Key::F;
	case SDL_SCANCODE_G:
		return CEGUI::Key::G;
	case SDL_SCANCODE_H:
		return CEGUI::Key::H;
	case SDL_SCANCODE_I:
		return CEGUI::Key::I;
	case SDL_SCANCODE_J:
		return CEGUI::Key::J;
	case SDL_SCANCODE_K:
		return CEGUI::Key::K;
	case SDL_SCANCODE_L:
		return CEGUI::Key::L;
	case SDL_SCANCODE_M:
		return CEGUI::Key::M;
	case SDL_SCANCODE_N:
		return CEGUI::Key::N;
	case SDL_SCANCODE_O:
		return CEGUI::Key::O;
	case SDL_SCANCODE_P:
		return CEGUI::Key::P;
	case SDL_SCANCODE_Q:
		return CEGUI::Key::Q;
	case SDL_SCANCODE_R:
		return CEGUI::Key::R;
	case SDL_SCANCODE_S:
		return CEGUI::Key::S;
	case SDL_SCANCODE_T:
		return CEGUI::Key::T;
	case SDL_SCANCODE_U:
		return CEGUI::Key::U;
	case SDL_SCANCODE_V:
		return CEGUI::Key::V;
	case SDL_SCANCODE_W:
		return CEGUI::Key::W;
	case SDL_SCANCODE_X:
		return CEGUI::Key::X;
	case SDL_SCANCODE_Y:
		return CEGUI::Key::Y;
	case SDL_SCANCODE_Z:
		return CEGUI::Key::Z;
	case SDL_SCANCODE_1:
		return CEGUI::Key::One;
	case SDL_SCANCODE_2:
		return CEGUI::Key::Two;
	case SDL_SCANCODE_3:
		return CEGUI::Key::Three;
	case SDL_SCANCODE_4:
		return CEGUI::Key::Four;
	case SDL_SCANCODE_5:
		return CEGUI::Key::Five;
	case SDL_SCANCODE_6:
		return CEGUI::Key::Six;
	case SDL_SCANCODE_7:
		return CEGUI::Key::Seven;
	case SDL_SCANCODE_8:
		return CEGUI::Key::Eight;
	case SDL_SCANCODE_9:
		return CEGUI::Key::Nine;
	case SDL_SCANCODE_0:
		return CEGUI::Key::Zero;
	default:
		return CEGUI::Key::Unknown;
	}
}

// convert SDL mouse button to CEGUI mouse button
CEGUI::MouseButton CEGuiGLES2BaseApplication::SDLtoCEGUIMouseButton(const Uint8 & button)
{
	using namespace CEGUI;

	switch (button) {
	case SDL_BUTTON_LEFT:
		return LeftButton;

	case SDL_BUTTON_MIDDLE:
		return MiddleButton;

	case SDL_BUTTON_RIGHT:
		return RightButton;

	default:
		return NoButton;
	}
}

void CEGuiGLES2BaseApplication::process_SDL_event(const SDL_Event & event, bool * quit)
{
	using CEGUI::System;
	using CEGUI::GUIContext;

	CEGUI::GUIContext & context = System::getSingleton().getDefaultGUIContext();

	switch (event.type) {
	case SDL_QUIT:
		d_sampleApp->setQuitting(true);
		if (quit) {
			*quit = true;
		}
		break;

	case SDL_MOUSEMOTION: {
	        d_sampleApp->injectMousePosition(static_cast<float>(event.motion.x), static_cast<float>(event.motion.y));
		break;
	}
	case SDL_MOUSEBUTTONDOWN: {
	        d_sampleApp->injectMouseButtonDown(SDLtoCEGUIMouseButton(event.button.button));
		break;
	}
	case SDL_MOUSEBUTTONUP: {
	        d_sampleApp->injectMouseButtonUp(SDLtoCEGUIMouseButton(event.button.button));
		break;
	}
	case SDL_MOUSEWHEEL: {
		d_sampleApp->injectMouseWheelChange(static_cast<float>(event.wheel.y));
/*    static int lastPosition = 0;
    d_sampleApp->injectMouseWheelChange(static_cast<float>(position - lastPosition));
    lastPosition = position;*/
		break;
	}
	case SDL_KEYDOWN: {
		d_sampleApp->injectKeyDown(SDLtoCEGUIKey(event.key.keysym.scancode));
	        d_sampleApp->injectChar(event.key.keysym.sym);
		break;
	}
	case SDL_KEYUP: {
		d_sampleApp->injectKeyUp(SDLtoCEGUIKey(event.key.keysym.scancode));
		break;
	}
	case SDL_WINDOWEVENT: {
		if (event.window.event == SDL_WINDOWEVENT_RESIZED) {
			// We cache this in order to minimise calls to notifyDisplaySizeChanged,
			// which happens in the main loop whenever d_windowSized is set to true.
			d_windowSized = true;
			d_newWindowWidth = event.window.data1;
			d_newWindowHeight = event.window.data2;
		} else {
//			fprintf(stderr, "Time: %d -- Window event Unknown type\n", event.window.timestamp);
		}
		break;
	}
	}
}

//----------------------------------------------------------------------------//

