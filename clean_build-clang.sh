#!/bin/bash
set -e
rm -rf build
mkdir build
cd build
cmake -DCMAKE_C_FLAGS="-Qunused-arguments" -DCMAKE_CXX_FLAGS="-std=c++11 -fpermissive -Wno-\#pragma-messages -Qunused-arguments -Wno-unknown-warning-option -Wno-deprecated-register" -DCMAKE_C_COMPILER=/usr/bin/clang-3.6 -DCMAKE_CXX_COMPILER=/usr/bin/clang++-3.6 ..
make -j3 VERBOSE=1
cd ..
export TOOL=gdb #valgrind
$TOOL ./build/CEGUI_Samples.bin.x86_64

