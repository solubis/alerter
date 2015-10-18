/// <reference path="../../typings/types.d.ts" />

/**
 * Filters
 */

var module = angular.module('modules.core.filters', ['modules.dictionaries'])

    /*
     Filters for displaying various data types using translation
     */

    .filter('category', ($dictionaries) => (value) => $dictionaries.get('category', value).label)

    .filter('product', ($dictionaries) => (value) => $dictionaries.get('product', value).label)

    .filter('priority', ($dictionaries) => (value) => $dictionaries.get('priority', value).label)

    .filter('link', ($dictionaries) => (value) => $dictionaries.get('linkType', value).label)

    .filter('state', ($dictionaries) => (value) => $dictionaries.get('state', value).label)

    .filter('tag', ($dictionaries) => (value) => $dictionaries.get('tag', value).label)

    .filter('priorityIcon', ($dictionaries) => (value) => $dictionaries.get('priority', value).name)

    .filter('stateClass', ($dictionaries) => (value) => $dictionaries.getClassForState(value))

export default module;
