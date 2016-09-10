"use strict";
var allComponents = [], enabledServices = [];
window.currSelection = "home";
function setupLinks(settings) {
    allComponents = Object.keys(settings.services);
    allComponents.forEach(function (service) {
        if (settings["services"][service])
            enabledServices.push(service);
    });
    if (typeof settings["fields"]["contact"] === "object") {
        if (Object.keys(settings["fields"]["contact"]).length === 1 && settings["fields"]["contact"].email) {
            settings["fields"]["contact"] = settings["fields"]["contact"].email;
        } else {
            enabledServices.push("contact");
            settings["services_settings"]["contact"] = settings["fields"]["contact"];
            settings["services_settings"]["contact"]["url"] = "mailto:" + settings["fields"]["contact"]["email"];
        }
    }
    //CREATE LINKS ITEMS FOR ENABLED SERVICES
    var main_nav = document.getElementById("main-nav"), i;
    main_nav.innerHTML = "";
    if (settings["blog_platform"].length)
        addLinkItem(main_nav, "home", "Home", "#");
    for (i = 0; i < enabledServices.length; i++) {
        var service = enabledServices[i];
        var $service = window[formatModuleName(service) + "Service"];
        var text;
        if ($service)
            text = $service.displayName;
        else
            text = service[0].toUpperCase() + service.slice(1);
        addLinkItem(main_nav, service, text);
    }
    if (typeof settings["fields"]["contact"] === "string")
        addLinkItem(main_nav, "contact", "Contact", "mailto:" + settings["fields"]["contact"] + "?subject=Hello");
    linkClickHandler(settings);
    processHash();
}
function addLinkItem(main_nav, name, text, href) {
    var li, link;
    li = document.createElement("li");
    link = document.createElement("a");
    link.href = href || "#" + name;
    link.id = name + "-item-link";
    link.textContent = text;
    li.appendChild(link);
    main_nav.appendChild(li);
}
function linkClickHandler(settings) {
    $("#main-nav a").click(function (e) {
        var newSelection;
        if (e.which === 2)
            return;
        e.preventDefault();
        e.stopPropagation();
        // get the name of newly selected item
        if (this.id === "home-item-link") {
            newSelection = "home";
        } else {
            var i;
            for (i = 0; i < enabledServices.length; i++) {
                var service = enabledServices[i];
                if (this.id === service + "-item-link") {
                    newSelection = service;
                    break;
                }
            }
        }
        // then  handle the click depending on this newly selected item name
        if (newSelection === undefined)
            window.location = this.href;
        else if (newSelection === currSelection)
            return;
        else if (newSelection === "home")
            adjustSelection("home");
        else
            adjustSelection(newSelection, setupService.bind(this, newSelection, this, settings["services_settings"][newSelection]));
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
    $("#" + component + "-item-link").parent().addClass("sel");
    window.currSelection = component;
}
function processHash() {
    // if location hash is an item name, click it
    var hash = window.location.hash.slice(1);
    if (hash && hash.match(/^[\w-]+$/)) {
        var item = document.getElementById(hash + "-item-link");
        if (item && item.parentElement.parentElement.id === "main-nav")
            item.click();
    }
}