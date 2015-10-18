describe('basic', function () {

    it('should login to application', function () {

        browser.get('lib/iqsec/ui/src/index.html#/?redirect_url=http://localhost:3000/dist/index.html');

        expect(browser.getTitle()).toBe('Logowanie');

        $('input[name="username"]').sendKeys('user');
        $('input[name="password"]').sendKeys('user');
        $('a.btn-login').click();

        browser.sleep(1000);

        expect(browser.getTitle()).toBe('IMPAQ Alerter');
    });

    it('should add alert', function () {
        $('header .btn-float').click();

        element(by.model('ctrl.alert.title')).sendKeys('Test Alert');

        $('select[name="category"] option:nth-child(2)').click();
        $('select[name="product"] option:nth-child(2)').click();

        $('[name="assignee"] .dropdown a').click();

        element(by.model('searchText')).sendKeys('user');

        browser.actions().doubleClick(element.all(by.css('.tree-node-header')).get(3)).perform();

        $('input[type="submit"]').click();

        expect(element.all(by.repeater('alert in ctrl.data')).count()).toBeGreaterThan(0);
    });
});
