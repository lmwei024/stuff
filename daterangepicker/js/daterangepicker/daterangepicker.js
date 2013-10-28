/**
* 移植自https://github.com/dangrossman/bootstrap-daterangepicker
*/

/**
* 原jQuery插件的版权信息
* @version: 1.2
* @author: Dan Grossman http://www.dangrossman.info/
* @date: 2013-07-25
* @copyright: Copyright (c) 2012-2013 Dan Grossman. All rights reserved.
* @license: Licensed under Apache License v2.0. See http://www.apache.org/licenses/LICENSE-2.0
* @website: http://www.improvely.com/
*/

KISSY.add('daterangepicker/daterangepicker', function(S){

    var $ = S.all, DOM = S.DOM, moment = S.moment;

    //构造函数
    function DateRangePicker(element, options, cb){

            

            var hasOptions = typeof options == 'object';
            var localeObject;

            //option defaults

            this.startDate = moment().startOf('day');
            this.endDate = moment().startOf('day');
            this.minDate = false;
            this.maxDate = false;
            this.dateLimit = false;

            this.showDropdowns = false;
            this.showWeekNumbers = false;
            this.timePicker = false;
            this.timePickerIncrement = 30;
            this.timePicker12Hour = true;
            this.ranges = {};
            this.opens = 'right';

            this.buttonClasses = ['btn', 'btn-small'];
            this.applyClass = 'btn-success';
            this.cancelClass = 'btn-default';

            this.format = 'MM/DD/YYYY';
            this.separator = ' - ';

            this.locale = {
                applyLabel: 'Apply',
                cancelLabel: 'Cancel',
                fromLabel: 'From',
                toLabel: 'To',
                weekLabel: 'W',
                customRangeLabel: 'Custom Range',
                daysOfWeek: moment()._lang._weekdaysMin.slice(),
                monthNames: moment()._lang._monthsShort.slice(),
                firstDay: 0
            };

            this.cb = function () { };

            // by default, the daterangepicker element is placed at the bottom of HTML body
            this.parentEl = 'body';

            //element that triggered the date range picker
            this.element = $(element);

            if (this.element.hasClass('pull-right'))
                this.opens = 'left';

            if (this.element.test('input')) {
                this.element.on('click, focus', this.show.bind(this));
            } else {
                this.element.on('click', this.show.bind(this));
            }

            localeObject = this.locale;

            if (hasOptions) {
                if (typeof options.locale == 'object') {
                    S.each(localeObject, function (property, value) {
                        localeObject[property] = options.locale[property] || value;
                    });
                }

                if (options.applyClass) {
                    this.applyClass = options.applyClass;
                }

                if (options.cancelClass) {
                    this.cancelClass = options.cancelClass;
                }
            }

            var DRPTemplate = '<div class="daterangepicker dropdown-menu">' +
                    '<div class="calendar left"></div>' +
                    '<div class="calendar right"></div>' +
                    '<div class="ranges">' +
                      '<div class="range_inputs">' +
                        '<div class="daterangepicker_start_input" style="float: left">' +
                          '<label for="daterangepicker_start">' + this.locale.fromLabel + '</label>' +
                          '<input class="input-mini" type="text" name="daterangepicker_start" value="" disabled="disabled" />' +
                        '</div>' +
                        '<div class="daterangepicker_end_input" style="float: left; padding-left: 11px">' +
                          '<label for="daterangepicker_end">' + this.locale.toLabel + '</label>' +
                          '<input class="input-mini" type="text" name="daterangepicker_end" value="" disabled="disabled" />' +
                        '</div>' +
                        '<button class="' + this.applyClass + ' applyBtn" disabled="disabled">' + this.locale.applyLabel + '</button>&nbsp;' +
                        '<button class="' + this.cancelClass + ' cancelBtn">' + this.locale.cancelLabel + '</button>' +
                      '</div>' +
                    '</div>' +
                  '</div>';

            this.parentEl = (hasOptions && options.parentEl && $(options.parentEl)) || $(this.parentEl);
            //the date range picker
            this.container = $(DRPTemplate).appendTo(this.parentEl);

            if (hasOptions) {

                if (typeof options.format == 'string')
                    this.format = options.format;

                if (typeof options.separator == 'string')
                    this.separator = options.separator;

                if (typeof options.startDate == 'string')
                    this.startDate = moment(options.startDate, this.format);

                if (typeof options.endDate == 'string')
                    this.endDate = moment(options.endDate, this.format);

                if (typeof options.minDate == 'string')
                    this.minDate = moment(options.minDate, this.format);

                if (typeof options.maxDate == 'string')
                    this.maxDate = moment(options.maxDate, this.format);

                if (typeof options.startDate == 'object')
                    this.startDate = moment(options.startDate);

                if (typeof options.endDate == 'object')
                    this.endDate = moment(options.endDate);

                if (typeof options.minDate == 'object')
                    this.minDate = moment(options.minDate);

                if (typeof options.maxDate == 'object')
                    this.maxDate = moment(options.maxDate);

                if (typeof options.ranges == 'object') {
                    for (var range in options.ranges) {

                        var start = moment(options.ranges[range][0]);
                        var end = moment(options.ranges[range][1]);

                        // If we have a min/max date set, bound this range
                        // to it, but only if it would otherwise fall
                        // outside of the min/max.
                        if (this.minDate && start.isBefore(this.minDate))
                            start = moment(this.minDate);

                        if (this.maxDate && end.isAfter(this.maxDate))
                            end = moment(this.maxDate);

                        // If the end of the range is before the minimum (if min is set) OR
                        // the start of the range is after the max (also if set) don't display this
                        // range option.
                        if ((this.minDate && end.isBefore(this.minDate)) || (this.maxDate && start.isAfter(this.maxDate))) {
                            continue;
                        }

                        this.ranges[range] = [start, end];
                    }

                    var list = '<ul>';
                    for (var range in this.ranges) {
                        list += '<li>' + range + '</li>';
                    }
                    list += '<li>' + this.locale.customRangeLabel + '</li>';
                    list += '</ul>';
                    this.container.all('.ranges').prepend(list);
                }

                if (typeof options.dateLimit == 'object')
                    this.dateLimit = options.dateLimit;

                // update day names order to firstDay
                if (typeof options.locale == 'object') {
                    if (typeof options.locale.firstDay == 'number') {
                        this.locale.firstDay = options.locale.firstDay;
                        var iterator = options.locale.firstDay;
                        while (iterator > 0) {
                            this.locale.daysOfWeek.push(this.locale.daysOfWeek.shift());
                            iterator--;
                        }
                    }
                }

                if (typeof options.opens == 'string')
                    this.opens = options.opens;

                if (typeof options.showWeekNumbers == 'boolean') {
                    this.showWeekNumbers = options.showWeekNumbers;
                }

                if (typeof options.buttonClasses == 'string') {
                    this.buttonClasses = [options.buttonClasses];
                }

                if (typeof options.buttonClasses == 'object') {
                    this.buttonClasses = options.buttonClasses;
                }

                if (typeof options.showDropdowns == 'boolean') {
                    this.showDropdowns = options.showDropdowns;
                }

                if (typeof options.timePicker == 'boolean') {
                    this.timePicker = options.timePicker;
                }

                if (typeof options.timePickerIncrement == 'number') {
                    this.timePickerIncrement = options.timePickerIncrement;
                }

                if (typeof options.timePicker12Hour == 'boolean') {
                    this.timePicker12Hour = options.timePicker12Hour;
                }

            }

            if (!this.timePicker) {
                this.startDate = this.startDate.startOf('day');
                this.endDate = this.endDate.startOf('day');
            }

            //apply CSS classes to buttons
            var c = this.container;
            S.each(this.buttonClasses, function (val) {
                c.all('button').addClass(val);
            });

            if (this.opens == 'right') {
                //swap calendar positions
                var left = this.container.all('.calendar.left');
                var right = this.container.all('.calendar.right');
                left.removeClass('left').addClass('right');
                right.removeClass('right').addClass('left');
            }

            if (typeof options == 'undefined' || typeof options.ranges == 'undefined') {
                this.container.all('.calendar').show();
                this.move();
            }

            if (typeof cb == 'function')
                this.cb = cb;

            this.container.addClass('opens' + this.opens);

            //try parse date if in text input
            if (!hasOptions || (typeof options.startDate == 'undefined' && typeof options.endDate == 'undefined')) {
                if ($(this.element).test('input[type=text]')) {
                    var val = $(this.element).val();
                    var split = val.split(this.separator);
                    var start, end;
                    if (split.length == 2) {
                        start = moment(split[0], this.format);
                        end = moment(split[1], this.format);
                    }
                    if (start != null && end != null) {
                        this.startDate = start;
                        this.endDate = end;
                    }
                }
            }

            //state
            this.oldStartDate = this.startDate.clone();
            this.oldEndDate = this.endDate.clone();

            this.leftCalendar = {
                month: moment([this.startDate.year(), this.startDate.month(), 1, this.startDate.hour(), this.startDate.minute()]),
                calendar: []
            };

            this.rightCalendar = {
                month: moment([this.endDate.year(), this.endDate.month(), 1, this.endDate.hour(), this.endDate.minute()]),
                calendar: []
            };

            //event listeners
            this.container.on('mousedown', this.mousedown.bind(this));
            this.container.all('.calendar').delegate('click', '.prev', this.clickPrev.bind(this));
            this.container.all('.calendar').delegate('click', '.next', this.clickNext.bind(this));
            this.container.all('.ranges').delegate('click', 'button.applyBtn', this.clickApply.bind(this));
            this.container.all('.ranges').delegate('click', 'button.cancelBtn', this.clickCancel.bind(this));

            this.container.all('.ranges').delegate('click', '.daterangepicker_start_input', this.showCalendars.bind(this));
            this.container.all('.ranges').delegate('click', '.daterangepicker_end_input', this.showCalendars.bind(this));

            this.container.all('.calendar').delegate('click', 'td.available', this.clickDate.bind(this));
            this.container.all('.calendar').delegate('mouseenter', 'td.available', this.enterDate.bind(this));
            this.container.all('.calendar').delegate('mouseleave', 'td.available', this.updateView.bind(this));

            this.container.all('.ranges').delegate('click', 'li', this.clickRange.bind(this));
            this.container.all('.ranges').delegate('mouseenter', 'li', this.enterRange.bind(this));
            this.container.all('.ranges').delegate('mouseleave', 'li', this.updateView.bind(this));

            this.container.all('.calendar').delegate('change', 'select.yearselect', this.updateMonthYear.bind(this));
            this.container.all('.calendar').delegate('change', 'select.monthselect', this.updateMonthYear.bind(this));

            this.container.all('.calendar').delegate('change', 'select.hourselect', this.updateTime.bind(this));
            this.container.all('.calendar').delegate('change', 'select.minuteselect', this.updateTime.bind(this));
            this.container.all('.calendar').delegate('change', 'select.ampmselect', this.updateTime.bind(this));

            this.element.on('keyup', this.updateFromControl.bind(this));

            this.updateView();
            this.updateCalendars();
        
    }
    //添加原型
    DateRangePicker.prototype = {

        constructor: DateRangePicker,

        mousedown: function (e) {
            e.stopPropagation();
        },

        updateView: function () {
            this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year());
            this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year());

            this.container.all('input[name=daterangepicker_start]').val(this.startDate.format(this.format));
            this.container.all('input[name=daterangepicker_end]').val(this.endDate.format(this.format));

            if (this.startDate.isSame(this.endDate) || this.startDate.isBefore(this.endDate)) {
                this.container.all('button.applyBtn').removeAttr('disabled');
            } else {
                this.container.all('button.applyBtn').attr('disabled', 'disabled');
            }
        },

        updateFromControl: function () {
            if (!this.element.test('input')) return;
            if (!this.element.val().length) return;

            var dateString = this.element.val().split(this.separator);
            var start = moment(dateString[0], this.format);
            var end = moment(dateString[1], this.format);

            if (start == null || end == null) return;
            if (end.isBefore(start)) return;

            this.oldStartDate = this.startDate.clone();
            this.oldEndDate = this.endDate.clone();

            this.startDate = start;
            this.endDate = end;

            if (!this.startDate.isSame(this.oldStartDate) || !this.endDate.isSame(this.oldEndDate))
                this.notify();

            this.updateCalendars();
        },

        notify: function () {
            this.updateView();
            this.cb(this.startDate, this.endDate);
        },

        move: function () {
            var parentOffset = {
                top: this.parentEl.offset().top - (this.parentEl.test('body') ? 0 : this.parentEl.scrollTop()),
                left: this.parentEl.offset().left - (this.parentEl.test('body') ? 0 : this.parentEl.scrollLeft())
            };
            if (this.opens == 'left') {
                this.container.css({
                    top: this.element.offset().top + this.element.outerHeight() - parentOffset.top,
                    right: $(window).width() - this.element.offset().left - this.element.outerWidth() - parentOffset.left,
                    left: 'auto'
                });
                if (this.container.offset().left < 0) {
                    this.container.css({
                        right: 'auto',
                        left: 9
                    });
                }
            } else {
                this.container.css({
                    top: this.element.offset().top + this.element.outerHeight() - parentOffset.top,
                    left: this.element.offset().left - parentOffset.left,
                    right: 'auto'
                });
                if (this.container.offset().left + this.container.outerWidth() > $(window).width()) {
                    this.container.css({
                        left: 'auto',
                        right: 0
                    });
                }
            }
        },

        show: function (e) {
            this.container.show();
            this.move();

            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }

            $(document).on('mousedown', this.hide.bind(this));
            this.element.fire('shown', {target: e.target, picker: this});
        },

        hide: function (e) {
            this.container.hide();

            if (!this.startDate.isSame(this.oldStartDate) || !this.endDate.isSame(this.oldEndDate))
                this.notify();

            this.oldStartDate = this.startDate.clone();
            this.oldEndDate = this.endDate.clone();

            $(document).undelegate('mousedown', this.hide);
            this.element.fire('hidden', { picker: this });
        },

        enterRange: function (e) {
            var label = e.target.innerHTML;
            if (label == this.locale.customRangeLabel) {
                this.updateView();
            } else {
                var dates = this.ranges[label];
                this.container.all('input[name=daterangepicker_start]').val(dates[0].format(this.format));
                this.container.all('input[name=daterangepicker_end]').val(dates[1].format(this.format));
            }
        },

        showCalendars: function() {
            this.container.all('.calendar').show();
            this.move();
        },

        updateInputText: function() {
            if (this.element.test('input'))
                this.element.val(this.startDate.format(this.format) + this.separator + this.endDate.format(this.format));
        },

        clickRange: function (e) {
            var label = e.target.innerHTML;
            if (label == this.locale.customRangeLabel) {
                this.showCalendars();
            } else {
                var dates = this.ranges[label];

                this.startDate = dates[0];
                this.endDate = dates[1];

                if (!this.timePicker) {
                    this.startDate.startOf('day');
                    this.endDate.startOf('day');
                }

                this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year()).hour(this.startDate.hour()).minute(this.startDate.minute());
                this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year()).hour(this.endDate.hour()).minute(this.endDate.minute());
                this.updateCalendars();

                this.updateInputText();

                this.container.all('.calendar').hide();
                this.hide();
            }
        },

        clickPrev: function (e) {
            var cal = $(e.target).parent('.calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.subtract('month', 1);
            } else {
                this.rightCalendar.month.subtract('month', 1);
            }
            this.updateCalendars();
        },

        clickNext: function (e) {
            var cal = $(e.target).parent('.calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.add('month', 1);
            } else {
                this.rightCalendar.month.add('month', 1);
            }
            this.updateCalendars();
        },

        enterDate: function (e) {

            var title = $(e.target).attr('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parent('.calendar');

            if (cal.hasClass('left')) {
                this.container.all('input[name=daterangepicker_start]').val(this.leftCalendar.calendar[row][col].format(this.format));
            } else {
                this.container.all('input[name=daterangepicker_end]').val(this.rightCalendar.calendar[row][col].format(this.format));
            }

        },

        clickDate: function (e) {
            var title = $(e.target).attr('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parent('.calendar');

            if (cal.hasClass('left')) {
                var startDate = this.leftCalendar.calendar[row][col];
                var endDate = this.endDate;
                if (typeof this.dateLimit == 'object') {
                    var maxDate = moment(startDate).add(this.dateLimit).startOf('day');
                    if (endDate.isAfter(maxDate)) {
                        endDate = maxDate;
                    }
                }
            } else {
                var startDate = this.startDate;
                var endDate = this.rightCalendar.calendar[row][col];
                if (typeof this.dateLimit == 'object') {
                    var minDate = moment(endDate).subtract(this.dateLimit).startOf('day');
                    if (startDate.isBefore(minDate)) {
                        startDate = minDate;
                    }
                }
            }

            cal.all('td').removeClass('active');

            if (startDate.isSame(endDate) || startDate.isBefore(endDate)) {
                $(e.target).addClass('active');
                this.startDate = startDate;
                this.endDate = endDate;
            } else if (startDate.isAfter(endDate)) {
                $(e.target).addClass('active');
                this.startDate = startDate;
                this.endDate = moment(startDate).add('day', 1).startOf('day');
            }

            this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year());
            this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year());
            this.updateCalendars();
        },

        clickApply: function (e) {
            this.updateInputText();
            this.hide();
        },

        clickCancel: function (e) {
            this.startDate = this.oldStartDate;
            this.endDate = this.oldEndDate;
            this.updateView();
            this.updateCalendars();
            this.hide();
        },

        updateMonthYear: function (e) {

            var isLeft = $(e.target).closest('.calendar').hasClass('left');
            var cal = this.container.all('.calendar.left');
            if (!isLeft)
                cal = this.container.all('.calendar.right');

            var month = parseInt(cal.all('.monthselect').val());
            var year = cal.all('.yearselect').val();

            if (isLeft) {
                this.leftCalendar.month.month(month).year(year);
            } else {
                this.rightCalendar.month.month(month).year(year);
            }

            this.updateCalendars();

        },

        updateTime: function(e) {

            var isLeft = $(e.target).closest('.calendar').hasClass('left');

            var cal = this.container.all('.calendar.left');
            if (!isLeft)
                cal = this.container.all('.calendar.right');

            var hour = parseInt(cal.all('.hourselect').val());
            var minute = parseInt(cal.all('.minuteselect').val());


            if (this.timePicker12Hour) {
                var ampm = cal.all('.ampmselect').val();
                if (ampm == 'PM' && hour < 12)
                    hour += 12;
                if (ampm == 'AM' && hour == 12)
                    hour = 0;
            }

            if (isLeft) {
                var start = this.startDate.clone();
                start.hour(hour);
                start.minute(minute);
                this.startDate = start;
                this.leftCalendar.month.hour(hour).minute(minute);
            } else {
                var end = this.endDate.clone();
                end.hour(hour);
                end.minute(minute);
                this.endDate = end;
                this.rightCalendar.month.hour(hour).minute(minute);
            }

            this.updateCalendars();

        },

        updateCalendars: function () {
            this.leftCalendar.calendar = this.buildCalendar(this.leftCalendar.month.month(), this.leftCalendar.month.year(), this.leftCalendar.month.hour(), this.leftCalendar.month.minute(), 'left');
            this.rightCalendar.calendar = this.buildCalendar(this.rightCalendar.month.month(), this.rightCalendar.month.year(), this.rightCalendar.month.hour(), this.rightCalendar.month.minute(), 'right');
            this.container.all('.calendar.left').html(this.renderCalendar(this.leftCalendar.calendar, this.startDate, this.minDate, this.maxDate));
            this.container.all('.calendar.right').html(this.renderCalendar(this.rightCalendar.calendar, this.endDate, this.startDate, this.maxDate));

            this.container.all('.ranges li').removeClass('active');
            var customRange = true;
            var i = 0;
            for (var range in this.ranges) {
                if (this.timePicker) {
                    if (this.startDate.isSame(this.ranges[range][0]) && this.endDate.isSame(this.ranges[range][1])) {
                        customRange = false;
                        this.container.all('.ranges li:eq(' + i + ')').addClass('active');
                    }
                } else {
                    //ignore times when comparing dates if time picker is not enabled
                    if (this.startDate.format('YYYY-MM-DD') == this.ranges[range][0].format('YYYY-MM-DD') && this.endDate.format('YYYY-MM-DD') == this.ranges[range][1].format('YYYY-MM-DD')) {
                        customRange = false;
                        this.container.all('.ranges li:eq(' + i + ')').addClass('active');
                    }
                }
                i++;
            }
            if (customRange)
                this.container.all('.ranges li:last').addClass('active');
        },

        buildCalendar: function (month, year, hour, minute, side) {


            var firstDay = moment([year, month, 1]);
            var lastMonth = moment(firstDay).subtract('month', 1).month();
            var lastYear = moment(firstDay).subtract('month', 1).year();

            var daysInLastMonth = moment([lastYear, lastMonth]).daysInMonth();

            var dayOfWeek = firstDay.day();

            //initialize a 6 rows x 7 columns array for the calendar
            var calendar = [];
            for (var i = 0; i < 6; i++) {
                calendar[i] = [];
            }

            //populate the calendar with date objects
            var startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
            if (startDay > daysInLastMonth)
                startDay -= 7;

            if (dayOfWeek == this.locale.firstDay)
                startDay = daysInLastMonth - 6;

            var curDate = moment([lastYear, lastMonth, startDay, 12, minute]);
            for (var i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = moment(curDate).add('hour', 24)) {
                if (i > 0 && col % 7 == 0) {
                    col = 0;
                    row++;
                }
                calendar[row][col] = curDate.clone().hour(hour);
                curDate.hour(12);
            }


            return calendar;

        },

        renderDropdowns: function (selected, minDate, maxDate) {
            var currentMonth = selected.month();
            var monthHtml = '<select class="monthselect">';
            var inMinYear = false;
            var inMaxYear = false;

            for (var m = 0; m < 12; m++) {
                if ((!inMinYear || m >= minDate.month()) && (!inMaxYear || m <= maxDate.month())) {
                    monthHtml += "<option value='" + m + "'" +
                        (m === currentMonth ? " selected='selected'" : "") +
                        ">" + this.locale.monthNames[m] + "</option>";
                }
            }
            monthHtml += "</select>";

            var currentYear = selected.year();
            var maxYear = (maxDate && maxDate.year()) || (currentYear + 5);
            var minYear = (minDate && minDate.year()) || (currentYear - 50);
            var yearHtml = '<select class="yearselect">';

            for (var y = minYear; y <= maxYear; y++) {
                yearHtml += '<option value="' + y + '"' +
                    (y === currentYear ? ' selected="selected"' : '') +
                    '>' + y + '</option>';
            }

            yearHtml += '</select>';

            return monthHtml + yearHtml;
        },

        renderCalendar: function (calendar, selected, minDate, maxDate) {

            var html = '<div class="calendar-date">';
            html += '<table class="table-condensed">';
            html += '<thead>';
            html += '<tr>';

            // add empty cell for week number
            if (this.showWeekNumbers)
                html += '<th></th>';

            if (!minDate || minDate.isBefore(calendar[1][1])) {
                html += '<th class="prev available"><i class="icon-arrow-left glyphicon glyphicon-arrow-left"></i></th>';
            } else {
                html += '<th></th>';
            }

            var dateHtml = this.locale.monthNames[calendar[1][1].month()] + calendar[1][1].format(" YYYY");

            if (this.showDropdowns) {
                dateHtml = this.renderDropdowns(calendar[1][1], minDate, maxDate);
            }

            html += '<th colspan="5" style="width: auto">' + dateHtml + '</th>';
            if (!maxDate || maxDate.isAfter(calendar[1][1])) {
                html += '<th class="next available"><i class="icon-arrow-right glyphicon glyphicon-arrow-right"></i></th>';
            } else {
                html += '<th></th>';
            }

            html += '</tr>';
            html += '<tr>';

            // add week number label
            if (this.showWeekNumbers)
                html += '<th class="week">' + this.locale.weekLabel + '</th>';

            S.each(this.locale.daysOfWeek, function (dayOfWeek) {
                html += '<th>' + dayOfWeek + '</th>';
            });

            html += '</tr>';
            html += '</thead>';
            html += '<tbody>';

            for (var row = 0; row < 6; row++) {
                html += '<tr>';

                // add week number
                if (this.showWeekNumbers)
                    html += '<td class="week">' + calendar[row][0].week() + '</td>';

                for (var col = 0; col < 7; col++) {
                    var cname = 'available ';
                    cname += (calendar[row][col].month() == calendar[1][1].month()) ? '' : 'off';

                    if ((minDate && calendar[row][col].isBefore(minDate)) || (maxDate && calendar[row][col].isAfter(maxDate))) {
                        cname = ' off disabled ';
                    } else if (calendar[row][col].format('YYYY-MM-DD') == selected.format('YYYY-MM-DD')) {
                        cname += ' active ';
                        if (calendar[row][col].format('YYYY-MM-DD') == this.startDate.format('YYYY-MM-DD')) {
                            cname += ' start-date ';
                        }
                        if (calendar[row][col].format('YYYY-MM-DD') == this.endDate.format('YYYY-MM-DD')) {
                            cname += ' end-date ';
                        }
                    } else if (calendar[row][col] >= this.startDate && calendar[row][col] <= this.endDate) {
                        cname += ' in-range ';
                        if (calendar[row][col].isSame(this.startDate)) { cname += ' start-date '; }
                        if (calendar[row][col].isSame(this.endDate)) { cname += ' end-date '; }
                    }

                    var title = 'r' + row + 'c' + col;
                    html += '<td class="' + cname.replace(/\s+/g, ' ').replace(/^\s?(.*?)\s?$/, '$1') + '" data-title="' + title + '">' + calendar[row][col].date() + '</td>';
                }
                html += '</tr>';
            }

            html += '</tbody>';
            html += '</table>';
            html += '</div>';

            if (this.timePicker) {

                html += '<div class="calendar-time">';
                html += '<select class="hourselect">';
                var start = 0;
                var end = 23;
                var selected_hour = selected.hour();
                if (this.timePicker12Hour) {
                    start = 1;
                    end = 12;
                    if (selected_hour >= 12)
                        selected_hour -= 12;
                    if (selected_hour == 0)
                        selected_hour = 12;
                }

                for (var i = start; i <= end; i++) {
                    if (i == selected_hour) {
                        html += '<option value="' + i + '" selected="selected">' + i + '</option>';
                    } else {
                        html += '<option value="' + i + '">' + i + '</option>';
                    }
                }

                html += '</select> : ';

                html += '<select class="minuteselect">';

                for (var i = 0; i < 60; i += this.timePickerIncrement) {
                    var num = i;
                    if (num < 10)
                        num = '0' + num;
                    if (i == selected.minute()) {
                        html += '<option value="' + i + '" selected="selected">' + num + '</option>';
                    } else {
                        html += '<option value="' + i + '">' + num + '</option>';
                    }
                }

                html += '</select> ';

                if (this.timePicker12Hour) {
                    html += '<select class="ampmselect">';
                    if (selected.hour() >= 12) {
                        html += '<option value="AM">AM</option><option value="PM" selected="selected">PM</option>';
                    } else {
                        html += '<option value="AM" selected="selected">AM</option><option value="PM">PM</option>';
                    }
                    html += '</select>';
                }

                html += '</div>';

            }


            return html;

        }

    };

    //向KISSY对象添加相应的api
    S.mix(S, {
        daterangepicker: function(elem, options, cb){
            var i,
                elems = [];

            //获取和遍历elem元素
            if (typeof elem === 'string'){
                elems = $(elem);
            } else if (elem.innerHTML){
                elems[0] = elem;
            } else if (elem.length){
                elems = elem;
            } else {
                throw new Error('incorrect elements');
            }
            //KISSY.use('dom', function(S, DOM){
                S.each(elems, function(el){
                    if (!DOM.data(el, 'daterangepicker'))
                        DOM.data(el, 'daterangepicker', new DateRangePicker(el, options, cb));
                    return this;
                });
            //});
        },


    });

}, {
    requires: [
        'node',
        'dom',
        'sizzle',
        'daterangepicker/moment'
    ]
});

