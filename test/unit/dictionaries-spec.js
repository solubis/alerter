describe('Dictionaries Module', function () {

    beforeEach(module('squealer'));

    beforeEach(inject(function ($dictionaries) {
        $dictionaries.init();
    }));

    beforeEach(function () {
        expectServerRequest('dictionaries');
        expectServerRequest('product');
        expectServerRequest('dictionary/product');
    });

    it('$dictionaries should return dictionaries', inject(function ($dictionaries, $httpBackend) {
        $httpBackend.flush();

        expect($dictionaries.get().category).toBeDefined();
    }));

    it('category filter should convert CODE to i18n LABEL', inject(function (categoryFilter, $httpBackend) {
        $httpBackend.flush();

        expect(categoryFilter('INF')).toBe('Informacyjny');
    }));

    it('DictionariesController should have data', inject(function ($rootScope, $controller, $httpBackend) {
        var $scope = $rootScope.$new();
        var ctrl = $controller('DictionariesController', {$scope: $scope});

        expect(ctrl.dictionaries).toBeDefined();

        ctrl.selectDictionary('product');

        expect(ctrl.dictionary).toBeDefined();
        expect(ctrl.isLoading).toBe(true);

        $httpBackend.flush();
        $rootScope.$digest();

        expect(ctrl.isLoading).toBe(false);
        expect(ctrl.data.length).toBeGreaterThan(1);
    }));
});
