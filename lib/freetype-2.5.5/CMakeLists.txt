CMAKE_MINIMUM_REQUIRED(VERSION 2.8.12)
PROJECT(FREETYPE)

MESSAGE(STATUS "Linking FREETYPE2 to LIBPNG: " ${PNG_LIBRARIES})
MESSAGE(STATUS "Including FREETYPE2 to LIBPNG: " ${PNG_INCLUDE_DIRS})

#  src/autofit/afglobal.c
#  src/autofit/afmodule.c
#  src/autofit/aflatin2.c

set(BASE_SRCS
  src/autofit/afcjk.c
  src/autofit/afdummy.c
  src/autofit/afindic.c
  src/autofit/aflatin.c
  src/autofit/afloader.c
  src/autofit/autofit.c
  src/base/ftadvanc.c
  src/base/ftbbox.c
  src/base/ftbdf.c
  src/base/ftbitmap.c
  src/base/ftcalc.c
  src/base/ftcid.c
  src/base/ftdbgmem.c
  src/base/ftdebug.c
  src/base/ftfstype.c
  src/base/ftgasp.c
  src/base/ftgloadr.c
  src/base/ftglyph.c
  src/base/ftgxval.c
  src/base/ftinit.c
  src/base/ftlcdfil.c
  src/base/ftmm.c
  src/base/ftobjs.c
  src/base/ftotval.c
  src/base/ftoutln.c
  src/base/ftpatent.c
  src/base/ftpfr.c
  src/base/ftrfork.c
  src/base/ftsnames.c
  src/base/ftstream.c
  src/base/ftstroke.c
  src/base/ftsynth.c
  src/base/ftsystem.c
  src/base/fttrigon.c
  src/base/fttype1.c
  src/base/ftutil.c
  src/base/ftwinfnt.c
  src/base/ftxf86.c
  src/bdf/bdf.c
  src/bzip2/ftbzip2.c
  src/cache/ftcache.c
  src/cff/cff.c
  src/cid/type1cid.c
  src/gzip/ftgzip.c
  src/lzw/ftlzw.c
  src/pcf/pcf.c
  src/pfr/pfr.c
  src/psaux/psaux.c
  src/pshinter/pshinter.c
  src/psnames/psmodule.c
  src/raster/raster.c
  src/sfnt/sfnt.c
  src/smooth/smooth.c
  src/truetype/truetype.c
  src/type1/type1.c
  src/type42/type42.c
  src/winfonts/winfnt.c
)

if (EMSCRIPTEN)
  set(extra_inc "include_em")
else()
  set(extra_inc "include_linux")
endif()

# DIRS
#    src/truetype
#    src/sfnt
#    src/smooth
#    src/raster
#    src/psaux
#    src/psnames
#EXCLUDE
#    src/psauxmod.c
#    src/ttinterp.c
#    src/ttdriver.c


CreateLibrary(${PROJECT_NAME}
FILES
    ${BASE_SRCS}
INCLUDES
    PUBLIC
        include
        include/config
        ${extra_inc}
    PRIVATE
        include/internal
        ${PNG_INCLUDE_DIRS}
DEFINES
    FT_CONFIG_OPTION_USE_PNG
    FT_CONFIG_CONFIG_H=<ftconfig.h> 
    FT2_BUILD_LIBRARY 
    FT_CONFIG_MODULES_H=<ftmodule.h>
LINK
    ${PNG_LIBRARIES}
PROPERTIES
    FOLDER "3rd Party"

)
#     src/autofit
# TODO: Fix this! ^

# -I/usr/include/harfbuzz -DFT_CONFIG_OPTION_USE_HARFBUZZ

#    -DBYTEORDER=${BYTEORDER}
#    -Dconst=${CONST}
#    -Doff_t=${off_t}
#    -Dsize_t=${size_t}

set(INCL  ${CMAKE_CURRENT_SOURCE_DIR}/include; ${CMAKE_CURRENT_SOURCE_DIR}/include/config; ${CMAKE_CURRENT_SOURCE_DIR}/${extra_inc})

MESSAGE( STATUS "freetype include dirs: " ${INCL})

SET(FREETYPE_INCLUDE_DIRS ${INCL} PARENT_SCOPE)
SET(FREETYPE_LIBRARIES FREETYPE PARENT_SCOPE)
