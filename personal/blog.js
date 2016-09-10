/* global getPosts */
"use strict";
function post2html(post)
{
	let txt = `<article id="${post.id}">
                 <hgroup>
                   <h2><a data-id="${post.id}" href="#!post/${post.id}" class="post-link">${"post.title"}</a></h2>
                   <h3><a href="#${post.id}">${(new Date(post.date)).toDateString()}</a></h3>
                 </hgroup>
                 <div class="post-body">
                   ${post.body}
                 </div>
               </article>`;
	let oParser = new DOMParser();
	let oDOM = oParser.parseFromString(txt, "text/xml");
	let el = oDOM.documentElement;
	el.getElementsByClassName("post-link")[0].textContent = post.title;
	return el;
}
function loadPosts()
{
	let container = document.getElementById("articales");
	getPosts().then((posts) => {
		while (container.children.length)
			container.children[0].remove();
		posts.forEach(post => container.appendChild(post2html(post)));
	});
}
loadPosts();
