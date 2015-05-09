(function (window) {
    "use strict";
    var DISPLAY_NAME = "Bitbucket";
    var API_URL = "https://api.bitbucket.org/1.0/";
    var BASE_URL = "https://bitbucket.org/";
    function getURL(settings) {
        return BASE_URL + settings.username;
    }
    function setupBitbucket(bitbucketData, settings) {
        bitbucketData.user.followers = numberWithCommas(bitbucketData.user.followers);
        return bitbucketData;
    }
    function fetchData(settings) {
        var context = {};
        return Promise.all([
            asyncGet(API_URL + "users/" + settings.username + "?jsoncallback=mainRequest"),
            asyncGet(API_URL + "users/" + settings.username + "/followers?jsoncallback=followersRequest")
        ]).then(function (res) {
            context = res[0];
            context["user"]["followers"] = res[1]["count"];
            context["user"]["public_repos"] = context["repositories"].length;
            context["repositories"].sort(function (r1, r2) {
                return r1.utc_last_updated < r2.utc_last_updated;
            });
            if (settings.show_forks) {
                return Promise.all(context["repositories"].map(function (repo) {
                    return asyncGet(API_URL + "repositories/" + settings.username + "/" + repo["slug"] + "?jsoncallback=forksRequest");
                })).then(function (forks) {
                    var i = 0;
                    forks.forEach(function (fork) {
                        context["repositories"][i++]["forks_count"] = fork["forks_count"];
                    });
                    return Promise.resolve(context);
                });
            } else {
                return Promise.resolve(context);
            }
        });
    }
    exportService({
        displayName: DISPLAY_NAME,
        template: "bitbucket.html",
        getURL: getURL,
        setup: setupBitbucket,
        fetch: fetchData
    }, "bitbucket");
}(window));