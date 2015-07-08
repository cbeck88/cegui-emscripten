#ifndef __HUMBLE_CLOUD_H__
#define __HUMBLE_CLOUD_H__

#include <emscripten/emscripten.h>

#ifdef __cplusplus
extern "C" {
#endif

    int humble_init();

    /**
     * Trigger a FS.syncfs call on the emscripten Filesystem
     */
    void humble_syncfs();

    /**
     * This method is 100% compatible to emscripten_async_wget_data.
     * Except that it can cache the fetched files into IndexedDB and it has 2 extension points
     *   one to map the URL/path (e.g. to handle pre-signed GETs against CDNs)
     *   another to map the URL path to a cache KEY. (e.g. if using relative allow it to be prefixed by something else
     */
    void humble_fetch_asset_data(const char* url, void *arg, em_async_wget_onload_func onload, em_arg_callback_func onerror);

    /**
     * Gets the allowable player size of the humble player.  Use this to restrict the size of the game in windowed mode.
     * returns 1 if the restriction should be enforced.. 0 otherwise
     */
    int humble_get_player_size(int *width, int *height);

    /**
     * Called to let the humble player know the demo has ended.
     */
    void humble_demo_ended();

#ifdef __cplusplus
};
#endif

#endif // __HUMBLE_CLOUD_H__