(function (window) {
    "use strict";
    var DISPLAY_NAME = "Foursquare";
    var API_URL = "";
    var BASE_URL = "";
    function getURL(settings) {
        return BASE_URL + settings.username;
    }
    function setupFoursquare(foursquareData, settings) {
        var photo_dict = foursquareData.user["photo"];
        if (photo_dict) {
            //foursquare api returned me a wrong prefix url so check the url with your foursquare profile.
            foursquareData.user["photoURL"] = "https://is0.4sqi.net/userpix_thumbs" + photo_dict.suffix;
        }
        $.each(foursquareData.checkins.items, function (i, c) {
            c.formated_date = moment.unix(parseInt(c.createdAt)).fromNow();
            if (c.venue) {
                var category = c.venue["categories"][0];
                if (category) {
                    var prefix = category.icon.prefix + "bg_32";
                    if (prefix.substring(prefix.length - 1) === "_") {
                        prefix = prefix.substring(0, prefix.length - 1);
                    }
                    c.venue.venueImageURL = prefix + category.icon.suffix;
                    c.venue.categoryName = category.shortName;
                }
            }
        });
        return foursquareData;
    }
    function fetchData(settings) {
        return Promise.all([
            asyncGet(API_URL + "users/self?v=20120812&oauth_token=" + settings.access_token),
            asyncGet(API_URL + "users/self/checkins?v=20120812&oauth_token=" + settings.access_token)
        ]).then(function (res) {
            console.log(res);
            var checkins = res[1]["response"]["checkins"];
            /*
                  if not settings.FOURSQUARE_SHOW_CURRENT_DAY:
                      valid_checkins = []
                  now = datetime.datetime.now()
                  for c in checkins["items"]:
                      created_at = c.get("createdAt", None)
                  if created_at:
                      created_at_dt = datetime.datetime.fromtimestamp(int(created_at))
                  if (now - created_at_dt) > datetime.timedelta(days = 1):
                      valid_checkins.append(c)
                  checkins["items"] = valid_checkins
                  */
            return Promise.resolve({
                user: res[0]["response"]["user"],
                checkins: checkins
            });
        });
    }
    exportService({
        displayName: DISPLAY_NAME,
        template: "foursquare.html",
        getURL: getURL,
        setup: setupFoursquare,
        fetch: fetchData
    }, "foursquare");
}(window));