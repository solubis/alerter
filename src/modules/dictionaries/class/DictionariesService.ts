/// <reference path="../../../typings/types.d.ts" />

/*
 Dictionaries service
 */

import DictionaryItem from './DictionaryItem';

/*@ngInject*/
class DictionariesService {

    private data: any = {};

    constructor(
        private $rest,
        private $translate) {
    }

    /*
     Translate dictionary labels using i18n
     */
    translate(data) {
        var result = {};

        angular.forEach(data, (item) => {
            item.name = item.label;
            item.label = this.$translate(item.label || item.code);

            result[item.code] = item;
        });

        return result;
    }

    translateAll(data) {
        var result = {};

        angular.forEach(data, (dictionary, name) => {
            result[name] = this.translate(dictionary);
        });

        return result;
    }

    /*
     Load all dictionaries or single one (name)
     */
    init(name = null) {
        var promise;

        if (name) {
            promise = this.$rest
                .get({
                    command: 'dictionary/' + name
                })
                .then((result) => {
                    this.data[name] = this.translate(result);

                    return this.data;
                });
        } else {
            promise = this.$rest
                .get({
                    command: 'dictionaries'
                })
                .then((result) => {
                    this.data = this.translateAll(result);

                    return this.data;
                });
        }

        return promise;
    }

    getClassForState(finalized: boolean): string {
        return finalized ? 'default' : 'info';
    }

    toArray() {
        var result = {};

        Object.keys(this.data).forEach((dictionary) => {
            var array;

            array = Object.keys(this.data[dictionary]).map((code) => {
                return this.data[dictionary][code];
            });

            result[dictionary] = array;
        });

        return result;
    }

    get(key = null, code = null) {
        var dict: any;

        if (!this.data) {
            return {};
        }

        if (!key) {
            return this.data;
        }

        dict = this.data[key];

        if (!dict) {
            return;
        }

        if (code) {
            /*
             Return single value for code
             */
            return dict[code];

        } else {
            /*
             Return dictionary
             */
            return dict;
        }
    }
}

export default DictionariesService;
