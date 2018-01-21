---
title: (Syteup) creating a basic plugin, segment as an example
tags: syteup
---

Here, we will add Segment support to Syteup.

Segment is "a customer data hub". It makes it easy to integrate third-party
tools (analytics, advertising,...) to your application throw a all-in-one single
library.

To add Segment plugin support to Syteup, we needs just 3 simple steps:

1- create `plugins/segment.js` plugin code file that will export the plugin
module to the window object:

```javascript
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
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.id = "analytics-js";
            script.async = true;
            script.src = ("https:" === document.location.protocol ? "https://" : "http://") + "cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";
            var first = document.getElementsByTagName("script")[0];
            first.parentNode.insertBefore(script, first);
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
    window.segmentPlugin = { setup: setupSegment };
}(window));
```

what we did is to add segment code (copied from segment tutorial) into the
`setupSegment` function, then we export it as `setup` item on the plugin module
which should be named `segmentPlugin`. As you note, the user depending write_key
is readed from the `settings` object of the plugin which will be added on the
third step.

2- we add a script tag to the `index.html` file that will load the plugin code.

the script tag should be included on the plugins section just before
`js/plugins.js` tag and it should be loaded on defer mode

```html
<script defer src="plugins/segment.js"></script>
```

3- Finally, we add the plugin settings to the configuration file `config.json`

option to turn on/off the plugin inside the `plugins` option:

```javascript
"plugins": {
    "segment": true
}
```

the plugin settings object that includes all user depending settings (here we
will need the user's write_key) on the `plugins_settings option`:

```javascript
"plugins_settings": {
    "segment": {
        "write_key": "?????????"
    }
}
```

All Done! we are ready to test our plugin.

Don't be lazy, and send me a pull request with your plugins code and other
patches to
[https://github.com/lejenome/syteup](https://github.com/lejenome/syteup) !
