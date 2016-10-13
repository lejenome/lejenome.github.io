from datetime import datetime
import os
import markdown
md = markdown.Markdown(output_format="html5",
                       extensions=["markdown.extensions.fenced_code",
                                   "markdown.extensions.codehilite"],
                       extension_configs={
                           "markdown.extensions.codehilite": {
                               "css_class": "code"
                           }})
def load_post(post, index):
    post_file = open(post["url"])
    post["title"] = post_file.readline().strip()
    post_file.readline()
    post["body"] = md.convert(post_file.read())
    post["date_original"] = post["date"]
    post["date"] = datetime.strptime(post["date"], "%Y/%m/%d").strftime(
        "%a %b %d %Y")
    post_file.close()
    post["ids"] = {post["id"]}
    post["ids"].add(os.path.splitext(os.path.basename(post["url"]))[0])
    post["url"] = os.path.join("post", str(post["id"]))
    post["date_rss"] = datetime.strptime(post["date"], "%a %b %d %Y").strftime(
        "%a, %d %b %Y 00:00:00 GMT")
