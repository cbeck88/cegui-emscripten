/***********************************************************************
    created:    24/9/2004
    author:     Paul D Turner
*************************************************************************/
/***************************************************************************
 *   Copyright (C) 2004 - 2008 Paul D Turner & The CEGUI Development Team
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
#include "SamplesFrameworkBase.h"

#ifdef HAVE_CONFIG_H
#   include "config.h"
#endif
#include "CEGUISamplesConfig.h"

// includes for application types
#include "CEGuiGLES2BaseApplication.h"

// now we include the base CEGuiBaseApplication just in case someone has managed to
// get this far without any of the renderers.  This ensures the framework will build,
// although there will be no renderers available for selection in the samples.
#include "CEGuiBaseApplication.h"

#include "CEGUI/CEGUI.h"

// Include iostream if not on windows.
#if defined( __WIN32__ ) || defined( _WIN32 )
#else
#    include <iostream>
#endif


/*************************************************************************
    Constructor
*************************************************************************/
SamplesFrameworkBase::SamplesFrameworkBase() :
        d_baseApp(0),
        d_quitting(false),
        d_appWindowWidth(0),
        d_appWindowHeight(0)
{}


/*************************************************************************
    Destructor
*************************************************************************/
SamplesFrameworkBase::~SamplesFrameworkBase()
{
    if (d_baseApp)
    {
        d_baseApp->cleanup();
        delete d_baseApp;
    }
}


/*************************************************************************
    Application entry point
*************************************************************************/
int SamplesFrameworkBase::run()
{
    CEGUI_TRY
    {
        if(runApplication())
            cleanup();
    }
    CEGUI_CATCH (CEGUI::Exception& exc)
    {
        outputExceptionMessage(exc.getMessage().c_str());
    }
    CEGUI_CATCH (std::exception& exc)
    {
        outputExceptionMessage(exc.what());
    }
    CEGUI_CATCH (const char* exc)
    {
        outputExceptionMessage(exc);
    }
    CEGUI_CATCH(...)
    {
        outputExceptionMessage("Unknown exception was caught!");
    }

    return 0;
}


/*************************************************************************
    Start the SamplesFramework application
*************************************************************************/
bool SamplesFrameworkBase::runApplication()
{
	d_baseApp = new CEGuiGLES2BaseApplication();

	// run the base application (which sets up the demo via 'this' and runs it.
	if (d_baseApp->execute(this))
	{
		// signal that app initialised and ran
		return true;
	}

#ifndef EMSCRIPTEN
	// sample app did not initialise, delete the object.
	delete d_baseApp;
	d_baseApp = 0;

	// signal app did not initialise and run.
	return false;
#else
	return true;
#endif

}


/*************************************************************************
    Cleanup the sample application.
*************************************************************************/
void SamplesFrameworkBase::cleanup()
{   
    delete d_baseApp;
    d_baseApp = 0;

}


/*************************************************************************
    Output a message to the user in some OS independant way.
*************************************************************************/
void SamplesFrameworkBase::outputExceptionMessage(const char* message)
{
#if defined(__WIN32__) || defined(_WIN32)
    MessageBoxA(0, message, "CEGUI - Exception", MB_OK|MB_ICONERROR);
#else
    std::cout << "An exception was thrown within the sample framework:" << std::endl;
    std::cout << message << std::endl;
#endif
}

void SamplesFrameworkBase::setQuitting(bool quit)
{
    d_quitting = quit;
}

bool SamplesFrameworkBase::isQuitting()
{
    return d_quitting;
}

void SamplesFrameworkBase::setApplicationWindowSize(int width, int height)
{
    d_appWindowWidth = width;
    d_appWindowHeight = height;
}
