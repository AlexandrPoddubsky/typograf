Typograf.rule({
    name: 'ru/date/weekday',
    handler: function(text) {
        var space = '( |\u00A0)',
            monthCase = this.data('ru/monthGenCase'),
            weekday = this.data('ru/weekday'),
            re = new RegExp('(\\d)' + space + '(' + monthCase + '),' + space + '(' + weekday + ')', 'gi');

        return text.replace(re, function() {
            var a = arguments;
            return a[1] + a[2] + a[3].toLowerCase() + ',' + a[4] + a[5].toLowerCase();
        });
    }
});
