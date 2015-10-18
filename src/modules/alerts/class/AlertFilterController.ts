/// <reference path="../../../typings/types.d.ts" />

import Alert from './Alert';
import AlertService from './AlertService';
import AlertFilterService from './AlertFilterService';
import TagService from '../../dictionaries/class/TagService';

/*@ngInject*/
class AlertFilterController {

    private dict;
    private metadata;
    private fields = {
        staticFields: {},
        dynamicFields: {}
    };

    constructor(
        private $scope,
        private $tag: TagService,
        private $timeout: ng.ITimeoutService,
        private $alertFilter: AlertFilterService,
        private listFilter,
        private listCtrl) {

        /*
         Load metadata and select generate filter form
         */
        $alertFilter
            .getMetadata()
            .then((metadata) => {
                this.metadata = metadata;

                /*
                 Restore filter value from URL
                 */

                this.$alertFilter.restoreFilter(this.listFilter);

                this.fields = this.$alertFilter.getFields();

                this.dict = this.$alertFilter.getDictionaries();

                /*
                 Update list params with new filter
                 Timeout is for multiselect that selectes output model in next digest cycle
                 */

                this.$timeout(() => {
                    this.updateList();
                });
            });

        $scope.$on('$filter:clear', () => this.clearFilter());
    }

    isNotSelected(item) {
        return !item.selected;
    }

    fieldTypeIcon(type) {
        var map = {
            'date': 'md-event-note',
            'string': 'md-text-format',
            'number': 'md-filter-1',
            'boolean': 'md-check-box'
        };

        return map[type];
    }

    getField(code) {
        return this.$alertFilter.getMetadataField(code);
    }

    getTags(query) {
        return this.$tag.find(query);
    }

    removeFromDynamicFields(field) {
        this.$alertFilter.removeFromDynamicFields(field);
    }

    addToDynamicFields(field) {
        this.$alertFilter.addToDynamicFields(field);
    }

    updateList() {
        var filter: any;
        var filterDescription: any;
        var description: string;

        filterDescription = this.$alertFilter.getDescription();

        description = filterDescription.staticFields +
        (filterDescription.dynamicFields.length && filterDescription.staticFields.length ? ' <i class="md md-done"></i> ' : '') +
        filterDescription.dynamicFields;

        filter = this.$alertFilter.getFilter();

        this.listCtrl.updateFilter(filter, description);
    }

    clearFilter() {
        this.fields = this.$alertFilter.clearFilter();
        this.$timeout(() => this.updateList());
    }

}

export default AlertFilterController;
