(function (window) {
    "use strict";
    var DISPLAY_NAME = "Flickr";
    function setupFlickr(flickrData, settings) {
        if (flickrData.items === 0) {
            return;
        }
        flickrData.title = flickrData.title.substring(13);
        $.each(flickrData.items, function (i, p) {
            p.formated_date = moment.unix(Date.parse(p.date_taken) / 1000).fromNow();
        });
        return flickrData;
    }
    function fetchData(settings) {
        return asyncGet("http://api.flickr.com/services/feeds/photos_public.gne?id=" + settings.client_id + "&format=json&lang=en-us", undefined, "jsoncallback");
    }
    exportService({
        displayName: DISPLAY_NAME,
        template: "flickr.html",
        setup: setupFlickr,
        fetch: fetchData
    }, "flickr");
}(window));