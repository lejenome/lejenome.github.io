(function (window) {
    "use strict";
    function setupSegment(settings) {
        window.analytics = window.analytics || [];
        window.analytics.methods = [
            "identify",
            "group",
            "track",
            "page",
            "pageview",
            "alias",
            "ready",
            "on",
            "once",
            "off",
            "trackLink",
            "trackForm",
            "trackClick",
            "trackSubmit"
        ];
        window.analytics.factory = function (method) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(method);
                window.analytics.push(args);
                return window.analytics;
            };
        };
        for (var i = 0; i < window.analytics.methods.length; i++) {
            var key = window.analytics.methods[i];
            window.analytics[key] = window.analytics.factory(key);
        }
        window.analytics.load = function (key) {
            if (document.getElementById("analytics-js"))
                return;
            loadJS("//cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js", { id: "analytics-js" });
        };
        // Add a version to keep track of what's in the wild.
        window.analytics.SNIPPET_VERSION = "2.0.9";
        // Load Analytics.js with your key, which will automatically
        // load the tools you've enabled for your account. Boosh!
        window.analytics.load(settings["write_key"]);
        // Make the first page call to load the integrations. If
        // you'd like to manually name or tag the page, edit or
        // move this call however you'd like.
        window.analytics.page({ title: "Syteup" });
    }
    exportPlugin({ setup: setupSegment }, "segment");
}(window));(function (window) {
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
}(window));(function (window) {
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
}(window));(function (window) {
    "use strict";
    function setup(settings) {
        window.grtpAPI = "https://grtp.co/v1/";
        loadJS("//grtp.co/v1.js", {}, { gratipayUsername: settings.username }, document.getElementById("header-widgets"));
    }
    exportPlugin({ setup: setup }, "gratipay_widget");
}(window));(function (window) {
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
}(window));(function (window) {
    /* global DISQUS */
    "use strict";
    function embedDisqus(settings) {
        var type = "embed";
        if (settings.just_count)
            type = "count";
        loadJS("//" + settings.shortname + ".disqus.com/" + type + ".js");
        $(document).on("click", ".disqus_show_comments", function () {
            var old = $("#disqus_thread");
            if (old.length) {
                old[0].className = "disqus_show_comments";
                old[0].id = "";
                old.append($("<a>Show Comments</a>"));
            }
            this.innerHTML = "";
            this.className = "disqus-thread";
            this.id = "disqus_thread";
            $(this).append($("<a href='/post/" + this.dataset.id + "#disqus_thread' class='comments'></a>"));
            var data = this.dataset;
            DISQUS.reset({
                reload: true,
                config: function () {
                    this.page.identifier = data.id;
                    this.page.url = window.location.origin + window.location.pathname + "#!post/" + data.id;
                    this.language = "en";
                }
            });
        });
    }
    function setupDisqus(settings) {
        window.disqus_enabled = true;
        window.disqus_just_count = settings["just_count"];
        window.disqus_shortname = settings["shortname"];
        $("body").bind("blog-post-loaded", function () {
            embedDisqus(settings);
        });
    }
    exportPlugin({ setup: setupDisqus }, "disqus");
}(window));(function (window) {
    "use strict";
    var DISPLAY_NAME = "Github";
    var API_URL = "https://api.github.com/";
    var BASE_URL = "https://github.com/";
    function getURL(settings) {
        return BASE_URL + settings.username;
    }
    function setupGithub(githubData, settings) {
        githubData.user.following = numberWithCommas(githubData.user.following);
        githubData.user.followers = numberWithCommas(githubData.user.followers);
        return githubData;
    }
    function fetchData(settings) {
        var context = {};
        return Promise.all([
            asyncGet(API_URL + "users/" + settings.username),
            asyncGet(API_URL + "users/" + settings.username + "/repos")
        ]).then(function (res) {
            res[0] = res[0].data;
            res[1] = res[1].data;
            context.user = res[0];
            context.repos = res[1];
            context["repos"].sort(function (r1, r2) {
                return r1.updated_at < r2.updated_at;
            });
            return Promise.resolve(context);
        });
    }
    exportService({
        displayName: DISPLAY_NAME,
        template: "github.html",
        getURL: getURL,
        setup: setupGithub,
        fetch: fetchData
    }, "github");
}(window));(function (window) {
    "use strict";
    var DISPLAY_NAME = "LinkedIn";
    var API_URL = "https://api.linkedin.com/v1";
    var BASE_URL = "https://www.linkedin.com/in/";
    function getURL(settings) {
        return BASE_URL + settings.username;
    }
    function setupLinkedin(linkedinData, settings) {
        linkedinData.profile["profile_url"] = "http://linkedin.com/profile/view?id=" + linkedinData.profile["id"];
        linkedinData.profile["summary"] = linkedinData.profile["summary"].replace("\n", "<br />", "g");
        //        linkedinData.profile["numGroups"] = linkedinData.groups["_count"];
        //        linkedinData.profile["numNetworkUpdates"] = linkedinData.network_updates["_total"];
        linkedinData.profile["location_name"] = linkedinData.profile["location"]["name"];
        return linkedinData;
    }
    function fetchData(settings) {
        //request auth_code:
        //https://www.linkedin.com/uas/oauth2/authorization?response_type=code&client_id=XXX&scope=r_fullprofile&state=XXX&redirect_uri=http://lejenome.github.io
        var profile_selectors = [
            "id",
            "first-name",
            "last-name",
            "headline",
            "location",
            "num-connections",
            "skills",
            "educations",
            "picture-url",
            "summary",
            "positions",
            "industry",
            "site-standard-profile-request"
        ].join();
        var network_upd_types = [
            "APPS",
            "CMPY",
            "CONN",
            "JOBS",
            "JGRP",
            "PICT",
            "PFOL",
            "PRFX",
            "RECU",
            "PRFU",
            "SHAR",
            "VIRL"
        ].join("&type=");
        return Promise.all([asyncGet(API_URL + "/people/~:(" + profile_selectors + ")?oauth2_access_token=" + settings.access_token)    //            asyncGet(API_URL + "/people/~/group-memberships:(group:(id,name),membership-state)?oauth2_access_token=" + settings.access_token),
                                                                                                                        //            asyncGet(API_URL + "/people/~/network/updates?type=" + network_upd_types + "&oauth2_access_token=" + settings.access_token)
]).then(function (res) {
            return Promise.resolve({ profile: res[0] });
        });
    }
    exportService({
        displayName: DISPLAY_NAME,
        template: "linkedin.html",
        getURL: getURL,
        setup: setupLinkedin,
        fetch: fetchData
    }, "linkedin");
}(window));(function (window) {
    "use strict";
    var DISPLAY_NAME = "StackOverflow";
    var API_URL = "https://api.stackexchange.com/2.2/";
    var BASE_URL = "https://stackoverflow.com/users/";
    function getURL(settings) {
        return BASE_URL + settings.user_id + "/" + settings.username;
    }
    function setupStackoverflow(stackoverflowData, settings) {
        var user = stackoverflowData.user;
        var badge_count = user.badge_counts.bronze + user.badge_counts.silver + user.badge_counts.gold;
        user.badge_count = badge_count;
        user.about_me = (user.about_me || "").replace(/(<([^>]+)>)/gi, "");
        var timeline = stackoverflowData.timeline;
        $.each(timeline, function (i, t) {
            t.creation_date = moment.unix(t.creation_date).fromNow();
            if (t.action === "comment") {
                t.action = "commented";
            }
            if (t.detail && t.detail.length > 140) {
                t.detail = $.trim(t.detail).substring(0, 140).split(" ").slice(0, -1).join(" ") + "...";
            }
        });
        return {
            "user": user,
            "timeline": timeline
        };
    }
    function fetchData(settings) {
        return Promise.all([
            asyncGet(API_URL + "users/" + settings.user_id + "?site=stackoverflow&filter=!-*f(6q3e0kZX"),
            asyncGet(API_URL + "users/" + settings.user_id + "/timeline?site=stackoverflow")
        ]).then(function (res) {
            return Promise.resolve({
                user: res[0]["items"][0],
                timeline: res[1]["items"]
            });
        });
    }
    exportService({
        displayName: DISPLAY_NAME,
        template: "stackoverflow.html",
        getURL: getURL,
        setup: setupStackoverflow,
        fetch: fetchData
    }, "stackoverflow");
}(window));(function (window) {
    "use strict";
    var DISPLAY_NAME = "Google+";
    var API_URL = "https://www.googleapis.com/plus/v1/";
    var BASE_URL = "https://plus.google.com/";
    function getURL(settings) {
        return BASE_URL + settings.user_id;
    }
    function setupGplus(gplusData, settings) {
        $.each(gplusData.activities, function (i, t) {
            if (t.verb === "post")
                t.verb = "posted";
            else if (t.verb === "share")
                t.verb = "shared";
            if (t.title.length > 60)
                t.title = t.title.substr(0, 57) + "...";
            t.replies = t.object.replies.totalItems;
            t.plusoners = t.object.plusoners.totalItems;
            t.resharers = t.object.resharers.totalItems;
            t.published = moment.utc(t.published, "YYYY-MM-DD HH:mm:ss").fromNow();
            if (t.object.attachments && t.object.attachments[0].image) {
                t.object.image = t.object.attachments[0].image.url;
            } else if (t.object.content) {
                t.object.content = new DOMParser().parseFromString("<div>" + t.object.content + "</div>", "text/xml").documentElement.textContent;
                if (t.object.content.length > 200)
                    t.object.content = t.object.content.substr(0, 197) + "...";
            }
        });
        return gplusData;
    }
    function fetchData(settings) {
        var context = {};
        return Promise.all([
            asyncGet(API_URL + "people/" + settings.user_id + "?fields=circledByCount%2CcurrentLocation%2CdisplayName%2C" + "image%2Furl%2Cnickname%2Coccupation%2CplacesLived%2CplusOneCount%2Ctagline%2Curl" + "&key=" + settings.api_key),
            asyncGet(API_URL + "people/" + settings.user_id + "/activities/public" + "?maxResults=20&fields=items(annotation%2Cobject(actor(displayName%2Curl)" + "%2Cattachments(content%2CdisplayName%2Cimage%2CobjectType%2Cthumbnails)" + "%2Ccontent%2CobjectType%2Cplusoners%2FtotalItems%2Creplies%2F" + "totalItems%2Cresharers%2FtotalItems%2Curl)%2Cpublished%2Ctitle%2Curl%2Cverb)%2C" + "nextPageToken&key=" + settings.api_key)
        ]).then(function (res) {
            context.newt_page = res[1]["nextPageToken"];
            if (!res[0]["currentLocation"] && res[0]["placesLived"])
                res[0]["currentLocation"] = res[0]["placesLived"][0]["value"];
            context.user_info = res[0];
            context.activities = res[1]["items"];
            return Promise.resolve(context);
        });
    }
    exportService({
        displayName: DISPLAY_NAME,
        template: "gplus.html",
        getURL: getURL,
        setup: setupGplus,
        fetch: fetchData
    }, "gplus");
}(window));(function (window) {
    "use strict";
    var DISPLAY_NAME = "Facebook";
    var API_URL = "https://graph.facebook.com/v2.1/";
    var BASE_URL = "https://facebook.com/";
    function getURL(settings) {
        return BASE_URL + settings.username;
    }
    function setupFacebook(facebookData, settings) {
        facebookData.url = "https://facebook.com/" + settings.username;
        facebookData.image = "imgs/pic.png";
        facebookData.posts = facebookData.statuses.data.concat(facebookData.links.data);
        facebookData.posts.sort(function (p1, p2) {
            return (p1.updated_time || p1.created_time) < (p2.updated_time || p2.created_time);
        });
        facebookData.posts.forEach(function (p) {
            p.url = facebookData.url + "/posts/" + p.id;
            p.updated_time = moment.utc(p.updated_time || p.created_time, "YYYY-MM-DD HH:mm:ss").fromNow();
            if (p.likes)
                p.likes = p.likes.data.length;
            else
                p.likes = 0;
            if (p.comments)
                p.comments = p.comments.data.length;
            else
                p.comments = 0;
            if (p.sharedposts)
                p.sharedposts = p.sharedposts.data.length;
            else
                p.sharedposts = 0;
            if (p.message && p.message.length > 200)
                p.message = p.message.substr(0, 197) + "...";
        });
        return facebookData;
    }
    function fetchData(settings) {
        return asyncGet(API_URL + "me?fields=statuses.limit(10){message," + "updated_time,comments{id},likes{id},sharedposts}," + "links.limit(10){comments{id},likes{id},sharedposts{id}," + "picture,link,name,created_time},id,about,link,name,website," + "work&method=get&access_token=" + settings.access_token).then(function (res) {
            return Promise.resolve(res);
        });
    }
    exportService({
        displayName: DISPLAY_NAME,
        template: "facebook.html",
        getURL: getURL,
        setup: setupFacebook,
        fetch: fetchData
    }, "facebook");
}(window));(function (window) {
    "use strict";
    var DISPLAY_NAME = "Contact";
    function getURL(settings) {
        return "mailto:" + settings.email;
    }
    function setupContact(data, settings) {
        if (data.tel)
            data.tel_uri = "tel:+" + data.tel.match(/\((.*)\) (.*)/).slice(1).join("");
        if (data.mobile)
            data.mobile_uri = "tel:+" + data.mobile.match(/\((.*)\) (.*)/).slice(1).join("");
        if (data.fax)
            data.fax_uri = "fax:+" + data.fax.match(/\((.*)\) (.*)/).slice(1).join("");
        return data;
    }
    function fetchContact(settings) {
        var context = [];
        if (settings.pgp_url)
            context.push(asyncText(settings.pgp_url));
        if (settings.ssh_url)
            context.push(asyncText(settings.ssh_url));
        if (context.length > 0) {
            return Promise.all(context).then(function (res) {
                var data = settings;
                if (settings.pgp_url) {
                    data.pubkey = res[0];
                    data.sshkey = res[1];
                } else {
                    data.sshkey = res[0];
                }
                return Promise.resolve(data);
            });
        } else {
            return Promise.resolve(settings);
        }
    }
    exportService({
        displayName: DISPLAY_NAME,
        getURL: getURL,
        setup: setupContact,
        fetch: fetchContact,
        template: "contact.html"
    }, "contact");
}(window));