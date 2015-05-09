(function (window) {
    "use strict";
    var DISPLAY_NAME = "Facebook";
    var API_URL = "https://graph.facebook.com/v2.1/";
    var BASE_URL = "https://facebook.com/";
    function getURL(settings) {
        return BASE_URL + settings.username;
    }
    function setupFacebook(facebookData, settings) {
        facebookData.url = "https://facebook.com/" + settings.username;
        facebookData.image = "imgs/pic.png";
        facebookData.posts = facebookData.statuses.data.concat(facebookData.links.data);
        facebookData.posts.sort(function (p1, p2) {
            return (p1.updated_time || p1.created_time) < (p2.updated_time || p2.created_time);
        });
        facebookData.posts.forEach(function (p) {
            p.url = facebookData.url + "/posts/" + p.id;
            p.updated_time = moment.utc(p.updated_time || p.created_time, "YYYY-MM-DD HH:mm:ss").fromNow();
            if (p.likes)
                p.likes = p.likes.data.length;
            else
                p.likes = 0;
            if (p.comments)
                p.comments = p.comments.data.length;
            else
                p.comments = 0;
            if (p.sharedposts)
                p.sharedposts = p.sharedposts.data.length;
            else
                p.sharedposts = 0;
            if (p.message && p.message.length > 200)
                p.message = p.message.substr(0, 197) + "...";
        });
        return facebookData;
    }
    function fetchData(settings) {
        return asyncGet(API_URL + "me?fields=statuses.limit(10){message," + "updated_time,comments{id},likes{id},sharedposts}," + "links.limit(10){comments{id},likes{id},sharedposts{id}," + "picture,link,name,created_time},id,about,link,name,website," + "work&method=get&access_token=" + settings.access_token).then(function (res) {
            return Promise.resolve(res);
        });
    }
    exportService({
        displayName: DISPLAY_NAME,
        template: "facebook.html",
        getURL: getURL,
        setup: setupFacebook,
        fetch: fetchData
    }, "facebook");
}(window));