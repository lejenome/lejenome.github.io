(function (window) {
    "use strict";
    var DISPLAY_NAME = "Youtube";
    var API_URL = "https://www.googleapis.com/youtube/v3/";
    var BASE_URL = "https://www.youtube.com/user/";
    function getURL(settings) {
        return BASE_URL + settings.username;
    }
    function setupYoutube(youtubeData, settings) {
        if (youtubeData.message || youtubeData.activities.length === 0) {
            return;
        }
        youtubeData.statistics.url = BASE_URL + settings.username;
        youtubeData.channel.url = BASE_URL + settings.username;
        $.each(youtubeData.activities, function (i, t) {
            t.publishedAt = moment.utc(t.publishedAt, "YYYY-MM-DD HH:mm:ss").fromNow();
            t.img = t.thumbnails["default"].url;
            if (t.type === "playlistItem")
                t.type = "add to playlist";
            else if (t.type === "bulletin")
                t.type = "post";
        });
        return youtubeData;
    }
    function fetchData(settings) {
        var context = {};
        return asyncGet(API_URL + "channels?part=statistics%2Csnippet&forUsername=" + settings.username + "&key=" + settings.api_key).then(function (channels) {
            context.channel = channels["items"][0]["snippet"];
            context.statistics = channels["items"][0]["statistics"];
            context.id = channels["items"][0]["id"];
            context.username = settings.username;
            return asyncGet(API_URL + "activities?part=snippet%2CcontentDetails&channelId=" + context.id + "&maxResults=20&fields=items(contentDetails%2Csnippet)%2CnextPageToken&key=" + settings.api_key).then(function (activities) {
                context.next_page = activities["nextPageToken"];
                context.activities = activities["items"].map(function (item) {
                    var resource = item["contentDetails"][item["snippet"]["type"]];
                    if ("videoId" in resource)
                        item["snippet"]["url"] = "https://www.youtube.com/watch?v=" + resource["videoId"];
                    else if (resource["resourceId"]["channelId"])
                        item["snippet"]["url"] = "https://www.youtube.com/channel/" + resource["resourceId"]["channelId"];
                    else if (resource["resourceId"]["videoId"])
                        item["snippet"]["url"] = "https://www.youtube.com/watch?v=" + resource["resourceId"]["videoId"];
                    return item["snippet"];
                });
                return Promise.resolve(context);
            });
        });
    }
    exportService({
        displayName: DISPLAY_NAME,
        template: "youtube.html",
        getURL: getURL,
        setup: setupYoutube,
        fetch: fetchData
    }, "youtube");
}(window));