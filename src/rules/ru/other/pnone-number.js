(function() {

var defaultCityCodeLength = 5,
    countryCode = '7',
    exceptions = [],
    exceptionsMax = 8,
    exceptionsMin = 2;

[
    4162, 416332, 8512, 851111, 4722, 4725, 391379, 8442, 4732,
    4152, 4154451, 4154459, 4154455, 41544513, 8142, 8332, 8612,
    8622, 3525, 812, 8342, 8152, 3812, 4862, 3422, 342633, 8112,
    9142, 8452, 3432, 3434, 3435, 4812, 3919, 8432, 8439, 3822,
    4872, 3412, 3511, 3512, 3022, 4112, 4852, 4855, 3852, 3854,
    8182, 818, 90, 3472, 4741, 4764, 4832, 4922, 8172, 8202, 8722,
    4932, 493, 3952, 3951, 3953, 411533, 4842, 3842, 3843, 8212,
    4942, 3912, 4712, 4742, 8362, 495, 499, 4966, 4964, 4967, 498,
    8312, 8313, 3832, 383612, 3532, 8412, 4232, 423370, 423630, 8632,
    8642, 8482, 4242, 8672, 8652, 4752, 4822, 482502, 4826300, 3452,
    8422, 4212, 3466, 3462, 8712, 8352,
    '901-934', '936-939', '950-953', 958, '960-969',
    '977-989', '991-997', 999
].forEach(function(num) {
    if(typeof num === 'string') {
        var buf = num.split('-');
        for(var i = +buf[0]; i <= +buf[1]; i++) {
            exceptions.push(i);
        }
    } else {
        exceptions.push(num);
    }
});

function phone(num) {
    var cityCode = '',
        hasCountryCode,
        hasPlus,
        hasEight;

    if(num[0] === '+') {
        hasPlus = true;
        num = num.substr(1);
    } else if(num[0] === '8') {
        hasEight = true;
        num = num.substr(1);
    }

    if(num.length > 7) {
        if(num[0] === countryCode) {
            hasCountryCode = true;
            num = num.substr(1);
        }

        for(var cityCodeLen = exceptionsMax; cityCodeLen >= exceptionsMin; cityCodeLen--) {
            var code = +num.substr(0, cityCodeLen);
            if(exceptions.indexOf(code) > -1) {
                cityCode = num.substr(0, cityCodeLen);
                num = num.substr(cityCodeLen);
                break;
            }
        }

        if(!cityCode) {
            cityCode = num.substr(0, defaultCityCodeLength);
            num = num.substr(defaultCityCodeLength);
        }

        return (hasPlus ? '+' : '') +
            (hasEight ? '8' : '') +
            (hasCountryCode ? countryCode + '\u00A0' : '') +
            prepareCode(cityCode) + '\u00A0' +
            phoneBlocks(num);
    }

    return (hasPlus ? '+' : '') + phoneBlocks(num);
}

function prepareCode(code) {
    var numCode = +code;

    return numCode > 900 && numCode < 1000 ? code : '(' + code + ')';
}

function phoneBlocks(num){
    var add = '';
    if(num.length % 2) {
        add = num[0];
        add += num.length <= 5 ? '-': '';
        num = num.substr(1, num.length - 1);
    }

    return add + num.split(/(?=(?:\d\d)+$)/).join('-');
}

Typograf.rule({
    name: 'ru/other/pnone-number',
    handler: function(text) {
        return text.replace(
            /(т.|тел.|ф.|моб.|факс|сотовый|мобильный|телефон)(\:? *)(\+?\d[\d \u00A0\-\(\)]{3,}\d)/g,
            function($0, $1, $2, $3) {
                var buf = $3.replace(/[^\d\+]/g, '');
                if(buf.length >= 5) {
                    return $1 + $2 + phone(buf);
                }

                return $0;
            }
        );
    }
});

})();
