describe('Alerts Module', function () {

    beforeEach(module('alerter'));

    beforeEach(function () {
        expectServerRequest('alert', 'number=0&size=100');
        expectServerRequest('alert', 'number=0&orderBy=modificationDate&orderDirection=desc&size=50');
        expectServerRequest('metadata');
        expectServerRequest('tag');
        expectServerRequest('dictionary/tag');
    });

    it('$alerts should return alerts', inject(function ($httpBackend, $alerts) {
        $alerts
            .get()
            .then(function (result) {
                expect(result.content.length).toBe(100);
            });

        $httpBackend.flush();
    }));

    it('AlertListController should have data', inject(function ($httpBackend, $rootScope, $controller) {
        var $scope = $rootScope.$new();
        var ctrl = $controller('AlertListController', {$scope: $scope});

        ctrl.updateFilter();
        ctrl.tableParams.settings().$scope = $scope;
        ctrl.tableParams.reload();

        $httpBackend.flush();
        $rootScope.$digest();

        expect(ctrl.data.length).toBe(100);
    }));
});
