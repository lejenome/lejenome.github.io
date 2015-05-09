(function (window) {
    "use strict";
    var API_URL = "https://public-api.wordpress.com/rest/v1";
    var nextId = 0;
    function getPosts(settings, postId, tag, offset) {
        var post_id = "";
        var params = "";
        if (postId)
            post_id += postId;
        else if (tag)
            params += "?tag=" + tag.replace(/\s/g, "-");
        else if (settings.tag_slug)
            params += "?tag=" + settings.tag_slug.replace(/\s/g, "-");
        if (offset && nextId)
            params += (params ? "&" : "?") + "offset=" + nextId;
        var wpApiUrl = [
            API_URL,
            "/sites/",
            settings.blog_url,
            "/posts/",
            post_id,
            params
        ].join("");
        return asyncGet(wpApiUrl).then(function (data) {
            if (data.error)
                data = {
                    found: 0,
                    posts: []
                };
            else if (postId)
                data = {
                    found: 1,
                    posts: [data]
                };
            $.each(data.posts, function (i, p) {
                var newTags = [];
                p.id = p.ID;
                p.body = p.content;
                p.content = null;
                if (p.type === "post") {
                    p.type = "text";
                }
                for (var tag in p.tags) {
                    if (p.tags.hasOwnProperty(tag))
                        newTags.push(tag);
                }
                p.tags = newTags;
                // TODO: figure out how to preserve timezone info and make it
                // consistent with python's datetime.strptime
                if (p.date.lastIndexOf("+") > 0) {
                    p.date = p.date.substring(0, p.date.lastIndexOf("+"));
                } else {
                    p.date = p.date.substring(0, p.date.lastIndexOf("-"));
                }
            });
            nextId += 20;
            return Promise.resolve(data.posts);
        });
    }
    function fetchPosts(settings) {
        nextId = 0;
        return getPosts(settings, undefined, undefined, false);
    }
    function fetchMorePosts(settings) {
        return getPosts(settings, undefined, undefined, true);
    }
    function fetchOnePost(settings, postId) {
        nextId = 0;
        return getPosts(settings, postId, undefined, false);
    }
    function fetchBlogTag(settings, tag) {
        nextId = 0;
        return getPosts(settings, undefined, tag, false);
    }
    function fetchBlogTagMore(settings, tag) {
        return getPosts(settings, undefined, tag, true);
    }
    exportBlog({
        fetch: fetchPosts,
        fetchMore: fetchMorePosts,
        fetchPost: fetchOnePost,
        fetchTag: fetchBlogTag,
        fetchTagMore: fetchBlogTagMore
    }, "wordpress");
}(window));