MESSAGE ( STATUS "CEGUI_SAMPLES = " ${CEGUI_SAMPLES}  )

set(CEGUI_SAMPLES_COMMON_INCLUDE ${CMAKE_CURRENT_SOURCE_DIR}/common/include)

MESSAGE ( STATUS "CEGUI_INCLUDE = " ${CEGUI_INCLUDE_DIRS}  )


add_subdirectory(HelloWorld)
add_subdirectory(LookNFeelOverview)

add_subdirectory(GameMenu)
add_subdirectory(HUDDemo)
add_subdirectory(DragDropDemo)
add_subdirectory(InventoryDemo)
add_subdirectory(EffectsDemo)
add_subdirectory(FontDemo)
add_subdirectory(Demo6)

add_subdirectory(EditboxValidationDemo)
add_subdirectory(Minesweeper)
add_subdirectory(ScrollablePaneDemo)
add_subdirectory(TabControlDemo)
add_subdirectory(CommonDialogsDemo)
add_subdirectory(WidgetDemo)
add_subdirectory(TextDemo)
add_subdirectory(TreeDemo)

MESSAGE ( STATUS "CEGUI_SAMPLES = " ${CEGUI_SAMPLES}  )

set(CEGUI_SAMPLES ${CEGUI_SAMPLES} ${CEGUI_SAMPLES} PARENT_SCOPE)
