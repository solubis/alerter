/// <reference path="../../../typings/types.d.ts" />

import DictionariesService from '../../dictionaries/class/DictionariesService';
import WorkflowDefinition from './WorkflowDefinition';
import WorkflowService from './WorkflowService';

/*@ngInject*/
class WorkflowListController {

    private config;
    private tableParams;
    private isLoading: boolean;
    private dict: any;
    private data: WorkflowDefinition[] = [];

    constructor(private $scope,
        private $workflow: WorkflowService,
        private $dialog,
        private $ask,
        private $toast,
        private $error,
        private $dictionaries: DictionariesService,
        private ngTableParams) {

        this.tableParams = new ngTableParams({ count: this.data.length }, { counts: [] });

        this.config = {
            useWrapMode: true,
            showGutter: false,
            mode: 'yaml',
            firstLineNumber: 1
        };

        this.dict = $dictionaries.get();

        this.isLoading = true;

        this.$workflow
            .get()
            .then((result) => {
                this.data = result;
            })
            .finally(() => {
                this.isLoading = false;
            });

        $scope.$on('$workflow:update', (event, record) => {
            this.data.forEach((item) => {
                if (item.id === record.id) {
                    angular.extend(item, record);
                }
            })
        });

        $scope.$on('$workflow:add', (event, record) => {
            this.data.unshift(record);
        });

        $scope.$on('$workflow:delete', (event, record) => {
            var index;

            index = this.data.indexOf(record);

            if (index >= 0) {
                this.data.splice(index, 1);
            }
        })
    }

    open(workflow: WorkflowDefinition) {
        return this.$dialog.open(
            /*@ngInject*/
            {
                templateUrl: 'modules/workflow/html/workflow-edit.html',
                backdrop: 'static',
                controller: 'WorkflowEditController as ctrl',
                resolve: {
                    workflow: ($workflow: WorkflowService) => (workflow ? $workflow.get(workflow.id) : WorkflowService.factory())
                },
                size: 'lg'
            })
    }

    remove(workflow: WorkflowDefinition) {
        this.$ask('Delete', 'Do you want to delete: {0}?', workflow.name)
            .then(() => {
                this.$workflow
                    .remove(workflow)
                    .then(() => {
                        this.$toast.info('Record deleted', workflow.name);
                    })
                    .catch((error) => {
                        this.$error.warning('Record cannot be deleted', error);
                    });
            })
    }
}

export default WorkflowListController;
