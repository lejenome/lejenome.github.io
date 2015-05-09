(function (window) {
    "use strict";
    var DISPLAY_NAME = "Instagram";
    var API_URL = "https://api.instagram.com/v1/";
    var nextId;
    function setupInstagram(instagramData, settings) {
        if (instagramData.media === 0) {
            return;
        }
        var user_counts = instagramData.user["counts"];
        user_counts.media = numberWithCommas(user_counts.media);
        user_counts.followed_by = numberWithCommas(user_counts.followed_by);
        user_counts.follows = numberWithCommas(user_counts.follows);
        $.each(instagramData.media, function (i, p) {
            p.formated_date = moment.unix(parseInt(p.created_time)).fromNow();
        });
        return instagramData;
    }
    function setupInstagramMore(instagramData, settings) {
        $.each(instagramData.media, function (i, p) {
            p.formated_date = moment.unix(parseInt(p.created_time)).fromNow();
        });
        return instagramData;
    }
    function fetchData(settings) {
        return Promise.all([
            asyncGet(API_URL + "users/" + settings.user_id + "/?access_token=" + settings.access_token),
            asyncGet(API_URL + "users/" + settings.user_id + "/media/recent/?access_token=" + settings.access_token)
        ]).then(function (res) {
            nextId = res[1]["pagination"]["next_max_id"];
            return Promise.resolve({
                "user": res[0],
                "media": res[1]["data"],
                "pagination": nextId
            });
        });
    }
    function fetchMore(settings) {
        if (nextId)
            return asyncGet(API_URL + "users/" + settings.user_id + "/media/recent/?access_token=" + settings.access_token + "&max_id=" + nextId).then(function (res) {
                nextId = res["pagination"]["next_max_id"];
                return Promise.resolve({
                    "media": res["data"],
                    "pagination": nextId
                });
            });
        else
            return Promise.reject(NO_MORE_DATA);
    }
    exportService({
        displayName: DISPLAY_NAME,
        template: "instagram.html",
        templateMore: "instagram-more.html",
        setup: setupInstagram,
        fetch: fetchData,
        supportMore: true,
        fetchMore: fetchMore,
        setupMore: setupInstagramMore
    }, "instagram");
}(window));