(function (window) {
    "use strict";
    var DISPLAY_NAME = "Google+";
    var API_URL = "https://www.googleapis.com/plus/v1/";
    var BASE_URL = "https://plus.google.com/";
    function getURL(settings) {
        return BASE_URL + settings.user_id;
    }
    function setupGplus(gplusData, settings) {
        $.each(gplusData.activities, function (i, t) {
            if (t.verb === "post")
                t.verb = "posted";
            else if (t.verb === "share")
                t.verb = "shared";
            if (t.title.length > 60)
                t.title = t.title.substr(0, 57) + "...";
            t.replies = t.object.replies.totalItems;
            t.plusoners = t.object.plusoners.totalItems;
            t.resharers = t.object.resharers.totalItems;
            t.published = moment.utc(t.published, "YYYY-MM-DD HH:mm:ss").fromNow();
            if (t.object.attachments && t.object.attachments[0].image) {
                t.object.image = t.object.attachments[0].image.url;
            } else if (t.object.content) {
                t.object.content = new DOMParser().parseFromString("<div>" + t.object.content + "</div>", "text/xml").documentElement.textContent;
                if (t.object.content.length > 200)
                    t.object.content = t.object.content.substr(0, 197) + "...";
            }
        });
        return gplusData;
    }
    function fetchData(settings) {
        var context = {};
        return Promise.all([
            asyncGet(API_URL + "people/" + settings.user_id + "?fields=circledByCount%2CcurrentLocation%2CdisplayName%2C" + "image%2Furl%2Cnickname%2Coccupation%2CplacesLived%2CplusOneCount%2Ctagline%2Curl" + "&key=" + settings.api_key),
            asyncGet(API_URL + "people/" + settings.user_id + "/activities/public" + "?maxResults=20&fields=items(annotation%2Cobject(actor(displayName%2Curl)" + "%2Cattachments(content%2CdisplayName%2Cimage%2CobjectType%2Cthumbnails)" + "%2Ccontent%2CobjectType%2Cplusoners%2FtotalItems%2Creplies%2F" + "totalItems%2Cresharers%2FtotalItems%2Curl)%2Cpublished%2Ctitle%2Curl%2Cverb)%2C" + "nextPageToken&key=" + settings.api_key)
        ]).then(function (res) {
            context.newt_page = res[1]["nextPageToken"];
            if (!res[0]["currentLocation"] && res[0]["placesLived"])
                res[0]["currentLocation"] = res[0]["placesLived"][0]["value"];
            context.user_info = res[0];
            context.activities = res[1]["items"];
            return Promise.resolve(context);
        });
    }
    exportService({
        displayName: DISPLAY_NAME,
        template: "gplus.html",
        getURL: getURL,
        setup: setupGplus,
        fetch: fetchData
    }, "gplus");
}(window));