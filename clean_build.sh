#!/bin/bash
set -e
rm -rf build
mkdir build
cd build
cmake -DCMAKE_CXX_FLAGS="-std=c++11 -fpermissive -Wno-pragma-messages" -DCMAKE_C_COMPILER=/usr/bin/gcc -DCMAKE_CXX_COMPILER=/usr/bin/g++ ..
#cmake -DCMAKE_CXX_FLAGS="-std=c++14 -fpermissive" -DCMAKE_C_COMPILER="/usr/bin/clang-3.6" -DCMAKE_CXX_COMPILER="/usr/bin/clang++-3.6" ..
make -j3 VERBOSE=1
export TOOL=gdb #valgrind
$TOOL ./CEGUI_Samples.bin.x86_64
