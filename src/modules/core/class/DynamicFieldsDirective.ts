/// <reference path="../../../typings/types.d.ts" />

// TODO Componentize and Refactor 

/*@ngInject*/
function dynamicFieldsDirective($compile, $interpolate, $utils):ng.IDirective {

    return {
        restrict: 'AE',
        replace: true,
        scope: true,
        terminal: true,
        link: (scope:any, element:any, attrs:any) => {
            var templates = scope.$eval(attrs.templates);
            var fields = scope.$eval(attrs.fields);

            var refresh = (fields, templates) => {
                element.html('');

                angular.forEach(fields, (field) => {
                    var templateDefinition = $utils.arraySearch(templates, {type: field.type});
                    var templateElement;
                    var fieldScope = scope.$new();
                    var model = attrs.model + '.' + field.code;
                    var interpolateFn;

                    if (templateDefinition) {
                        templateElement = angular.element(templateDefinition.template);

                        templateElement.find('input').attr('ng-model', model);
                        templateElement.find('textarea').attr('ng-model', model);
                        templateElement.find('datetimepicker').attr('ng-model', model);

                        templateElement.find('input').attr('name', field.code);
                        templateElement.find('textarea').attr('name', field.code);
                        templateElement.find('datetimepicker').attr('name', field.code);

                        fieldScope.$field = fieldScope.field = field;
                        fieldScope.$value = fieldScope.value = fieldScope.$eval(model);
                        fieldScope.$record = fieldScope.record = fieldScope.alert = fieldScope.$eval(attrs.record);

                        if (field.template){
                            interpolateFn = $interpolate(field.template);
                            fieldScope.$interpolatedValue = fieldScope.interpolatedValue = interpolateFn(fieldScope);
                        }

                        $compile(templateElement)(fieldScope, (clone) => {
                            element.append(clone);
                        })
                    } else {
                        console.error('Template for dynamic field not found : ' + field.type);
                    }
                });
            };

            scope.$watch(attrs.fields, (value) => {
                fields = value;

                refresh(fields, templates);
            });

            scope.$watch(attrs.model, () => {
                refresh(fields, templates);
            });
        }
    }
}

export default dynamicFieldsDirective;
