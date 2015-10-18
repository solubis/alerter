/// <reference path="../../typings/types.d.ts" />

import WorkflowDefinition from './class/WorkflowDefinition';
import WorkflowService from './class/WorkflowService';
import WorkflowEditController from './class/WorkflowEditController';
import WorkflowListController from './class/WorkflowListController';

var module = angular.module('modules.workflow', [
        'ui.ace'
    ])
    .config(($stateProvider) => {
        $stateProvider
            .state('workflow', {
                parent:'app',
                url: '/workflow',
                templateUrl: 'modules/workflow/html/workflow.html',
                controller: 'WorkflowListController as ctrl',
                access: {
                    requiredPermissions: ['ALERTER_ADMIN', 'ALERTER_ADMIN_MANAGE_WORKFLOW']
                }
            })
    })
    .service('$workflow', WorkflowService)
    .controller('WorkflowEditController', WorkflowEditController)
    .controller('WorkflowListController', WorkflowListController);

export default module;
