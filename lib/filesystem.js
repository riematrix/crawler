// Copyright (c) 2014 Jie Zhou. All rights reserved.
// Use of this source code is governed by a MIT-style license that can be
// found in the LICENSE file.

function Filesystem(type, quota) {
    this.quota = quota || this.quota;
    this.type = type || this.type; // PERSISTENT or TEMPORARY
    this.storageType = this.type === window.PERSISTENT
        ? "webkitPersistentStorage"
        : "webkitTemporaryStorage";
    this.fs = null;
}

Filesystem.prototype = {
    quota: 1024,
    type: window.TEMPORARY,
    mimeType: "text/plain",
    deferred: Deferred,
    init: function(){
        var deferred = new this.deferred;
        var type = this.type,
            quota = this.quota,
            self = this;
        navigator[this.storageType].requestQuota(quota, function(quota) {
            window.webkitRequestFileSystem(type, quota, function(fs){
                self.fs = fs;
                deferred.resolve(fs);
            }, function(){
                FileErrorHandler();
                deferred.reject();
            });
        },  function(){
            FileErrorHandler();
            deferred.reject();
        });
        return deferred.promise();
    },
    createFile: function(name, data, options){
        var mimeType = options && options.mimeType || this.mimeType,
            create = options && options.create;
        create = typeof create === "undefined" ? true : create;
        var deferred = new this.deferred;

        var splitPath = name.split("/"),
            fileName = splitPath.pop(),
            self = this;

        this.createDirectory(splitPath.join("/")).done(function(){
            self.fs.root.getFile(name, {create: create}, function(fileEntry) {
                fileEntry.createWriter(function(writer) {
                    var truncated = false;
                    writer.onwriteend = function(e) {
                        if (!truncated) {
                            truncated = true;
                            this.truncate(this.position);
                        }
                        deferred.resolve();
                    };
                    writer.onerror = function(e) {
                        deferred.reject();
                    };
                    writer.write(new Blob([data], {type: mimeType}));
                }, function(){
                    FileErrorHandler();
                    deferred.reject();
                });

            }, function(e){
                FileErrorHandler(e);
                deferred.reject();
            });
        });
        return deferred.promise();
    },
    appendToFile: function(name, content, mimeType){
        mimeType = mimeType || this.mimeType;
        var deferred = new this.deferred;
        this.fs.root.getFile(name, { create: false }, function (fileEntry) {
            fileEntry.createWriter(function (fileWriter) {
                fileWriter.seek(fileWriter.length);

                var bb = new BlobBuilder();
                bb.append(content);
                fileWriter.write(bb.getBlob(mimeType));
                deferred.resolve();
            }, function(){
                FileErrorHandler();
                deferred.reject();
            });
        }, function(){
            FileErrorHandler();
            deferred.reject();
        });
        return deferred.promise();
    },
    readFile: function(name){
        var deferred = new this.deferred;
        this.fs.root.getFile(name,
            {create: false},
            function(entry) {
                entry.file(function(file) {
                    var fileReader = new FileReader(), self = this;

                    fileReader.onload = function(e) {
                        deferred.resolve(e.target.result);
                    };

                    fileReader.onerror = function(e) {
                        console.error("Read failed: " + e.toString());
                        deferred.reject();
                    };

                    fileReader.readAsText(file);
                }, function(e){
                    FileErrorHandler(e);
                    deferred.reject(e);
                });
            }, function(e){
                FileErrorHandler(e);
                deferred.reject(e);
            });
        return deferred.promise();
    },
	readDir: function(name,eachEntry){
        var deferred = new this.deferred;
        this.fs.root.getDirectory(name,{},function(dirEntry) {
            var dirReader = dirEntry.createReader();
            dirReader.readEntries(function(entries) {
                for(var i = 0; i < entries.length; i++) {
                    var entry = entries[i];
                    eachEntry(entry);
                }
            })
        },function(e){
            FileErrorHandler(e);
            deferred.reject(e);
        });
        return deferred.promise();
    },
    deleteFile : function (fileName) {
        var deferred = new this.deferred;
        this.fs.root.getFile(fileName, { create: false }, function (fileEntry) {
            fileEntry.remove(function () {
                deferred.resolve();
            }, function(e){
                FileErrorHandler(e);
                deferred.reject();
            });
        }, function(e){
            FileErrorHandler(e);
            deferred.reject();
        });
    },
    createDirectory: function(folder){
        var decedentFolders = folder.split("/"), root = this.fs.root;
        var deferred = new this.deferred;
        (function create(folders){
            if(!folders[0]){
                setTimeout(function(){deferred.resolve();},100);
                return;
            }
            root.getDirectory(folders[0], {create: true}, function(dirEntry) {
                if (folders.length) {
                    create(folders.slice(1));
                }
                else{
                    deferred.resolve();
                }
            }, function(e){
                FileErrorHandler(e);
                deferred.reject();
            });
        })(decedentFolders);
        return deferred.promise();
    },
    removeDirectory: function (directoryName, callback) {
        var deferred = new this.deferred;
        fs.root.getDirectory(directoryName, {}, function (dirEntry) {
            dirEntry.removeRecursively(function () {
                deferred.resolve();
            }, FileErrorHandler);

        }, FileErrorHandler);
        return deferred.promise();
    }/*,
     errorHandler: function(e){
     this.deferred.reject();
     FileErrorHandler(e);
     }*/
};

function FileErrorHandler(e) {
    var msg = "";

    switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = "QUOTA_EXCEEDED_ERR";
            break;
        case FileError.NOT_FOUND_ERR:
            msg = "NOT_FOUND_ERR";
            break;
        case FileError.SECURITY_ERR:
            msg = "SECURITY_ERR";
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = "INVALID_MODIFICATION_ERR";
            break;
        case FileError.INVALID_STATE_ERR:
            msg = "INVALID_STATE_ERR";
            break;
        default:
            msg = "Unknown Error";
            break;
    }
    console.error("Error: " + msg);
}