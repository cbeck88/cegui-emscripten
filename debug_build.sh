#!/bin/bash
set -e
rm -rf build_debug
mkdir build_debug
cd build_debug
cmake -DCMAKE_C_FLAGS="-O0 -g3" -DCMAKE_CXX_FLAGS="-std=c++11 -O0 -g3 -fpermissive -Wno-pragma-messages" -DCMAKE_C_COMPILER=/usr/bin/gcc -DCMAKE_CXX_COMPILER=/usr/bin/g++ ..
#cmake CMAKE_CXX_FLAGS="-O0 -g3 -fsanitize=undefined" -DCMAKE_CXX_COMPILER=/usr/lib/ccache/g++ ..
make -j3 VERBOSE=1
cd ..
export TOOL=gdb #valgrind
$TOOL ./build_debug/Wesmere.bin.x86_64

