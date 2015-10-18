/// <reference path="../../../typings/types.d.ts" />

import DictionaryItem from './DictionaryItem';
import DictionariesService from './DictionariesService';

/*@ngInject*/
class BaseDictionaryService {

    protected $translate;
    protected $rootScope;
    protected $rest;
    protected $dictionaries;
    protected $q;
    protected $utils;

    public data:any[];
    public name:string;

    constructor(private $injector) {
        this.$translate = $injector.get('$translate');
        this.$rootScope = $injector.get('$rootScope');
        this.$q = $injector.get('$q');
        this.$rest = $injector.get('$rest');
        this.$utils = $injector.get('$utils');
        this.$dictionaries = $injector.get('$dictionaries');

        this.data = [];
    }

    /*
     Translate dictionary labels using i18n
     */
    translate(data) {
        angular.forEach(data, (item) => {
            item.name = item.label;
            item.label = this.$translate(item.label || item.code);
        });

        return data;
    }

    init() {
        var request;

        request = this.$rest
            .get({
                command: this.name
            })
            .then((result) => {
                this.data = this.translate(result);

                return result;
            });

        this.refresh();

        return request;
    }

    refresh() {
        this.$dictionaries.init(this.name);
    }

    get(code?) {
        var value = null;

        if (code === undefined) {
            return this.data;
        }

        for (var item of this.data) {
            if (item.code === code) {
                value = item;
            }
        }

        return value;
    }

    create(data:DictionaryItem) {
        var request;

        request = this.$rest
            .post({
                command: this.name,
                data: data
            })
            .then((result) => {
                this.$rootScope.$broadcast('$dictionary:' + this.name + ':create', result);

                this.init();

                return result.data;
            });

        return request;
    }

    update(code, data:DictionaryItem) {
        var request;

        request = this.$rest
            .put({
                command: this.name + '/' + code,
                data: data
            })
            .then((result) => {
                this.$rootScope.$broadcast('$dictionary:' + this.name + ':update', result);

                this.init();

                return result.data;
            });

        return request;
    }

    remove(data:DictionaryItem) {
        var request;

        request = this.$rest
            .remove({
                command: this.name + '/' + data.code,
            })
            .then(() => {
                this.$rootScope.$broadcast('$dictionary:' + this.name + ':remove', data);

                this.init();
            });

        return request;
    }
}

export default BaseDictionaryService;
