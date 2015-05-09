"use strict";
//Global configs and functions shared between js
window.UNKNOWN_ERROR = -1;
window.NO_MORE_DATA = -2;
window.MODULE_NOT_FOUND = -3;
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
require.config({
    baseUrl: "templates/",
    paths: {
        "text": "../js/libs/text",
        "json": "../js/libs/json"
    },
    waitSeconds: 15
});
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
    zIndex: 2000000000
};
function formatModuleName(module) {
    return module.replace(/_(.)/g, function (match, p1) {
        return p1.toUpperCase();
    });
}
function syncGet(url, success, headers, failure) {
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
function asyncGet(url, headers, jsonp) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: url,
            headers: headers,
            jsonp: jsonp,
            contentType: "application/json; charset=utf-8",
            type: "GET",
            dataType: "jsonp",
            async: false,
            success: function (res) {
                if ("meta" in res && Object.keys(res).length === 2)
                    if ("data" in res)
                        res = res.data;
                    else if ("response" in res)
                        res = res.response;
                resolve(res);
            },
            error: function (xhr, status) {
                reject(status);
            }
        });    //		syncGet(url, resolve, headers, reject);
    });
}