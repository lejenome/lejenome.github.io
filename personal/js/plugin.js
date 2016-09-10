"use strict";
function setupPlugins(settings) {
    return Promise.all(pluginsPromises(settings));
}
function pluginsPromises(settings) {
    return Object.keys(settings["plugins"]).filter(function (plugin) {
        return settings["plugins"][plugin];
    }).map(function (plugin) {
        return setupPlugin(plugin, settings["plugins_settings"][plugin]).then(console.log.bind(console, "Plugin Setuped:", plugin)).catch(console.error.bind(console, "Plugin Not Found", plugin));
    });
}
function setupPlugin(plugin, settings) {
    return new Promise(function (resolve, reject) {
        importM(formatModuleName(plugin) + "Plugin", "plugins/" + formatModulePath(plugin)).then(function ($plugin) {
            if ($plugin) {
                $plugin.setup(settings);
                resolve();
            } else {
                reject(MODULE_NOT_FOUND);
            }
        });
    });
}