/// <reference path="../../../typings/types.d.ts" />

import Alert from './Alert';
import AlertService from './AlertService';

/*@ngInject*/
class AlertEditDialog {

    constructor(private $dialog) {
    }

    open(alert: Alert) {
        return this.$dialog.open(
            /*@ngInject*/
            {
                templateUrl: 'modules/alerts/html/alert-edit.html',
                controller: 'AlertEditController as ctrl',
                backdrop: 'static',
                resolve: {
                    alert: ($alerts) => (alert ? $alerts.get(alert.id) : $alerts.createAlert())
                },
                size: 'lg'
            })
    }
}

export default AlertEditDialog;
