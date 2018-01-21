==================================
Github push webhook implementation
==================================

.. Author:: Moez Bouhlel <bmoez.j@gmail.com>
.. Id:: github-push-webhook-implementation
.. Tags:: php, github, webhook, django
.. Published:: 2017/07/30
.. Publish:: True

Github and Bitbuket provide webhooks support to notify external services when
certain events happen with a repository. The most commonly used webhook event
is ``push``.

The following code is a PHP implementation of GitHub webhook that will update
a repository clone and execute required deployment code when a new commit was
pushed.

.. raw:: html

    <script src="https://gist.github.com/lejenome/2ee7f1f47b9800140c57b51c1474439f.js"></script>

After adding this file to your server, you need to make the following changes
before adding the webhook to github:

- Sett ``SECRET_TOKEN`` to a randomly generated token. You can use this
  command to generate a truly random secure token on Linux:

.. code:: shell

    head /dev/urandom | tr -dc A-Za-z0-9 | head -c 40

- Change ``$commands`` list to matches your need for every repository. An
  example of updating both a static website repository and a Django based
  application repository is provided on the code above as a reference.
- Add write access to the process running PHP (FastCGI, mod_php, ...) which is
  mostly either running within the group ``www-data`` or ``www`` depending on
  the Linux distribution running on your server.
- If your repository is private, generate a ssh key and add the pubkey as a
  read-only deployment key to your repository settings. This key should be
  generated using the same user as the PHP process.

Finally, add a webhook to your repository settings. Make sure to set the
content type to ``application/json`` and the secret to the secret token you
have already generated.
