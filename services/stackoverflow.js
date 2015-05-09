(function (window) {
    "use strict";
    var DISPLAY_NAME = "StackOverflow";
    var API_URL = "https://api.stackexchange.com/2.2/";
    var BASE_URL = "https://stackoverflow.com/users/";
    function getURL(settings) {
        return BASE_URL + settings.user_id + "/" + settings.username;
    }
    function setupStackoverflow(stackoverflowData, settings) {
        var user = stackoverflowData.user;
        var badge_count = user.badge_counts.bronze + user.badge_counts.silver + user.badge_counts.gold;
        user.badge_count = badge_count;
        user.about_me = (user.about_me || "").replace(/(<([^>]+)>)/gi, "");
        var timeline = stackoverflowData.timeline;
        $.each(timeline, function (i, t) {
            t.creation_date = moment.unix(t.creation_date).fromNow();
            if (t.action === "comment") {
                t.action = "commented";
            }
            if (t.detail && t.detail.length > 140) {
                t.detail = $.trim(t.detail).substring(0, 140).split(" ").slice(0, -1).join(" ") + "...";
            }
        });
        return {
            "user": user,
            "timeline": timeline
        };
    }
    function fetchData(settings) {
        return Promise.all([
            asyncGet(API_URL + "users/" + settings.user_id + "?site=stackoverflow&filter=!-*f(6q3e0kZX"),
            asyncGet(API_URL + "users/" + settings.user_id + "/timeline?site=stackoverflow")
        ]).then(function (res) {
            return Promise.resolve({
                user: res[0]["items"][0],
                timeline: res[1]["items"]
            });
        });
    }
    exportService({
        displayName: DISPLAY_NAME,
        template: "stackoverflow.html",
        getURL: getURL,
        setup: setupStackoverflow,
        fetch: fetchData
    }, "stackoverflow");
}(window));