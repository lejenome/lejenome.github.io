/** Jukax
 * @author      Moez Bouhlel
 * @license     MIT License
 * @project     https://github.com/lejenome/jukax
 */

/*jslint plusplus: true */
/*jslint devel: true */
/*jslint browser: true */
/*global jukax */
/*global $ */
/*jshint quotmark:single */

$(function () {
    'use strict';

    /*var user, data, bucket;*/
    var monthField = $('#monthField'), // current month on the calendar
        listview = $('#listview'), // list of events on selected day
        newb = $('#new'), // new button to create new event on selected day
        selectDate = $('#select-date'),
        lastPage = '#cal', //last page cal or events
        form = {
            title: $('#title'),
            where: $('#where'),
            note: $('#note'),
            time: $('#time'),
            repeat: 'once',
            reminder: 'no',
            level: 'A',
            created: null,
            ymd: null
        },
        //functions list
        calendarDayClicked,
        selectedDay, //point to selected day on cal
        date = new Date(),
        //months US short symbol
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        year = date.getFullYear().toString(),
        month = (date.getMonth() + 1).toString(),
        day = date.getDate().toString();

    if (month.length === 1) {
        month = '0' + month;
    }


    //create li item for the 2 events lists
    function newEventItem(event, YMD) {
        return '<li class="tag-' + event.level + '" data-created="' + event.created + '" data-ymd="' + YMD + '"><a><h3>' +
            (event.title || 'Unidentified') +
            (event.where ? ' <small>(' + event.where + ')</small>' : '') +
            '</h3><p>' + event.note + '</p><p class="ui-li-aside">' + event.time + '</p></a></li>';
    }

    //Updating the list of events on the selected day
    function updateListview() {
        var listView = document.getElementById('listview'),
            YMD = year + month + day,
            events = jukax.eventsGet(YMD),
            listViewContent = '',
            i;
        $.mobile.loading('show');
        if (events !== null) {
            for (i = 0; i < events.length; i++) {
                listViewContent += newEventItem(events[i], YMD);
            }
        }
        listview.removeClass('hidden');
        listView.innerHTML = listViewContent;
        listview.listview('refresh');
        $.mobile.loading('hide');
    }

    // when a day from Cal selected
    calendarDayClicked = function () {
        if (selectedDay) {
            selectedDay.removeClass('selected');
        }
        selectedDay = $(this).addClass('selected');
        day = $(this).text();
        listview.addClass('hiden');
        updateListview();
        newb.show();
    };

    //return the nbre of days on a month
    function daysInMonth(year, month) {
        return [31, (((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    }

    //Building the calendar for a given Month
    function buildCal(year, month) {
        window.year = year;
        window.month = month;
        var time = new Date().getTime(),
            tbody = document.getElementsByTagName('tbody')[0],
            firstDay = new Date(year + '-' + month).getDay(),
            daysNbre = daysInMonth(parseInt(year, 10), parseInt(month, 10) - 1),
            tbodyContent = '<tr>',
            dayOnMonth,
            i = 1;
        for (i = 0; i < firstDay; i++) {
            tbodyContent += '<td class="empty"></td>';
        }
        for (dayOnMonth = 1; dayOnMonth <= daysNbre; dayOnMonth++) {
            if (++i === 8) {
                tbodyContent += '</tr><tr>';
                i = 1;
            }
            tbodyContent += '<td data-ymd="' + year + month + dayOnMonth.toString() +
                '" class="day-on-month' + (jukax.eventsGet(year + month + dayOnMonth.toString()) ? ' date-has-event">' : '">') + dayOnMonth.toString() + '</td>';
        }
        for (i; i < 7; i++) {
            tbodyContent += '<td class="empty"></td>';
        }
        tbodyContent += '</tr>';
        listview.empty();
        newb.hide();
        monthField.text(months[parseInt(month, 10) - 1] + ' ' + year);
        $('#controlgroup').controlgroup();
        tbody.innerHTML = tbodyContent;
        console.log('Calendar created on:', new Date().getTime() - time);
    }

    function nextMonth() { //show next month
        month = (parseInt(month, 10) + 1).toString();
        if (month === '13') {
            month = '01';
            year = (parseInt(year, 10) + 1).toString();
            $('#select-year').val(year).selectmenu('refresh');
        } else if (month.length === 1) {
            month = '0' + month;
        }
        $('#select-month').val(months[parseInt(month, 10) - 1]).selectmenu('refresh');
        buildCal(year, month);
    }

    function prevMonth() { //show prev month
        month = (parseInt(month, 10) - 1).toString();
        if (month === '0') {
            month = '12';
            year = (parseInt(year, 10) - 1).toString();
            $('#select-year').val(year).selectmenu('refresh');
        } else if (month.length === 1) {
            month = '0' + month;
        }
        $('#select-month').val(months[parseInt(month, 10) - 1]).selectmenu('refresh');
        buildCal(year, month);
    }





    /*
    //Create new calendar item
    function newTD(str, date) {
        if (!str) {
            return $("<td class='empty'></td>");
        }
        return $("<td" + (jukax.eventsGet(date) ? " class='date-has-event'>" : ">") + str + "</td>").click(calendarDayClicked);
    }
    */
    function getHM() { //get Hours:Minutes String
        var time = new Date(),
            hours = time.getHours(),
            minutes = time.getMinutes();
        hours = (hours < 10) ? '0' + hours.toString() : hours.toString();
        minutes = (minutes < 10) ? '0' + minutes.toString() : minutes.toString();
        /*if (hours.length === 1) {
            hours = '0' + hours;
        }
        if (minutes.length === 1) {
            minutes = '0' + minutes;
        }*/
        return hours + ':' + minutes;
    }

    function newEvent() {
        form.title.val('');
        form.where.val('');
        form.note.val('');
        form.time.val(getHM());
        form.level = 'A';
        $('#level-A').prop('checked', true);
        form.created = null;
        $('#delete').hide();
        $.mobile.changePage('#eventPage');
        $('#level-radio :radio').checkboxradio('refresh');
        form.ymd = year + month + day;
    }


    function buildeventsList() {
        var evlist = $('#eventsList'),
            evList = document.getElementById('eventsList'),
            evListContent = '',
            i,
            events,
            datesData,
            date;
        $.mobile.loading('show');
        evlist.empty();
        if (jukax.dataGet()) {
            datesData = jukax.dataGet().get('data');
        }
        for (date in datesData) {
            if (datesData.hasOwnProperty(date)) {
                events = jukax.eventsGet(date);
                if (events) {
                    evListContent += '<li data-date="' + date + '" data-role="list-divider">' + date.substring(6) + '/' + date.substr(4, 2) + '/' + date.substr(0, 4) + '<span class="ui-li-count">' + events.length.toString() + '</span></li>';
                    for (i = 0; i < events.length; i++) {
                        evListContent += newEventItem(events[i], date);
                    }
                }
            }

        }
        evList.innerHTML = evListContent;
        $.mobile.changePage('#events');
        lastPage = '#events';
        evlist.listview('refresh');
        $.mobile.loading('hide');
        evlist.listview('option', 'hideDividers', true);
        // TODO: Add event delete by swaping left/right on supported devices
        /*$(document).on('swipeleft swiperight', '#eventsList li:not(.ui-li-has-count)', function (event) {
            var listitem = $(this),
                // These are the classnames used for the CSS transition
                dir = event.type === 'swipeleft' ? 'left' : 'right',
                // Check if the browser supports the transform (3D) CSS transition
                transition = $.support.cssTransform3d ? dir : false;
            confirmAndDeleteFromEventsList(listitem, transition);
        });*/
    }

    function deleteEvent(created, YMD) {
        jukax.eventsDelete(YMD, created);
        if (lastPage === '#events') {
            buildeventsList();
        }
        $.mobile.changePage(lastPage);
        updateListview();
        if (!jukax.eventsGet(YMD) && YMD.substr(0, 6) === year + month) {
            $('[data-ymd=' + YMD + ']').removeClass('date-has-event');
        }
    }

    function editEvent(created, YMD) {
        var e = jukax.eventsGet(YMD, created);
        if (e === null) {
            newEvent();
        } else {
            form.title.val(e.title.replace('&lt;', '<', 'g').replace('&gt;', '>', 'g'));
            form.where.val(e.where.replace('&lt;', '<', 'g').replace('&gt;', '>', 'g'));
            form.note.val(e.note.replace('&lt;', '<', 'g').replace('&gt;', '>', 'g'));
            form.time.val(e.time);
            /*form.repeat = $('#repeat option[value="'+e.repeat+'"]').prop("checked", true).checkboxradio("refresh").val();
             form.reminder = $('#reminder option[value="'+e.reminder+'"]').prop('checked', true).val();*/
            form.level = e.level;
            $('#level-' + e.level).prop('checked', true);
            form.created = e.created;
            $('#delete').click(function () {
                deleteEvent(created, YMD);
            });
            $('#delete').show();
            $.mobile.changePage('#eventPage');
            $('#level-radio').controlgroup('refresh');
        }
    }




    function saveEvent() {
        var event = {
            title: form.title.val(),
            where: form.where.val(),
            note: form.note.val(),
            time: form.time.val().trim(),
            repeat: 'once',
            reminder: 'no',
            level: $('#level-radio input:checked').val(),
            created: form.created
        },
            time = /^([012]?\d) *: *([012345]?\d)(?::\d{1,2}\.?\d{0,2})? *(am|pm)?$/i.exec(event.time);
        if (event.time && (!time || (time[3] && parseInt(time[1], 10) > 12))) {
            time = null;
        }

        if (!event.title && !event.note) {
            $('#event-err-msg').text('You should put at least a title or a note.').css('color', 'red').show(200, 'linear');
            setTimeout(function () {
                $('#event-err-msg').hide();
            }, 6000);
        } else if (event.title && event.title.length > 42) {
            $('#event-err-msg').text('Title sould not be more than 42 characters').css('color', 'red').show(200, 'linear');
            setTimeout(function () {
                $('#event-err-msg').hide();
            }, 6000);
        } else if (event.time && !time) {
            $('#event-err-msg').text('Time is not valid').css('color', 'red').show(200, 'linear');
            setTimeout(function () {
                $('#event-err-msg').hide();
            }, 6000);
        } else {
            event.time = time ? (
                (time[1].length === 1 ? '0' + time[1] : time[1]) +
                ':' +
                (time[2].length === 1 ? '0' + time[2] : time[2]) +
                (time[3] ? ' ' + time[3] : '')
            ) : '';
            event.title = event.title.replace('<', '&lt;', 'g').replace('>', '&gt;', 'g');
            event.where = event.where.replace('<', '&lt;', 'g').replace('>', '&gt;', 'g');
            event.note = event.note.replace('<', '&lt;', 'g').replace('>', '&gt;', 'g');
            jukax.eventsUpdate((form.ymd || year + month + day), event);
            if (lastPage === '#events') {
                buildeventsList();
            }
            $.mobile.changePage(lastPage);
            updateListview();
            if (selectedDay) {
                selectedDay.addClass('date-has-event');
            }
        }
    }



    function confirmAndDelete(listitem, transition) {
        // Highlight the list item that will be removed
        listitem.children('.ui-btn').addClass('ui-btn-active');
        // Show the confirmation popup
        $('#confirmDelete').popup('open');
        // Proceed when the user confirms
        $('#confirmDelete .yes').on('click', function () {
            jukax.eventsDelete(year + month + day, listitem.data('created'));
            // Remove with a transition
            if (transition) {
                listitem
                    .addClass(transition) /*Add the class for the transition direction*/
                    .on('webkitTransitionEnd transitionend otransitionend', function () { /*When the transition is done...*/
                        // ...the list item will be removed
                        listitem.remove();
                        // ...the list will be refreshed and the temporary class for border styling removed
                        listview.listview('refresh').find('.border-bottom').removeClass('border-bottom');
                    })
                    .prev('li').children('a').addClass('border-bottom') /*During the transition the previous button gets bottom border*/
                    .end().end().children('.ui-btn').removeClass('ui-btn-active'); /*Remove the highlight*/
            } else { /*If it's not a touch device or the CSS transition isn't supported just remove the list item and refresh the list*/
                listitem.remove();
                listview.listview('refresh');
            }
            if (!jukax.eventsGet(year + month + day)) {
                selectedDay.removeClass('date-has-event');
            }
        });
        // Remove active state and unbind when the cancel button is clicked
        $('#confirmDelete .cancel').on('click', function () {
            listitem.removeClass('ui-btn-active');
            $('#confirmDelete .yes').off();
        });
    }


    /*    function confirmAndDeleteFromEventsList(listitem, transition) {

        var eventsList = $('#eventsList');
        // Highlight the list item that will be removed
        listitem.children('.ui-btn').addClass('ui-btn-active');
        // Show the confirmation popup
        $('#confirmDeleteFromEventsList').popup('open');
        // Proceed when the user confirms
        $('#confirmDeleteFromEventsList .yes').on('click', function () {
            var itemDateCounter = listitem.prev();
            if (!itemDateCounter.is('.ui-li-has-count')) {
                itemDateCounter = listitem.prevAll('.ui-li-has-count').last();
            }
            var itemDate = itemDateCounter.data('date');
            jukax.eventsDelete(itemDate, listitem.data('created'));
            // Remove with a transition
            if (transition) {
                listitem
                // Add the class for the transition direction
                .addClass(transition)
                // When the transition is done...
                .on('webkitTransitionEnd transitionend otransitionend', function () {
                    // ...the list item will be removed
                    listitem.remove();
                    // ...the list will be refreshed and the temporary class for border styling removed
                    eventsList.listview('refresh').find('.border-bottom').removeClass('border-bottom');
                })
                // During the transition the previous button gets bottom border
                .prev('li').children('a').addClass('border-bottom')
                // Remove the highlight
                .end().end().children('.ui-btn').removeClass('ui-btn-active');
            }
            // If it's not a touch device or the CSS transition isn't supported just remove the list item and refresh the list
            else {
                listitem.remove();
                eventsList.listview('refresh');
            }
            if (!itemDateCounter.next() || itemDateCounter.next().is('.ui-li-has-count')) {
                itemDateCounter.remove();
            }
            if (year + month + day === itemDate) {
                updateListview();
                if (!jukax.eventsGet(year + month + day)) {
                    selectedDay.removeClass('date-has-event');
                }
            }
            //buildeventsList();
            //TODO: when not selected day but no longer has events
        });
        // Remove active state and unbind when the cancel button is clicked
        $('#confirmDeleteFromEventsList .cancel').on('click', function () {
            listitem.removeClass('ui-btn-active');
            $('#confirmDeleteFromEventsList .yes').off();
        });

    }
*/

    function performRegistration() {
        var username = $('#username').val(),
            password = $('#password').val();
        if (username.length < 4 || password.length < 4) {
            $('#login-err-msg').text('Username and Password should be at least 4 charachters').css('color', 'red').show(200, 'linear');
            setTimeout(function () {
                $('#login-err-msg').hide();
            }, 3000);
        } else {
            $.mobile.loading('show');
            jukax.accountKeepLogin(false, function () {
                jukax.accountKeepLogin($('#keepLogin').prop('checked'), function () {
                    try {
                        jukax.accountCreate(username, password, {
                            success: function () {
                                buildCal(year, month);
                                $('#select-month').val(months[parseInt(month, 10) - 1]).selectmenu('refresh');
                                $('#select-year').val(year).selectmenu('refresh');
                                $.mobile.changePage('#cal');
                                $('#username').val('');
                                $('#password').val('');
                                $.mobile.loading('hide');
                            },
                            failure: function (e) {
                                $.mobile.loading('hide');
                                if (typeof (window.navigator) !== undefined && typeof (window.navigator.onLine) !== undefined && !window.navigator.onLine) {
                                    $('#login-err-msg').text('Unable to register: check your network connection').css('color', 'red').show(200, 'linear');
                                    setTimeout(function () {
                                        $('#login-err-msg').hide();
                                    }, 4000);
                                } else if (e.type === jukax.ERROR_CREATING_USER) {
                                    if (e.message.indexOf('USER_ALREADY_EXISTS') > -1) {
                                        e.message = 'user already exists';
                                    }
                                    $('#login-err-msg').text('Unable to register: ' + e.message).css('color', 'red').show(200, 'linear');
                                    setTimeout(function () {
                                        $('#login-err-msg').hide();
                                    }, 3000);
                                }
                            }
                        });
                    } catch (e) {
                        $('#login-err-msg').text('Unable to register: ' + e.message).css('color', 'red').show(200, 'linear');
                        setTimeout(function () {
                            $('#login-err-msg').hide();
                        }, 3000);
                    }
                });

            });
        }
    }

    function performLogin() {
        var username = $('#username').val(),
            password = $('#password').val();
        if (username.length < 4 || password.length < 4) {
            $('#login-err-msg').text('Username and Password should be at least 4 charachters').css('color', 'red').show(200, 'linear');
            setTimeout(function () {
                $('#login-err-msg').hide();
            }, 3000);
        } else {
            $.mobile.loading('show');
            jukax.accountKeepLogin(false, function () {
                var username = $('#username').val(),
                    password = $('#password').val();
                jukax.accountKeepLogin($('#keepLogin').prop('checked'), function () {
                    jukax.accountLogin(username, password, {
                        success: function () {
                            buildCal(year, month);
                            $.mobile.changePage('#cal');
                            $('#select-month').val(months[parseInt(month, 10) - 1]).selectmenu('refresh');
                            $('#select-year').val(year).selectmenu('refresh');
                            $('#username').val('');
                            $('#password').val('');
                            $.mobile.loading('hide');
                        },
                        failure: function (e) {
                            $.mobile.loading('hide');
                            if (typeof (window.navigator) !== undefined && typeof (window.navigator.onLine) !== undefined && !window.navigator.onLine) {
                                $('#login-err-msg').text('Unable to login: check your network connection').css('color', 'red').show(200, 'linear');
                                setTimeout(function () {
                                    $('#login-err-msg').hide();
                                }, 4000);
                            } else if (e.type === jukax.ERROR_LOGIN) {
                                $('#login-err-msg').text('Unable to login: check your input').css('color', 'red').show(200, 'linear');
                                setTimeout(function () {
                                    $('#login-err-msg').hide();
                                }, 3000);
                            }
                        }
                    });
                });

            });

        }
    }

    function logout() {
        jukax.accountLogout();
        $.mobile.changePage('#login');
        date = new Date();
        year = date.getFullYear().toString();
        month = (date.getMonth() + 1).toString();
        day = date.getDate().toString();
    }

    ////
    //hide addbar on phones
    window.addEventListener('load', function () {
        setTimeout(function () {
            window.scrollTo(0, 1);
        }, 1);
    }, false);

    jukax.storagesSet({
        Kii: true
    });
    jukax.initializeKii('ea716d13', '60ac553a1539a79cf9f44a98642be971');

    buildCal(year, month);
    $('#select-month').val(months[parseInt(month, 10) - 1]);
    $('#select-year').val(year);
    jukax.ready(function () {
        if (jukax.accountKeepLogin()) {
            $.mobile.changePage('#cal');
            $.mobile.loading('show', {
                text: 'Downloading Data...',
                textVisible: true,
                theme: 'b'
            });
            jukax.accountLogin(null, null, {
                success: function () {
                    buildCal(year, month);
                    $.mobile.loading('hide');
                },
                failure: function () {
                    $.mobile.changePage('#login');
                    $.mobile.loading('hide');
                    jukax.accountKeepLogin('false');
                }
            });
        } else {
            $.mobile.changePage('#login');
        }
    });


    //Click Events
    $('#register-button').click(performRegistration);
    $('#login-button').click(performLogin);
    $('#logout').click(logout);
    $('#logout2').click(logout);
    $('#deleteaccountbutton').click(function () {
        jukax.accountDelete({
            success: function () {
                $('#deleteaccountmessage').text('Done!').css('color', 'green').show(200, 'linear');
                setTimeout(function () {
                    $('#deleteaccountmessage').hide();
                    $.mobile.changePage('#login');
                }, 2000);
            },
            failure: function () {
                $('#deleteaccountmessage').text('Failed!').css('color', 'red').show(200, 'linear');
                setTimeout(function () {
                    $('#deleteaccountmessage').hide();
                    $.mobile.loadPage('#login');
                }, 3000);
            }
        });
    });
    $('#updatepasswordbutton').click(function () {
        try {
            jukax.accountUpdatePassword(
                $('#updatepasswordold').val(),
                $('#updatepasswordnew').val(), {
                    success: function () {
                        $('#updatepasswordmessage').text('Done! Relogin needed!').css('color', 'green').show(200, 'linear');
                        setTimeout(function () {
                            jukax.accountLogout();
                            $('#updatepasswordmessage').hide();
                            $.mobile.changePage('#login');
                        }, 3000);
                        $('#updatepasswordnew').val('');
                        $('#updatepasswordold').val('');
                    },
                    failure: function (e) {
                        if (e.type === jukax.ERROR_UNVALID_INPUT) {
                            $('#updatepasswordmessage').text('Unvalid Input!').css('color', 'red').show(200, 'linear');
                            setTimeout(function () {
                                $('#updatepasswordmessage').hide();
                            }, 3000);
                        } else if (e.type === jukax.ERROR_UPDATING_PASSWORD) {
                            $('#updatepasswordmessage').text('Failed!').css('color', 'red').show(200, 'linear');
                            setTimeout(function () {
                                $('#updatepasswordmessage').hide();
                            }, 3000);
                            $('#updatepasswordnew').val('');
                            $('#updatepasswordold').val('');
                        }
                    }
                }
            );
        } catch (e) {
            $('#updatepasswordmessage').text('Failed!').css('color', 'red').show(200, 'linear');
            setTimeout(function () {
                $('#updatepasswordmessage').hide();
            }, 3000);
            $('#updatepasswordnew').val('');
            $('#updatepasswordold').val('');
        }
    });
    $('#deletedatabutton').click(function () {
        jukax.eventsCleanup({
            success: function () {
                buildCal(year, month);
                $('#deletedatamessage').text('Done!').css('color', 'green').show(200, 'linear');
                setTimeout(function () {
                    $('#deletedatamessage').hide(200);
                }, 3000);

                if (lastPage === '#events') {
                    buildeventsList();
                }
            },
            failure: function (e) {
                if (e.type === jukax.ERROR_CLEANINGUP_EVENTS) {
                    $('#deletedatamessage').text('Failed!').css('color', 'red').show(200, 'linear');
                    setTimeout(function () {
                        $('#deletedatamessage').hide();
                    }, 3000);
                } else {
                    $('#deletedatamessage').text('Relogin needed!').css('color', 'yellow').show(200, 'linear');
                    setTimeout(function () {
                        $('#deletedatamessage').hide();
                        $.mobile.changePage('#login');
                    }, 3000);
                }
            }
        });
    });
    $('#gotoCal').click(function () {
        lastPage = '#cal';
        $.mobile.changePage('#cal');
    });

    $('#prevMonth').click(prevMonth);
    $('#nextMonth').click(nextMonth);
    newb.click(newEvent);
    $('#save').click(saveEvent);
    $('#gotoEvents').click(buildeventsList);
    $('#backbutton').click(function () {
        $.mobile.changePage(lastPage);
    });

    if (!$.mobile.support.touch) {
        // Remove the class that is used to hide the delete button on touch devices
        listview.removeClass('touch');
    }


    $.event.special.swipe.horizontalDistanceThreshold = 70; //at least 70 px to be vertical swipe
    $(document).on('swipeleft swiperight', 'tbody',
        function (event) {
            if (event.type === 'swipeleft') {
                nextMonth();
            } else {
                prevMonth();
            }

        });
    // TODO: add nicescroll for chrome packaged web apps
    /*$('#events').niceScroll({
        boxzoom: false,
        touchbehavior: true
    });
    $('#cal').niceScroll({
        boxzoom: false,
        touchbehavior: true
    });*/
    $('#monthCheckbox').click(function () {
        selectDate.toggle(400);
    });
    $('#select-year').change(function () {
        year = $(this).val();
        buildCal(year, month);
    });
    $('#select-month').change(function () {
        month = (months.indexOf($(this).val()) + 1).toString();
        if (month.length === 1) {
            month = '0' + month;
        }
        buildCal(year, month);
    });

    $(document).on('submit', 'form', function (e) {
        e.preventDefault();
        return false;
    });


    $(document).on('click', '#listview li', function () {
        form.ymd = $(this).data('ymd');
        editEvent($(this).data('created'), $(this).data('ymd').toString());
    });
    $(document).on('click', '#eventsList>li[data-created]', function () {
        form.ymd = $(this).data('ymd');
        editEvent($(this).data('created'), $(this).data('ymd').toString());
    });
    $(document).on('click', '.day-on-month', calendarDayClicked);

    // Add event delete by swaping left/right on supported devices
    $(document).on('swipeleft swiperight', '#listview li', function (event) {
        var listitem = $(this),
            // These are the classnames used for the CSS transition
            dir = event.type === 'swipeleft' ? 'left' : 'right',
            // Check if the browser supports the transform (3D) CSS transition
            transition = $.support.cssTransform3d ? dir : false;
        confirmAndDelete(listitem, transition);
    });
    $.mobile.hashListeningEnabled = false;
});