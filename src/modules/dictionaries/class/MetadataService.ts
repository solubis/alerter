/// <reference path="../../../typings/types.d.ts" />

import DictionaryItem from './DictionaryItem';
import BaseDictionaryService from './BaseDictionaryService';

/*@ngInject*/ 
class MetadataDictionaryService extends BaseDictionaryService {

    constructor($injector) {
        super($injector);

        this.name = 'metadata';
    }

    refresh(){}
}

export default MetadataDictionaryService;
