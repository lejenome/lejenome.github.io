(function (window) {
    "use strict";
    var DISPLAY_NAME = "Github";
    var API_URL = "https://api.github.com/";
    function setupGithub(githubData, settings) {
        githubData.user.following = numberWithCommas(githubData.user.following);
        githubData.user.followers = numberWithCommas(githubData.user.followers);
        return githubData;
    }
    function fetchData(settings) {
        var context = {};
        return Promise.all([
            asyncGet(API_URL + "users/" + settings.client_id),
            asyncGet(API_URL + "users/" + settings.client_id + "/repos")
        ]).then(function (res) {
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
        setup: setupGithub,
        fetch: fetchData
    }, "github");
}(window));