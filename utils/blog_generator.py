#!/bin/env python3

import os
import json
from datetime import datetime
from xml.sax.saxutils import escape
from jinja2 import Template
import markdown

posts = None
tmpl = None
md = markdown.Markdown(output_format="html5",
                       extensions=["markdown.extensions.fenced_code",
                                   "markdown.extensions.codehilite"])
settings = {
    "rss_url": "https://lejenome.github.io/rss.xml",
    "blog_name": "Moez Bouhlel [lejenome]",
    "blog_description": "Self-taught programmer, CS Student and FOSS "
    "contributor",
    "blog_url": "https://lejenome.github.io/",
    "author": "Moez Bouhlel",
}
MAX_POSTS = 5

with open("posts.json") as posts_file:
    posts = json.load(posts_file)["files"]
with open(os.path.join(os.path.dirname(__file__), "post.html")) as tmpl_file:
    tmpl = Template(tmpl_file.read())

def load_post(post, index):
    post_file = open(post["url"])
    post["title"] = post_file.readline().strip()
    post_file.readline()
    post["body"] = md.convert(post_file.read())
    post["date_original"] = post["date"]
    post["date"] = datetime.strptime(post["date"], "%Y/%m/%d").strftime(
        "%a %b %d %Y")
    post["index"] = index
    if index + 1 < len(posts):
        post["newer"] = posts[index + 1]['id']
    if index > 0:
        post["older"] = posts[index - 1]["id"]
    post_file.close()
    post["full_path"] = os.path.join("post", '.'.join([
        os.path.splitext(os.path.basename(post["url"]))[0], "html"]))
    post["min_path"] = os.path.join(
        "post", '.'.join([str(post["id"]), "html"]))

def load_posts():
    for index, post in enumerate(posts):
        load_post(post, index)

def gen_posts():
    try:
        os.mkdir("post")
    except FileExistsError:
        pass
    for post in posts:
        page_data = {"index": post["index"]}
        if "newer" in post:
            page_data["newer"] = post["newer"]
        if "older" in post:
            page_data["older"] = post["older"]
        post_html = open(post["min_path"], "w")
        html = tmpl.render(posts=[post], page=page_data, page_type="post")
        post_html.write(html)
        try:
            os.symlink(post["min_path"][5:], post["full_path"])
        except FileExistsError:
            pass

def gen_archive():
    archive_html = open("archive.html", "w")
    html = tmpl.render(posts=posts, page={"index": 1}, page_type="archive")
    archive_html.write(html)

def gen_pages():
    try:
        os.mkdir("page")
    except FileExistsError:
        pass
    for i in range(0, len(posts), MAX_POSTS):
        index = (i // 4) + 1
        page_posts = posts[i: i + MAX_POSTS]
        page_data = {"index": index}
        if i + MAX_POSTS < len(posts):
            page_data["older"] = str(index + 1)
        if i > 0:
            page_data["newer"] = str(index - 1)
        page_html = open(os.path.join("page", str(index) + ".html"), "w")
        html = tmpl.render(posts=page_posts, page=page_data, page_type="page")
        page_html.write(html)
    try:
        os.symlink("1.html", "page/index.html")
    except FileExistsError:
        pass
    try:
        os.symlink("page/1.html", "index.html")
    except FileExistsError:
        pass

def gen_post_rss(post):
    post["title"] = escape(post["title"])
    post["body"] = escape(post["body"])
    post["url"] = os.path.join(
        settings["blog_url"], "post", str(post["id"]) + ".html")
    post["date"] = datetime.strptime(post["date"], "%a %b %d %Y").strftime(
        "%a, %d %b %Y 00:00:00 GMT")
    categories_rss = "\n".join(
        """<category domain="{blog_url}#!tag/{tag}">{tag}</category>"""
        .format(tag=tag, **settings) for tag in post["tags"])
    return """
    <item>
      <title>{title}</title>
      <link>{url}</link>
      <pubDate>{date}</pubDate>
      <guid>{url}</guid>
      <dc:creator>{author}</dc:creator>
      {categories}
      <description>{body}</description>
    </item>""".format(author=settings["author"], categories=categories_rss,
                      **post)

def gen_rss():
    posts_rss = "\n".join(gen_post_rss(post) for post in posts)
    rss = """<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"
 xmlns:dc="http://purl.org/dc/elements/1.1/"
 xml:base="{blog_url}">
  <channel>
    <atom:link href="{rss_url}" rel="self" type="application/rss+xml" />
    <title>{blog_name}</title>
    <description>{blog_description}</description>
    <language>en</language>
    <link>{blog_url}</link>
{posts_rss}
  </channel>
</rss>""".format(posts_rss=posts_rss, **settings)
    rss_file = open("rss.xml", "w")
    rss_file.write(rss)
    rss_file.close()

if __name__ == "__main__":
    load_posts()
    posts.reverse()
    gen_posts()
    gen_archive()
    gen_pages()
    gen_rss()
