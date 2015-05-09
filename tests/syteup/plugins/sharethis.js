(function (window) {
    "use strict";
    function setupSharethis(settings) {
        var switchTo5x = true;
        loadJS("//w.sharethis.com/button/buttons.js").then(function () {
            stLight.options({ publisher: settings["publisher_key"] });
        });
    }
    exportPlugin({ setup: setupSharethis }, "sharethis");
}(window));