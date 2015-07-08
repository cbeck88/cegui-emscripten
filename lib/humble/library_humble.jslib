var LibraryHUMBLE = {
    $HUMBLE_API: {
        options: {
            /**
             * allows altering the incoming URL before it is fetched from the network
             * ex. function(path) { return path; }
             */
            locateAsset: null,
            /**
             * returns a key for the specified path. return null to NOT cache the specific resource
             * for scoped keys..  return { scope: 'deadbeef', path: 'path' }, otherwise just return a string
             * ex. function(path) { return path; }
             */
            buildCacheKey: null,
            /**
             * function returning a hash like {width: 800, height: 600, locked: true}
             * locked specifies whether the game should use that width/height.
             * ex. function() { return { width: 800, height: 600, locked: true } }
             */
            playerSize: null,
            /**
             * callback to handle the demo_ended API from in the game
             * the callback takes no parameters.
             */
            demoEndedCallback: null
        },
        /**
         * allows configuring the HUMBLE_API  simply call this method in a preRun to initialize..
         * any option is accepted and will be added to the configuration hash.
         * Also all hooks will be context of HUMBLE_API so this.options.myCustomKey will be accessible
         */
        configure: function(options) {
            for (var i in options) {
                HUMBLE_API.options[i] = options[i];
            }
        },

        locateAsset: function(path) {
            if (HUMBLE_API.options.locateAsset) {
                return HUMBLE_API.options.locateAsset.call(HUMBLE_API, path);
            } else {
                return path;
            }
        },

        buildCacheKey: function(path) {
            if (HUMBLE_API.options.buildCacheKey) {
                return HUMBLE_API.options.buildCacheKey.call(HUMBLE_API, path);
            } else {
                return null;
            }
        },

        pathToKey: function(path) {
            if (typeof path == 'string') {
                return { path: path, scope: '', key: ':' + path};
            } else {
                return { path: path.path, scope: path.scope, key: path.scope + ':' + path.path };
            }
        },
        // deletes all entries for the specified scope
        clearCacheByScope: function(scope, oncomplete) {
            HUMBLE_API.getDB(function(err, db) {
                if (err) return oncomplete(err);

                var transaction = db.transaction([HUMBLE_API.DB_ASYNC_CACHE_STORE], 'readwrite');
                transaction.onerror = function() { oncomplete(this.error); };

                var store = transaction.objectStore(HUMBLE_API.DB_ASYNC_CACHE_STORE);
                var index = store.index('scope');

                index.openKeyCursor(IDBKeyRange.only(scope)).onsuccess = function(e) {
                    var cursor = event.target.result;

                    if (cursor) {
                        store.delete(cursor.primaryKey);

                        cursor.continue();
                    } else {
                        oncomplete(null);
                    }
                };
            });
        },
        storeToCache: function(path, byteArray, ondone) {
            if (path === null) {
                return ondone(null);
            }

            HUMBLE_API.getDB(function(err, db) {
                if (err) return ondone(err);

                var transaction = db.transaction([HUMBLE_API.DB_ASYNC_CACHE_STORE], 'readwrite');
                transaction.onerror = function() { ondone(this.error); };

                var store = transaction.objectStore(HUMBLE_API.DB_ASYNC_CACHE_STORE);

                var data = HUMBLE_API.pathToKey(path);
                data['data'] = byteArray;

                var req = store.put(data);

                req.onsuccess = function(e) {
                    ondone(null);
                };
                req.onerror = function() { ondone(this.error); };
            });
        },
        fetchFromCache: function(path, ondone, onfail) {
            if (path === null) {
                return onfail(null);
            }
            HUMBLE_API.getDB(function(err, db) {
                if (err) return onfail(err);

                var transaction = db.transaction([HUMBLE_API.DB_ASYNC_CACHE_STORE], 'readonly');
                transaction.onerror = function() { onfail(this.error); };

                var store = transaction.objectStore(HUMBLE_API.DB_ASYNC_CACHE_STORE);

                var data = HUMBLE_API.pathToKey(path);

                var req = store.get(data.key);
                req.onsuccess = function(e) {
                    if (e.target.result) {
                        var o = e.target.result;
                        ondone(o.data);
                    } else {
                        onfail(null);
                    }
                };
                req.onerror = function() { onfail(this.error); };
            });
        },

        /* indexedDB access */
        // borrowed from IDBFS
        dbs: {},
        indexedDB: function() {
            if (typeof indexedDB !== 'undefined') return indexedDB;
            var ret = null;
            if (typeof window === 'object') ret = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            assert(ret, 'IDBFS used, but indexedDB not supported');
            return ret;
        },
        DB_VERSION: 1,
        DB_NAME: 'HUMBLE_API',
        DB_ASYNC_CACHE_STORE: 'HUMBLE_API_ASYNC',
        getDB: function(callback) {
            var db = HUMBLE_API.dbs[HUMBLE_API.DB_NAME];
            if (db) {
                return callback(null, db);
            }

            var req;
            try {
                req = HUMBLE_API.indexedDB().open(HUMBLE_API.DB_NAME, HUMBLE_API.DB_VERSION)
            } catch (e) {
                return callback(e);
            }
            req.onupgradeneeded = function(e) {
                var db = e.target.result;

                var fileStore;

                // Just replace it for now
                fileStore = db.createObjectStore(HUMBLE_API.DB_ASYNC_CACHE_STORE, {keyPath: 'key'});
                fileStore.createIndex('scope','scope',{ unique: false });
            };
            req.onsuccess = function() {
                db = req.result;

                HUMBLE_API.dbs[HUMBLE_API.DB_NAME] = db;
                callback(null, db);
            };
            req.onerror = function() {
                callback(this.error);
            };
        }
    },
    humble_init__deps: ['$CLOUDFS','$HUMBLE_API'],
    humble_init: function() {
        // Dummy function to pull in the rest of the functions
    },
    humble_syncfs__deps: ['$FS', '$CLOUDFS','$HUMBLE_API'],
    humble_syncfs: function() {
        FS.syncfs(function (err) {
            console.log('File Sync');
        });
    },
    humble_fetch_asset_data__deps: ['$BROWSER','$HUMBLE_API'],
    humble_fetch_asset_data: function(assetPath, arg, onload, onerror) {
        var path = Pointer_stringify(assetPath);
        var cacheKey = HUMBLE_API.buildCacheKey(path);

        HUMBLE_API.fetchFromCache(cacheKey, function(byteArray) {
            var buffer = _malloc(byteArray.length);
            HEAPU8.set(byteArray, buffer);
            Runtime.dynCall('viii', onload, [arg, buffer, byteArray.length]);
            _free(buffer);
        }, function(err) {
            try {
                var url = HUMBLE_API.locateAsset(path);
                Browser.asyncLoad(url, function (byteArray) {
                    HUMBLE_API.storeToCache(cacheKey, byteArray, function (err) {
                        var buffer = _malloc(byteArray.length);
                        HEAPU8.set(byteArray, buffer);
                        Runtime.dynCall('viii', onload, [arg, buffer, byteArray.length]);
                        _free(buffer);
                    });
                }, function() {
                    if (onerror) Runtime.dynCall('vi', onerror, [arg]);
                }, true /* NO run dependency */);
            } catch(ex) {
                if (onerror) Runtime.dynCall('vi', onerror, [arg]);
            }
        });
    },
    humble_get_player_size__deps: ['$HUMBLE_API'],
    humble_get_player_size: function(w, h) {
        var ret = {width: 0, height: 0, locked: false};
        if (HUMBLE_API.options.playerSize) {
            ret = HUMBLE_API.options.playerSize();
        }
        if (w && ret.width > 0) {{{ makeSetValue('w', '0', 'ret.width', 'i32') }}};
        if (h && ret.height > 0) {{{ makeSetValue('h', '0', 'ret.height', 'i32') }}};
        return ret.locked ? 1 : 0;
    },
    humble_demo_ended__deps: ['$HUMBLE_API'],
    humble_demo_ended: function() {
        if (HUMBLE_API.options.demoEndedCallback) {
            return HUMBLE_API.options.demoEndedCallback.call(HUMBLE_API);
        }
    }
};

mergeInto(LibraryManager.library, LibraryHUMBLE);
