var LibraryCLOUDFS = {
    $CLOUDFS__deps: ['$FS', '$MEMFS', '$PATH'],
    $CLOUDFS__postset: "var CLOUD_PROVIDERS; if (!CLOUD_PROVIDERS) CLOUD_PROVIDERS = (typeof CLOUD_PROVIDERS !== 'undefined' ? CLOUD_PROVIDERS : null) || {};",
    $CLOUDFS: {
        mount: function(mount) {
            var provider = CLOUDFS.fetchProvider(mount);
            if (provider) {
                mount.opts.provider = provider;
                if (!mount.opts.scope) {
                  // backwards compat
                  mount.opts.scope = mount.opts.cloud.applicationtoken;
                }
                Module.print('Cloud provider vendor: ' + provider.vendor);
                if (!provider.isAvailable(mount.opts.cloud)) {
                  mount.opts.disabled = true;
                  Module.print("WARNING: Cloud not available. Disabling Cloud Sync");
                }
            } else {
                mount.opts.disabled = true;
                Module.print("WARNING: Cloud provider not available. Disabling Cloud Sync");
            }
            return MEMFS.mount.apply(null, arguments);
        },
        syncfs: function(mount, populate, callback) {
          if (populate) {
            if (!mount.opts.disabled) {
              CLOUDFS.syncfs_load_from_cloud(mount, function (err) {
                if (err) return callback(err);
                CLOUDFS.syncfs_load_from_idb(mount, callback);
              });
            } else {
              CLOUDFS.syncfs_load_from_idb(mount, callback);
            }
          } else {
            CLOUDFS.syncfs_save_to_idb(mount, function(err) {
              if (err) return callback(err);
              if (!mount.opts.disabled) {
                CLOUDFS.syncfs_save_to_cloud(mount, callback);
              } else {
                callback(null);
              }
            });
          }
        },
        syncfs_load_from_cloud: function(mount, callback) {
          CLOUDFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);

            CLOUDFS.getIDBSet(mount, function(err, idb) {
              if (err) return callback(err);

              CLOUDFS.reconcile(mount, remote, idb, callback, true /* skip remove */);
            });
          });
        },
        syncfs_load_from_idb: function(mount, callback) {
          CLOUDFS.getIDBSet(mount, function(err, idb) {
            if (err) return callback(err);

            CLOUDFS.getLocalSet(mount, function(err, local) {
              if (err) return callback(err);

              CLOUDFS.reconcile(mount, idb, local, callback);
            });
          });
        },
        syncfs_save_to_idb: function(mount, callback) {
          CLOUDFS.getLocalSet(mount, function(err, local) {
            if (err) return callback(err);

            CLOUDFS.getIDBSet(mount, function(err, idb) {
              if (err) return callback(err);

              CLOUDFS.reconcile(mount, local, idb, callback);
            });
          });
        },
        syncfs_save_to_cloud: function(mount, callback) {
          CLOUDFS.getIDBSet(mount, function(err, idb) {
            if (err) return callback(err);

            CLOUDFS.getRemoteSet(mount, function(err, remote) {
              if (err) return callback(err);

              CLOUDFS.reconcile(mount, idb, remote, callback);
            });
          });
        },
        // handling the diffing of "haves" and "have nots"
        reconcile: function(mount, src, dst, callback, skip_remove) {
          var total = 0;

          var create = [];
          Object.keys(src.entries).forEach(function (key) {
            var e = src.entries[key];
            var e2 = dst.entries[key];
            if (!e2 || e.timestamp > e2.timestamp) {
              create.push(key);
              total++;
            }
          });

          var remove = [];
          if (!skip_remove) {
              Object.keys(dst.entries).forEach(function (key) {
                  var e = dst.entries[key];
                  var e2 = src.entries[key];
                  if (!e2) {
                      remove.push(key);
                      total++;
                  }
              });
          }

          if (!total) {
            return callback(null);
          }

          var completed = 0;

          function done(err) {
            if (err) {
              if (!done.errored) {
                done.errored = true;
                return callback(err);
              }
              return;
            }
            if (++completed >= total) {
              return callback(null);
            }
          };

          var srcFunc = CLOUDFS.getFuncSet(src.type),
            dstFunc = CLOUDFS.getFuncSet(dst.type);
          var srcCtx = srcFunc.start(mount, src, done),
            dstCtx = dstFunc.start(mount, dst, done);

          // sort paths in ascending order so directory entries are created
          // before the files inside them
          create.sort().forEach(function (path) {
            var pathinfo = src.entries[path];
            srcFunc.load(mount, srcCtx, pathinfo, function(err, entry) {
              if (err) return done(err);
              dstFunc.store(mount, dstCtx, pathinfo, entry, done);
            });
          });

          // sort paths in descending order so files are deleted before their
          // parent directories
          remove.sort().reverse().forEach(function(path) {
            dstFunc.remove(mount, dstCtx, dst.entries[path], done);
          });
        },
        // Utility functions
        validateProvider: function(provider_name) {
            var provider = CLOUD_PROVIDERS[provider_name];
            if (provider === undefined) return false;

            var requiredMethods = ['allFiles', 'read', 'write', 'rm','isAvailable'];
            return requiredMethods.every(function(method) {
                return (method in provider);
            });
        },
        fetchProvider: function(mount) {
            if (mount.opts.provider === undefined || CLOUD_PROVIDERS[mount.opts.provider] === undefined) {
                return false;
            }
            if (CLOUDFS.validateProvider( mount.opts.provider ) ) {
                return CLOUD_PROVIDERS[mount.opts.provider];
            } else {
                return false;
            }
        },
        populateDirs: function(entries, f, toAbsolute) {
          if (f.path.indexOf('/') !== -1) {
            // we have folders.. stuff them in the list
            var parts = f.path.split('/'),
                prefix = '';
            // remove the "file" from the end
            parts.pop();
            // remove the empty directory from the beginning
            if (parts[0] == '') parts.shift();

            parts.forEach(function(e) {
              var p = prefix.length ? PATH.join2(prefix, e) : e,
                abs = toAbsolute(p);
              if (!(abs in entries)) {
                entries[abs] = {
                  path: p,
                  type: 'dir',
                  timestamp: f.timestamp
                };
              }
              prefix = p;
            });
          }
        },
        getFuncSet: function(type) {
          if (type == 'local') {
            return {
              start: function() {},
              load: CLOUDFS.loadLocalEntry,
              store: CLOUDFS.storeLocalEntry,
              remove: CLOUDFS.removeLocalEntry
            };
          } else if (type == 'remote') {
            return {
              start: function() {},
              load: CLOUDFS.loadRemoteEntry,
              store: CLOUDFS.storeRemoteEntry,
              remove: CLOUDFS.removeRemoteEntry
            };
          } else if (type == 'idb') {
            return {
              start: CLOUDFS.startIDBEntry,
              load: CLOUDFS.loadIDBEntry,
              store: CLOUDFS.storeIDBEntry,
              remove: CLOUDFS.removeIDBEntry
            };
          }
        },
        // Indexed DB Utility functions
        db: null,
        indexedDB: function() {
          if (typeof indexedDB !== 'undefined') return indexedDB;
          var ret = null;
          if (typeof window === 'object') ret = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
          assert(ret, 'CLOUDFS used, but indexedDB not supported');
          return ret;
        },
        DB_VERSION: 1,
        DB_NAME: 'CLOUDFS',
        DB_STORE_NAME: 'FILE_DATA',
        getDB: function(callback) {
          // check the cache first
          var db = CLOUDFS.db;
          if (db) {
            return callback(null, db);
          }

          var req;
          try {
            req = CLOUDFS.indexedDB().open(CLOUDFS.DB_NAME, CLOUDFS.DB_VERSION);
          } catch (e) {
            return callback(e);
          }
          req.onupgradeneeded = function(e) {
            var db = e.target.result;
            var transaction = e.target.transaction;

            var fileStore;

            if (db.objectStoreNames.contains(CLOUDFS.DB_STORE_NAME)) {
              fileStore = transaction.objectStore(CLOUDFS.DB_STORE_NAME);
            } else {
              fileStore = db.createObjectStore(CLOUDFS.DB_STORE_NAME);//, {keyPath: 'key'});
            }

            fileStore.createIndex('scope','scope',{ unique: false });
          };
          req.onsuccess = function() {
            db = req.result;

            // add to the cache
            CLOUDFS.db = db;
            callback(null, db);
          };
          req.onerror = function() {
            callback(this.error);
          };
        },
        listFilesByScope: function(scope, listCB) {
            CLOUDFS.getDB(function(err, db) {
                if (err) listCB(err);

                var transaction = db.transaction([CLOUDFS.DB_STORE_NAME], 'readonly');
                transaction.onerror = function() { listCB(this.error); };

                var store = transaction.objectStore(CLOUDFS.DB_STORE_NAME);
                var index = store.index('scope');
                var entries = [];

                index.openCursor(IDBKeyRange.only(scope)).onsuccess = function(event) {
                    var cursor = event.target.result;

                    if (!cursor) {
                          return listCB(null, entries);
                    }

                    if (FS.isFile(cursor.value.mode)) {
                        entries.push(cursor.value.path);
                    }

                    cursor.continue();
                };
            });
        },
        clearFilesByScope: function(scope, oncomplete) {
            CLOUDFS.getDB(function(err, db) {
                if (err) oncomplete(err);

                var transaction = db.transaction([CLOUDFS.DB_STORE_NAME], 'readwrite');
                transaction.onerror = function() { oncomplete(this.error); };

                var store = transaction.objectStore(CLOUDFS.DB_STORE_NAME);
                var index = store.index('scope');
                var entries = [];

                index.openKeyCursor(IDBKeyRange.only(scope)).onsuccess = function(event) {
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
        // Getting list of entities
        getLocalSet: function(mount, callback) {
            function isRealDir(p) {
                return p !== '.' && p !== '..';
            };
            function toAbsolute(root) {
                return function(p) {
                    return PATH.join2(root, p);
                };
            };
            function checkPath(path) {
                for (var i = 0, l = mount.opts.filters.length; i < l; ++i) {
                    var f = mount.opts.filters[i];
                    if (typeof f == 'string') {
                        if (path.lastIndexOf(f, 0) == 0) {
                            return true;
                        }
                    } if (typeof f == 'function') {
                        if (f(path)) {
                            return true;
                        }
                    } if (f instanceof RegExp) {
                        if (f.test(path)) {
                            return true;
                        }
                    }
                }
                return false;
            };

            var entries = {},
                shouldFilter = false,
                check = FS.readdir(mount.mountpoint).filter(isRealDir);

            if (mount.opts.filters && mount.opts.filters.length) {
                shouldFilter = true;
            }

            while (check.length) {
                var path = check.pop(),
                    stat,
                    keep = true,
                    is_dir = false,
                    abs_path = PATH.join2(mount.mountpoint, path);

                try {
                    stat = FS.stat(abs_path);
                } catch (e) {
                    return callback(e);
                }

                if (FS.isDir(stat.mode)) {
                    check.push.apply(check, FS.readdir(abs_path).filter(isRealDir).map(toAbsolute(path)));
                    is_dir = true;
                } else if (shouldFilter) {
                    keep = checkPath(path);
                }

                if (keep) {
                    entries[abs_path] = {
                        timestamp: stat.mtime,
                        path: path,
                        type: is_dir ? 'dir' : 'file'
                    };
                }
            }

            return callback(null, { type: 'local', entries: entries });
        },
        getIDBSet: function(mount, callback) {
          var entries = {},
              toAbsolute = function(p) { return PATH.join2(mount.mountpoint, p); };

          CLOUDFS.getDB(function(err, db) {
            if (err) return callback(err);

            var transaction = db.transaction([CLOUDFS.DB_STORE_NAME], 'readonly');
            transaction.onerror = function() { callback(this.error); };

            var store = transaction.objectStore(CLOUDFS.DB_STORE_NAME);
            var index = store.index('scope');

            index.openCursor(IDBKeyRange.only(mount.opts.scope || '')).onsuccess = function(event) {
              var cursor = event.target.result;

              if (!cursor) {
                return callback(null, { type: 'idb', db: db, entries: entries });
              }

              entries[PATH.join2(mount.mountpoint, cursor.value.path)] = {
                path: cursor.value.path,
                type: FS.isDir(cursor.value.mode) ? 'dir' : 'file',
                timestamp: cursor.value.timestamp
              };

              cursor.continue();
            };
          });
        },
        getRemoteSet: function(mount, callback) {
          mount.opts.provider.allFiles(mount.opts.cloud, function(data) {
            var entries = {},
                toAbsolute = function(p) { return PATH.join2(mount.mountpoint, p); };
            for(var k in data) {
              var f = data[k];

              CLOUDFS.populateDirs(entries, f, toAbsolute);

              var p = toAbsolute(f.path);
              entries[p] = {
                url: f.url,
                path: f.path.trim('/'),
                type: 'file',
                timestamp: f.timestamp,
                size: f.size
              };
            }
            return callback(null, { type: 'remote', entries: entries } );
          }, function(e) {
            callback(e || new Error('failed request'));
          });
        },
        // Local file access
        loadLocalEntry: function(mount, ctx, pathinfo, callback) {
            var stat, node,
                path = PATH.join2(mount.mountpoint, pathinfo.path);

            try {
                var lookup = FS.lookupPath(path);
                node = lookup.node;
                stat = FS.stat(path);
            } catch (e) {
                return callback(e);
            }

            if (FS.isDir(stat.mode)) {
                return callback(null, { timestamp: stat.mtime, mode: stat.mode });
            } else if (FS.isFile(stat.mode)) {
                // Performance consideration: storing a normal JavaScript array to a IndexedDB is much slower than storing a typed array.
                // Therefore always convert the file contents to a typed array first before writing the data to IndexedDB.
                node.contents = MEMFS.getFileDataAsTypedArray(node);
                return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
            } else {
                return callback(new Error('node type not supported'));
            }
        },
        storeLocalEntry: function(mount, ctx, pathinfo, entry, callback) {
          var path = PATH.join2(mount.mountpoint, pathinfo.path);
          try {
            if (FS.isDir(entry.mode)) {
              try {
                FS.mkdir(path, entry.mode);
              } catch(e) {
                // ignore existing dirs
              }
            } else if (FS.isFile(entry.mode)) {
              FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
            } else {
              return callback(new Error('node type not supported'));
            }

            FS.utime(path, entry.timestamp, entry.timestamp);
          } catch (e) {
            return callback(e);
          }

          callback(null);
        },
        removeLocalEntry: function(mount, ctx, pathinfo, callback) {
          var path = PATH.join2(mount.mountpoint, pathinfo.path);
          try {
            var lookup = FS.lookupPath(path);
            var stat = FS.stat(path);

            if (FS.isDir(stat.mode)) {
              try {
                FS.rmdir(path);
              } catch(e) {
                // it's ok if we can't remove the local folder.. it could be filtered files are in there
              }
            } else if (FS.isFile(stat.mode)) {
              FS.unlink(path);
            }
          } catch (e) {
            return callback(e);
          }

          callback(null);
        },
        // IDB File access
        buildIDBKey: function(mount, pathinfo) {
          return (mount.opts.scope || '') + ':' + pathinfo.path;
        },
        startIDBEntry: function(mount, dataset, ondone) {
          return {db: dataset.db};
        },
        loadIDBEntry: function(mount, ctx, pathinfo, callback) {
          var tx = ctx.db.transaction([CLOUDFS.DB_STORE_NAME], 'readwrite');
          tx.onerror = function() { callback(this.error); };
          var store = tx.objectStore(CLOUDFS.DB_STORE_NAME);

          var req = store.get(CLOUDFS.buildIDBKey(mount, pathinfo));
          req.onsuccess = function(event) { callback(null, event.target.result); };
          req.onerror = function() { callback(this.error); };
        },
        storeIDBEntry: function(mount, ctx, pathinfo, entry, callback) {
          var tx = ctx.db.transaction([CLOUDFS.DB_STORE_NAME], 'readwrite');
          tx.onerror = function() { callback(this.error); };
          var store = tx.objectStore(CLOUDFS.DB_STORE_NAME);

          // keep scope with entry
          var d = {
            scope: mount.opts.scope,
            path: pathinfo.path,
            mode: entry.mode,
            timestamp: entry.timestamp
          };
          if (entry.contents) d.contents = entry.contents;

          var req = store.put(d, CLOUDFS.buildIDBKey(mount, pathinfo));
          req.onsuccess = function() { callback(null); };
          req.onerror = function() { callback(this.error); };
        },
        removeIDBEntry: function(mount, ctx, pathinfo, callback) {
          var tx = ctx.db.transaction([CLOUDFS.DB_STORE_NAME], 'readwrite');
          tx.onerror = function() { callback(this.error); };
          var store = tx.objectStore(CLOUDFS.DB_STORE_NAME);

          var req = store.delete(CLOUDFS.buildIDBKey(mount, pathinfo));
          req.onsuccess = function() { callback(null); };
          req.onerror = function() { callback(this.error); };
        },
        // Remote file access
        loadRemoteEntry: function(mount, ctx, pathinfo, callback) {
            if (pathinfo.type == 'file') {
                mount.opts.provider.read(mount.opts.cloud, pathinfo.url,
                    function(data) {
                        // ensure data is in Uint8Array
                        var u8data = new Uint8Array(data);
                        callback(null, { contents: u8data, timestamp: pathinfo.timestamp, mode: CLOUDFS._FILE_MODE });
                    },
                    function(e) {
                        callback(e);
                    });
            } else {
                callback(null, { timestamp: pathinfo.timestamp, mode: CLOUDFS._DIR_MODE });
            }
        },
        storeRemoteEntry: function(mount, ctx, pathinfo, entry, callback) {
            if (FS.isFile(entry.mode)) {
                mount.opts.provider.write(mount.opts.cloud, pathinfo, entry.contents, function() {
                    callback(null);
                },
                function(e) {
                    callback(e);
                })
            }
        },
        removeRemoteEntry: function(mount, ctx, pathinfo, callback) {
          if (pathinfo.type == 'file') {
            mount.opts.provider.rm(mount.opts.cloud, pathinfo, function() {
              callback(null);
            },
            function(e) {
              callback(e);
            });
          }
        },
        _FILE_MODE: {{{ cDefine('S_IFREG') | 0777 }}},
        _DIR_MODE: {{{ cDefine('S_IFDIR') | 0777 }}}
    }
};

autoAddDeps(LibraryCLOUDFS, '$CLOUDFS');
mergeInto(LibraryManager.library, LibraryCLOUDFS);
