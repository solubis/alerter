/// <reference path="../../typings/types.d.ts" />

/**
 * Core module
 */

import directives from './directives';
import filters from './filters';

var module = angular.module('modules.core', [

    directives.name,
    filters.name

]);

export default module;
