#!/bin/env python3

import os
import json
from datetime import datetime
from jinja2 import Template
import markdown

posts = None
tmpl = None
tmpl_rss = None
tmpl_sitemap = None
md = markdown.Markdown(output_format="html5",
                       extensions=["markdown.extensions.fenced_code",
                                   "markdown.extensions.codehilite"])
settings = {
    "rss_url": "https://lejenome.github.io/rss.xml",
    "blog_name": "Moez Bouhlel [lejenome]",
    "blog_description": "Self-taught programmer, CS Student and FOSS "
    "contributor",
    "blog_url": "https://lejenome.github.io",
    "author": "Moez Bouhlel",
}
MAX_POSTS = 5

with open("posts.json") as posts_file:
    posts = json.load(posts_file)["files"]
with open(os.path.join(os.path.dirname(__file__), "post.html")) as tmpl_file:
    tmpl = Template(tmpl_file.read())
with open(os.path.join(os.path.dirname(__file__), "rss.xml")) as tmpl_file:
    tmpl_rss = Template(tmpl_file.read())
with open(os.path.join(os.path.dirname(__file__), "sitemap.xml")) as tmpl_file:
    tmpl_sitemap = Template(tmpl_file.read())

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
    post["url_rss"] = os.path.join(
        settings["blog_url"], post["full_path"])
    post["date_rss"] = datetime.strptime(post["date"], "%a %b %d %Y").strftime(
        "%a, %d %b %Y 00:00:00 GMT")

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
        post_html.close()
        try:
            os.symlink(post["min_path"][5:], post["full_path"])
        except FileExistsError:
            pass

def gen_archive():
    archive_html = open("archive.html", "w")
    html = tmpl.render(posts=posts, page={"index": 1}, page_type="archive")
    archive_html.write(html)
    archive_html.close()

def gen_tags():
    try:
        os.mkdir("tag")
    except FileExistsError:
        pass
    tags = set(tag for post in posts for tag in post["tags"])
    for tag in tags:
        tag_posts = [post for post in posts if tag in post["tags"]]
        tag_html = open(os.path.join("tag", tag + ".html"), "w")
        html = tmpl.render(posts=tag_posts, page={"index": 1}, page_type="tag")
        tag_html.write(html)
        tag_html.close()
    tags_s = sorted(tags)
    tag_html = open(os.path.join("tag/index.html"), "w")
    html = tmpl.render(tags=tags_s, page={"index": 1},
                       page_type="tags", posts=[])
    tag_html.write(html)
    tag_html.close()

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
        page_html.close()
    try:
        os.symlink("1.html", "page/index.html")
    except FileExistsError:
        pass
    try:
        os.symlink("page/1.html", "index.html")
    except FileExistsError:
        pass

def gen_rss():
    rss_file = open("rss.xml", "w")
    rss = tmpl_rss.render(settings=settings, posts=posts)
    rss_file.write(rss)
    rss_file.close()

def gen_sitemap():
    sitemap_file = open("sitemap.xml", "w")
    posts_d = [os.path.splitext(p)[0] for p in os.listdir("post/")]
    tags_d = [os.path.splitext(p)[0]
              for p in os.listdir("tag/") if p != "index.html"]
    pages_d = [os.path.splitext(p)[0]
               for p in os.listdir("page/") if p != "index.html"]
    tags_d.append("")
    pages_d.append("")
    sitemap = tmpl_sitemap.render(settings=settings, posts=posts_d,
                                  tags=tags_d, pages=pages_d)
    sitemap_file.write(sitemap)
    sitemap_file.close()

if __name__ == "__main__":
    load_posts()
    posts.reverse()
    gen_posts()
    gen_archive()
    gen_tags()
    gen_pages()
    gen_rss()
    gen_sitemap()
