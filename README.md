CEGUI Samples for Emscripten / WebGL 
====================================

Notes: 

I hacked up the build system significantly to make it more like the cmake script for my existing project -- this was simpler than trying to add features to the standard cegui cmake script. Part of the reason is that any data files used by the resulting javascript need to be mounted into a virtual filesystem, and the cmake script I was using has some built-in stuff to do this which I wanted to use rather than reinvent.

"samples_framework/include" has become "include" and "samples_framework/src" has become "src", and "samples" has been moved into "lib". "CEGUI" is also in lib, as is the source of all of the dependencies I am building with (except SDL2, gles2, libpng, zlib). Because, this is much simpler for emscripten.

I had to change the GL renderer a bit so that it works with OpenGLES2 / WebGL. 

Caveat Emptor: My GLES2 port is not really finished, some functions I simply commented out and replaced with `assert(false && "Not implemented yet!");` 
