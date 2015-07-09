cmake_minimum_required(VERSION 2.8.12)
Project(CEGUI_Samples)

if (CMAKE_CURRENT_SOURCE_DIR STREQUAL CMAKE_CURRENT_BINARY_DIR)
    message(FATAL_ERROR "You must set your binary directory different from your source")
endif()

# default to Release build (it's what most people will use, except cegui devs)
if (NOT CMAKE_BUILD_TYPE)
    set( CMAKE_BUILD_TYPE Release CACHE STRING "Sets the configuration to build (Release, Debug, etc...)")
endif()

### pull in boilerplate cmake
set(CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/cmake")
include(BoilerPlate)
include(UtilityFunctions)
include(AssetUtilities)
#include(FindPNG)

# this sets the paths that cmake will use to locate libs (via the FindXXX.cmake or XXConfig.cmake scripts)
LIST(APPEND CMAKE_PREFIX_PATH ${CMAKE_CURRENT_SOURCE_DIR}/lib/SDL2 )

#############
## OPTIONS ##
#############

### Freetype in tree or not 
set (FREETYPE_IN_TREE TRUE)
### Note: For now it is only supported to use freetype in tree, please use freetype out of tree only if the in-tree version gives you problems
### Note that freetype out-of-tree emscripten version is broken -- because of a function pointer related to auto-hinting being called with a different type than it is declared, emscripten will crash with a bad function pointer at runtime :/ I fixed it in the source in tree but not out of tree.


set(render_define "CEGUI_BUILD_OPENGLES2_RENDERER_MODULE")

set(GLM_INCLUDE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/lib/glm/include )

### Find BASE Libraries (freetype, png, zlib)
if(EMSCRIPTEN)

#  SET_PROPERTY(GLOBAL PROPERTY RULE_LAUNCH_COMPILE ccache)
#  ccache doesn't actually work with emscripten D:
#  Trying to use "jcache" option the em debug build instead... seems that doesn't work either D:

else()

  SET_PROPERTY(GLOBAL PROPERTY RULE_LAUNCH_COMPILE ccache)

  find_package( ZLIB REQUIRED )
  find_package( PNG REQUIRED )
  MESSAGE ( STATUS "png found = " ${PNG_FOUND} )

  find_package(OpenGLES2 REQUIRED)
  MESSAGE ( STATUS "OpenGLES2 found = " ${OPENGLES2_FOUND} )
  MESSAGE ( STATUS "OpenGLES2 lib = " ${OPENGLES2_LIBRARIES} )

endif()

if (FREETYPE_IN_TREE)
  add_subdirectory(lib/freetype-2.5.5 freetype-2.5.5)
else()
  LIST(APPEND CMAKE_PREFIX_PATH ${CMAKE_CURRENT_SOURCE_DIR}/lib/freetype-2.5.5-old )
  find_package(freetype NO_CMAKE_FIND_ROOT_PATH)
  MESSAGE ( STATUS "FREETYPE found = " ${FREETYPE_FOUND} )
endif()

# Add SDL2 and the in-tree libs
find_package(SDL2 NO_CMAKE_FIND_ROOT_PATH)
add_subdirectory(lib/lodepng lodepng)
add_subdirectory(lib/pcre-8.37 pcre-8.37)
add_subdirectory(lib/SILLY SILLY)
add_subdirectory(lib/expat-2.1.0 expat-2.1.0)
add_subdirectory(lib/cegui cegui)

#MESSAGE ( STATUS "ROOT CEGUI_SAMPLES = " ${CEGUI_SAMPLES}  )
#set(CEGUI_SAMPLES_COMMON_INCLUDE ${CMAKE_CURRENT_SOURCE_DIR}/lib/samples/common/include)

#add_subdirectory(lib/samples/HelloWorld HelloWorld)
#add_subdirectory(lib/samples/LookNFeelOverview LookNFeelOverview)
#add_subdirectory(lib/samples/GameMenu GameMenu)
#add_subdirectory(lib/samples/HUDDemo HUDDemo)
#add_subdirectory(lib/samples/DragDropDemo DragDropDemo)
#add_subdirectory(lib/samples/InventoryDemo InventoryDemo)
#add_subdirectory(lib/samples/EffectsDemo EffectsDemo)
#add_subdirectory(lib/samples/FontDemo FontDemo)
#add_subdirectory(lib/samples/Demo6 Demo6)
#add_subdirectory(lib/samples/EditboxValidationDemo EditboxValidationDemo)
#add_subdirectory(lib/samples/Minesweeper Minesweeper)
#add_subdirectory(lib/samples/ScrollablePaneDemo ScrollablePaneDemo)
#add_subdirectory(lib/samples/TabControlDemo TabControlDemo)
#add_subdirectory(lib/samples/CommonDialogsDemo CommonDialogsDemo)
#add_subdirectory(lib/samples/WidgetDemo WidgetDemo)
#add_subdirectory(lib/samples/TextDemo TextDemo)
#add_subdirectory(lib/samples/TreeDemo TreeDemo)


MESSAGE ( STATUS "ROOT CEGUI_SAMPLES = " ${CEGUI_SAMPLES}  )

### emscripten compiler provides OPENGL and SDL2
if(EMSCRIPTEN)
    set(OPENGLES2_LIBRARIES "")
    set(SDL2_LIBRARIES "")
    set(SDL2_INCLUDE_DIRS "")

    EmscriptenCreatePackage(${PROJECT_NAME} DATA_FILE
        PRELOAD ${CMAKE_CURRENT_SOURCE_DIR}/assets@assets
    )
endif()

#        CEGUICommonDialogsDemo
#        CEGUIHelloWorldDemo
#        CEGUILookNFeelOverviewDemo
#        CEGUIGameMenuDemo
#        CEGUIHUDDemo
#        CEGUIDragDropDemo
#        CEGUIInventoryDemo
#        CEGUIEffectsDemo
#        CEGUIFontDemo
#        CEGUIDemo6
#        CEGUIEditboxValidationDemo
#        CEGUIMinesweeper
#        CEGUIScrollablePaneDemo
#        CEGUITabControlDemo
#        CEGUICommonDialogsDemo
#        CEGUIWidgetDemo
#        CEGUITextDemo
#        CEGUITreeDemo


CreateProgram(${PROJECT_NAME}
FILES
    src/SamplesFrameworkBase.cpp
    src/SamplesFramework.cpp
    src/CEGuiBaseApplication.cpp
    src/CEGuiGLES2BaseApplication.cpp
    src/Samples_xmlHandler.cpp
    src/SampleData.cpp
    src/MetaDataWindowManager.cpp
    src/SamplesBrowserManager.cpp
DIRS
    lib/samples/**
INCLUDES
    include/
    lib/samples/common/include/
    ${CEGUI_INCLUDE_DIRS}
    ${SDL2_INCLUDE_DIRS}
    lib/humble
DEFINES
    $<$<BOOL:${EMSCRIPTEN}>:USE_HUMBLE_API>
LINK
    cegui
    PCRE
    SILLY
    EXPAT
    ${FREETYPE_LIBRARIES}
    ${ZLIB_LIBRARIES}
    ${PNG_LIBRARIES}
    ${SDL2_LIBRARIES}
    ${OPENGLES2_LIBRARIES}
    lodepng
#FLAGS
#    $<$<CXX_COMPILER_ID:GNU>:-std=c++11>
#    $<$<CXX_COMPILER_ID:Clang>:-std=c++11>
#    $<$<CXX_COMPILER_ID:AppleClang>:-std=c++11>
PRE_JS
    ${DATA_FILE}
JS_LIBS
    lib/humble/library_cloudfs.jslib
    lib/humble/library_humble.jslib
PROPERTIES
    FOLDER Executables
    MACOSX_BUNDLE_BUNDLE_NAME "${PROJECT_NAME} Demo"
    MACOSX_BUNDLE_BUNDLE_VERSION "1.0"
    MACOSX_BUNDLE_GUI_IDENTIFIER "com.{PROJECT_NAME}"
    MACOSX_BUNDLE_COPYRIGHT "© 2015 Wesmere, Inc. "
)
source_group("Source" REGULAR_EXPRESSION "\\.(cpp|h)$")


if(EMSCRIPTEN)
    set(EM_TARGET_JS ${PROJECT_NAME}.js)
    configure_file(shell.html index.html @ONLY)
endif()

## this auto copies the needed libraries / frameworks over
CopyDependentLibs(${PROJECT_NAME})

if(NOT EMSCRIPTEN)
    CreateFolderMarkerFile(${PROJECT_NAME} asset_path.txt ${CMAKE_CURRENT_SOURCE_DIR}/assets)
endif()
