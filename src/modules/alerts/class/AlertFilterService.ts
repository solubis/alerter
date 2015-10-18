/// <reference path="../../../typings/types.d.ts" />

// TODO Componentize and Refactor

import Alert from './Alert';
import AlertService from './AlertService';
import DictionariesService from '../../dictionaries/class/DictionariesService';
import MetadataService from '../../dictionaries/class/MetadataService';

interface FieldDefinition {
    code: string,
    label: string,
    description: string,
    type: string,
    isStatic: boolean,
    selected?: boolean
}

/*@ngInject*/
class AlertFilterService {

    static staticMetadata:FieldDefinition[] = [
        {
            code: 'title',
            label: 'Title',
            description: 'Title',
            type: 'string',
            isStatic: true
        },
        {
            code: 'creationDate',
            label: 'Creation date',
            description: 'Creation date',
            type: 'date',
            isStatic: true
        },
        {
            code: 'modificationDate',
            label: 'Modification date',
            description: 'Modification date',
            type: 'date',
            isStatic: true
        },
        {
            code: 'finalizeDate',
            label: 'Finalize date',
            description: 'Date of changing alert state to final',
            type: 'date',
            isStatic: true
        },
        {
            code: 'testMode',
            label: 'Test mode',
            description: 'Test mode',
            type: 'boolean',
            isStatic: true
        },
        {
            code: 'finalized',
            label: 'Final state',
            description: 'Final state',
            type: 'boolean',
            isStatic: true
        }
    ];

    private dict:any;
    private metadata:FieldDefinition[];
    private staticFields:any = {};
    private dynamicFields:any = {};

    constructor(private $location: ng.ILocationService,
                private $translate: any,
                private $dictionaries: DictionariesService,
                private $utils,
                private $settings,
                private $metadata:MetadataService) {

        /*
         Load dictionaries
         */

        this.dict = this.$dictionaries.toArray();
    }

    /**
     * Get available dynamic and static fields definition
     * @returns {ng.IPromise<TResult>}
     */

    getMetadata() {
        return this.$metadata
            .init()
            .then((metadata) => {
                var selectedFields;

                /*
                 Exclude 'text' fields from list of all fields
                 */

                this.metadata = AlertFilterService.staticMetadata.concat(metadata.filter((item) => item.type !== 'text'));

                /*
                 Select fields saved in local storage
                 */
                selectedFields = this.$settings.get('filterFields') || [];

                this.selectMetadataFields(selectedFields);

                return this.metadata;
            })

    }

    /**
     * Get dictionaries for dropdowns
     * @returns {any}
     */
    getDictionaries():any {
        return this.dict;
    }

    /**
     * Get static and dynamic fields
     * @returns {{staticFields: any, dynamicFields: any}}
     */
    getFields():any {
        return {
            staticFields: this.staticFields,
            dynamicFields: this.dynamicFields
        }
    }

    /**
     * Get field definition by code
     * @param code
     * @returns {FieldDefinition}
     */
    getMetadataField(code):FieldDefinition {
        return this.$utils.arraySearch(this.metadata, {code:code});
    }

    /**
     * Select metadata fields based on names array
     * @param fieldNames
     */
    selectMetadataFields(fieldNames) {
        angular.forEach(this.metadata, (value) => {
            if (fieldNames.indexOf(value.code) >= 0) {
                value.selected = true;
            }
        });
    }

    /**
     * Save selected fields in local storage
     */
    storeSelectedFields() {
        var selectedFields = [];

        angular.forEach(this.metadata, function (field) {
            if (field.selected) {
                selectedFields.push(field.code);
            }
        });

        this.$settings.set('filterFields', selectedFields);
    }

    /**
     * Remove field from dynamic fields
     * @param field
     */
    removeFromDynamicFields(field) {
        field.selected = false;

        /*
         Save selected fields to local storage
         */

        this.storeSelectedFields();

        /*
         Delete field from filter
         */

        if (this.dynamicFields && angular.isDefined(this.dynamicFields[field.code])) {
            delete this.dynamicFields[field.code];
        }
    }

    /**
     * Add field to dynamic fields
     * @param field
     */
    addToDynamicFields(field) {
        field.selected = true;

        /*
         Save selected fields to local storage
         */

        this.storeSelectedFields();
    }

    /**
     * Get string representation of filter
     * @returns {{staticFields: string, dynamicFields: string}}
     */
    getDescription() {
        var getFieldsDescription = (filter) => {
            var description:string = '';

            angular.forEach(filter, (value, name) => {
                var first;
                var from;
                var to;
                var field;

                if (value === null || angular.isUndefined(value)) {
                    return;
                }

                field = this.getMetadataField(name);

                if ((angular.isArray(value) ? value.length : angular.isDefined(value))) {

                    description += (description ? ' <i class="md md-done"></i> ' : '') + '<strong>' + this.$translate(name) + '</strong> : ';
                    first = true;

                    if (angular.isArray(value)) {

                        angular.forEach(value, (item) => {
                            description += (first ? '' : ', ') + item.label;
                            first = false;
                        })

                    } else if (angular.isDefined(value.from) || angular.isDefined(value.to)) {

                        if (field.type === 'date') {
                            from = this.$utils.formatDate(value.from);
                            to = this.$utils.formatDate(value.to);
                        } else {
                            from = value.from;
                            to = value.to;
                        }

                        if (from || to) {
                            description += (value.from ? '> ' + from : '') + (value.to ? ' < ' + to : '')
                        }

                    } else {
                        description += this.$translate(value);
                    }
                }
            });

            return description;
        };

        return {
            staticFields: getFieldsDescription(this.staticFields),
            dynamicFields: getFieldsDescription(this.dynamicFields)
        }
    }

    /**
     * Get filter object
     * @returns {any}
     */
    getFilter() {
        var filter:any = {};
        /*
         Collect dictionary selection
         */

        angular.forEach(this.staticFields, (value, key) => {
            filter[key] = value.map((item) => item.code);
        });

        /*
         Collect filter values from selected fields
         */

        angular.forEach(this.dynamicFields, (value, key) => {

            if (value === null || !angular.isDefined(value)) {
                return;
            }

            if (angular.isDefined(value.from) || angular.isDefined(value.to)) {

                if (value.from || value.to) {
                    filter[key] = [];

                    if (value.from) {
                        filter[key].push('>' + value.from)
                    }

                    if (value.to) {
                        filter[key].push('<' + value.to)
                    }
                }

            } else {
                filter[key] = value;
            }
        });

        this.$location.search(filter);

        return filter;
    }

    clearFilter():any {
        /*
         Clear dynamic fields
         */
        this.dynamicFields = {};

        /*
         Clear static fields
         */

        angular.forEach(['category', 'product', 'state', 'priority'], (dictionary) => {
            angular.forEach(this.dict[dictionary], (item) => {
                item.selected = false;
            });
        });

        /*
         Clear tags
         */

        this.staticFields.tag = [];

        return this.getFields();
    }

    /**
     * Restore filter from URL and/or saved value in Alert List
     * @param savedFilter
     */
    restoreFilter(savedFilter) {
        var filter:any = {};

        this.clearFilter();

        if (savedFilter && !this.$location.search()) {
            this.$location.search(savedFilter);
        }

        /*
         Restore values from URL converting single objects to arrays to ease further management
         */

        angular.forEach(this.$location.search(), (item, key) => {
            if (angular.isArray(item)) {
                filter[key] = item;
            } else {
                filter[key] = [item];
            }
        });

        /*
         Select dictionary fields
         */
        function selectDictionaryValue(dictionary, code) {
            for (var item of dictionary) {
                if (item.code === code) {
                    item.selected = true;
                }
            }
        }

        angular.forEach(['category', 'product', 'state', 'priority'], (dictionary) => {
            angular.forEach(filter[dictionary], (item) => {
                selectDictionaryValue(this.dict[dictionary], item);
            });

            /*
             Delete already selected values so next phase will not be polluted by it
             */

            delete filter[dictionary];
        });

        this.staticFields.tag = [];

        angular.forEach(filter['tag'], (item) => {
            this.staticFields.tag.push(this.$dictionaries.get('tag', item));
        });

        /*
         Delete already selected values so next phase will not be polluted by it
         */

        delete filter['tag'];

        /*
         Restore metadata fields (static and dynamic)
         */

        this.selectMetadataFields(Object.keys(filter));

        /*
         Restore values for fields in filter
         */

        var getTypedValue = (key, value):any => {
            var field = this.$utils.arraySearch(this.metadata, {code:key});

            if (field.type === 'boolean') {
                return value === true || value === "true";
            } else if (field.type === 'number' || field.type === 'date') {
                return parseInt(value, 10);
            } else {
                return value;
            }
        };

        this.dynamicFields = {};

        angular.forEach(filter, (item, key) => {

            if (!this.$utils.arraySearch(this.metadata, {code:key})) {
                return;
            }

            this.dynamicFields[key] = {};

            angular.forEach(item, (value) => {
                if (value[0] === '<') {
                    this.dynamicFields[key].to = getTypedValue(key, value.substring(1));
                } else if (value[0] === '>') {
                    this.dynamicFields[key].from = getTypedValue(key, value.substring(1));
                } else {
                    this.dynamicFields[key] = getTypedValue(key, value);
                }
            })
        });
    }
}

export default AlertFilterService;
