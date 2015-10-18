/// <reference path="../../../typings/types.d.ts" />

import DictionaryItem from './DictionaryItem';
import BaseDictionaryEditController from './BaseDictionaryEditController';
import MetadataService from './MetadataService';

/*@ngInject*/ 
class MetadataEditController extends BaseDictionaryEditController {

    private metadata;
    private fields;

    constructor($scope,
                $q,
                $error,
                $toast,
                $utils,
                item:DictionaryItem,
                $metadata:MetadataService) {

        super($scope, $q, $error, $toast, $utils, item, $metadata);
    }
}

export default MetadataEditController;
