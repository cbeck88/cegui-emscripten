CMAKE_MINIMUM_REQUIRED(VERSION 2.8.12)
PROJECT(SILLY)

MESSAGE(STATUS "Linking SILLY to PNG: " ${PNG_LIBRARIES})

CreateLibrary(${PROJECT_NAME}
DIRS
    src/
FILES
    src/loaders/SILLYPNGImageContext.cpp
    src/loaders/SILLYPNGImageLoader.cpp
    src/loaders/SILLYTGAImageContext.cpp
    src/loaders/SILLYTGAImageLoader.cpp
INCLUDES
    PUBLIC
        include/
    PRIVATE
        ${PNG_INCLUDE_DIRS}
DEFINES
    SILLY_HAVE_PNG
LINK
    ${PNG_LIBRARIES}
PROPERTIES
    FOLDER "3rd Party"

)

SET(SILLY_INCLUDE_DIRS ${CMAKE_CURRENT_SOURCE_DIR}/include PARENT_SCOPE)
