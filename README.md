CEGUI Samples for Emscripten / WebGL 
====================================

This is a port of CEGUI v0-8 branch (v0-8.4 iirc).
The most significant code change was porting the OpenGL3 core calls to OpenGLES2.
Some changes needed to be made to the samples framework so that it is all linked at compile time as well.
There was also a complete replacement of the build system. This was in order to make it easier to build on emscripten without compromising the ability to make native builds.

Reorg / renames:

CEGUI v0-8 branch               |  here
===============================================
- datafiles/ 			| assets/
- samples_framework/include 	| include/
- samples_framework/src		| src/
- samples/			| lib/samples/
- CEGUI/			| lib/CEGUI/

External dependencies (for emscripten build)  
- CMake version >= 2.8.12	
      http://www.cmake.org/
- Emscripten (master branch)  
      http://www.emscripten.org/
- That's it!

For a detailed installation guide please see here: http://developer.humblebundle.com/post/112252930481/developing-for-asm-js-using-sdl2

External dependencies (for native build)
- CMake version >= 2.8.12  
      http://www.cmake.org/
- A C++11 compiler (tested with gcc 4.8.4 and clang 3.6)  
- OpenGLES2 development libraries
- SDL2 development libraries
- libpng development libraries
- zlib development libraries      

How to build:

Currently you must build using CMake at command line. I placed appropriate commands in the shell scripts at repo root "clean_build.sh", "clean_build-clang.sh", "clean_build_em.sh" etc. (These work for me on linux mint 17 after installing appropriate libraries using apt-get.)

In principle it should be possible to build for windows / OS X, but it is likely that it will require a very large amount of work. I brought all the CEGUI external dependencies in tree -- this is because emscripten is a bit finnicky and can have problems if libraries are not compiled using the same optimization settings and such, and it ensures consistency between the native build and em build .


Notes:

The build system is *exactly* the one used by the humble developers in their sample project described here:
  http://developer.humblebundle.com/post/112252930481/developing-for-asm-js-using-sdl2

In fact you can think of this project as a template for using CEGUI within games targetted at the humble bundle store / humble widget.

The advantages of that build system are that it has some nice cmake macros for declaring libraries and executables, and it automatically handles the process of copying everything in "assets" into a virtual filesystem blob that gets loaded when your javascript app starts up. I did not want to have to reengineer that into the cegui cmake.

*Caveat Emptor*: My GLES2 port is not really finished, some functions I simply commented out and replaced with `assert(false && "Not implemented yet!");` 
