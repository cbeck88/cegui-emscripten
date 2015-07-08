#!/bin/bash
set -e
rm -rf build_debug_em
mkdir build_debug_em
cd build_debug_em

export COMMON_FLAGS="-O0 -g4 -s USE_LIBPNG=1 -s USE_ZLIB=1" #--jcache  <-- note: jcache was disabled
export DEBUG_FLAGS="-s SAFE_HEAP=1 -s ALIASING_FUNCTION_POINTERS=0"
export CXX_FLAGS="$COMMON_FLAGS -std=c++11 -Wall -Werror -Wno-unused -Wno-format -Wno-switch -s USE_SDL=2 -s DEMANGLE_SUPPORT=1 -s ASSERTIONS=2 -s TOTAL_MEMORY=500000000 -s NO_EXIT_RUNTIME=1" #$DEBUG_FLAGS"

#-s ASSERTIONS=2 -s SAFE_HEAP=1 -s ALIASING_FUNCTION_POINTERS=0'
# CFLAGS are needed so that freetype can find png header
emcmake cmake .. -DCMAKE_C_FLAGS="$COMMON_FLAGS" -DCMAKE_CXX_FLAGS="$CXX_FLAGS"
emmake make -j3 VERBOSE=1
firefox index.html
cd ..
