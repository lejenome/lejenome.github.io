=======================================================
Simple feedback form implementation for static websites
=======================================================

.. Author:: Moez Bouhlel <bmoez.j@gmail.com>
.. Id:: slack-feedback-form
.. Tags:: javascript, slack
.. Published:: 2016/10/05
.. Publish:: True

Recently, I wanted to add a feedback form to my resume page to help my friends
review it. I was using GitHub pages to host my static web site and I didn't
want to host the server side of the feedback on a different server. So I was
looking for a simple solution that works well with my static website. Most of
the available ones were either paid or have too many unneeded features.

At the end, I decided to use my `Slack <https://slack.com/>`_ team to receive
feedbacks. It does not require any third-party library or any server side code.
And it's very simple to implement:

1. Create a Slack team if you don't have one.
2. Add an `Incoming Webhook <https://api.slack.com/incoming-webhooks>`_ URL to
   a channel on your team. It's a simple URL that you can send feedbacks to.
3. Finally, add your client side implementation. This is a simple one:

.. code:: html
    :number-lines:

    <form id="feedback">
        <textarea name="text" required></textarea>
        <input type="submit" value="send feedback"></input>
    </form>

.. code:: javascript
    :number-lines:

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

Improvements:
-------------

You can add more entries to the send JSON. Check Slack
`documentation <https://api.slack.com/methods/chat.postMessage>`_ for more
details. The most useful ones are ``username`` and ``icon_emoji``.

You can set different a ``username`` and different a ``icon_emoji`` entry for
every page. For example, you send this JSON from your resume page:

.. code:: json
    :number-lines:

    {
        "text"       : "THE FEEDBACK MESSAGE",
        "parse"      : "none",
        "username"   : "resume",
        "icon_emoji" : ":briefcase:"
    }

