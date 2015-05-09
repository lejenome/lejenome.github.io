(function (window) {
    "use strict";
    function setupControlPanel(settings) {
        var style = document.createElement("style");
        style.appendChild(document.createTextNode(""));
        document.head.appendChild(style);
        style.sheet.insertRule(".control-panel-btn { display: inline-block; margin: 5px;}", 0);
        style.sheet.insertRule(".control-panel-btn a { line-height: 25px; padding: 5px; margin: 0; border: solid 1px;}", 0);
        style.sheet.insertRule(".control-panel-btn a.clicked {background-color: green}", 0);
        style.sheet.insertRule(".control-panel-btn a.unclicked {background-color: red}", 0);
        $("body").bind("blog-post-loaded", function () {
            if (!$("#control-panel")[0])
                return;
            $.each($(".main-nav li a"), function (i, e) {
                $("#control-panel").append("<div class='control-panel-btn'><a class='clicked' data-id='" + e.id + "'>#" + e.id + "</a></div>");
            });
            $(".control-panel-btn a").click(function () {
                var id = this.dataset["id"];
                if (this.className === "clicked") {
                    this.className = "unclicked";
                    $("#" + id).parent().hide(300);
                } else {
                    this.className = "clicked";
                    $("#" + id).parent().show(300);
                }
            });
            $("#control-panel").removeAttr("id");
        });
    }
    exportPlugin({ setup: setupControlPanel }, "control_panel");
}(window));