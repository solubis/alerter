describe('Workflow Module', function () {

    beforeEach(module('alerter'));

    beforeEach(function () {
        expectServerRequest('workflow');
    });

    it('$workflow service should return workflows', inject(function ($httpBackend, $workflow) {
        $workflow
            .get()
            .then(function (result) {
                expect(result.length).toBe(1);
            });

        $httpBackend.flush();
    }));

    it('WorkflowListController should have data', inject(function ($httpBackend, $controller, $rootScope) {
        var $scope = $rootScope.$new();
        var ctrl = $controller('WorkflowListController', {$scope: $scope});

        ctrl.tableParams.settings().$scope = $scope;
        ctrl.tableParams.reload();

        $httpBackend.flush();
        $rootScope.$digest();

        expect(ctrl.data.length).toBe(1);
    }));
});
