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
    return """
    <item>
      <title>{title}</title>
      <description>{body}</description>
      <link>{url}</link>
      <pubDate>{date}</pubDate>
      <guid>{url}</guid>
    </item>
    """.format(**post)

posts_rss = "\n".join(gen_post_rss(post) for post in reversed(posts["files"]))
rss = """
<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <atom:link href="{rss_url}" rel="self" type="application/rss+xml" />
    <title>{blog_name}</title>
    <description>{blog_description}</description>
    <link>{blog_url}</link>
    {posts_rss}
  </channel>
</rss>
""".format(posts_rss=posts_rss, **settings)

print(rss)
