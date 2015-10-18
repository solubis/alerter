/// <reference path="../../../typings/types.d.ts" />

import DictionaryItem from './DictionaryItem';
import BaseDictionaryService from './BaseDictionaryService';

/*@ngInject*/ 
class ProductDictionaryService extends BaseDictionaryService {

    constructor($injector, private $metadata) {
        super($injector);

        this.name = 'product';
    }

    updateMetadata(code, metadata) {
        var request;

        request = this.$rest
            .put({
                command: 'product/' + code + '/metadata',
                data: metadata
            })
            .then((result) => {
                this.$rootScope.$broadcast('$dictionary:' + this.name + ':update', {code: code, metadata: result});

                this.init();

                return result.data;
            });

        return request;
    }

    validateMetadata(code, metadata) {
        var request;

        request = this.$rest
            .put({
                command: 'product/' + code + '/metadata/validate',
                data: metadata
            });

        return request;
    }

    getMetadata(code) {
        var fieldNames;
        var productMetadata = [];

        if (!code) {
            return [];
        }

        fieldNames = this.get(code).metadata;

        angular.forEach(fieldNames, (code) => {
            var fieldMetadata;

            fieldMetadata = this.$metadata.get(code);

            if (fieldMetadata) {
                productMetadata.push(fieldMetadata);
            }
        });

        return productMetadata;
    }
}

export default ProductDictionaryService;
