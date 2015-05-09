(function (window) {
    "use strict";
    function setupGoogleAnalytics(settings) {
        // load google analytics.js
        var ga = window.ga = window.ga || function () {
            ga.q = ga.q || [];
            ga.q.push(arguments);
        };
        loadJS("//www.google-analytics.com/analytics.js");
        // push actions
        if (window.location.host === "localhost" || window.location.host === "172.0.0.1" || window.location.host === "")
            ga("create", settings["tracking_id"], { "cookieDomain": "none" });
        else
            ga("create", settings["tracking_id"], "auto");
        ga("set", "forceSSL", true);
        ga("set", "anonymizeIp", true);
        ga("send", "pageview", {
            "title": "Syteup",
            "page": "index.html"
        });    // TODO: send perfermance timing & exceptions/errors reports??
               //ga('send', 'timing', 'jQuery', 'Load Library', 20, 'Google CDN')
               //ga('send', 'exception', {
               //  'exDescription': 'DatabaseError',
               //    'exFatal': false,
               //      'appName', 'myApp',
               //        'appVersion', '1.0'
               //        });
               // ga('send', 'event', 'image2', 'clicked')
    }
    exportPlugin({ setup: setupGoogleAnalytics }, "googleAnalytics");
}(window));