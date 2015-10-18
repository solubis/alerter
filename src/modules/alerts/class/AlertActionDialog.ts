/// <reference path="../../../typings/types.d.ts" />

// TODO Refactor

import Alert from './Alert';
import AlertService from './AlertService';

/*@ngInject*/
class AlertActionDialog {

    constructor(private $dialog) {
    }

    open(config) {
        var modalInstance;

        modalInstance = this.$dialog.open(
            /*@ngInject*/
            {
                templateUrl: config.templateUrl,
                controller: function($scope: any, $dictionaries, $timeout, $error, $translate, $toast, $alerts: AlertService, $security, $state, $utils, $q) {
                    this.data = config.data;
                    this.title = $translate(config.title);
                    this.comment = '';
                    this.dict = $dictionaries;
                    this.acceptButtonLabel = config.acceptButtonLabel || 'Accept';

                    $scope.$watch(() => this.data.assignee, (assignee) => {
                        if (assignee && this.organisation && !assignee.assignable) {
                            $scope.foreignAssignee = true;
                        } else {
                            $scope.foreignAssignee = false;
                        }
                    })

                    this.accept = function() {
                        let changes = $utils.formChanges($scope.form, this.data);
                        let comment = this.comment && this.comment.trim();
                        let update = $q.when();

                        if ($scope.form.$invalid) {
                            return;
                        }

                        if (comment) {
                            changes['comment'] = comment;
                        }

                        if (!config.noUpdate && Object.keys(changes).length > 0) {
                            update = $alerts.update(this.data.id, changes)
                        }

                        if (changes.assignee && !changes.assignee.assignable) {
                            $state.go('alerts');
                            $timeout(() => $alerts.broadcast('reload'));
                        }

                        update
                            .then(() => {
                                if (config.action && typeof config.action === 'function') {
                                    return config.action(changes);
                                }
                            })
                            .catch((error) => {
                                $error.warning(error);
                            })
                            .finally(() => {
                                $scope.$close();
                            });

                    };

                    var getOrganisation = () => {
                        $alerts
                            .getOrganisation()
                            .then((result) => {
                                this.organisation = result;
                                this.organisation.getUserGroups($security.getUserLogin());
                            });
                    };

                    $timeout(getOrganisation, 1000);
                },
                resolve: {
                    organisation: ($alerts) => $alerts.getOrganisation()
                },
                controllerAs: 'ctrl',
                backdrop: 'static',
                size: 'sm'
            }
        );

        return modalInstance.result;
    }

}

export default AlertActionDialog;
