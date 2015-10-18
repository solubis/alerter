describe('Core Module', function () {

    beforeEach(module('alerter'));

    beforeEach(inject(function ($dictionaries) {
        $dictionaries.init();
    }));

    beforeEach(function () {
        expectServerRequest('dictionaries');
    });

    it('validateCode directive', inject(function ($rootScope, $compile) {
        var $scope = $rootScope.$new();

        $scope.testCode = 'ABC';

        var element = $compile('<form name="form"><input ng-model="testCode" name="testCode" validate-code></form>')($scope);

        $rootScope.$digest();

        expect(element.find('input').val()).toContain('ABC');
        expect($scope.form.testCode.$invalid).toBe(false);

        $scope.testCode = '123';

        $rootScope.$digest();

        expect(element.find('input').val()).toContain('123');
        expect($scope.form.testCode.$invalid).toBe(true);

        $scope.testCode = 'a$';

        $rootScope.$digest();

        expect(element.find('input').val()).toContain('a$');
        expect($scope.form.testCode.$invalid).toBe(true);
    }));

    it('dateFormat filter should format Unix Timestamp Dates', inject(function (dateFormatFilter) {
        var date = new Date(2015, 6, 1, 13, 13, 13).getTime() / 1000;

        expect(dateFormatFilter(date)).toBe('01.07.2015 13:13:13');
    }));

    it('category filter should convert CODE to i18n LABEL', inject(function (categoryFilter, $httpBackend) {
        $httpBackend.flush();

        expect(categoryFilter('INF')).toBe('Informacyjny');
    }));

    it('product filter should convert CODE to i18n LABEL', inject(function (productFilter, $httpBackend) {
        $httpBackend.flush();

        expect(productFilter('CFD')).toBe('Aplikacja Kredytowa');
    }));

    it('priority filter should convert CODE to i18n LABEL', inject(function (priorityFilter, $httpBackend) {
        $httpBackend.flush();

        expect(priorityFilter('40')).toBe('Blokujący');
    }));

    it('link filter should convert CODE to i18n LABEL', inject(function (linkFilter, $httpBackend) {
        $httpBackend.flush();

        expect(linkFilter('IS_DUPLICATED')).toBe('Jest zduplikowany przez');
    }));

    it('state filter should convert CODE to i18n LABEL', inject(function (stateFilter, $httpBackend) {
        $httpBackend.flush();

        expect(stateFilter('IN_PROGRESS')).toBe('W toku');
    }));

    it('priorityIcon filter should return name for file', inject(function (priorityIconFilter, $httpBackend) {
        $httpBackend.flush();

        expect(priorityIconFilter('40')).toBe('Blocker');
    }));

    it('stateClass filter should return CSS class for state', inject(function (stateClassFilter, $httpBackend) {
        $httpBackend.flush();

        expect(stateClassFilter('IN_PROGRESS')).toBe('default');
    }));
});
