/// <reference path="../../../typings/types.d.ts" />

import Alert from './Alert';
import AlertService from './AlertService';
import AlertAttachmentDialogControler from './AlertAttachmentDialogController';

const KEY_ATTACH = 'z';
const KEY_EDIT = 'e';
const KEY_ASSIGN = 'p';
const KEY_LINK = 'l';
const KEY_COMMENT = 'k';
const KEY_ALERT_LIST = 'esc';

/*@ngInject*/
class AlertViewController {

    private token: any;
    private host: string;
    private linksTableParams;
    private attachmentsTableParams;
    private isLoading: boolean;
    private links;
    private audit;
    private templates;
    private fields;

    constructor(
        private $scope,
        private $timeout,
        private $dialog,
        private $rest,
        private $ask,
        private $translate,
        private $state,
        private $error,
        private $toast,
        private $alerts: AlertService,
        private $security,
        private $actionDialog,
        private $alertDialog,
        private Organisation,
        private alert: Alert,
        private $hotkeys,
        private $product,
        private ngTableParams) {

        /*
        * Scope
        */

        this.audit = { totalElements: 0 };

        this.linksTableParams = new ngTableParams({
            count: alert.linkedAlerts.length
        }, { counts: [] });

        this.attachmentsTableParams = new ngTableParams({
            count: alert.attachments.length
        }, { counts: [] });

        this.templates = [
            {
                type: 'string',
                template: '<tr><td ng-bind="$field.label"></td><td ng-bind="$value"></td></tr>'
            },

            {
                type: 'url',
                template: '<tr><td ng-bind="$field.label"></td><td><a ng-href="{{ $interpolatedValue }}" ng-bind="$interpolatedValue" target="_blank"></a></td></tr>'
            },

            {
                type: 'number',
                template: '<tr><td ng-bind="$field.label"></td><td ng-bind="$value"></td></tr>'
            },

            {
                type: 'date',
                template: '<tr><td ng-bind="$field.label"></td><td ng-bind="$value | dateFormat"></td></tr>'
            },

            {
                type: 'boolean',
                template: '<tr><td ng-bind="$field.label"></td><td><i class="md md-done" ng-if="$value"></i></td></tr>'
            },

            {
                type: 'text',
                template: '<tr><td ng-bind="$field.label"></td><td class="wrap-words" ng-bind="$value"></td></tr>'
            }
        ];

        this.fields = $product.getMetadata(alert.product);

        this.host = $rest.url;

        this.token = $security.getAccessToken();

        this.bindHotkeys();

        this.bindEvents();
    }

    private bindHotkeys() {

        if (this.hasPermissionToEdit()) {
            if (!this.$hotkeys.get(KEY_EDIT)) {
                this.$hotkeys.bindTo(this.$scope)
                    .add({
                        combo: KEY_EDIT,
                        description: this.$translate('Edit current alert'),
                        callback: () => this.edit()
                    });
            }
        } else {
            this.$hotkeys.del(KEY_EDIT);
        }

        if (this.hasPermissionToComment()) {
            if (!this.$hotkeys.get(KEY_COMMENT)) {
                this.$hotkeys.bindTo(this.$scope)
                    .add({
                        combo: KEY_COMMENT,
                        description: this.$translate('Add comment to current alert'),
                        callback: () => this.comment()
                    });
            }
        } else {
            this.$hotkeys.del(KEY_COMMENT);
        }

        if (this.hasPermissionToLink()) {
            if (!this.$hotkeys.get(KEY_LINK)) {
                this.$hotkeys.bindTo(this.$scope)
                    .add({
                        combo: KEY_LINK,
                        description: this.$translate('Link current alert'),
                        callback: (event) => this.link()
                    });
            }
        } else {
            this.$hotkeys.del(KEY_LINK);
        }

        if (this.hasPermissionToAssign()) {
            if (!this.$hotkeys.get(KEY_ASSIGN)) {
                this.$hotkeys.bindTo(this.$scope)
                    .add({
                        combo: KEY_ASSIGN,
                        description: this.$translate('Change assignment'),
                        callback: (event) => this.assign()
                    });
            }
        } else {
            this.$hotkeys.del(KEY_ASSIGN);
        }

        if (this.hasPermissionToAttach()) {
            if (!this.$hotkeys.get(KEY_ATTACH)) {
                this.$hotkeys.bindTo(this.$scope)
                    .add({
                        combo: KEY_ATTACH,
                        description: this.$translate('Add attachment'),
                        callback: (event) => {
                            this.attach();
                            event.preventDefault();
                        }
                    });
            }
        } else {
            this.$hotkeys.del(KEY_ATTACH);
        }
    }

    /* TODO Refactor to call this.refresh() after changes - it is no longer possible to maintain changes without interaction w. server*/
    private bindEvents() {
        this.$scope.$on('$alerts:update', (event, data) => {
            if (data && (this.alert.id === data.id)) {
                angular.extend(this.alert, data);
            }
        });

        this.$scope.$on('$alerts:comment', (event, data) => {
            if (data && (this.alert.id === data.id)) {
                this.alert.comments.unshift(data.comment);
            }
        });

        this.$scope.$on('$alerts:attachment', (event, data) => {
            if (data && (this.alert.id === data.id)) {
                this.alert.attachments.unshift(data.attachment);
            }
        });

        this.$scope.$on('$alerts:audit', (event, data) => {
            if (data && (this.alert.id === data.id)) {
                this.audit = data.audit;
            }
        });

        this.$scope.$watch(() => this.alert.finalized, () => {
            this.bindHotkeys()
        })
    }

    hasPermissionToComment(): any {
        return !this.alert.finalized && this.$security.authorize('ALERTER_ALERT_ADD_COMMENT');
    }

    hasPermissionToAttach(): any {
        return !this.alert.finalized && this.$security.authorize('ALERTER_ALERT_ADD_ATTACHMENT');
    }

    hasPermissionToLink(): any {
        return !this.alert.finalized && this.$security.authorize('ALERTER_ALERT_ADD_LINK');
    }

    hasPermissionToAssignSelf() {
        return !this.alert.finalized && (
            !this.$security.owner(this.alert.assignee.userLogin) &&
            this.$security.authorize('ALERTER_ALERT_ASSIGN_TO_SELF')
        );
    }

    hasPermissionToAssign() {
        return !this.alert.finalized && (
            this.$security.authorize('ALERTER_ALERT_ASSIGN_FOREIGN') || (
                this.$security.authorize('ALERTER_ALERT_ASSIGN_OWN') &&
                this.$security.owner(this.alert.assignee.userLogin)
            )
        )
    }

    hasPermissionToEdit() {
        return !this.alert.finalized && (
            this.$security.authorize('ALERTER_ALERT_EDIT_FOREIGN') || (
                this.$security.authorize('ALERTER_ALERT_EDIT_OWN') &&
                this.$security.owner(this.alert.assignee.userLogin)
            )
        );
    }

    runTransition(transition) {
        var data = {
            id: this.alert.id
        };

        this.$actionDialog
            .open({
                data: data,
                noUpdate: true,
                acceptButtonLabel: 'Change state',
                title: 'Change state to: ' + this.$translate(transition),
                templateUrl: 'modules/alerts/html/alert-transition.html',
                action: (changes) =>
                    this.$alerts
                        .runTransition(this.alert.id, transition, changes.comment)
                        .then((result) => {
                            this.$toast.info('Alert ({0}) state changed to {1}', result.id, this.$translate(result.state));
                            this.refresh();
                        })
            })
    }

    assign() {
        var data = {
            id: this.alert.id,
            assignee: this.alert.assignee
        };

        this.$actionDialog
            .open({
                data: data,
                title: 'Assignment',
                templateUrl: 'modules/alerts/html/alert-assign.html',
                action: (changes) => {
                    if (changes.assignee && !changes.assignee.assignable) {
                        this.$toast.info('Alert saved but you lost access to it');
                    } else {
                        this.$toast.info('Alert saved');
                    }
                }
            });
    }

    assignSelf() {
        var assignee = this.alert.assignee;
        var user = this.$security.getUserLogin();

        this.$ask('Assign to me', 'Do you want to assign this alert to yourself?')
            .then(() => {
                this.$alerts.getOrganisation().then((organisation) => {
                    var group = organisation.getUserGroupInHierarchy(assignee.hierarchyId, user);

                    if (group) {
                        assignee.groupId = group.id;
                        assignee.userLogin = user;

                        this.$alerts.update(this.alert.id, {
                            assignee: assignee
                        })
                    } else {
                        this.$error.warning('Assign to me error', 'Cannot assign - alert is in foreign hierarchy');
                    }
                });
            })
    }

    link() {
        var data = {
            id: this.alert.id
        };

        this.$actionDialog
            .open({
                data: data,
                noUpdate: true,
                title: 'Linking',
                templateUrl: 'modules/alerts/html/alert-link.html',
                action: (changes) =>
                    this.$alerts
                        .addLink(this.alert.id, changes.linkedAlert, changes.linkType, changes.comment)
                        .then((result) => {
                            this.refresh();
                            this.$toast.info('Link created');
                        })
            });
    }

    attach() {
        this.$dialog
            .open({
                templateUrl: 'modules/alerts/html/alert-attach.html',
                resolve: {
                    alert: () => this.alert
                },
                controllerAs: 'ctrl',
                backdrop: 'static',
                controller: AlertAttachmentDialogControler
            });
    }

    removeLink(link) {
        this.$ask('Delete', 'Do you want to delete: {0}?', link.linkedAlertId)
            .then(() => {
                this.$alerts
                    .removeLink(this.alert.id, link.linkedAlertId, link.linkTypeCode)
                    .then(() => {
                        var index;

                        index = this.alert.linkedAlerts.indexOf(link);

                        if (index >= 0) {
                            this.alert.linkedAlerts.splice(index, 1);
                        }

                        this.$toast.info('Link removed');
                    })
                    .catch((error) =>
                        this.$error.warning('Application error', error)
                    );
            })
    }

    removeAttachment(attachment) {
        this.$ask('Delete', 'Do you want to delete: {0}?', (attachment.name || attachment.url))
            .then(() => {
                this.$alerts
                    .removeFile(this.alert.id, attachment.id)
                    .then(() => {
                        var index;

                        index = this.alert.attachments.indexOf(attachment);

                        if (index >= 0) {
                            this.alert.attachments.splice(index, 1);
                        }

                        this.$toast.info('Attachment removed');
                    })
                    .catch((error) =>
                        this.$error.warning('Application error', error)
                    );
            })
    }

    downloadFile(file) {
        if (window.navigator.msSaveBlob) {
            this.$alerts
                .downloadBlob(this.alert.id, file.id)
                .then((result) => {
                    window.navigator.msSaveBlob(result, file.name);
                })
        } else {
            this.$alerts
                .downloadBase64(this.alert.id, file.id)
                .then((result) => {
                    let uriContent = `data:${file.type};base64,${result}`;
                    window.open(uriContent, '_blank');
                })
        }
    }

    comment() {
        var data = {
            id: this.alert.id
        };

        this.$actionDialog
            .open({
                data: data,
                title: 'Komentarz',
                templateUrl: 'modules/alerts/html/alert-comment.html'
            });
    }

    edit() {
        this.$alertDialog.open(this.alert);
    }

    remove() {
        this.$ask('Delete', 'Do you want to delete alert: {0}?', this.alert.title)
            .then(() => {
                this.$alerts
                    .remove(this.alert)
                    .then(() => {
                        this.$toast.info('Alert removed');
                        this.$state.go('alerts');
                    })
                    .catch((error) => {
                        this.$error.warning('Removing alert', error)
                    });
            })
    }

    refresh(){
        this.$alerts.get(<any>this.alert.id).then((result) => this.alert = result);
    }

    back() {
        this.$state.go('alerts');
    }
}

export default AlertViewController;
