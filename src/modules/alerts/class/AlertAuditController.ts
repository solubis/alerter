/// <reference path="../../../typings/types.d.ts" />

import Alert from './Alert';
import AlertService from './AlertService';

var _total = 0;
var _filter;
var _params = {
    page: 1,
    count: 10,
    sorting: {
        id: 'desc'
    }
};

/*@ngInject*/ 
class AlertAuditController {

    tableParams:any;
    isLoading:boolean;
    data:Alert[];
    dict:any;
    filter:any;
    id:number;

    constructor(private $scope,
                private $stateParams,
                private $alerts:AlertService,
                private ngTableParams) {

        this.id = parseInt($stateParams.id);

        this.tableParams = new ngTableParams(_params, {
            counts: [10, 50, 100],
            total: _total,
            filterDelay: 0,
            getData: ($defer, params) => {
                var page = params.page() - 1;
                var count = params.count();

                this.isLoading = true;

                _params.page = page + 1;
                _params.count = count;

                $alerts
                    .audit(this.id, page, count)
                    .then((result) => {
                        this.data = result.content;

                        _total = result.totalElements;

                        params.total(_total);

                        $defer.resolve(this.data);
                    })
                    .finally(() => {
                        this.isLoading = false;
                    });
            }
        });

        $scope.$on('$alerts:update', (alert) => this.tableParams.reload());
        $scope.$on('$alerts:link', (alert) => this.tableParams.reload());
        $scope.$on('$alerts:attachment', (alert) => this.tableParams.reload());
    }
}

export default AlertAuditController;
