#!/bin/env python3

import os
import subprocess
import json
from datetime import datetime
from jinja2 import Template

from rst_parser import load_post as load_rst_post
from md_parser import load_post as load_md_post

posts = None
tmpl = None
tmpl_rss = None
tmpl_sitemap = None
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


def load_posts():
    global posts
    for index, post in enumerate(posts):
        if post["url"].endswith(".rst"):
            load_rst_post(post, index)
        else:
            load_md_post(post, index)
    posts = list(filter(lambda p: "publish" not in p or p["publish"], posts))


def gen_posts():
    try:
        os.mkdir("post")
    except FileExistsError:
        pass
    for index, post in enumerate(posts):
        post["index"] = index
        page_data = {"index": index}
        if index + 1 < len(posts):
            page_data["older"] = post["older"] = posts[index + 1]['id']
        if index > 0:
            page_data["newer"] = post["newer"] = posts[index - 1]["id"]
        post_html = open(post["url"] + '.html', "w")
        html = tmpl.render(posts=[post], page=page_data, page_type="post")
        post_html.write(html)
        post_html.close()
        for _id in post["ids"]:
            try:
                os.symlink(post["url"][5:] + '.html',
                           os.path.join("post", str(_id) + ".html"))
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
        html = tmpl.render(tag=tag, posts=tag_posts, page={"index": 1},
                           page_type="tag")
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


def minify_html():
    print("Minifying HTML...")
    files = ["page/" + f for f in os.listdir("page/")]
    files += ["post/" + f for f in os.listdir("post/")]
    files += ["tag/" + f for f in os.listdir("tag/")]
    files.append("archive.html")
    files = filter(lambda f: not os.path.islink(f), files)
    for f in files:
        pass
        subprocess.call(["html-minifier", f, "-o", f,
                         "--minify-css",
                         "--minify-js",
                         "--case-sensitive",
                         "--remove-comments",
                         "--collapse-whitespace",
                         "--conservative-collapse",
                         "--collapseBoolean-attributes",
                         "--remove-redundant-attributes",
                         "--remove-empty-attributes"])


def minify_css():
    print("Minifying CSS...")
    subprocess.call(["lessc",
                     "--no-ie-compat",
                     "--plugin=less-plugin-clean-css=advanced",
                     "css/style.less",
                     "css/style.css",
                     "--relative-urls",
                     "--source-map"])


if __name__ == "__main__":
    load_posts()
    posts.reverse()
    gen_posts()
    gen_archive()
    gen_tags()
    gen_pages()
    gen_rss()
    gen_sitemap()
    minify_html()
    minify_css()
