/// <reference path="../../typings/types.d.ts" />

import MenuController from './class/MenuController';

var module = angular
    .module('modules.menu', [
        'modules.dictionaries',
        'modules.alerts'
    ])
    .controller('MenuController', MenuController);

export default module;
