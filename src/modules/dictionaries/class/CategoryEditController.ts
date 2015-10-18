/// <reference path="../../../typings/types.d.ts" />

import DictionaryItem from './DictionaryItem';
import BaseDictionaryEditController from './BaseDictionaryEditController';
import CategoryService from './CategoryService';
import WorkflowService from '../../workflow/class/WorkflowService';
import WorkflowDefiniton from '../../workflow/class/WorkflowDefinition';
import DictionariesService from './DictionariesService';

/*@ngInject*/
class CategoryEditController extends BaseDictionaryEditController {

    private workflows: WorkflowDefiniton[];

    constructor(
        $scope,
        $q,
        $error,
        $toast,
        $utils,
        item: any,
        $category: CategoryService,
        $dictionaries: WorkflowService) {

        /* Hack for ngOptions requirement for string value */
        if (item) {
            item.workflowId = '' + item.workflowId;
        }

        super($scope, $q, $error, $toast, $utils, item, $category);



        this.workflows = $dictionaries.get().workflow;
    }
}

export default CategoryEditController;
