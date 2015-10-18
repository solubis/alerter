/// <reference path="../../../typings/types.d.ts" />

import WorkflowDefinition from './WorkflowDefinition';

/*@ngInject*/ 
class WorkflowService {

    constructor(private $rootScope, private $log, private $rest) {
    }

    static factory(data:any = {}) {
        data.active = data.active || false;

        return new WorkflowDefinition(data);
    }

    get(id?:number) {
        var request;

        if (id) {
            request = this.$rest
                .get({
                    command: 'workflow' + '/' + id
                })
                .then((result) => WorkflowService.factory(result));
        } else {
            request = this.$rest
                .get({
                    command: 'workflow'
                })
                .then((result) => {
                    result = result.map((item) => WorkflowService.factory(item));

                    return result;
                });
        }

        return request;
    }

    update(id, changes) {
        var request;

        request = this.$rest
            .put({
                command: 'workflow/' + id,
                data: changes
            })
            .then((result) => {
                this.$rootScope.$broadcast('$workflow:update', WorkflowService.factory(result));
            });

        return request;
    }

    add(workflow) {
        var request;

        request = this.$rest
            .post({
                command: 'workflow',
                data: workflow
            })
            .then((result) => {
                this.$rootScope.$broadcast('$workflow:add', WorkflowService.factory(result));
            });

        return request;
    }

    remove(workflow) {
        var request;

        request = this.$rest
            .remove({
                command: 'workflow/' + workflow.id
            })
            .then(() => {
                this.$rootScope.$broadcast('$workflow:delete', workflow);
            });

        return request;
    }

    validate(workflow) {
        var request;

        request = this.$rest
            .put({
                command: 'workflow/validate',
                data: workflow
            });

        return request;
    }

    addComment(workflowId, text) {
        var request;

        this.$log.debug('addComment:', text);

        request = this.$rest
            .post({
                command: 'workflow/' + workflowId + '/comment',
                data: {
                    text: text
                }
            });

        return request;
    }
}

export default WorkflowService;
