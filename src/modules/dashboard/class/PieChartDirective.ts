/// <reference path="../../../typings/types.d.ts" />

interface PieChartDirectiveScope extends ng.IScope {
    trackColor: string,
    scaleColor: string,
    barColor: string,
    lineWidth: number,
    lineCap: string,
    size: number,
    percent: number
}

/*@ngInject*/ 
function PieChartDirective($alerts, $q):ng.IDirective {
    var defaults = {
        trackColor: '#eee',
        scaleColor: '#ccc',
        barColor: '#2196F3',
        lineWidth: 7,
        lineCap: 'butt',
        size: 95
    };

    return {
        restrict: 'AE',
        scope: {
            percent: '@',
            trackColor: '@',
            scaleColor: '@',
            barColor: '@',
            lineWidth: '@',
            lineCap: '@',
            size: '@'
        },
        link: (scope:PieChartDirectiveScope, element) => {
            scope.$watch('percent', (percent) => {
                var config;

                if (percent) {
                    config = angular.extend({}, defaults, scope);

                    element.easyPieChart({
                        trackColor: config.trackColor,
                        scaleColor: config.scaleColor,
                        barColor: config.barColor,
                        lineWidth: config.lineWidth,
                        lineCap: config.lineCap,
                        size: config.size
                    });

                    element.data('easyPieChart').update(percent);
                }
            })
        }
    }
}

export default PieChartDirective;
