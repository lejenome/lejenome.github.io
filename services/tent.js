(function (window) {
    "use strict";
    var DISPLAY_NAME = "Tent.io";
    function tentLinkify(text) {
        text = text.replace(/(https?:\/\/\S+)/gi, function (s) {
            return "<a href='" + s + "'>" + s + "</a>";
        });
        return text;
    }
    function getURL(settings) {
        return settings.url;
    }
    function setupTent(tentData, settings) {
        var tent_posts = tentData[0], tent_profile = tentData[1], tent_followers = tentData[2], tent_followings = tentData[3], tent_posts_count = tentData[4];
        var user = tent_profile["https://tent.io/types/info/basic/v0.1.0"];
        user.entity_url = tent_profile["https://tent.io/types/info/core/v0.1.0"].entity;
        user.feed_url = settings.feed_url;
        user.profile_image_url = user.avatar_url;
        user.statuses_count = numberWithCommas(tent_posts_count);
        user.friends_count = numberWithCommas(tent_followings.length);
        user.followers_count = numberWithCommas(tent_followers.length);
        user.f_description = user.bio;
        var posts = [];
        var item_count = 0;
        $.each(tent_posts, function (i, t) {
            if (item_count > 4)
                return;
            // show only tent.io status posts
            if (t.type === "https://tent.io/types/post/status/v0.1.0") {
                t.formated_date = moment(new Date(t.published_at * 1000)).fromNow();
                t.f_text = tentLinkify(t.content.text);
                t.user = user;
                posts.push(t);
                item_count++;
            }
        });
        return {
            "user": user,
            "posts": posts
        };
    }
    function fetchData(settings) {
        return Promise.all([
            asyncGet(settings.entity_url + "/posts?entities=" + settings.url),
            asyncGet(settings.entity_url + "/discover?entities=" + settings.url),
            asyncGet(settings.entity_url + "/followers?entities=" + settings.url),
            asyncGet(settings.entity_url + "/followings?entities=" + settings.url),
            asyncGet(settings.entity_url + "/posts/count?entities=" + settings.url)
        ]);
    }
    exportService({
        displayName: DISPLAY_NAME,
        template: "tent.html",
        getURL: getURL,
        setup: setupTent,
        fetch: fetchData
    }, "tent");
}(window));