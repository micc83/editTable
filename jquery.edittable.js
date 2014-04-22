/*! editTable v0.1.1 by Alessandro Benoit */
(function ($, window, i) {

    'use strict';

    $.fn.editTable = function (options) {

        // Settings
        var s = $.extend({
                name: '',
                data: [['']],
                jsonData: false,
                headerCols: false,
                maxRows: 999
            }, options),
            $el = $(this),
            defaultTableContent = '<thead><tr></tr></thead><tbody></tbody>',
            $table = $('<table/>', {
                class: 'inputtable' + ((!s.headerCols) ? ' wh' : ''),
                html: defaultTableContent
            }),
            defaultth = '<th><a class="addcol icon-button" href="#">+</a> <a class="delcol icon-button" href="#">-</a></th>',
            colnumber,
            rownumber,
            reset;

        // Increment for IDs
        i = i + 1;

        // Build cell
        function buildCell(content) {
            content = (content === 0) ? "0" : (content || '').toString();
            return '<td><input type="text" name="" value="' + content.replace(/"/g, "&quot;") + '" /></td>';
        }

        // Build row
        function buildRow(data, len) {

            var rowcontent = '', b;

            data = data || '';

            for (b = 0; b < (len || data.length); b += 1) {
                rowcontent += buildCell(data[b]);
            }

            return $('<tr/>', {
                html: rowcontent + '<td><a class="addrow icon-button" href="#">+</a> <a class="delrow icon-button" href="#">-</a></td>'
            });

        }

        // Check button status (enable/disabled)
        function checkButtons() {
            if (colnumber < 2) {
                $table.find('.delcol').addClass('disabled');
            }
            if (rownumber < 2) {
                $table.find('.delrow').addClass('disabled');
            }
            if (s.maxRows && rownumber === s.maxRows) {
                $table.find('.addrow').addClass('disabled');
            }
        }

        // Fill table with data
        function fillTableData(data) {

            var a, crow = Math.min(s.maxRows, data.length);

            // Clear table
            $table.html(defaultTableContent);

            // Populate table headers
            if (s.headerCols) {
                // Fixed columns
                for (a = 0; a < s.headerCols.length; a += 1) {
                    $table.find('thead tr').append('<th>' + s.headerCols[a] + '</th>');
                }
                for (a = 0; a < crow; a += 1) {
                    buildRow(data[a], s.headerCols.length).appendTo($table.find('tbody'));
                }
            } else if ( data[0] ) {
                // Variable columns
                for (a = 0; a < data[0].length; a += 1) {
                    $table.find('thead tr').append(defaultth);
                }
                for (a = 0; a < crow; a += 1) {
                    buildRow(data[a]).appendTo($table.find('tbody'));
                }
            }

            // Append missing th
            $table.find('thead tr').append('<th></th>');

            // Count rows and columns
            colnumber = $table.find('thead th').length - 1;
            rownumber = $table.find('tbody tr').length;

            checkButtons();
        }

        // Export data
        function exportData() {
            var row = 0, data = [];

            $table.find('tbody tr').each(function () {

                row += 1;
                data[row] = [];

                $(this).find('input').each(function () {
                    data[row].push($(this).val());
                });

            });

            // Remove undefined
            data.splice(0, 1);

            return data;
        }

        // Fill the table with data from textarea or given properties
        if ($el.is('textarea')) {

            try {
                reset = JSON.parse($el.val());
            } catch (e) {
                reset = s.data;
            }

            $el.after($table);

            // If inside a form set the textarea content on submit
            if ($table.parents('form').length > 0) {
                $table.parents('form').submit(function () {
                    $el.val(JSON.stringify(exportData()));
                });
            }

        } else {
            reset = (JSON.parse(s.jsonData) || s.data);
            $el.append($table);
        }

        fillTableData(reset);

        // Add column
        $table.on('click', '.addcol', function () {

            var colid = parseInt($(this).closest('tr').children().index($(this).parent('th')), 10);

            colnumber += 1;

            $table.find('thead tr').find('th:eq(' + colid + ')').after(defaultth);

            $table.find('tbody tr').each(function () {
                $(this).find('td:eq(' + colid + ')').after(buildCell());
            });

            $table.find('.delcol').removeClass('disabled');

            return false;
        });

        // Remove column
        $table.on('click', '.delcol', function () {

            if ($(this).hasClass('disabled')) {
                return false;
            }

            var colid = parseInt($(this).closest('tr').children().index($(this).parent('th')), 10);

            colnumber -= 1;

            checkButtons();

            $(this).parent('th').remove();

            $table.find('tbody tr').each(function () {
                $(this).find('td:eq(' + colid + ')').remove();
            });

            return false;
        });

        // Add row
        $table.on('click', '.addrow', function () {

            if ($(this).hasClass('disabled')) {
                return false;
            }

            rownumber += 1;

            $(this).closest('tr').after(buildRow(0, colnumber));

            $table.find('.delrow').removeClass('disabled');

            checkButtons();

            return false;
        });

        // Delete row
        $table.on('click', '.delrow', function () {

            if ($(this).hasClass('disabled')) {
                return false;
            }

            rownumber -= 1;

            checkButtons();

            $(this).closest('tr').remove();

            $table.find('.addrow').removeClass('disabled');

            return false;
        });

        // Select all content on click
        $table.on('click', 'input', function () {
            $(this).select();
        });

        // Return functions
        return {
            // Get an array of data
            getData: function () {
                return exportData();
            },
            // Get the JSON rappresentation of data
            getJsonData: function () {
                return JSON.stringify(exportData());
            },
            // Load an array of data
            loadData: function (data) {
                fillTableData(data);
            },
            // Load a JSON rappresentation of data
            loadJsonData: function (data) {
                fillTableData(JSON.parse(data));
            },
            // Reset data to the first instance
            reset: function () {
                fillTableData(reset);
            }
        };
    };

})(jQuery, this, 0);