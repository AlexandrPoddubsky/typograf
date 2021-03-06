var assert = require('chai').assert,
    r = require('../build/rules'),
    tests = r.tests,
    innerTests = r.innerTests,
    Typograf = require('../build/typograf'),
    lang = 'ru',
    t = new Typograf({lang: lang}),
    _settings;

function pushSettings(ruleName, settings) {
    _settings = {};

    Object.keys(settings).forEach(function(key) {
        _settings[key] = t.setting(ruleName, key);
        t.setting(ruleName, key, settings[key]);
    });
}

function popSettings(ruleName) {
    Object.keys(_settings).forEach(function(key) {
        t.setting(ruleName, key, _settings[key]);
    });
}

function executeRule(name, text) {
    var rules = t._rules;

    t._lang = lang;
    rules.forEach(function(f) {
        if(f.name === name) {
            text = f.handler.call(t, text, t._settings[f.name]);
        }
    });

    return text;
}

function executeInnerRule(name, text) {
    var rules = t._innerRules;

    rules.forEach(function(f) {
        if(f.name === name) {
            text = f.handler.call(t, text, t._settings[f.name]);
        }
    });

    return text;
}

function getLang(name, item) {
    return item[2] ? item[2] : name.split(/\//)[0];
}

describe('inner rules', function() {
    innerTests.forEach(function(elem) {
        var name = elem[0];
        it(name, function() {
            elem[1].forEach(function(as) {
                t.enable(name);
                assert.equal(executeInnerRule(name, as[0]), as[1], as[0] + ' → ' + as[1]);
            });
        });
    });
});

describe('rules', function() {
    tests.forEach(function(elem) {
        var name = elem[0];
        it(name, function() {
            elem[1].forEach(function(as) {
                var itTypograf = new Typograf(as[2]);
                itTypograf.disable('*').enable(name);
                var result = itTypograf.execute(as[0], {lang: getLang(name, as)});
                assert.equal(result, as[1], as[0] + ' → ' + as[1]);
            });
        });
    });
});

describe('rules, double execute', function() {
    tests.forEach(function(elem) {
        var name = elem[0];
        it(name, function() {
            elem[1].forEach(function(as) {
                var itTypograf = new Typograf(as[2]);
                itTypograf.disable('*').enable(name);

                var result = itTypograf.execute(as[0], {lang: getLang(name, as)});
                assert.equal(result, as[1], as[0] + ' → ' + as[1]);

                if(!itTypograf._getRule(name).disabled) {
                    result = itTypograf.execute(result, {lang: getLang(name, as)});
                    assert.equal(result, as[1], as[0] + ' → ' + as[1]);
                }
            });
        });
    });
});

describe('common specific tests', function() {
    it('enable common/html/stripTags', function() {
        var tp = new Typograf();
        tp.enable('common/html/stripTags');

        var tagTests = [
            ['<p align="center">Hello world!</p> <a href="/">Hello world!</a>\n\n<pre>Hello world!</pre>',
            'Hello world! Hello world!\n\nHello world!'],
            ['<p align="center" Hello world!</p>', '']
        ];

        tagTests.forEach(function(el) {
            assert.equal(tp.execute(el[0]), el[1]);
        });
    });

    it('should enable common/html/escape', function() {
        var tp = new Typograf();
        tp.enable('common/html/escape');

        var escapeTests = [
            ['<p align="center">\nHello world!\n</p>',
            '&lt;p align=&quot;center&quot;&gt;\nHello world!\n&lt;&#x2F;p&gt;']
        ];

        escapeTests.forEach(function(el) {
            assert.equal(tp.execute(el[0]), el[1]);
        });
    });
});

describe('russian specific tests', function() {
    it('quotes lquote = lquote2 and rquote = rquote2', function() {
        var quotTests = [
            ['"Триллер “Закрытая школа” на СТС"', '«Триллер «Закрытая школа» на СТС»'],
            ['Триллер "Триллер “Закрытая школа” на СТС" Триллер', 'Триллер «Триллер «Закрытая школа» на СТС» Триллер'],
            ['"“Закрытая школа” на СТС"', '«Закрытая школа» на СТС»'],
            ['Триллер "“Закрытая школа” на СТС" Триллер', 'Триллер «Закрытая школа» на СТС» Триллер'],
            ['"Триллер “Закрытая школа"', '«Триллер «Закрытая школа»'],
            ['Триллер "Триллер “Закрытая школа" Триллер', 'Триллер «Триллер «Закрытая школа» Триллер']
        ];

        pushSettings('ru/punctuation/quote', {
            lquote: '«',
            rquote: '»',
            lquote2: '«',
            rquote2: '»'
        });

        quotTests.forEach(function(el) {
            assert.equal(executeRule('ru/punctuation/quote', el[0]), el[1]);
        });

        popSettings('ru/quote');
    });

    it('ru/optalign', function() {
        var tp = new Typograf({lang: 'ru'});
        tp.enable('ru/optalign/*');

        [
            [
                '<p>"что-то, где-то!"</p>',
                '<p><span class="typograf-oa-n-lquote">«</span>что-то<span class="typograf-oa-comma">,</span><span class="typograf-oa-comma-sp"> </span>где-то!»</p>'
            ]
        ].forEach(function(el) {
            assert.equal(tp.execute(el[0]), el[1]);
        });
    });

    it('shoult disable ru/optalign', function() {
        var tp = new Typograf({lang: 'ru'});
        tp.disable('*');

        [
            '<span class="typograf-oa-sp-lquot"> </span>',
            '<span class="typograf-oa-lquot">«</span>',
            '<span class="typograf-oa-comma">,</span>',
            '<span class="typograf-oa-sp-lbracket"> </span>'
        ].forEach(function(el) {
            assert.equal(tp.execute(el), el);
        });
    });
});
