/* vim: set filetype=javascript : */
/* global fetch, marked */
"use strict";
class MarkdownPosts {
  constructor(conf_link = "posts.json") {
    this.POSTS_MAX    = 5;
    this.posts_loader = fetch(conf_link)
                            .then(resp => resp.json())
                            .then(data => Promise.resolve(data.files.reverse()));
    this._next = {};
    this._prev = {};
  }
  static _getPost(post, render = true) {
    return fetch(post.url).then((response) => response.text()).then(txt => {
      let arr    = txt.split("\n", 2);
      post.title = arr[0];
      if (render)
        post.body = marked(txt.slice(arr[0].length + arr[1].length + 2),
                           {langPrefix : "prettyprint linenums lang-"});
      else
        post.body = txt.slice(arr[0].length + arr[1].length + 2);
      return Promise.resolve(post);
    });
  }
  getArchive() {
    return this.posts_loader.then(
        files => Promise.all(files.map(f => MarkdownPosts._getPost(f, false))));
  }
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
  getPosts({postId, pageId, tag}) {
    return this.posts_loader.then(files => {
      this.next = {};
      this.prev = {};
      if (postId) {
        let index = files.findIndex(f => f.id === postId);
        if (index === -1) {
          return Promise.resolve([]);
        } else {
          if (index + 1 < files.length) this.next = {postId : files[index + 1].id};
          if (index > 0) this.prev                = {postId : files[index - 1].id};
          return Promise.all([ MarkdownPosts._getPost(files[index]) ]);
        }
      }
      if (!Number.isFinite(pageId) || pageId < 1) pageId = 1;
      let offset                                         = pageId - 1;
      if (tag) files = files.filter(f => Array.isArray(f.tags) && f.tags.any(t => t === tag));
      if (files.length > (offset + 1) * this.POSTS_MAX)
        this.next               = {tag : tag, pageId : pageId + 1};
      if (pageId > 1) this.prev = {tag : tag, pageId : pageId - 1};
      files = files.slice(offset * this.POSTS_MAX, (offset + 1) * this.POSTS_MAX);
      return Promise.all(files.map(p => MarkdownPosts._getPost(p)));
    });
  }
  get next() {
    return this._next;
  }
  set next(ctxt) {
    this._next = ctxt;
  }
  get prev() {
    return this._prev;
  }
  set prev(ctxt) {
    this._prev = ctxt;
  }
  hasNext() {
    return this.next.pageId || this.next.postId;
  }
  hasPrev() {
    return this.prev.pageId || this.prev.postId;
  }
}
