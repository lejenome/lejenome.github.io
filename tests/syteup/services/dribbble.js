(function (window) {
    "use strict";
    var DISPLAY_NAME = "Dribbble";
    var API_URL = "https://api.dribbble.com/players/";
    function setupDribbble(dribbbleData, settings) {
        var user = dribbbleData.shots[0].player;
        user.following_count = numberWithCommas(user.following_count);
        user.followers_count = numberWithCommas(user.followers_count);
        user.likes_count = numberWithCommas(user.likes_count);
        return {
            "user": user,
            "shots": dribbbleData.shots
        };
    }
    function fetchData(settings) {
        return asyncGet(API_URL + settings.username + "/shots");
    }
    exportService({
        displayName: DISPLAY_NAME,
        template: "dribbble.html",
        setup: setupDribbble,
        fetch: fetchData
    }, "dribbble");
}(window));