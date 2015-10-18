/// <reference path="../../../typings/types.d.ts" />

import DashboardService from './DashboardService';

/*@ngInject*/
class DashboardController {

    private stats:any = {};

    constructor(private $scope,
                private $q,
                private $dashboard,
                private $error) {

        $dashboard
            .getCount()
            .then((count) => this.stats.total = count)
            .then(() => {
                return $dashboard.getCount({finalized: true}).then((count) => {
                    this.stats.finalized = count;
                    this.stats.finalizedPercent = Math.round(this.stats.finalized / this.stats.total * 100);
                    this.stats.activePercent = Math.round((this.stats.total - this.stats.finalized) / this.stats.total * 100);
                })
            })
            .then(() => {
                return $dashboard.getCount({testMode: true}).then((count) => {
                    this.stats.testMode = count;
                    this.stats.testModePercent = Math.round(this.stats.testMode / this.stats.total * 100);
                });
            })
            .then(() => {
                return $dashboard.getCount({testMode: true, finalized:true}).then((count) => {
                    this.stats.testModeFinalized = count;
                });
            });

        $dashboard.getDictionariesStatistics().then((result) => {
            this.stats.dictionaries = result;
        });
    }

    getPercent(value){
        return Math.round(value / this.stats.total * 100);
    }

}

export default DashboardController;
