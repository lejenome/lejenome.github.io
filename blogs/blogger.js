(function (window) {
    "use strict";
    var API_URL = "https://www.googleapis.com/blogger/v3/";
    var nextId = 0;
    function getPosts(settings, postId, tag, offset) {
        var params = "?maxResults=20&key=" + settings.api_key + "&fields=items(content%2Cid%2Clabels%2Cpublished%2Ctitle%2Curl)" + "%2CnextPageToken";
        if (offset && nextId)
            params += "&pageToken=" + nextId;
        if (tag)
            params += "&labels=" + tag;
        else if (settings.tag_slug)
            params += "&labels=" + tag;
        if (postId)
            params = "/" + postId + "?key=" + settings.api_key + "&content%2Cid%2Clabels%2Cpublished%2Ctitle%2Curl";
        return asyncGet(API_URL + "blogs/" + settings.blog_id + "/posts" + params).then(function (res) {
            if (res.error) {
                window.reachedEnd = true;
                return Promise.resolve([]);
            }
            nextId = res.nextPageToken;
            if (!nextId)
                window.reachedEnd = true;
            if (postId)
                res = { items: [res] };
            res["items"].forEach(function (post) {
                post.date = post.published;
                post.body = post.content;
                post.tags = post.labels;
                post.tags = post.labels;
                post.type = "text";    //????
            });
            return Promise.resolve(res["items"]);
        });
    }
    function fetchPosts(settings) {
        nextId = "";
        return getPosts(settings, undefined, undefined, false);
    }
    function fetchMorePosts(settings) {
        return getPosts(settings, undefined, undefined, true);
    }
    function fetchOnePost(settings, postId) {
        nextId = "";
        return getPosts(settings, postId, undefined, false);
    }
    function fetchBlogTag(settings, tag) {
        nextId = "";
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
    }, "blogger");
}(window));