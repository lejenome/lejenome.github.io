/* global getPosts, prettyPrint, POSTS_MAX */
"use strict";
function post2html(post)
{
	let txt = `<article id="${post.id}">
                 <hgroup>
                   <h2><a data-id="${post.id}" href="#!post/${post.id}" class="post-link">${"post.title"}</a></h2>
                   <h3 class="post-date"><a href="#${post.id}">${(new Date(post.date)).toDateString()}</a></h3>
                 </hgroup>
                 <div class="post-body">
                   ${post.body}
                 </div>
               </article>`;
	let oParser = new DOMParser();
	let oDOM = oParser.parseFromString(txt, "text/html");
	let el = oDOM.documentElement.children[1]
		     .children[0]; // root -> body -> articale
	el.getElementsByClassName("post-link")[0].textContent = post.title;
	return el;
}
function loadPosts()
{
	let postId = 0;
	let pageId = 0;
	let container = document.getElementById("articales");
	let nextBtn = document.getElementById("next-post");
	let prevBtn = document.getElementById("prev-post");
	if (location.hash.startsWith("#!")) {
		let [type, id] = location.hash.slice(2).split("/");
		try {
			switch (type) {
			case "page":
				pageId = parseInt(id);
				break;
			case "post":
				postId = parseInt(id);
				break;
			}
		} catch (e) {
		}
	}
	getPosts({postId, pageId})
	    .then((posts) => {
		    while (container.children.length)
			    container.children[0].remove();
		    posts.forEach(post =>
				      container.appendChild(post2html(post)));
		    prettyPrint();
		    if (posts.length === 0)
			    container.innerHTML = "<p>Oops! 404 Error!</p>";
		    if (pageId && pageId > 1) {
			    prevBtn.style.display = "inline";
			    prevBtn.href =
				location.toString().replace(location.hash, "");
			    prevBtn.href += "#!page/" + (pageId - 1);
		    }
		    if (posts.length === POSTS_MAX) {
			    nextBtn.style.display = "inline";
			    nextBtn.href =
				location.toString().replace(location.hash, "");
			    nextBtn.href += "#!page/" + ((pageId || 1) + 1);
		    }
	    })
	    .catch((err) => {
		    container.innerHTML = "<p>Oops! Error loading posts!</p>";
		    console.error(err);
	    });
}
function main()
{
	window.addEventListener("hashchange", (e) => location.reload());
	loadPosts();
}
main();
