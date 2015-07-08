CMAKE_MINIMUM_REQUIRED(VERSION 2.8.12)
PROJECT(cegui)

# cegui depends (minimally) on 
# - Freetype
# - an xml parser (such as expat)
# - an image codec (such as SILLY)
# - enough OpenGL to render the widgets.
#
# Possible addons are PCRE (regex) and Fribidi (bidirectional text like hebrew or arabic)
#
# We currently have SILLY and expat in tree. Freetype is still external.
# However, Freetype version 2.4.4 is built in the emscripten test module in the master repository.
# We will probably favor to use that rather than bring it also in tree, hopefully it will become
# built-in like zlib and libpng.

set(render_dir "src/RendererModules/OpenGLES2")
set(render_libs ${OPENGLES2_LIBRARIES})
set(render_includes ${SDL2_INCLUDE_DIRS} ${GLM_INCLUDE_DIR})

# TODO: Get rid of SDL2 here

MESSAGE(STATUS "CEGUI is including " ${EXPAT_INCLUDE_DIRS} " and " ${FREETYPE_INCLUDE_DIRS} " and " ${SILLY_INCLUDE_DIRS} " and " ${render_includes})

MESSAGE(STATUS "CEGUI is linking " ${render_libs})

CreateLibrary(cegui
DIRS
    src
    src/falagard/**
    src/ImageCodecModules/**
    ${render_dir}
    src/widgets/**
    src/WindowRendererSets/**
    src/XMLParserModules/**
EXCLUDE
    src/DynamicModule.cpp
    src/minibidi.cpp
    src/PCRERegexMatcher.cpp
    src/FribidiVisualMapping.cpp
    src/MinibidiVisualMapping.cpp
    src/MinizipResourceProvider.cpp
    src/Win32StringTranscoder.cpp
INCLUDES
    PUBLIC
        include/
    PRIVATE
        ${EXPAT_INCLUDE_DIRS}
	${FREETYPE_INCLUDE_DIRS}
	${SILLY_INCLUDE_DIRS}
	${render_includes}
DEFINES
    CEGUI_STATIC
    CEGUI_BUILD_STATIC_FACTORY_MODULE
    ${render_define}
    CEGUI_BUILD_EXPAT_PARSER_MODULE
LINK
    SILLY
    EXPAT
    ${FREETYPE_LIBRARIES}
    ${render_libs}
PROPERTIES
    FOLDER "3rd Party"

)

SET(CEGUI_INCLUDE_DIRS ${CMAKE_CURRENT_SOURCE_DIR}/include)
