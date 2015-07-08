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
#ifndef _CEGuiGLFWSharedBase_h_
#define _CEGuiGLFWSharedBase_h_

#include "CEGuiBaseApplication.h"
#include "CEGUI/MouseCursor.h"
#include "SDL2/SDL.h"

class SamplesFrameworkBase;

struct SDL_graphics;

class CEGuiGLES2BaseApplication : public CEGuiBaseApplication
{
public:
	CEGuiGLES2BaseApplication();
	~CEGuiGLES2BaseApplication();

	void main_loop_body();

protected:
	// implementation of base class abstract functions.
	void run();
	void destroyWindow();
	void beginRendering(const float elapsed);
	void endRendering();

	/*************************************************************************
	Implementation Methods
	*************************************************************************/
	static void initGLFW();
	static void createGLFWWindow();
	static void setGLFWAppConfiguration();

	void drawFrame();

	static CEGUI::Key::Scan SDLtoCEGUIKey(SDL_Scancode key);
	static CEGUI::MouseButton SDLtoCEGUIMouseButton(const Uint8 & button);

	static void process_SDL_event(const SDL_Event & event, bool * quit);

	/*************************************************************************
	Data fields
	*************************************************************************/
	static CEGuiGLES2BaseApplication* d_appInstance;
	static SDL_graphics* d_SDL_Graphics;
	static double  d_frameTime;
	static int  d_modifiers;

	static bool d_windowSized;
	static int d_newWindowWidth;
	static int d_newWindowHeight;

	static bool d_mouseLeftWindow;
	static bool d_mouseDisableCalled;
	static int d_oldMousePosX;
	static int d_oldMousePosY;
};


#endif  // end of guard _CEGuiGLFWSharedBase_h_

