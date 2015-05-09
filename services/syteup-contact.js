(function (window) {
    "use strict";
    var DISPLAY_NAME = "Contact";
    function setupContact(data, settings) {
        if (data.tel)
            data.tel_uri = "tel:+" + data.tel.match(/\((.*)\) (.*)/).slice(1).join("");
        if (data.mobile)
            data.mobile_uri = "tel:+" + data.mobile.match(/\((.*)\) (.*)/).slice(1).join("");
        if (data.fax)
            data.fax_uri = "fax:+" + data.fax.match(/\((.*)\) (.*)/).slice(1).join("");
        return data;
    }
    function fetchContact(settings) {
        var context = [];
        if (settings.pgp_url)
            context.push(asyncText(settings.pgp_url));
        if (settings.ssh_url)
            context.push(asyncText(settings.ssh_url));
        if (context.length > 0) {
            return Promise.all(context).then(function (res) {
                var data = settings;
                if (settings.pgp_url) {
                    data.pubkey = res[0];
                    data.sshkey = res[1];
                } else {
                    data.sshkey = res[0];
                }
                return Promise.resolve(data);
            });
        } else {
            return Promise.resolve(settings);
        }
    }
    exportService({
        displayName: DISPLAY_NAME,
        setup: setupContact,
        fetch: fetchContact,
        template: "syteup-contact.html"
    }, "syteup_contact");
}(window));