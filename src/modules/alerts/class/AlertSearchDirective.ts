/// <reference path="../../../typings/types.d.ts" />

/*@ngInject*/
function alertSearchDirective($alerts, $q):  ng.IDirective {

    return {
        restrict: 'AE',
        replace: true,
        require: 'ngModel',
        link: function(scope:  any, element, attrs, ngModelController) {

            scope.find = (id) => {
                id = parseInt(id);

                if (isNaN(id)) {
                    ngModelController.$setValidity('alert', false);
                    return $q.reject();
                }

                return $alerts
                    .get(id)
                    .then((result) => {
                        ngModelController.$setValidity('alert', true);
                        return [result];
                    })
                    .catch((error)  => {
                        if (error.status === 403) {
                            ngModelController.$setValidity('alert', true);
                        } else {
                            ngModelController.$setValidity('alert', false);
                        }

                        return [];
                    });
            };
        },
        templateUrl: 'modules/alerts/html/alert-search-directive.html'
    }
}

export default alertSearchDirective;
