(function (window) {
    "use strict";
    var DISPLAY_NAME = "Last.fm";
    var API_URL = "https://ws.audioscrobbler.com/2.0/";
    function setupLastfm(lastfmData, settings) {
        /* Add extra helper to parse out the #text fields in context passed to
         * handlebars.  The '#' character is reserved by the handlebars templating
         * language itself so cannot reference '#text' easily in the template. */
        Handlebars.registerHelper("text", function (obj) {
            try {
                return obj["#text"];
            } catch (err) {
                return "";
            }
        });
        Handlebars.registerHelper("image_url", function (obj) {
            try {
                return obj[0]["#text"];
            } catch (err) {
                return "";
            }
        });
        Handlebars.registerHelper("avatar_url", function (obj) {
            try {
                return obj[1]["#text"];
            } catch (err) {
                return "";
            }
        });
        lastfmData.user_info.user.formatted_plays = numberWithCommas(lastfmData.user_info.user.playcount);
        lastfmData.user_info.user.formatted_playlists = numberWithCommas(lastfmData.user_info.user.playlists);
        lastfmData.user_info.user.formatted_register_date = moment.utc(lastfmData.user_info.user.registered["#text"], "YYYY-MM-DD HH:mm").format("MM/DD/YYYY");
        $.each(lastfmData.recenttracks.recenttracks.track, function (i, t) {
            // Lastfm can be really finicky with data and return garbage if
            // the track is currently playing
            var date;
            try {
                date = t.date["#text"];
            } catch (err) {
                t.formatted_date = "Now Playing";
                return true;    // equivalent to "continue" with a normal for loop
            }
            t.formatted_date = moment.utc(date, "DD MMM YYYY, HH:mm").fromNow();
        });
        return lastfmData;
    }
    function fetchData(settings) {
        return Promise.all([
            asyncGet(API_URL + "?method=user.getinfo&user=" + settings.username + "&format=json&api_key=" + settings.api_key),
            asyncGet(API_URL + "?method=user.getrecenttracks&user=" + settings.username + "&format=json&api_key=" + settings.api_key)
        ]).then(function (res) {
            return Promise.resolve({
                user_info: res[0],
                recenttracks: res[1]
            });
        });
    }
    exportService({
        displayName: DISPLAY_NAME,
        template: "lastfm.html",
        setup: setupLastfm,
        fetch: fetchData
    }, "lastfm");
}(window));