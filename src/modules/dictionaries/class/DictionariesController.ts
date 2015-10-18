/// <reference path="../../../typings/types.d.ts" />

import DictionaryItem from './DictionaryItem';
import BaseDictionaryService from './BaseDictionaryService';

interface Dictionary {
    name: string;
    label: string;
    service: BaseDictionaryService;
    editTemplateURL: string;
    extraColumns: any[]
}

/*@ngInject*/
class DictionariesController {

    static selectedDictionary = 'product';

    private tableParams: any;
    private isLoading: boolean;
    private dictionary: Dictionary;
    private dictionaries: any = {};
    private data: DictionaryItem[] = [];

    constructor(private $scope,
        private $dialog,
        private $ask,
        private $toast,
        private $injector,
        private $error,
        private $state,
        private ngTableParams) {
        /*
         Register dictionaries
         */

        this.registerDictionary({
            name: 'product',
            label: 'Products',
            service: this.$injector.get('$product'),
            editTemplateURL: 'modules/dictionaries/html/product-edit.html',
            extraColumns: []
        });

        this.registerDictionary({
            name: 'category',
            label: 'Categories',
            service: this.$injector.get('$category'),
            editTemplateURL: 'modules/dictionaries/html/category-edit.html',
            extraColumns: [{
                code: 'workflowName',
                label: 'Workflow'
            }]
        });

        this.registerDictionary({
            name: 'metadata',
            label: 'Dynamic fields',
            service: this.$injector.get('$metadata'),
            editTemplateURL: 'modules/dictionaries/html/field-edit.html',
            extraColumns: [{
                code: 'type',
                label: 'Data type'
            }]
        });

        this.registerDictionary({
            name: 'tag',
            label: 'Tags',
            service: this.$injector.get('$tag'),
            editTemplateURL: 'modules/dictionaries/html/tag-edit.html',
            extraColumns: []
        });

        /*
         Restore selected dictionary from URL params
         */
        if ($state.current.type) {
            this.selectDictionary($state.current.type);
        }
    }

    private registerDictionary(config: Dictionary) {
        this.dictionaries[config.name] = config;
    }

    selectDictionary(name) {
        this.dictionary = this.dictionaries[name];

        this.isLoading = true;

        this.registerListeners();

        this.dictionary.service
            .init()
            .then((result) => {
                this.data = result;
                this.tableParams = new this.ngTableParams({ count: this.data.length }, { counts: [] });
            })
            .finally(() => {
                this.isLoading = false;
            });

        /*
         Remember in static variable for future use
         */

        DictionariesController.selectedDictionary = name;
    }

    getExtraColumnValue(code, index) {
        return this.data[index][code];
    }

    registerListeners() {
        this.$scope.$on('$dictionary:' + this.dictionary.name + ':update', (event, record) => {
            this.data.forEach((item) => {
                if (item.code === record.code) {
                    angular.extend(item, record);
                }
            })
        });

        this.$scope.$on('$dictionary:' + this.dictionary.name + ':create', (event, record) => {
            this.data.unshift(record);
        });

        this.$scope.$on('$dictionary:' + this.dictionary.name + ':remove', (event, record) => {
            var index;

            index = this.data.indexOf(record);

            if (index >= 0) {
                this.data.splice(index, 1);
            }
        })
    }

    open(item: DictionaryItem) {
        var camelName = this.dictionary.name.charAt(0).toUpperCase() + this.dictionary.name.slice(1);

        return this.$dialog.open(
            /*@ngInject*/
            {
                templateUrl: this.dictionary.editTemplateURL,
                backdrop: 'static',
                controller: camelName + 'EditController as ctrl',
                resolve: {
                    item: () => item
                },
                size: 'lg'
            })
    }

    remove(item) {
        this.$ask('Delete', 'Do you want to delete: {0}?', item.code)
            .then(() => {
                this.dictionary.service
                    .remove(item)
                    .then(() => {
                        this.$toast.info('Dictionary {0} deleted', item.code);
                    })
                    .catch((error) => {
                        if (error.status === 409) {
                            this.$error.warning('Delete error', error);
                        }
                    });
            })
    }
}

export { DictionariesController, Dictionary};
export default DictionariesController;
