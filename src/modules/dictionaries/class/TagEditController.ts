/// <reference path="../../../typings/types.d.ts" />

import DictionaryItem from './DictionaryItem';
import BaseDictionaryEditController from './BaseDictionaryEditController';
import TagService from './TagService';

/*@ngInject*/ 
class TagEditController extends BaseDictionaryEditController {

    constructor($scope,
                $q,
                $error,
                $toast,
                $utils,
                $tag:TagService,
                item:DictionaryItem) {

        super($scope, $q, $error, $toast, $utils, item, $tag );
    }
}

export default TagEditController;
