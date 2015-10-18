/// <reference path="../../../typings/types.d.ts" />

import DictionaryItem from './DictionaryItem';
import BaseDictionaryService from './BaseDictionaryService';

/*@ngInject*/
class TagDictionaryService extends BaseDictionaryService {

    constructor($injector) {
        super($injector);

        this.name = 'tag';
    }

    public refresh() {
        return this.$dictionaries.init(this.name);
    }

    public find(query) {
        if (this.data){
            return this.searchInCache(query);
        } else {
            return this.refresh().then((result) => this.searchInCache(query))
        }
    }

    private searchInCache(query){
        var result = this.$utils.arrayFilter(this.data, {label:query}, false);
        return this.$q.resolve(result);
    }
}

export default TagDictionaryService;
