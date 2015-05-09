(function (window) {
    "use strict";
    function setup(settings) {
        window.grtpAPI = "https://grtp.co/v1/";
        loadJS("//grtp.co/v1.js", {}, { gratipayUsername: settings.username }, document.getElementById("header-widgets"));
    }
    exportPlugin({ setup: setup }, "gratipay_widget");
}(window));