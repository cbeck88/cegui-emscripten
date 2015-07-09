#!/bin/bash
set -e
rm -rf build_em
mkdir build_em
cd build_em

#export CCACHE_CPP2=1
#as described here: https://github.com/kripken/emscripten/issues/3365
#export CCACHE_LOGFILE=/var/tmp/cache.debug
#export CCACHE_COMPILERCHECK="stat -L --printf=%s %compiler%" 
#export CCACHE_SLOPPINESS=time_macros,include_file_mtime,file_macro
#export CCACHE_BASEDIR=/ 
# c.f. https://groups.google.com/forum/#!topic/android-building/dT-2d7khe5c
# Note: trying to use emscripten "jcache" on the debug build instead of ccache

export COMMON_FLAGS="-O3 -s USE_LIBPNG=1 -s USE_ZLIB=1"
#export COMMON_FLAGS="-Os -s USE_LIBPNG=1 -s USE_ZLIB=1"
export DEBUG_FLAGS=""
#export DEBUG_FLAGS="-s SAFE_HEAP=1 -s ALIASING_FUNCTION_POINTERS=0"
export CXX_FLAGS="$COMMON_FLAGS -std=c++11 -Wno-unused -Wno-format -Wno-switch -Wno-\#pragma-messages -s USE_SDL=2 -s DEMANGLE_SUPPORT=1 -s TOTAL_MEMORY=500000000 -s NO_EXIT_RUNTIME=1" #$DEBUG_FLAGS"
#export CXX_FLAGS="$COMMON_FLAGS -std=c++11 -Wall -Werror -Wno-unused -Wno-format -Wno-switch -Wno-\#pragma-messages -s USE_SDL=2 -s DEMANGLE_SUPPORT=1 -s ASSERTIONS=2 -s ALLOW_MEMORY_GROWTH=1" #$DEBUG_FLAGS"

#-s ASSERTIONS=2 -s SAFE_HEAP=1 -s ALIASING_FUNCTION_POINTERS=0'
# CFLAGS are needed so that freetype can find png header
emcmake cmake .. -DCMAKE_C_FLAGS="$COMMON_FLAGS" -DCMAKE_CXX_FLAGS="$CXX_FLAGS"
emmake make -j3 VERBOSE=1
firefox index.html
cd ..
