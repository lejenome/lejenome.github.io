(function (window) {
    "use strict";
    function setup(settings) {
        var form = document.createElement("form");
        form.action = "https://www.paypal.com/cgi-bin/webscr";
        form.method = "post";
        form.target = "_top";
        form.innerHTML = "<input type=\"hidden\" name=\"cmd\" value=\"_s-xclick\">" + "<input type=\"hidden\" name=\"encrypted\" value=\"" + settings["encrypted"] + "\">" + "<input type=\"image\" src=\"https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif\" border=\"0\" name=\"submit\" alt=\"PayPal - The safer, easier way to pay online!\">" + "<img alt=\"\" border=\"0\" src=\"https://www.paypalobjects.com/en_US/i/scr/pixel.gif\" width=\"1\" height=\"1\">";
        document.getElementById("header-widgets").appendChild(form);
    }
    exportPlugin({ setup: setup }, "paypal_donate");
}(window));