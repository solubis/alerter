/// <reference path="../../typings/types.d.ts" />

import AlertService from './class/AlertService';
import AlertFilterService from './class/AlertFilterService';
import AlertListController from './class/AlertListController';
import AlertViewController from './class/AlertViewController';
import AlertEditController from './class/AlertEditController';
import AlertAuditController from './class/AlertAuditController';
import AlertEditDialog from './class/AlertEditDialog';
import AlertActionDialog from './class/AlertActionDialog';
import AlertSearchDirective from './class/AlertSearchDirective';

var module = angular

    .module('modules.alerts', [
        'modules.dictionaries',
        'modules.core'
    ])

    .config(($stateProvider) => {

        $stateProvider
            .state('alerts', {
                parent: 'app',
                url: '/alerts/list?{query:dynamicQuery}',
                templateUrl: 'modules/alerts/html/alerts.html',
                controller: 'AlertListController as ctrl',
                access: {
                    requiredPermissions: ['ALERTER_ALERT_LIST']
                }
            })

            .state('view', {
                parent: 'app',
                url: '/alerts/view/:id',
                views: {
                    '': {
                        templateUrl: 'modules/alerts/html/alert-view.html',
                        controller: 'AlertViewController as ctrl',
                        resolve: {
                            metadata: ($metadata) => $metadata.init(),
                            product: ($product) => $product.init(),
                            alert: ($stateParams, $alerts) => $alerts.get($stateParams.id)
                        }
                    },
                    'audit@view': {
                        templateUrl: 'modules/alerts/html/alert-audit.html',
                        controller: 'AlertAuditController as ctrl'
                    }
                }
            });
    })

    .run(($rootScope, $state, $toast, $timeout, $security) => {
        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
            if (toState.name == 'view') {
                $toast.warning('Alert {0} not found or no access to it', toParams.id);
                event.preventDefault();
            }

            if (!$security.isAuthenticated()) {
                $security.redirectToLogin();
            }
        });
    })

    .controller('AlertListController', AlertListController)
    .controller('AlertEditController', AlertEditController)
    .controller('AlertViewController', AlertViewController)
    .controller('AlertAuditController', AlertAuditController)

    .service('$alerts', AlertService)
    .service('$alertDialog', AlertEditDialog)
    .service('$actionDialog', AlertActionDialog)
    .service('$alertFilter', AlertFilterService)

    .directive('alertSearch', AlertSearchDirective)

export default module;
