(function (window) {
    "use strict";
    var API_URL = "https://api.tumblr.com/v2/blog/";
    var nextId = 0;
    function getPosts(settings, postId, tag, offset) {
        var params = "?api_key=" + settings.api_key;
        if (postId)
            params += "&id=" + postId;
        else if (tag)
            params += "&tag=" + tag;
        else if (settings.tag_slug)
            params += "&tag=" + settings.tag_slug;
        if (offset)
            params = "&offset=" + nextId;
        return asyncGet(API_URL + settings.blog_url + "/posts" + params).then(function (res) {
            nextId += 20;
            return Promise.resolve(res.posts);
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
    }, "tumblr");
}(window));