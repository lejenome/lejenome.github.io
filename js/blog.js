function setupBlog(settings) {
    "use strict";
    var postOffset, postsOpts;
    $(document).on("click", ".post-link", function () {
        if (this.dataset["id"]) {
            postsOpts = { id: this.dataset["id"] };
            fetchBlogPosts(0, settings["blogs_settings"][settings["blog_platform"]], settings["blog_platform"], postsOpts);
        }
        postOffset = 0;
    });
    $(document).on("click", ".tag-link", function () {
        if (this.textContent) {
            window.reachedEnd = false;
            postsOpts = { tag: this.textContent };
            fetchBlogPosts(0, settings["blogs_settings"][settings["blog_platform"]], settings["blog_platform"], postsOpts).then(function (offset) {
                postOffset = offset;
            });
        }
    });
    $("#home-link").on("click", function () {
        if (location.hash.substr(0, 2) !== "#!")
            return;
        location.hash = "";
        postsOpts = undefined;
        window.reachedEnd = false;
        fetchBlogPosts(0, settings["blogs_settings"][settings["blog_platform"]], settings["blog_platform"]).then(function (offset) {
            postOffset = offset;
        });
    });
    //SETUP LINKS & BLOG
    window.sharethis_enabled = settings["blogs_settings"]["plugins"]["sharethis"] || false;
    if (settings["blogs_settings"]["plugins"]["disqus"])
        window.disqusPlugin.setup(settings["plugins_settings"]["disqus"]);
    window.reachedEnd = false;
    // set to true if no more blog posts left.
    if (location.hash.substr(0, 7) === "#!post/")
        postsOpts = { id: location.hash.slice(7).split("#")[0] };
    else if (location.hash.substr(0, 6) === "#!tag/")
        postsOpts = { tag: location.hash.slice(6).split("#")[0] };
    return fetchBlogPosts(0, settings["blogs_settings"][settings["blog_platform"]], settings["blog_platform"], postsOpts).then(function (offset) {
        postOffset = offset;
        var resultsLoaded = false, scrollWait = false, scrollWaitDur = 250;
        $(window).scroll(function () {
            if (!window.reachedEnd && !resultsLoaded && !scrollWait && postOffset && $(window).scrollTop() + $(window).height() > $(document).height() / 1.2) {
                resultsLoaded = true;
                scrollWait = true;
                fetchBlogPosts(postOffset, settings["blogs_settings"][settings["blog_platform"]], settings["blog_platform"], postsOpts).then(function (offset) {
                    postOffset = offset;
                    scrollWait = false;
                });
                // Only load posts at most every scrollWaitDur milliseconds.
                setTimeout(function () {
                    scrollWait = false;
                }, scrollWaitDur);
            }
            if (resultsLoaded && $(window).scrollTop() + $(window).height() < $(document).height() / 1.2) {
                resultsLoaded = false;
            }
        });
        if (window.sharethis_enabled) {
            var switchTo5x = true;
            var jsfile = document.createElement("script");
            jsfile.src = "http://w.sharethis.com/button/buttons.js";
            jsfile.type = "text/javascript";
            //jsfile.async = true;
            document.body.appendChild(jsfile);
            stLight.options({ publisher: settings["plugins_settings"]["sharethis"]["publisher_key"] });
        }
        return Promise.resolve();
    });
}