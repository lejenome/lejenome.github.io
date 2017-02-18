#!/bin/env python

from pprint import pprint
from datetime import datetime
import os

import docutils.parsers.rst.directives
import docutils.parsers.rst


class Author(docutils.parsers.rst.Directive):

    required_arguments = 1
    optional_arguments = 0
    final_argument_whitespace = True

    def run(self):
        self.state_machine.document['author'] = self.arguments[0]
        return []


class Tags(docutils.parsers.rst.Directive):

    required_arguments = 1
    optional_arguments = 0
    final_argument_whitespace = True

    def run(self):
        tags = [tag.strip() for tag in self.arguments[0].split(',')]
        self.state_machine.document['tags'] = tags
        return []


class Publish(docutils.parsers.rst.Directive):

    required_arguments = 1
    optional_arguments = 0
    final_argument_whitespace = True

    def run(self):
        publish = self.arguments[0].lower() in ("true", "yes", "1")
        self.state_machine.document['publish'] = publish
        return []


class Published(docutils.parsers.rst.Directive):

    required_arguments = 1
    optional_arguments = 0
    final_argument_whitespace = True

    def run(self):
        import datetime
        date = datetime.datetime.strptime(self.arguments[0],
                                          "%Y/%m/%d")
        self.state_machine.document['published'] = date
        return []


class Id(docutils.parsers.rst.Directive):

    required_arguments = 1
    optional_arguments = 0
    final_argument_whitespace = True

    def run(self):
        self.state_machine.document['id'] = self.arguments[0]
        return []


docutils.parsers.rst.directives.register_directive("author", Author)
docutils.parsers.rst.directives.register_directive("tags", Tags)
docutils.parsers.rst.directives.register_directive("publish", Publish)
docutils.parsers.rst.directives.register_directive("published", Published)
docutils.parsers.rst.directives.register_directive("id", Id)


import docutils.core
import docutils.io


def parse_file(file_path):
    print(file_path)
    f = open(file_path)
    pub = docutils.core.Publisher()
    pub.set_components(parser_name="rst", reader_name="standalone",
                       writer_name="html4css1")
    pub.get_settings(traceback=True, syntax_highlight='short')
    pub.set_source(source=f, source_path=f.name)
    pub.set_destination(None, None)
    pub.publish()
    return pub

# pub = parse_file("posts/simple-feedback-form-for-static-websites.rst")
# pprint(pub.document)
# pprint(pub.writer.parts)


def load_post(post, index):
    post_file = open(post["url"])
    pub = parse_file(post["url"])
    post["publish"] = "publish" in pub.document and pub.document["publish"]
    post["title"] = pub.document["title"]
    post["body"] = ''.join(pub.writer.body)
    post["tags"] = pub.document["tags"]
    post["date"] = pub.document["published"].strftime("%Y/%m/%d")
    post["date_original"] = post["date"]
    post["file"] = post["url"]
    post["date"] = datetime.strptime(post["date"], "%Y/%m/%d").strftime(
        "%a %b %d %Y")
    post_file.close()
    if "id" in pub.document:
        post["id"] = pub.document["id"]
    if "id" not in post:
        post["id"] = pub.document["ids"][0]
    post["ids"] = set(pub.document["ids"])
    post["ids"].add(os.path.splitext(os.path.basename(post["url"]))[0])
    post["url"] = os.path.join("post", str(post["id"]))
    post["date_rss"] = datetime.strptime(post["date"], "%a %b %d %Y").strftime(
        "%a, %d %b %Y 00:00:00 GMT")
