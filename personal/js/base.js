(function (window) {
    "use strict";
    //Global configs and functions shared between js
    window.UNKNOWN_ERROR = -1;
    window.NO_MORE_DATA = -2;
    window.MODULE_NOT_FOUND = -3;
    window.numberWithCommas = function (x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    window.spin_opts = {
        lines: 9,
        length: 5,
        width: 2,
        radius: 4,
        rotate: 9,
        color: "#4c4c4c",
        speed: 1.5,
        trail: 40,
        shadow: false,
        hwaccel: true,
        className: "spinner",
        zIndex: 2000000000,
        left: "90%"
    };
    window.formatModuleName = function (module) {
        return module.replace(/_(.)/g, function (match, p1) {
            return p1.toUpperCase();
        });
    };
    window.formatModulePath = function (module) {
        return module.replace(/_(.)/g, function (match, p1) {
            return "-" + p1;
        });
    };
    window.alertError = function (error, errorMessage) {
        return asyncText("templates/alert.html").then(function (view) {
            var template = Handlebars.compile(view);
            $(template({
                error: error,
                error_message: errorMessage
            })).modal().on("hidden.bs.modal", function () {
                $(this).remove();
            });
            return Promise.resolve();
        });
    };
    /*
window.syncGet = function(url, success, headers, failure) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.onload = function () {
        if (this.status !== 200) {
            if (failure)
                failure();
            return;
        }
        success(JSON.parse(this.responseText));
    };
    xhr.onerror = function () {
        if (failure)
            failure();
    };
    if (headers) {
        for (var header in headers) {
            if (headers.hasOwnProperty(header))
                xhr.setRequestHeader(header, headers[header]);
        }
    }
    xhr.send();
}
*/
    window.asyncText = function (url, headers) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, false);
            if (xhr.overrideMimeType)
                xhr.overrideMimeType("text/plain");
            xhr.onload = function () {
                if (String(this.status) !== "200") {
                    reject(this.status);
                    return;
                }
                resolve(this.responseText);
            };
            xhr.onerror = function () {
                reject();
            };
            if (headers) {
                for (var header in headers) {
                    if (headers.hasOwnProperty(header))
                        xhr.setRequestHeader(header, headers[header]);
                }
            }
            xhr.send();
        });
    };
    window.asyncGet = function (url, headers, jsonp) {
        if (headers || typeof $ !== "function")
            return asyncText(url, headers).then(function (res) {
                return Promise.resolve(JSON.parse(res));
            });
        else
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: url,
                    jsonp: jsonp,
                    contentType: "application/json; charset=utf-8",
                    type: "GET",
                    dataType: "jsonp",
                    async: false,
                    success: function (res) {
                        resolve(res);
                    },
                    error: function (xhr, status) {
                        reject(status);
                    }
                });
            });
    };
    window.loadJS = function (src, obj, data, parentEl) {
        return new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.async = true;
            script.src = src.replace(/^\/\//, "https:" === document.location.protocol ? "https://" : "http://");
            if (obj)
                for (var opt in obj)
                    if (obj.hasOwnProperty(opt))
                        script[opt] = obj[opt];
            if (data)
                for (var el in data)
                    if (data.hasOwnProperty(el))
                        script.dataset[el] = data[el];
            function onload(e) {
                /* jshint validthis:true */
                this.removeEventListener("load", onload);
                this.removeEventListener("loadend", onload);
                this.removeEventListener("afterscriptexecute", onload);
                resolve();
            }
            script.addEventListener("load", onload);
            script.addEventListener("loadend", onload);
            script.addEventListener("afterscriptexecute", onload);
            (parentEl || document.getElementsByTagName("head")[0] || document.getElementsByTagName("body")[0]).appendChild(script);
        });
    };
    window.exportM = function (obj, name) {
        //	if(window.System) {
        //	        /*jshint esnext:true*/
        //		export default obj;
        //	} else
        if (typeof module !== "undefined" && module.export) {
            module.export[name] = obj;
        } else if (typeof define === "function" && define.amd) {
            define(name, function () {
                return obj;
            });
        } else {
            window[name] = obj;
        }
    };
    window.exportBlog = function (blog, name) {
        exportM(blog, formatModuleName(name) + "Blog");
    };
    window.exportService = function (service, name) {
        exportM(service, formatModuleName(name) + "Service");
    };
    window.exportPlugin = function (plugin, name) {
        exportM(plugin, formatModuleName(name) + "Plugin");
    };
    window.importM = function (name, path) {
        return new Promise(function (resolve, reject) {
            if (window[name]) {
                resolve(window[name]);    //		} else if (window.System) {
                                          //			/*global System*/
                                          //			System.import(path).then(function(_) {
                                          //				resolve(_[name] || _);
                                          //			});
            } else if (typeof define === "function" && define.amd) {
                require([path], function (_) {
                    resolve(_[name], _);
                });
            } else if (typeof module !== "undefined" && module.exports) {
                var _module = require(path);
                resolve(_module[name] || _module);
            } else {
                loadJS(path + ".js").then(function () {
                    resolve(window[name]);
                });
            }
        });
    };
}(window || global));