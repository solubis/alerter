/// <reference path="../../../typings/types.d.ts" />

import Alert from './Alert';
import AlertService from './AlertService';
import AlertFilterController from './AlertFilterController';

/*@ngInject*/
class AlertListController {
    /*
     Remember params to use it when return from another state
     */
    static params = {
        total: 0,
        page: 1,
        count: 50,
        sorting: {
            modificationDate: 'desc'
        },
        filter: null
    };

    static saveParams(params) {
        AlertListController.params = {
            total: params.total(),
            sorting: params.sorting(),
            page: params.page(),
            count: params.count(),
            filter: params.filter()
        }
    }

    private tableParams: any;
    private isLoading = true;
    private isStarting = true;
    private data: any[] = [];
    private filter: any;
    private selectionMode = false;
    private selectionCount = 0;
    private productionCount = 0;
    private sidebar;
    private filterDescription;
    private total: number;
    private lastRecordNumber: number;
    private firstRecordNumber: number;
    private allSelected;

    constructor(
        private $scope,
        private $q,
        private $alerts: AlertService,
        private $security,
        private $timeout,
        private $ask,
        private $alertDialog,
        private $dialog,
        private $sidebar,
        private $toast,
        private $error,
        private $format,
        private $dictionaries,
        private ngTableParams) {

        this.tableParams = new ngTableParams();

        this.selectionMode = false;

        this.sidebar = $sidebar.create({
            templateUrl: 'modules/alerts/html/alert-filter-sidebar.html',
            scope: $scope,
            controller: AlertFilterController,
            controllerAs: 'ctrl',
            resolve: {
                listCtrl: () => {
                    return this;
                },
                listFilter: AlertListController.params.filter
            },
            side: 'right'
        });

        $scope.$on('$alerts:update', (event, alert) => {
            this.data.forEach((item) => {
                if (item.id === alert.id) {
                    angular.extend(item, alert);
                    this.select(item, false);
                }
            })
        });

        $scope.$on('$alerts:add', (event, alert) => {
            this.data.unshift(alert);
        });

        $scope.$on('$alerts:remove', (event, alert) => {
            this.select(alert, false);
            this.data.splice(this.data.indexOf(alert), 1);
        });

        $scope.$on('$alerts:reload', (event, data) => {
            this.reload();
        });

        $scope.$watch(() => this.selectionCount, (count) => {
            this.allSelected = count && (count === this.data.length);
            this.selectionMode = count > 0;
        });
    }

    getData = ($defer, params) => {
        var page = params.page() - 1;
        var count = params.count();
        var filter = params.filter();
        var sorting = params.sorting();

        this.isLoading = true;

        this.$alerts
            .get({ page: page, itemsPerPage: count, filter: filter, sort: sorting })
            .then((result) => {
                params.total(result.totalElements);

                this.data = result.content;
                this.total = result.totalElements;
                this.firstRecordNumber = result.number * result.size + 1;
                this.lastRecordNumber = this.firstRecordNumber + result.numberOfElements - 1;

                $defer.resolve(this.data);
            })
            .finally(() => {
                this.isLoading = false;
                this.isStarting = false;
                this.selectionCount = 0;

                AlertListController.saveParams(params);
            });
    };

    updateFilter(filter, description) {
        this.filterDescription = description;

        this.tableParams.settings({
            counts: [10, 50, 100],
            total: AlertListController.params.total,
            filterDelay: 0,
            getData: this.getData
        });

        AlertListController.params.filter = filter;

        this.tableParams.parameters(AlertListController.params);

        this.selectAll(false);
    }

    clearFilter() {
        this.$scope.$broadcast('$filter:clear');
    }

    remove(alert) {
        this.$ask('Delete', 'Do you want to delete alert: {0}?', alert.title)
            .then(() => {
                this.$alerts
                    .remove(alert)
                    .then(() => {
                        this.$toast.info('Alert removed');
                    })
                    .catch((error) => {
                        if (error.status === 409) {
                            this.$error.warning('Removing alert', error);
                        }
                    })
            })
    }

    hasPermissionToEdit(alert) {
        return !alert.finalized && (
            this.$security.authorize('ALERTER_ALERT_EDIT_FOREIGN') ||
            (this.$security.authorize('ALERTER_ALERT_EDIT_OWN') && this.$security.owner(alert.assignee.userLogin))
        )
    }

    edit(alert) {
        this.$alertDialog.open(alert);
    }

    reload() {
        this.$dictionaries.init();
        this.tableParams.reload();
    }

    onSelectionChange() {
        this.productionCount = 0;
        this.selectionCount = 0;

        angular.forEach(this.data, (item) => {
            if (item.isSelected) {
                this.selectionCount++;

                if (!item.testMode) {
                    this.productionCount++;
                }
            }
        });

        this.selectionMode = this.selectionCount > 0;
    }

    select(alert, flag) {
        if (Boolean(alert.isSelected) == flag) {
            return;
        }

        alert.isSelected = flag;

        this.onSelectionChange();
    }

    selectAll(flag) {
        angular.forEach(this.data, (item) => {
            this.select(item, flag)
        });
    }

    executeForSelected(action: Function) {
        var promises = [];
        var successCount = 0;
        var lastError;
        var lastErrorId;

        angular.forEach(this.data, (item) => {
            var promise;

            if (item.isSelected) {
                promise = action(item)
                    .then(() => {
                        successCount++;
                    })
                    .catch((error) => {
                        lastError = error;
                        lastErrorId = item.id;
                    });

                promises.push(promise);
            }
        });

        this.$q
            .all(promises)
            .then((result) => {
                if (lastError) {
                    this.$error.warning(this.$format('Error for alert id: {0}', lastErrorId), lastError);
                }
                this.$toast.info('Group operation success for {0} alerts', successCount);
                this.$timeout(() => this.$alerts.broadcast('reload'));
            });
    }

    removeSelected() {
        this.$ask('Delete selected', 'Do you want to delete {0} selected records?', this.selectionCount)
            .then(() => {
                this.executeForSelected((alert) => this.$alerts.remove(alert));
            })
    }

    editSelected() {
        var listCtrl = this;

        this.$dialog.open(
            /*@ngInject*/
            {
                templateUrl: 'modules/alerts/html/alert-selected.html',
                controller: function($scope: any, $dictionaries, $alerts: AlertService, $security, $utils) {
                    this.title = 'Edit selected';
                    this.comment = '';
                    this.acceptButtonLabel = 'Save for selected';
                    this.testModeEnabled = listCtrl.productionCount <= 0;
                    this.dict = $dictionaries.get();
                    this.data = { testMode: this.testModeEnabled };

                    $alerts.getOrganisation()
                        .then((result) => {
                            this.organisation = result;
                            this.organisation.getUserGroups($security.getUserLogin());
                        });

                    $scope.$watch(() => this.data.assignee, (assignee) => {
                        if (assignee && this.organisation && !assignee.assignable) {
                            this.foreignAssignee = true;
                        } else {
                            this.foreignAssignee = false;
                        }

                        if (!assignee && (this.testMode === undefined || this.testMode === true) && $scope.form.priority.$pristine && !this.comment.trim()) {
                            $scope.form.$setPristine();
                        }
                    });

                    this.accept = function() {
                        let changes = $utils.formChanges($scope.form, this.data);
                        let comment = this.comment && this.comment.trim();

                        $scope.$close();

                        if (comment) {
                            changes['comment'] = comment;
                        }

                        if (Object.keys(changes).length > 0) {
                            listCtrl.executeForSelected((alert) => $alerts.update(alert.id, changes));
                        }
                    };
                },
                controllerAs: 'ctrl',
                backdrop: 'static'
            }
        );
    }
}

export default AlertListController;
