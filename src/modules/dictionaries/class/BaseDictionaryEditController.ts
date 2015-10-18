/// <reference path="../../../typings/types.d.ts" />

import DictionaryItem from './DictionaryItem';
import BaseDictionaryService from './BaseDictionaryService';

/*@ngInject*/ 
class BaseDictionaryEditController {
    isNew:boolean;

    constructor(protected $scope,
                protected $q,
                protected $error,
                protected $toast,
                protected $utils,
                protected item:DictionaryItem,
                private $service:BaseDictionaryService) {

        this.isNew = item === undefined;
        this.item = angular.copy(item);
    }

    submitForm(form) {
        var changes = this.$utils.formChanges(form, this.item);

        if (this.$utils.isEmpty(changes)) {
            return this.$q.when();
        }

        if (this.isNew) {
            return this.$service.create(changes);
        } else {
            return this.$service.update(this.item.code, changes);
        }
    }

    saveChanges(form) {
        this.submitForm(form)
            .then(() => {
                this.$scope.$close();
                this.$toast.info('Record ({0}) saved', this.item.label || this.item.code);
            })
            .catch((error) => {
                if (error.status === 409) {
                    this.$error.warning('Error saving dictionary', error);
                } else {
                    this.$error.critical(error);
                }
            });
    }
}

export default BaseDictionaryEditController;
