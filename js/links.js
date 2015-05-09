"use strict";
var $url;
var allComponents = [], enabledServices = [];
window.currSelection = "home";
function setupLinks(settings) {
    allComponents = Object.keys(settings.services);
    allComponents.forEach(function (service) {
        if (settings["services"][service])
            enabledServices.push(service);
    });
    //CREATE LINKS ITEMS FOR ENABLED SERVICES
    var main_nav = document.getElementsByClassName("main-nav")[0];
    main_nav.innerHTML = "";
    if (settings["blog_platform"].length)
        addLinkItem(main_nav, "/", "home-link", "Home");
    var i;
    for (i = 0; i < enabledServices.length; i++) {
        var service = enabledServices[i];
        var text;
        if (window[service + "Service"])
            text = window[service + "Service"].displayName;
        else
            text = service[0].upperCase + service.slice(1);
        addLinkItem(main_nav, settings["services_settings"][service]["url"], service + "-link", text);
    }
    if (settings["fields"]["email"].length) {
        addLinkItem(main_nav, "mailto:" + settings["fields"]["email"] + "?subject=Hello", "contact-link", "Contact");
    }
    linkClickHandler(settings);
}
function addLinkItem(main_nav, href, id, text) {
    var li, link;
    li = document.createElement("li");
    link = document.createElement("a");
    link.href = href;
    link.id = id;
    link.textContent = text;
    li.appendChild(link);
    main_nav.appendChild(li);
}
function linkClickHandler(settings) {
    $("a").click(function (e) {
        if (e.which === 2)
            return;
        e.preventDefault();
        e.stopPropagation();
        if (this.href === $url)
            return;
        var url = $.url(this.href.replace("/#!", ""));
        $url = this.href;
        if (this.id === "home-link") {
            adjustSelection("home");
            return;
        } else {
            var i;
            for (i = 0; i < enabledServices.length; i++) {
                var service = enabledServices[i];
                if (this.id === service + "-link") {
                    adjustSelection(service, setupService.bind(this, service, url, this, settings["services_settings"][service]));
                    return;
                }
            }
        }
        window.location = this.href;
    });
}
function adjustSelection(component, callback) {
    var transition, $currProfileEl;
    if (currSelection !== "home") {
        $currProfileEl = $("#" + currSelection + "-profile");
        transition = $.support.transition && $currProfileEl.hasClass("fade");
        $currProfileEl.modal("hide");
        if (callback) {
            if (transition) {
                $currProfileEl.one($.support.transition.end, callback);
            } else {
                callback();
            }
        }
    } else if (callback) {
        callback();
    }
    $(".main-nav").children("li").removeClass("sel");
    $("#" + component + "-link").parent().addClass("sel");
    if (component === "home")
        $url = null;
    window.currSelection = component;
}