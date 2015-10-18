/// <reference path="../../typings/types.d.ts" />

import DictionariesService from './class/DictionariesService';
import DictionariesController from './class/DictionariesController';
import ProductService from './class/ProductService';
import ProductEditController from './class/ProductEditController';
import CategoryService from './class/CategoryService';
import CategoryEditController from './class/CategoryEditController';
import MetadataService from './class/MetadataService';
import MetadataEditController from './class/MetadataEditController';
import TagService from './class/TagService';
import TagEditController from './class/TagEditController';

var module = angular
    .module('modules.dictionaries', ['dndLists', 'ui.router', 'ui.translate', 'ngTagsInput'])
    .config(($stateProvider, tagsInputConfigProvider: any) => {

        /* TODO Refactor */

        $stateProvider

            .state('product', {
                parent: 'app',
                url: '/product',
                type: 'product',
                controller: 'DictionariesController as ctrl',
                templateUrl: 'modules/dictionaries/html/dictionaries.html',
                resolve: {
                    metadata: ($metadata) => $metadata.init()
                },
                access: {
                    requiredPermissions: ['ALERTER_ADMIN', 'ALERTER_ADMIN_MANAGE_PRODUCT']
                }
            })

            .state('metadata', {
                parent: 'app',
                url: '/metadata',
                type: 'metadata',
                controller: 'DictionariesController as ctrl',
                templateUrl: 'modules/dictionaries/html/dictionaries.html',
                access: {
                    requiredPermissions: ['ALERTER_ADMIN', 'ALERTER_ADMIN_MANAGE_DYNAMIC']
                }
            })

            .state('tag', {
                parent: 'app',
                url: '/tag',
                type: 'tag',
                controller: 'DictionariesController as ctrl',
                templateUrl: 'modules/dictionaries/html/dictionaries.html',
                access: {
                    requiredPermissions: ['ALERTER_ADMIN', 'ALERTER_ADMIN_MANAGE_TAG']
                }
            })

            .state('category', {
                parent: 'app',
                url: '/category',
                type: 'category',
                controller: 'DictionariesController as ctrl',
                templateUrl: 'modules/dictionaries/html/dictionaries.html',
                access: {
                    requiredPermissions: ['ALERTER_ADMIN', 'ALERTER_ADMIN_MANAGE_CATEGORY']
                }
            });

        tagsInputConfigProvider
            .setDefaults('tagsInput', {
                minLength: 1,
                addFromAutocompleteOnly: true,
                displayProperty: 'label',
                keyProperty: 'code',
                replaceSpacesWithDashes: false,
                addOnEnter: true
            })
            .setDefaults('autoComplete', {
                maxResultsToShow: 100,
                minLength: 1,
                debounceDelay: 200,
                loadOnDownArrow: true,
                loadOnEmpty: true,
                loadOnFocus: true
            });
    })

    .filter('dict', ($dictionaries) => (value, param) => $dictionaries.get(param, value).label)

    .service('$product', ProductService)
    .service('$metadata', MetadataService)
    .service('$category', CategoryService)
    .service('$dictionaries', DictionariesService)
    .service('$tag', TagService)

    .controller('ProductEditController', ProductEditController)
    .controller('CategoryEditController', CategoryEditController)
    .controller('MetadataEditController', MetadataEditController)
    .controller('TagEditController', TagEditController)
    .controller('DictionariesController', DictionariesController);

export default module;
