(function (window) {
    "use strict";
    var DISPLAY_NAME = "Github";
    var API_URL = "https://api.github.com/";
    var BASE_URL = "https://github.com/";
    function getURL(settings) {
        return BASE_URL + settings.username;
    }
    function setupGithub(githubData, settings) {
        githubData.user.following = numberWithCommas(githubData.user.following);
        githubData.user.followers = numberWithCommas(githubData.user.followers);
        return githubData;
    }
    function fetchData(settings) {
        var context = {};
        return Promise.all([
            asyncGet(API_URL + "users/" + settings.username),
            asyncGet(API_URL + "users/" + settings.username + "/repos")
        ]).then(function (res) {
            res[0] = res[0].data;
            res[1] = res[1].data;
            context.user = res[0];
            context.repos = res[1];
            context["repos"].sort(function (r1, r2) {
                return r1.updated_at < r2.updated_at;
            });
            return Promise.resolve(context);
        });
    }
    exportService({
        displayName: DISPLAY_NAME,
        template: "github.html",
        getURL: getURL,
        setup: setupGithub,
        fetch: fetchData
    }, "github");
}(window));