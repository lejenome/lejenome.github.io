(function (window) {
    "use strict";
    var DISPLAY_NAME = "LinkedIn";
    var API_URL = "https://api.linkedin.com/v1";
    function setupLinkedin(linkedinData, settings) {
        linkedinData.profile["profile_url"] = "http://linkedin.com/profile/view?id=" + linkedinData.profile["id"];
        linkedinData.profile["summary"] = linkedinData.profile["summary"].replace("\n", "<br />", "g");
        //        linkedinData.profile["numGroups"] = linkedinData.groups["_count"];
        //        linkedinData.profile["numNetworkUpdates"] = linkedinData.network_updates["_total"];
        linkedinData.profile["location_name"] = linkedinData.profile["location"]["name"];
        return linkedinData;
    }
    function fetchData(settings) {
        //request auth_code:
        //https://www.linkedin.com/uas/oauth2/authorization?response_type=code&client_id=XXX&scope=r_fullprofile&state=XXX&redirect_uri=http://lejenome.github.io
        var profile_selectors = [
            "id",
            "first-name",
            "last-name",
            "headline",
            "location",
            "num-connections",
            "skills",
            "educations",
            "picture-url",
            "summary",
            "positions",
            "industry",
            "site-standard-profile-request"
        ].join();
        var network_upd_types = [
            "APPS",
            "CMPY",
            "CONN",
            "JOBS",
            "JGRP",
            "PICT",
            "PFOL",
            "PRFX",
            "RECU",
            "PRFU",
            "SHAR",
            "VIRL"
        ].join("&type=");
        return Promise.all([asyncGet(API_URL + "/people/~:(" + profile_selectors + ")?oauth2_access_token=" + settings.access_token)    //            asyncGet(API_URL + "/people/~/group-memberships:(group:(id,name),membership-state)?oauth2_access_token=" + settings.access_token),
                                                                                                                        //            asyncGet(API_URL + "/people/~/network/updates?type=" + network_upd_types + "&oauth2_access_token=" + settings.access_token)
]).then(function (res) {
            return Promise.resolve({ profile: res[0] });
        });
    }
    exportService({
        displayName: DISPLAY_NAME,
        template: "linkedin.html",
        setup: setupLinkedin,
        fetch: fetchData
    }, "linkedin");
}(window));