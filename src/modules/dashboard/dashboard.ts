/// <reference path="../../typings/types.d.ts" />

import DashboardController from './class/DashboardController';
import DashboardService from './class/DashboardService';
import PieChartDirective from './class/PieChartDirective';

var module = angular.module('modules.dashboard', [])

    .config(($stateProvider) => {
        $stateProvider
            .state('dashboard', {
                url: '/dashboard',
                parent: 'app',
                templateUrl: 'modules/dashboard/html/dashboard.html',
                controller: 'DashboardController as ctrl'
            })
    })

    .service('$dashboard', DashboardService)

    .controller('DashboardController', DashboardController)

    .directive('pieChart', PieChartDirective);

export default module;


