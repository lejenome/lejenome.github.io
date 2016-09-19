/* global fetch, marked */
"use strict";
const POSTS_MAX = 5;
/* load posts
 * @param options:
 *      - postId: specific post to load (pageId will be ignored)
 *      - pageId: specific page to load (postId should not be specified)
 *      - tag: tags array to filter (used alone or with pageId)
 * @return: promie object with data format as:
 *        [
 *            { id: <post uid>,
 *              title: <post title, to be escaped>,
 *              body: <post content with embed HTML tags>,
 *              tags: <post tags>,
 *              date: <post publish date, should be supported by Date()>
 *            },
 *            ...
 *        ]
 */
function _getPost(post)
{
	return fetch(post.url).then((response) => response.text()).then(txt => {
		let arr = txt.split("\n", 2);
		post.title = arr[0];
		post.body = marked(txt.slice(arr[0].length + arr[1].length + 2),
				   {langPrefix : "prettyprint linenums lang-"});
		return Promise.resolve(post);
	});
}
function _lsPosts()
{
	return fetch("posts.json")
	    .then(resp => resp.json())
	    .then(data => Promise.resolve(data.files.reverse()));
}
function getPosts({postId, pageId, tag})
{
	return _lsPosts().then(files => {
		if (postId) {
			let fs = files.filter(f => f.id === postId);
			if (fs.length === 1)
				return Promise.all([ _getPost(fs[0]) ]);
			else
				return Promise.resolve([]);
		}
		if (1 > pageId)
			pageId = 1;
		pageId--;
		if (tag)
			files = files.filter(f => Array.isArray(f.tags) &&
						  f.tags.any(t => t === tag));
		files = files.splice(pageId * POSTS_MAX, POSTS_MAX);
		return Promise.all(files.map(p => _getPost(p)));
	});
}
