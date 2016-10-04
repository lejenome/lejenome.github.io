#!/bin/env python3
import json
from datetime import datetime
from xml.sax.saxutils import escape
from markdown import markdown

posts_file = open("posts.json")
posts = json.load(posts_file)

settings = {
    "rss_url": "https://lejenome.github.io/feed",
    "blog_name": "Moez Bouhlel [lejenome]",
    "blog_description": "Self-taught programmer, CS Student and FOSS "
    "contributor",
    "blog_url": "https://lejenome.github.io/",
    "author": "Moez Bouhlel",
}

def gen_post_rss(post):
    post_file = open(post["url"])
    post["url"] = settings["blog_url"] + "#!post/" + str(post["id"])
    post["date"] = datetime.strptime(post["date"], "%Y/%m/%d").strftime(
        "%a, %d %b %Y 00:00:00 GMT")
    post["title"] = escape(post_file.readline().strip())
    post_file.readline()
    post_file.readline()
    post["body"] = escape(markdown(post_file.read()))
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

posts_rss = "\n".join(gen_post_rss(post) for post in reversed(posts["files"]))
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
</rss>
""".format(posts_rss=posts_rss, **settings)

print(rss)
