/// <reference path="../../../typings/types.d.ts" />

import WorkflowDefinition from './WorkflowDefinition';

/*@ngInject*/
class WorkflowEditController {

    private config: any;
    private commentText: string;
    private active: boolean;
    private validationError;
    private validationResult;
    private activationEnabled;

    constructor(
        private $scope,
        private $error,
        private $toast,
        private $utils,
        private $ask,
        private $workflow,
        private $q,
        private $dictionaries,
        private workflow: WorkflowDefinition) {

        this.config = {
            useWrapMode: true,
            showGutter: true,
            mode: 'yaml',
            firstLineNumber: 1
        };

        this.active = workflow.active;
        this.activationEnabled = this.isNew() || workflow.active === false;

        $scope.$watch(() => this.active, (value, oldValue) => {
            if (oldValue === false && value === true) {
                this.validate()
                    .then(() => {
                        $ask('Workflow activation', 'Are you sure you want to activate workflow?')
                            .catch(() => {
                                this.active = false;
                            });
                    })
                    .catch(() => {
                        this.active = false;
                    });
            }
        });
    }

    isNew() {
        return this.workflow.isNew();
    }

    submitForm(form) {
        var changes = this.$utils.formChanges(form, this.workflow);

        changes.definition = this.workflow.definition;
        changes.active = this.active;

        if (this.workflow.isNew()) {
            if (this.commentText) {
                changes['comments'] = [{ text: this.commentText }];
            }
            return this.$workflow.add(changes);
        } else {
            return this.$workflow
                .update(this.workflow.id, changes)
                .then(() => {
                    if (this.commentText) {
                        this.$workflow.addComment(this.workflow.id, this.commentText);
                    }
                })
        }
    }

    validate() {
        var request;

        request = this.$workflow.validate(this.workflow)
            .then(() => {
                this.validationError = null;
                this.validationResult = true;
            })
            .catch((error) => {
                this.validationError = this.$error.format(error);
                this.validationResult = false;

                return this.$q.reject();
            });

        return request;
    }

    saveChanges(form) {
        this.submitForm(form)
            .then(() => {
                this.$scope.$close();
                this.$toast.info('Record ({0}) saved', this.workflow.name);

                this.$dictionaries.init();
            })
            .catch((error) => {
                if (error.status === 409) {
                    this.$error.warning(error);
                }
            });
    }
}

export default WorkflowEditController;
