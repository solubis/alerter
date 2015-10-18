/// <reference path="../../../typings/types.d.ts" />

import AlertService from '../../alerts/class/AlertService';
import DictionariesService from '../../dictionaries/class/DictionariesService';

/*@ngInject*/
class DashboardService {

    constructor(private $alerts:AlertService,
                private $q:ng.IQService,
                private $dictionaries:DictionariesService) {
    }

    getDictionariesStatistics() {
        var promises = [];
        var deffered = this.$q.defer();
        var result = {};
        var dict = this.$dictionaries.get();

        angular.forEach(['category', 'product', 'priority'], (dictionaryName)=> {
            result[dictionaryName] = {};

            angular.forEach(dict[dictionaryName], (value) => {
                result[dictionaryName][value.code] = {};

                var getTotalForDictionaryItem = (dictionaryName, item) => {
                    return this
                        .getCount({[dictionaryName]: item.code})
                        .then((count) => {
                            result[dictionaryName][item.code].total = count;
                        });
                };

                var getFinalizedForDictionaryItem = (dictionaryName, item) => {
                    return this
                        .getCount({[dictionaryName]: item.code, finalized: true})
                        .then((count) => {
                            result[dictionaryName][item.code].finalized = count;
                        });
                };

                promises.push(getTotalForDictionaryItem(dictionaryName, value));
                promises.push(getFinalizedForDictionaryItem(dictionaryName, value));
            })
        });

        this.$q.all(promises).then(() => {
            deffered.resolve(result);
        });

        return deffered.promise;
    }

    getCount(filter = {}) {
        return this.$alerts.count(filter).then((result) => result);
    }
}

export default DashboardService;
