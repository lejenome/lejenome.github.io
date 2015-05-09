/** Jukax
 * @author      Moez Bouhlel
 * @license     MIT License
 * @project     https://github.com/lejenome/jukax
 */
/*jslint browser: true */
/*jslint devel: true */
/*global tizen */
/*global jukax */
/*global $ */
/*global lastPage */
/*jshint quotmark:single */
(function () {
    'use strict';
    document.addEventListener('tizenhwkey', function (e) {
        switch (e.keyName) {
        case 'back':
            jukax.accoutSave();
            tizen.application.getCurrentApplication().exit();
            break;
        case 'menu':
            var activePage = $('body').pagecontainer('getActivePage').attr('id');
            if (activePage === 'cal') {
                $('#nav-panel').panel('toggle');
            } else if (activePage === 'events') {
                $('#nav-panel2').panel('toggle');
            } else if (activePage === 'settings') {
                $.mobile.changePage(lastPage);
            }
            break;
        default:
            console.log('Not supported.');
        }
    });
}());