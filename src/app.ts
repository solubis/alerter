/// <reference path="typings/types.d.ts" />

import alerts from './modules/alerts/alerts';
import dashboard from './modules/dashboard/dashboard';
import workflow from './modules/workflow/workflow';
import dictionaries from './modules/dictionaries/dictionaries';
import menu from './modules/menu/menu';
import core from './modules/core/core';

angular.module('squealer', ['fds.ui', 'fds.core', 'modules.html',
    core.name, alerts.name, dictionaries.name, workflow.name, dashboard.name, menu.name])

    .config(($urlRouterProvider, $stateProvider, $configProvider, $logProvider, $restProvider, $oauthTokenProvider, $translateProvider, $securityProvider, $hotkeysProvider) => {
        var config = $configProvider.$get();
        var $translate = $translateProvider.$get();

        $logProvider.debugEnabled(config.debugEnabled);

        $restProvider.configure(config);
        $securityProvider.configure(config);
        $oauthTokenProvider.configure(config);

        /**
         UI Router bug workaround for:
         https://github.com/angular-ui/ui-router/issues/600
         */
        $urlRouterProvider.otherwise(($injector) => {
            $injector.get('$state').go('alerts');
        });

        $stateProvider
            .state('app', {
                abstract: true,
                template: '<div ui-view></div>',
                resolve: {
                    version: ($rest) => $rest.init(),
                    dictionaries: ($dictionaries) => $dictionaries.init(),
                    product: ($product) => $product.init(),
                    tag: ($tag) => $tag.init()
                }
            })

        $hotkeysProvider.useNgRoute = false;
        $hotkeysProvider.templateTitle = $translate('Keyboard Shortcuts:');
        $hotkeysProvider.cheatSheetDescription = $translate('Show / hide this help menu');
    })

    .run(($log, $rootScope, $window, $document, $config, $error, $translate, $state, $toast, $alertDialog, $timeout, $security, $hotkeys) => {

        /*
        Hotkeys
        */
        if ($security.authorize('ALERTER_ALERT_CREATE')) {
            $hotkeys
                .add({
                    combo: 'a',
                    description: $translate('Add alert'),
                    callback: () => $alertDialog.open()
                });
        }

        $hotkeys
            .add({
                combo: 's',
                description: $translate('Search for alert'),
                callback: function(event, hotkey) {
                    $document.find('#top-search > a')[0].click();
                    /* Prevent adding 's' to search input box */
                    event.preventDefault();
                }
            });

        if ($security.authorize('ALERTER_ALERT_LIST')) {
            $hotkeys
                .add({
                    combo: '/',
                    description: $translate('Goto alerts list'),
                    callback: function(event, hotkey) {
                        $state.go('alerts');
                    }
                });
        }

        $hotkeys
            .add({
                combo: 'f',
                description: $translate('Goto filters list'),
                callback: function(event, hotkey) {
                    $state.go('dashboard');
                }
            });

        /*
         Error events
         */
        $rootScope.$on('$rest:error:communication', (event, error) => {
            $error.critical(error);
        });

        $rootScope.$on('$rest:error:request', (event, error) => {
            $error.critical(error);
        });

        $rootScope.$on('$rest:offline', () => {
            $error.critical('Network is not available');
        });

        $rootScope.$on('$rest:online', () => {
            $toast.success('Network is available');
        });

        /*
         Authentication management
         */
        $rootScope.isAuthenticated = $security.isAuthenticated();
        $rootScope.token = $security.getAccessToken();

        let onLoginRequired = () => { };

        let onNotAuthorised = () => {
            $window.location.href = '#dashboard';
        };

        $rootScope.$on("$stateChangeStart", (event, toState) => $security.stateChangeStart(event, toState, onLoginRequired, onNotAuthorised));

        let isProcessingError = false;

        $rootScope.$on('$oauth:error', (event, error) => {
            if (!isProcessingError) {
                isProcessingError = true;

                /*
                 Let's give it some time to process error and ignore similar errors for
                 asynchronous requests for 5s
                 */
                $timeout(() => isProcessingError = false, 5000);

                if (error.status !== 403) {
                    $security.redirectToLogin();
                }
            }
        });

        /*
         Version display
         */
        $rootScope.$version = $config.version;

        $log.info('IQ Squealer', $config.version);

    });

/*
 Bootstrap application
 */
angular.element(document).ready(() => {
    angular.bootstrap(document, ['squealer'], {});
});
