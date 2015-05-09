"use strict";
function setupBlogHeaderScroll() {
    if (window.isMobileView)
        return;
    $(".blog-section article hgroup h3 a").click(function (e) {
        if (!this.hash)
            return;
        $("html, body").stop().animate({ scrollTop: $(this.hash).offset().top }, 500, "linear");
        e.preventDefault();
    });
    var dateHeight = $("#blog-posts article hgroup h3 a")[0].scrollHeight;
    $(window).scroll(function () {
        var scrollTop = window.scrollY;
        var first = false;
        $("#blog-posts article").each(function () {
            if (window.scrollY < this.offsetTop)
                this.className = "";    //return; }
            else if (window.scrollY > this.offsetTop + this.scrollHeight - dateHeight)
                this.className = "passed";
            else
                this.className = "current";
        });
    });
}
/** renderBlogPosts
     *
     * Takes the response from the blog platform and renders it using
     * our Handlebars template.
     */
function renderBlogPosts(posts, clearPosts) {
    if (posts.length === 0) {
        window.reachedEnd = true;
    }
    //Update this every time there are changes to the required
    //templates since it's cached every time
    require.config({ urlArgs: "bust=v2" });
    require([
        "text!blog-post-text.html",
        "text!blog-post-photo.html",
        "text!blog-post-link.html",
        "text!blog-post-video.html",
        "text!blog-post-audio.html",
        "text!blog-post-quote.html"
    ], function (text_post_template, photo_post_template, link_post_template, video_post_template, audio_post_template, quote_post_template) {
        var text_template = Handlebars.compile(text_post_template), photo_template = Handlebars.compile(photo_post_template), link_template = Handlebars.compile(link_post_template), video_template = Handlebars.compile(video_post_template), audio_template = Handlebars.compile(audio_post_template), quote_template = Handlebars.compile(quote_post_template);
        $(".loading").remove();
        if (clearPosts)
            $("#blog-posts").empty();
        $.each(posts, function (i, p) {
            p.formated_date = moment.utc(p.date, "YYYY-MM-DD HH:mm:ss").local().format("MMMM DD, YYYY");
            if (window.disqus_enabled)
                p.disqus_enabled = true;
            p.disqus_just_count = window.disqus_just_count;
            if (p.type === "text") {
                var idx = p.body.indexOf("<!-- more -->");
                if (idx > 0) {
                    p.body = p.body.substring(0, idx);
                    p.show_more = true;
                }
                $("#blog-posts").append(text_template(p));
            } else if (p.type === "photo")
                $("#blog-posts").append(photo_template(p));
            else if (p.type === "link")
                $("#blog-posts").append(link_template(p));
            else if (p.type === "video")
                $("#blog-posts").append(video_template(p));
            else if (p.type === "audio")
                $("#blog-posts").append(audio_template(p));
            else if (p.type === "quote")
                $("#blog-posts").append(quote_template(p));
        });
        prettyPrint();
        setTimeout(setupBlogHeaderScroll, 1000);
        adjustSelection("home");
        $("body").trigger("blog-post-loaded");
    });
}
/**
     * fetchBlogPosts
     *
     * @param {(Number|String)} offset The offset at which to start loading posts.
     * @param {Object} settings current blogging platform settings from config.json
     * @param {String} platform argument to specify which blog platform to fetch from. Defaults to 'tumblr'.
     * @param {Object} posts_options Optional set searched post options
     */
function fetchBlogPosts(offset, settings, platform, posts_options) {
    if (posts_options && posts_options.id)
        window.reachedEnd = true;
    //return window["fetch" + platform[0].toUpperCase() + platform.slice(1) + "BlogPosts"](offset, settings, posts_options);
    var $blog = window[formatModuleName(platform) + "Blog"];
    if (!$blog)
        return Promise.reject(MODULE_NOT_FOUND);
    var posts;
    if (posts_options && posts_options.id)
        posts = $blog.fetchPost(settings, posts_options.id);
    else if (posts_options && posts_options.tag)
        if (offset)
            posts = $blog.fetchTagMore(settings, posts_options.tag);
        else
            posts = $blog.fetchTag(settings, posts_options.tag);
    else if (offset)
        posts = $blog.fetchMore(settings);
    else
        posts = $blog.fetch(settings);
    return posts.then(function (data) {
        if (!data || data.length === 0)
            return Promise.resolve(false);
        renderBlogPosts(data, posts_options && posts_options.id || !offset);
        return Promise.resolve(true);
    }).catch(function (error) {
        return Promise.resolve(false);
    });
}