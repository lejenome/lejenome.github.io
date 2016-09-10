"use strict";
function setupService(service, el, settings) {
    return importM(formatModuleName(service) + "Service", "services/" + formatModulePath(service)).then(function ($service) {
        if (!$service) {
            alertError("Service Not Found", service);
            return Promise.reject();
        }
        settings.url = $service.getURL(settings);
        // just open url in case of errors
        if ($("#" + service + "-profile").length > 0) {
            window.location = settings.url;
            return;
        }
        // show spinner
        var spinner = new Spinner(spin_opts).spin();
        $("#" + service + "-item-link").append(spinner.el);
        var promises = [
            $service.fetch(settings),
            asyncText("templates/" + $service.template)
        ];
        if ($service.supportMore)
            promises.push(asyncText("templates/" + $service.templateMore));
        // request templates && fetch service data
        return Promise.all(promises).then(function (results) {
            var serviceData = results[0], view = results[1], viewMore = results[2];
            var $modal;
            if (!serviceData || serviceData.error) {
                window.location = settings.url;
                return;
            }
            // compile the current view template
            var template = Handlebars.compile(view);
            // setup the template data
            serviceData = $service.setup(serviceData, settings);
            if (!serviceData) {
                window.location = settings.url;
                return;
            }
            $modal = $(template(serviceData)).modal().on("hidden.bs.modal", function () {
                $(this).remove();
                if (currSelection === service) {
                    adjustSelection("home");
                }
            });
            // If service support fetching more data
            if ($service.supportMore) {
                var moreTemplate = Handlebars.compile(viewMore);
                $modal.find("#load-more-data").click(function (e) {
                    var spinnerMore = new Spinner(spin_opts).spin();
                    $(this).append(spinnerMore.el);
                    // fetch more service data && add it to the modal
                    $service.fetchMore(settings).then(function (serviceMoreData) {
                        serviceMoreData = $service.setupMore(serviceMoreData, settings);
                        $("." + service + " .profile-data").append(moreTemplate(serviceMoreData));
                        spinnerMore.stop();
                    }).catch(function (error) {
                        if (error === NO_MORE_DATA) {
                            $(this).remove();
                        }
                        spinnerMore.stop();
                    });
                });
            }
            spinner.stop();
            console.info("Service Setuped:", service);
        }).catch(function (error) {
            //TODO
            alertError(error);
            console.error("Service Not Setuped:", service);
        });
    });
}