(function (window) {
    "use strict";
    var DISPLAY_NAME = "Twitter";
    var API_URL = "https://api.twitter.com/1.1/";
    var BASE_URL = "https://twitter.com/";
    function getURL(settings) {
        return BASE_URL + settings.username;
    }
    function twitterLinkify(text) {
        text = text.replace(/(https?:\/\/\S+)/gi, function (s) {
            return "<a href='" + s + "'>" + s + "</a>";
        });
        text = text.replace(/(^|) @(\w+)/gi, function (s) {
            return "<a href='http://twitter.com/" + s + "'>" + s + "</a>";
        });
        text = text.replace(/(^|) #(\w+)/gi, function (s) {
            return "<a href='http://search.twitter.com/search?q=" + s.replace(/#/, "%23") + "'>" + s + "</a>";
        });
        return text;
    }
    function setupTwitter(twitterData) {
        var tweets = [];
        $.each(twitterData, function (i, t) {
            t.formated_date = moment(t.created_at).fromNow();
            t.f_text = twitterLinkify(t.text);
            tweets.push(t);
        });
        var user = twitterData[0].user;
        user.statuses_count = numberWithCommas(user.statuses_count);
        user.friends_count = numberWithCommas(user.friends_count);
        user.followers_count = numberWithCommas(user.followers_count);
        user.f_description = twitterLinkify(user.description);
        return {
            "user": user,
            "tweets": tweets
        };
    }
    function fetchData(settings) {
        return asyncGet(API_URL + "statuses/home_timeline.json?count=50&include_rts=true&exclude_replies=true&screen_name=" + settings.username, { "Authorization": "Bearer " + settings.access_token }).then(function (result) {
            return Promise.resolve(result);    /*    statuses_in_dict = []
                    for s in statuses:
                        statuses_in_dict.append(json.loads(s.AsJsonString()))

                    return HttpResponse(content=json.dumps(statuses_in_dict),
                                        status=200,
                                        content_type="application/json")
            */
                                               //            return Promise.resolve(result);
        });
    }
    exportService({
        displayName: DISPLAY_NAME,
        template: "twitter.html",
        getURL: getURL,
        setup: setupTwitter,
        fetch: fetchData
    }, "twitter");
}(window));