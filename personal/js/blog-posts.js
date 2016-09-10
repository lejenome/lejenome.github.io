"use strict";
/** renderBlogPosts
     *
     * Takes the response from the blog platform and renders it using
     * our Handlebars template.
     */
function renderBlogPosts(posts, clearPosts) {
    if (posts.length === 0) {
        window.reachedEnd = true;
    }
    Promise.all([
        asyncText("templates/blog-post-text.html"),
        asyncText("templates/blog-post-photo.html"),
        asyncText("templates/blog-post-link.html"),
        asyncText("templates/blog-post-video.html"),
        asyncText("templates/blog-post-audio.html"),
        asyncText("templates/blog-post-quote.html")
    ]).then(function (res) {
        var text_template = Handlebars.compile(res[0]), photo_template = Handlebars.compile(res[1]), link_template = Handlebars.compile(res[2]), video_template = Handlebars.compile(res[3]), audio_template = Handlebars.compile(res[4]), quote_template = Handlebars.compile(res[5]);
        $(".loading").remove();
        if (clearPosts)
            $("#blog-posts").empty();
        if (posts.length === 1 && window.disqus_enabled)
            posts[0].disqus_open = true;
        posts = posts.forEach(function (p) {
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
        document.body.dispatchEvent(new CustomEvent("blog-post-loaded"));
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
    //Not sure how my old self wrote this code and how it stills runs
    if (posts_options && posts_options.id)
        window.reachedEnd = true;
    return importM(formatModuleName(platform) + "Blog", "blogs/" + formatModulePath(platform)).then(function ($blog) {
        //    var $blog = window[formatModuleName(platform) + "Blog"];
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
            alertError(error);
            return Promise.resolve(false);
        });
    });
}
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