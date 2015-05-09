(function (window) {
    "use strict";
    function setupRss(settings) {
        var rss = document.createElement("link");
        rss.rel = "alternate";
        rss.type = "application/rss+xml";
        rss.title = "RSS";
        rss.href = settings["url"];
        document.head.appendChild(rss);
    }
    exportPlugin({ setup: setupRss }, "rss");
}(window));