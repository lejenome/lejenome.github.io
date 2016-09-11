/* global fetch */
"use strict";
const API_URL = "https://public-api.wordpress.com/rest/v1.1";
const BLOG_URL = "lejenome.wordpress.com";
const TAG_SLUG = "";
var nextId = 0;
function _getPosts({postId, pageId, tag})
{
	let post_id = "";
	let params = "";
	if (postId) {
		postId = postId;
	} else {
		params = "?number=5";
		if (tag)
			params += "&tag=" + tag.replace(/\s/g, "-");
		else if (TAG_SLUG)
			params += "&tag=" + TAG_SLUG.replace(/\s/g, "-");
		if (pageId)
			params += "?page=" + pageId;
	}
	let wpApiUrl = `${API_URL}/sites/${BLOG_URL}/posts/${post_id}${params}`;
	return fetch(wpApiUrl)
	    .then(function(response) { return response.json(); })
	    .then(function(data) {
		    if (data.error)
			    data = {found : 0, posts : []};
		    else if (postId)
			    data = {found : 1, posts : [ data ]};
		    data.posts.forEach(function(p, i) {
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
			    if (p.date.lastIndexOf("+") > 0) {
				    p.date = p.date.substring(
					0, p.date.lastIndexOf("+"));
			    } else {
				    p.date = p.date.substring(
					0, p.date.lastIndexOf("-"));
			    }
		    });
		    nextId += 20;
		    return Promise.resolve(data.posts);
	    });
}
const fetchPosts = (tag) => _getPosts({tag});
const fetchPost = (postId) => _getPosts({postId});
const fetchPage = (pageId, tag) => _getPosts({pageId, tag});
