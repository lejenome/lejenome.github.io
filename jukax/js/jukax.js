/** Jukax
 * @author      Moez Bouhlel
 * @license     MIT License
 * @project     https://github.com/lejenome/jukax
 */

/*jslint es5: true */
/*jslint plusplus: true */
/*jslint devel: true */
/*jslint browser: true */
/*global KiiSite */
/*global KiiUser */
/*global Kii */
/*global KiiQuery */
/*global localForage */
/*jshint quotmark:single */
(function () {
    'use strict';

    var jukax,
        user,
        data,
        bucket,
        ERROR_SAVING_DATA = 3,
        ERROR_CREATING_USER = 4,
        ERROR_QUERY_FAILURE = 5,
        ERROR_LOGIN = 6,
        ERROR_REFRESHING_DATA = 7,
        ERROR_DELETING_USER = 8,
        ERROR_UNVALID_INPUT = 9,
        ERROR_UPDATING_PASSWORD = 10,
        ERROR_CLEANINGUP_EVENTS = 11,
        Storages = { //where to store user data
            local: false, //TODO: add support for localForge (IndexedDB/localStorage) for offline support
            Kii: false
        },
        whenReady = null,
        alreadyReady = false,
        isLogin = false,
        keepLogin = false,
        loginToken = null,
        DEBUG = true;

    function debug(val1, val2) {
        if (!DEBUG) {
            return;
        }
        if (val2 === undefined) {
            if (typeof (val1) === 'boolean') {
                if (val1) {
                    console.info('[JUKAX:INFO]', 'TRUE');
                } else {
                    console.error('[JUKAX:ERROR]', 'FALSE');
                }
            } else if (typeof (val1) === 'number') {
                switch (val1) {
                case 3:
                    console.error('[JUKAX:ERROR] 3:ERROR_SAVING_DATA');

                    break;
                case 4:
                    console.error('[JUKAX:ERROR] 4:ERROR_CREATING_USER');
                    break;
                case 5:
                    console.error('[JUKAX:ERROR] 5:ERROR_QUERY_FAILURE');
                    break;
                case 6:
                    console.error('[JUKAX:ERROR] 6:ERROR_LOGIN');
                    break;
                case 7:
                    console.error('[JUKAX:ERROR] 7:ERROR_REFRESHING_DATA');
                    break;
                case 8:
                    console.error('[JUKAX:ERROR] 8:ERROR_DELETING_USER');
                    break;
                case 9:
                    console.error('[JUKAX:ERROR] 9:ERROR_UNVALID_INPUT');
                    break;
                case 10:
                    console.error('[JUKAX:ERROR] 10:ERROR_UPDATING_PASSWORD');
                    break;
                case 11:
                    console.error('[JUKAX:ERROR] 11:ERROR_CLEANINGUP_EVENTS');
                    break;
                default:
                    console.info('[JUKAX:INFO]', val1);
                    break;
                }
            } else if (typeof (val1) === 'string') {
                console.info('[JUKAX:INFO]', val1);
            } else {
                console.info('[JUKAX:INFO]', val1.toString());
            }
        } else {
            if (typeof (val1) === 'number' && typeof (val2) === 'array') {
                switch (val1) {
                case 3:
                    console.error('[JUKAX:ERROR] 3:ERROR_SAVING_DATA', val2);

                    break;
                case 4:
                    console.error('[JUKAX:ERROR] 4:ERROR_CREATING_USER', val2);
                    break;
                case 5:
                    console.error('[JUKAX:ERROR] 5:ERROR_QUERY_FAILURE', val2);
                    break;
                case 6:
                    console.error('[JUKAX:ERROR] 6:ERROR_LOGIN', val2);
                    break;
                case 7:
                    console.error('[JUKAX:ERROR] 7:ERROR_REFRESHING_DATA', val2);
                    break;
                case 8:
                    console.error('[JUKAX:ERROR] 8:ERROR_DELETING_USER', val2);
                    break;
                case 9:
                    console.error('[JUKAX:ERROR] 9:ERROR_UNVALID_INPUT', val2);
                    break;
                case 10:
                    console.error('[JUKAX:ERROR] 10:ERROR_UPDATING_PASSWORD', val2);
                    break;
                case 11:
                    console.error('[JUKAX:ERROR] 11:ERROR_CLEANINGUP_EVENTS', val2);
                    break;
                default:
                    console.info('[JUKAX:INFO]', val1, val2);
                    break;
                }
            } else if (val1 === 1) {
                console.error('[JUKAX:ERROR]', val2);
            } else {
                if (val1 === val2) {
                    console.info('[JUKAX:info]', val1, '====', val2);
                } else {
                    console.error('[JUKAX:ERROR]', val1, '!==', val2);
                }
            }
        }
    }

    function ready(fn) {
        if (alreadyReady) {
            fn();
        } else {
            whenReady = fn;
        }
    }

    function itsReady() {
        alreadyReady = true;
        if (whenReady) {
            whenReady();

        }
    }

    localForage.getItem('keepLogin', function (item) {
        if (!item) { // maybe not defined yet
            item = false;
            localForage.setItem('keepLogin', false, function () {
                localForage.setItem('loginToken', null, itsReady);
            });
        } else {
            keepLogin = item;
            localForage.getItem('loginToken', function (item2) {
                loginToken = item2;
                if (!item2) {
                    keepLogin = false;
                    localForage.setItem('keepLogin', false, itsReady);
                } else {
                    itsReady();
                }
            });
        }
    });


    function storagesSet(storages) {
        storages = typeof storages !== 'undefined' ? storages : {};
        if (storages.hasOwnProperty('local')) {
            Storages.local = storages.local;
        }
        if (storages.hasOwnProperty('Kii')) {
            Storages.Kii = storages.Kii;
        }
    }

    function initializeKii(appID, appKey, kii_site) {
        if (Storages.Kii) {
            kii_site = typeof kii_site !== 'undefined' ? kii_site : KiiSite.US;
            Kii.initializeWithSite(appID, appKey, kii_site);
        } else {
            debug(1, 'Kii is not set as a Storage');
            throw 'Kii is not set as a Storage';
        }
    }

    function accountCreate(username, password, fn) {
        fn = typeof fn !== 'undefined' ? fn : {};
        try {
            user = KiiUser.userWithUsername(username, password);
            user.register({
                success: function (Auser) {
                    debug('registred user');
                    if (keepLogin) {
                        loginToken = Auser.getAccessToken();
                        localForage.setItem('loginToken', loginToken);
                    }
                    isLogin = true;
                    bucket = Auser.bucketWithName('data');
                    data = bucket.createObject();
                    data.set('data', {});
                    data.saveAllFields({
                        success: function (theObject) {
                            debug('all data fields saved');
                            theObject.refresh({
                                success: function (obj) {
                                    debug('data refreshed');
                                    data = obj;
                                    if (fn.hasOwnProperty('success')) {
                                        fn.success();
                                    }
                                },
                                failure: function (obj, error) {
                                    debug(7, [error]);
                                    if (fn.hasOwnProperty('failure')) {
                                        fn.failure({
                                            type: 7,
                                            message: error
                                        });
                                    }
                                }
                            });
                        },
                        failure: function (theObject, errorString) {
                            if (fn.hasOwnProperty('failure')) {
                                debug(3, [errorString]);
                                fn.failure({
                                    type: 3,
                                    message: errorString
                                });
                            }
                        }
                    });
                },
                failure: function (theUser, errorString) {
                    debug(4, [errorString]);
                    if (fn.hasOwnProperty('failure')) {
                        fn.failure({
                            type: 4,
                            message: errorString
                        });
                    }
                }
            });
        } catch (e) {
            debug(1, e);
            throw e.message;
        }
    }

    function accountLogin(username, password, fn) {
        fn = typeof fn !== 'undefined' ? fn : {};
        var callBack = {
            success: function (Auser) {
                debug('loged user');
                user = Auser;
                if (keepLogin) {
                    loginToken = Auser.getAccessToken();
                    localForage.setItem('loginToken', loginToken);
                }
                isLogin = true;
                bucket = user.bucketWithName('data');
                var query = KiiQuery.queryWithClause(),
                    queryCallbacks = {
                        success: function (queryPerformed, r) {
                            debug('Queryed for data');
                            /*
                        r[0].refresh({
                            success: function (obj) {
                                debug('data refreshed: ' + obj.toString());
                                data = obj;
                                if (typeof data.get('data') === 'undefined') {
                                    data.set('data', {});
                                    data.save({
                                        success: function (obj) {
                                            debug('data saved');
                                            data = obj;
                                            if (fn.hasOwnProperty('success')) {
                                                fn.success();
                                            }
                                        },
                                        failure: function (obj, errorString) {
                                            debug(3, [errorString]);
                                            if (fn.hasOwnProperty('failure')) {
                                                fn.failure({
                                                    type: 3,
                                                    message: errorString
                                                });
                                            }
                                        }
                                    });
                                } else if (fn.hasOwnProperty('success')) {
                                    fn.success();

                                }

                            },
                            failure: function (obj, errorString) {
                                debug(7, [errorString]);
                                if (fn.hasOwnProperty('failure')) {
                                    fn.failure({
                                        type: 7,
                                        message: errorString
                                    });
                                }
                            }
                        });*/
                            data = r[0];
                            fn.success();
                        },
                        failure: function (queryPerformed, errorString) {
                            debug(5, [errorString]);
                            if (fn.hasOwnProperty('failure')) {
                                fn.failure({
                                    type: 5,
                                    message: errorString
                                });
                            }
                        }
                    };
                bucket.executeQuery(query, queryCallbacks);
            },
            failure: function (theUser, errorString) {
                debug(6, [errorString]);
                if (fn.hasOwnProperty('failure')) {
                    fn.failure({
                        type: 6,
                        message: errorString
                    });
                }
            }
        };
        if (loginToken) {
            debug('Loging with Token');
            KiiUser.authenticateWithToken(loginToken, callBack);
        } else {
            debug('Loging with username/pw');
            KiiUser.authenticate(username, password, callBack);
        }
    }

    function accountKeepLogin(keep, callback) {
        if (keep === undefined) {
            return keepLogin && loginToken;
        }
        if (keep) {
            debug('KeepLogin set to True');
            keepLogin = true;
            localForage.setItem('keepLogin', true, callback);
        } else {
            debug('KeepLogin set to False');
            keepLogin = false;
            loginToken = false;
            localForage.setItem('keepLogin', false, function () {
                localForage.setItem('loginToken', null, callback);
            });
        }
    }

    function accountLogout() {
        data.save({
            success: function () {
                debug('data saved');
                KiiUser.logOut();
                debug('logged out');
                accountKeepLogin(false);
                isLogin = false;
            },
            failure: function () {
                debug(3);
                KiiUser.logOut();
                debug('logged out');
            }
        });
    }

    function accoutSave(fn) {
        fn = typeof fn !== 'undefined' ? fn : {};
        data.save({
            success: function () {
                debug('data saved');
                if (fn.hasOwnProperty('success')) {
                    fn.success();
                }
            },
            failure: function (obj, errorString) {
                debug(3, [errorString]);
                if (fn.hasOwnProperty('failure')) {
                    fn.failure({
                        type: 3,
                        message: errorString
                    });
                }
            }
        });
    }

    function accountDelete(fn) {
        fn = typeof fn !== 'undefined' ? fn : {};
        user.delete({
            success: function () {
                debug('user deleted');
                if (fn.hasOwnProperty('success')) {
                    accountKeepLogin(false);
                    isLogin = false;
                    fn.success();
                }
            },
            failure: function (user, errorString) {
                debug(8, [errorString]);
                if (fn.hasOwnProperty('failure')) {
                    fn.failure({
                        type: 8,
                        message: errorString
                    });
                }
            }
        });
    }

    function accountUpdatePassword(old_pw, new_pw, fn) {
        try {
            if (old_pw !== '' && old_pw !== null && new_pw !== '' && new_pw !== null) {
                user.updatePassword(old_pw, new_pw, {
                    success: function () {
                        debug('password updated');
                        accountKeepLogin(false);
                        isLogin = false;
                        if (fn.hasOwnProperty('success')) {
                            fn.success();
                        }
                    },
                    failure: function (user, errorString) {
                        if (fn.hasOwnProperty('failure')) {
                            debug(10, [errorString]);
                            fn.failure({
                                type: 10,
                                message: errorString
                            });
                        }
                    }
                });
            } else {
                if (fn.hasOwnProperty('failure')) {
                    fn.failure({
                        type: 9,
                        message: 'Unvalid Input'
                    });
                }
            }
        } catch (e) {
            debug(1, e);
            throw e.message;
        }
    }

    function eventsCleanup(fn) {
        data.delete({
            success: function () {
                debug('data removed');
                data = user.bucketWithName('data').createObject();
                data.set('data', {});
                data.save({
                    success: function (o) {
                        debug('data saved');
                        data = o;
                        data.refresh({
                            success: function (d) {
                                debug('data refreshed');
                                data = d;
                                if (fn.hasOwnProperty('success')) {
                                    fn.success();
                                }
                            },
                            failure: function (obj, errorString) {
                                debug(7, [errorString]);
                                if (fn.hasOwnProperty('failure')) {
                                    fn.failure({
                                        type: 7,
                                        message: errorString
                                    });
                                }
                            }
                        });
                    },
                    failure: function (obj, errorString) {
                        debug(3, [errorString]);
                        if (fn.hasOwnProperty('failure')) {
                            fn.failure({
                                type: 3,
                                message: errorString
                            });
                        }
                    }
                });
            },
            failure: function (obj, errorString) {
                debug(11, [errorString]);
                if (fn.hasOwnProperty('failure')) {
                    fn.failure({
                        type: 11,
                        message: errorString
                    });
                }
            }
        });
    }

    function eventsUpdate(YMD, event) { //YMD : Year+Month+Day String
        var eventIndex = -1,
            CurrentEvent = {},
            eventsData = data.get('data'),
            j;
        if (!eventsData.hasOwnProperty(YMD)) {
            eventsData[YMD] = [];
        }
        if (!event.hasOwnProperty('created') || event.created === null) {
            //eventIndex=-1;
            event.created = Date.now();
        } else {
            for (j = 0; j < eventsData[YMD].length; j++) {
                if (eventsData[YMD][j].created === event.created) {
                    eventIndex = j;
                    break;
                }
            }
        }
        CurrentEvent.title = event.hasOwnProperty('title') ? event.title : 'Note';
        CurrentEvent.where = event.hasOwnProperty('where') ? event.where : '';
        CurrentEvent.note = event.hasOwnProperty('note') ? event.note : '';
        CurrentEvent.time = event.hasOwnProperty('time') ? event.time : '';
        CurrentEvent.repeat = event.hasOwnProperty('repeat') ? event.repeat : 'once';
        CurrentEvent.reminder = event.hasOwnProperty('reminder') ? event.reminder : 'no';
        CurrentEvent.level = event.hasOwnProperty('level') ? event.level : 'A';
        CurrentEvent.created = event.created;

        if (eventIndex > -1) {
            eventsData[YMD][eventIndex] = CurrentEvent;
        } else {
            eventsData[YMD].push(CurrentEvent);
            eventsData[YMD].sort(function (a, b) {
                return parseInt(a.time.split(':').join(''), 10) - parseInt(b.time.split(':').join(''), 10);
            });
        }
        data.set('data', eventsData);
        data.save({
            success: function () {
                //data = obj;
                //....?????
            },
            failure: function () {
                //....????:w?
            }
        });
    }

    function eventsDelete(YMD, created) {
        var eventsData = data.get('data'),
            eventIndex = -1,
            j;
        if (!eventsData.hasOwnProperty(YMD)) {
            return;
        }
        for (j = 0; j < eventsData[YMD].length; j++) {
            if (eventsData[YMD][j].created === created) {
                eventIndex = j;
                break;
            }
        }
        if (eventIndex === -1) {
            return;
        }
        eventsData[YMD].splice(eventIndex, 1);
        if (eventsData[YMD].length === 0) {
            delete eventsData[YMD];
        }
        data.set('data', eventsData);
        data.saveAllFields({
            success: function () {
                //data = obj;
                //.....??????
            },
            failure: function () {
                //.....??????
            }
        });
    }

    function eventsObject() {
        return {
            title: '',
            where: '',
            note: '',
            time: '',
            repeat: 'once',
            reminder: 'no',
            level: 'A',
            created: Date.now()
        };
    }

    function eventsGet(YMD, created) {
        if (!isLogin || !data.get('data').hasOwnProperty(YMD)) {
            return null;
        }
        if (created !== undefined) {
            var eventIndex = -1,
                j;
            for (j = 0; j < data.get('data')[YMD].length; j++) {
                if (data.get('data')[YMD][j].created === created) {
                    eventIndex = j;
                    break;
                }
            }
            if (eventIndex > -1) {
                return data.get('data')[YMD][eventIndex];
            } else {
                return null;
            }
        }
        return data.get('data')[YMD];
    }

    function dataGet() {
        if (!isLogin) {
            return null;
        }
        return data;
    }

    function userGet() {
        if (!isLogin) {
            return null;
        }
        return user;
    }


    jukax = window.jukax = {
        userGet: userGet,
        dataGet: dataGet,
        bucket: bucket,
        ERROR_SAVING_DATA: ERROR_SAVING_DATA,
        ERROR_CREATING_USER: ERROR_CREATING_USER,
        ERROR_QUERY_FAILURE: ERROR_QUERY_FAILURE,
        ERROR_LOGIN: ERROR_LOGIN,
        ERROR_REFRESHING_DATA: ERROR_REFRESHING_DATA,
        ERROR_DELETING_USER: ERROR_DELETING_USER,
        ERROR_UNVALID_INPUT: ERROR_UNVALID_INPUT,
        ERROR_UPDATING_PASSWORD: ERROR_UPDATING_PASSWORD,
        ERROR_CLEANINGUP_EVENTS: ERROR_CLEANINGUP_EVENTS,
        initializeKii: initializeKii,
        accountCreate: accountCreate,
        accountLogin: accountLogin,
        accountLogout: accountLogout,
        accountUpdatePassword: accountUpdatePassword,
        accountDelete: accountDelete,
        eventsCleanup: eventsCleanup,
        eventsNew: eventsUpdate, //the same as eventsUpdate inside the code
        eventsUpdate: eventsUpdate,
        eventsDelete: eventsDelete,
        eventsObject: eventsObject,
        eventsGet: eventsGet,
        storagesSet: storagesSet,
        accountKeepLogin: accountKeepLogin,
        accoutSave: accoutSave,
        ready: ready,
        debug: debug
    };
}());