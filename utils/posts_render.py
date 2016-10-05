#!/bin/env python3

import os
import json
from datetime import datetime
from jinja2 import Template
import markdown

posts = None
tmpl = None
md = markdown.Markdown(output_format="html5",
                       extensions=["markdown.extensions.fenced_code",
                                   "markdown.extensions.codehilite"],
                       extension_configs={
                           'markdown.extensions.codehilite': {
                               'linenums': True,
                           }})

with open("posts.json") as posts_file:
    posts = json.load(posts_file)["files"]
with open(os.path.join(os.path.dirname(__file__), "post.html")) as tmpl_file:
    tmpl = Template(tmpl_file.read())

for index, post in enumerate(posts):
    post_file = open(post["url"])
    full_path = os.path.join("post", '.'.join([
        os.path.splitext(os.path.basename(post["url"]))[0], "html"]))
    min_path = os.path.join("post", '.'.join([str(post["id"]), "html"]))
    post_html = open(min_path, "w")
    post["title"] = post_file.readline()[:-2]
    post["date"] = datetime.strptime(post["date"], "%Y/%m/%d").strftime(
        "%a %b %d %Y")
    post_file.readline()
    post["body"] = md.convert(post_file.read())
    post["index"] = index
    if index + 1 < len(posts):
        post["newer"] = posts[index + 1]['id']
    if index > 0:
        post["older"] = posts[index - 1]["id"]
    html = tmpl.render(post=post)
    post_html.write(html)
    post_file.close()
    try:
        os.link(min_path, full_path)
    except FileExistsError:
        pass
