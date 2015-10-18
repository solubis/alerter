/// <reference path="../../../typings/types.d.ts" />

import DictionaryItem from './DictionaryItem';
import BaseDictionaryEditController from './BaseDictionaryEditController';
import ProductService from './ProductService';
import MetadataService from './MetadataService';

/*@ngInject*/
class ProductEditController extends BaseDictionaryEditController {

    private globalMetadata;
    private productMetadata;
    private validationError;

    constructor(
        $scope,
        $q,
        $error,
        $toast,
        $utils,
        private $product: ProductService,
        private $metadata: MetadataService,
        private $ask,
        private $format,
        item: DictionaryItem) {

        super($scope, $q, $error, $toast, $utils, item, $product);

        this.globalMetadata = angular.copy($metadata.get());

        if (this.isNew) {
            this.productMetadata = [];
        } else {
            this.productMetadata = $product.getMetadata(item.code);
            this.globalMetadata = this.globalMetadata.filter((field) => !$utils.arraySearch(this.productMetadata, { code: field.code }));
        }

        $scope.$watchCollection(() => this.productMetadata, (newValue, oldValue) => {
            if (newValue && oldValue) {
                $scope.form.$setDirty()
            }
        });
    }

    removeElementFromProductMetadata(index) {
        this.productMetadata.splice(index, 1);
        if (!this.isNew) {
            this.validate();
        }
    }

    removeElementFromGlobalMetadata(index) {
        this.globalMetadata.splice(index, 1);
        if (!this.isNew) {
            this.validate();
        }
    }

    removeElement(index) {
        this.globalMetadata.push(this.productMetadata[index]);
        this.removeElementFromProductMetadata(index);
    }

    addElement(index) {
        this.productMetadata.push(this.globalMetadata[index]);
        this.removeElementFromGlobalMetadata(index);
    }

    validate() {
        var fields = this.productMetadata.map((item) => item.code);

        return this.$product.validateMetadata(this.item.code, fields)
            .then(() => {
                return this.validationError = null;
            })
            .catch((error) => {
                return this.validationError = this.$error.format(error);
            })
    }

    submitForm(form) {
        var result;
        var fields = this.productMetadata.map((item) => item.code);

        result = super
            .submitForm(form)
            .then((result) =>
                this.$product.updateMetadata(this.item.code, fields));

        return result;
    }

    saveChanges(form) {
        var save = () => {
            this.submitForm(form)
                .then(() => {
                    this.$scope.$close();
                    this.$toast.info('Record ({0}) saved', this.item.label);
                })
                .catch((error) => {
                    if (error.status === 409) {
                        this.$error.warning('Error saving dictionary', error);
                    }
                });
        };

        if (this.validationError) {
            this.$ask('Metadata change', '{0} <br> <br> <strong>{1}</strong>', this.validationError, 'Are you sure?')
                .then(() => save())
        } else {
            save();
        }
    }
}

export default ProductEditController;
