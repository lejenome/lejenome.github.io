function setupPlugins(settings) {
    "use strict";
    for (var plugin in settings["plugins"])
        if (settings["plugins"].hasOwnProperty(plugin) && settings["plugins"][plugin]) {
            var $plugin = window[formatModuleName(plugin) + "Plugin"];
            if (!$plugin) {
                console.error("Plugin Not Found:", plugin);
                continue;
            }
            $plugin.setup(settings["plugins_settings"][plugin]);
            console.log("Plugin Setuped:", plugin);
        }
    return Promise.resolve();
}