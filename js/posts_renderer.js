/* global MarkdownPosts, prettyPrint */
"use strict";
class PostsRenderer
{
	constructor(posts_loader)
	{
		this.posts_loader = posts_loader;
		this.container = document.getElementById("articales");
		this.nextBtn = document.getElementById("next-post");
		this.prevBtn = document.getElementById("prev-post");
	}
	static post2html(post)
	{
		let txt = `<article class="post" id="${post.id}">
                 <hgroup>
                   <h2 class="post-title"><a data-id="${post.id}" href="#!post/${post.id}" class="post-link">${"post.title"}</a></h2>
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
		el.getElementsByClassName("post-link")[0].textContent =
		    post.title;
		return el;
	}
	hash({postId, pageId, tag})
	{
		let _hash = "";
		if (postId)
			return "#!post/" + encodeURIComponent(postId);
		if (tag)
			_hash = "#!tag/" + encodeURIComponent(tag);
		if (pageId) {
			if (tag)
				_hash += "/";
			else
				_hash = "#!";
			_hash += "page/" + encodeURIComponent(pageId);
		}
		return _hash;
	}
	unhash(_hash = location.hash)
	{
		let ctxt = {};
		if (_hash.startsWith("#!") === false)
			return ctxt;
		else
			_hash = _hash.slice(2);
		let data = _hash.split("/");
		for (let i = 0; i < data.length; i++) {
			switch (data[i]) {
			case "archive":
				ctxt.archive = true;
				break;
			case "page":
				i++;
				if (i < data.length)
					try {
						ctxt.pageId = parseInt(data[i]);
					} catch (e) {
					}
				break;
			case "tag":
				i++;
				if (i < data.length)
					ctxt.tag = decodeURIComponent(data[i]);
				break;
			case "post":
				i++;
				if (i < data.length)
					try {
						ctxt.postId = parseInt(data[i]);
					} catch (e) {
					}
				break;
			}
		}
		return ctxt;
	}
	update()
	{
		let ctxt = this.unhash();
		console.time("update");
		console.log("Hash:", location.hash || "#");
		return (ctxt.archive ? this.loadArchive()
				     : this.loadPosts(ctxt))
		    .then(function() {
			    window.scrollTo(0, 0);
			    console.timeEnd("update");
		    });
	}
	clean()
	{
		while (this.container.children.length)
			this.container.children[0].remove();
		this.nextBtn.style.display = "none";
		this.prevBtn.style.display = "none";
	}
	loadPosts(ctxt)
	{
		let postId = 0;
		let pageId = 0;
		return this.posts_loader.getPosts(ctxt).then(
		    posts => {
			    this.clean();
			    posts.forEach(post => this.container.appendChild(
					      PostsRenderer.post2html(post)));
			    prettyPrint();
			    if (this.posts_loader.hasPrev()) {
				    this.prevBtn.style.display = "inline";
				    this.prevBtn.href =
					this.hash(this.posts_loader.prev);
			    }
			    if (this.posts_loader.hasNext()) {
				    this.nextBtn.style.display = "inline";
				    this.nextBtn.href =
					this.hash(this.posts_loader.next);
			    }
			    if (posts.length === 0) {
				    this.container.innerHTML =
					"<p>Oops! 404 Error!</p>";
				    return Promise.reject();
			    }
			    return Promise.resolve();
		    },
		    err => {
			    this.container.innerHTML =
				"<p>Oops! Error loading posts!</p>";
			    console.error(err);
			    return Promise.reject();
		    });
	}
	loadArchive()
	{
		return this.posts_loader.getArchive().then(posts => {
			this.clean();
			posts.forEach(p => {
				let item = `
                <article class="post archive">
                <hgroup>
                  <time class="post-date" datetime="${p.date}">${p.date}</time>
                  <span class="post-title">
                    <a class="post-link" href="#!post/${p.id}">${p.title}</a>
                  </span>
                </hgroup>
                </article>`;
				this.container.innerHTML += item;
			});
			return Promise.resolve();
		});
	}
}
let renderer;
function main()
{
	console.log("New session");
	let loader = new MarkdownPosts("posts.json");
	renderer = new PostsRenderer(loader);
	renderer.update();
	window.addEventListener("hashchange", function(e) {
		e.preventDefault();
		renderer.update();
	});
}
main();
