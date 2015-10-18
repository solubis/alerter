/// <reference path="../../typings/types.d.ts" />

/**
 * Directives
 */

import DynamicFieldsDirective from './class/DynamicFieldsDirective';

var module = angular.module('modules.core.directives', [])

    .directive('dynamicFields', DynamicFieldsDirective)

    /*
     Directive for conditional focusing dom element
     */

    .directive('focusIf', ($parse, $timeout) => {
        return {
            restrict: 'AE',
            link: (scope, element, attrs) => {
                var model = $parse(attrs['focusIf']);

                scope.$watch(model, (value) => {
                    if (value === true) {
                        $timeout(() => {
                            element[0].focus();
                        });
                    }
                });
            }
        };
    })

    .directive('autofocus', ($parse, $timeout) => {
        return {
            restrict: 'A',
            link: (scope, element, attrs) => {
                $timeout(() => {
                    element[0].focus();
                });
            }
        };
    })

    /*
     Directive for validating  Number fields
     */

    .directive('validateNumber', () => {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: (scope, element, attrs, ngModelController) => {
                ngModelController.$parsers.push(function(value) {
                    return parseFloat(value);
                });

                ngModelController.$validators.number = (value, viewValue) => {
                    if (ngModelController.$isEmpty(viewValue)) {
                        return true;
                    }

                    return !isNaN(parseFloat(viewValue));
                };
            }
        }
    })

    /*
     Directive for validating  CODE fields
     */

    .directive('validateCode', () => {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: (scope, element, attrs, ngModelController) => {
                ngModelController.$validators.code = (value, viewValue) => {
                    if (ngModelController.$isEmpty(value)) {
                        return false;
                    }

                    return /^[A-Z][0-9A-Z]*$/i.test(value);
                };
            }
        }
    });

export default module;
