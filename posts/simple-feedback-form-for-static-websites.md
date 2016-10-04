Simple feedback form implementation for static websites
=======================================================

Recently, I wanted to add a feedback form to my resume page to help my friends
review it. I was using GitHub pages to host my static web site and I didn't
want to host the server side of the feedback on a different server. So I was
looking for a simple solution that works well with my static website. Most of
the available ones were either paid or have too many unneeded features.

At the end, I decided to use my [Slack](https://slack.com/) team to receive
feedbacks. It does not require any third-party library or any server side code.
And it's very simple to implement:

1. Create a Slack team if you don't have one.
2. Add an [Incoming Webhook](https://api.slack.com/incoming-webhooks) URL to a
   channel on your team. It's a simple URL that you can send feedbacks to.
3. Finally, add your client side implementation. This is a simple one:

```html
<form id="feedback">
    <textarea name="text" required></textarea>
    <input type="submit" value="send feedback"></input>
</form>
```

```javascript
let form = document.getElementById("feedback");
form.addEventListener("submit", function(e) {
    e.preventDefault();
    fetch(YOUR_WEBHOOK_URL, {
        method: "POST", // You should use POST method
        body: JSON.stringify({
            text: form.text.value, // the feedback message
            parse: "none", // tell Slack it's not a formated text
        });
    });
});
```

#### Improvements:

You can add more entries to the send JSON. Check Slack
[documentation](https://api.slack.com/methods/chat.postMessage) for more
details. The most useful ones are `username` and `icon_emoji`.

You can set different a `username` and different a `icon_emoji` entry for every
page. For example, you send this JSON from your resume page:

```javascript
{
    "text": "THE FEEDBACK MESSAGE",
    "parse": "none",
    "username": "resume",
    "icon_emoji": ":briefcase:"
}
```

Hopefully when the [W3C HTML JSON form
submission](bhttp://darobin.github.io/formic/specs/json/) specification becomes
implemented by the main browsers, you will no longer need any JavaScript code to
send feedback but just a simple HTML:

```html
<form action="YOUR_WEBHOOK_URL" method="post" accept-charset="UTF-8" enctype="application/json">
    <textarea name="text" required></textarea>
    <input type="text" name="parse" value="none" hidden></input>
    <input type="submit" value="send feedback"></input>
</form>
```
