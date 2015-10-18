/// <reference path="../../../typings/types.d.ts" />

import DictionaryItem from './DictionaryItem';
import BaseDictionaryService from './BaseDictionaryService';

/*@ngInject*/ 
class CategoryDictionaryService extends BaseDictionaryService{

    constructor($injector) {
        super($injector);

        this.name = 'category';
    }

    refresh() {
        this.$dictionaries.init(this.name);
    }
}

export default CategoryDictionaryService;
