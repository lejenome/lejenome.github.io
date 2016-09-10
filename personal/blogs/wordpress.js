/* global fetch */
"use strict";
const API_URL = "https://public-api.wordpress.com/rest/v1";
const BLOG_URL = "lejenome.wordpress.com";
const TAG_SLUG = "";
var nextId = 0;
function getPosts(postId, tag, offset)
{
	var post_id = "";
	var params = "";
	if (postId)
		post_id += postId;
	else if (tag)
		params += "?tag=" + tag.replace(/\s/g, "-");
	else if (TAG_SLUG)
		params += "?tag=" + TAG_SLUG.replace(/\s/g, "-");
	if (offset && nextId)
		params += (params ? "&" : "?") + "offset=" + nextId;
	var wpApiUrl =
	    [
	      API_URL, "/sites/", BLOG_URL, "/posts/", post_id, params
	    ].join("");
	return fetch(wpApiUrl).then(function(response) {
        return response.json();
    }).then(function(data) {
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
function fetchPosts()
{
	nextId = 0;
	return getPosts(undefined, undefined, false);
}
function fetchMorePosts()
{
	return getPosts(undefined, undefined, true);
}
function fetchOnePost(postId)
{
	nextId = 0;
	return getPosts(postId, undefined, false);
}
function fetchBlogTag(tag)
{
	nextId = 0;
	return getPosts(undefined, tag, false);
}
function fetchBlogTagMore(tag)
{
	return getPosts(undefined, tag, true);
}
