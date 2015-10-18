/// <reference path="../../../typings/types.d.ts" />

import AlertService from '../../alerts/class/AlertService';

/*@ngInject*/
class MenuController {

    private id: string;
    private alert: any;
    private foundAlertID;
    private alerts: any[];
    private permissions;
    private userFullName: string;

    constructor(
        private $state,
        private $alertDialog,
        private $dialog,
        private $alerts: AlertService,
        private $toast,
        private $security,
        private $ask,
        private $hotkeys) {

        this.userFullName = $security.getUserFullName();
    }

    addAlert() {
        this.$alertDialog.open();
    }

    showHelp() {
        this.$hotkeys.toggleCheatSheet();
    }

    gotoAlertDetails(id) {
        id = parseInt(id);

        if (isNaN(id)) {
            return this.$toast.info('Alert not found');
        }

        this.$alerts
            .get(id)
            .then(() => {
                this.$state.go('view', { id: id });
                this.foundAlertID = '';
            })
            .catch(() => {
                this.$toast.info('Alert not found');
            });
    }

    find(id) {
        return this.$alerts
            .get(id)
            .then((result) => {
                return [result];
            })
            .catch(() => {
                return [];
            });
    }

    logout() {
        this.$ask('Logout', 'Czy chcesz się wylogować z aplikacji?')
            .then(() => {
                this.$security.logout();
            })
    }

    showProfile() {
        this.$dialog.open(
            /*@ngInject*/
            {
                templateUrl: 'modules/menu/html/profile.html',
                controller: function($scope, $security) {
                    this.userLogin = $security.getUserLogin();
                    this.userFullName = $security.getUserFullName();
                },
                controllerAs: 'ctrl'
            });
    }

    showSettings() {
        this.$dialog.open(
            /*@ngInject*/
            {
                templateUrl: 'modules/menu/html/settings.html',
                controller: function($scope, $security, $settings) {
                    let permissions = $security.getPermissions();

                    this.permissions = permissions && permissions.sort().join(',\n');
                },
                controllerAs: 'ctrl'
            });
    }
}

export default MenuController;
