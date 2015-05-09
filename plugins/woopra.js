(function (window) {
    "use strict";
    function setupWoopra(settings) {
        loadJS("//static.woopra.com/js/woopra.js");
        window.woopraReady = function (tracker) {
            tracker.setDomain(settings["tracking_url"]);
            tracker.setIdleTimeout(settings["idle_timeout"]);
            if (settings["include_query"])
                tracker.trackPageview({
                    type: "pageview",
                    url: window.location.pathname + window.location.search,
                    title: document.title
                });
            else
                tracker.track();
            return false;
        };
    }
    exportPlugin({ setup: setupWoopra }, "woopra");
}(window));