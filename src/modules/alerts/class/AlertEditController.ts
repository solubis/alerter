/// <reference path="../../../typings/types.d.ts" />

import Alert from './Alert';
import AlertService from './AlertService';
import DictionariesService from '../../dictionaries/class/DictionariesService';
import TagService from '../../dictionaries/class/TagService';

/*@ngInject*/
class AlertEditController {
    private foreignAssignee: boolean;
    private currentAssigneeLogin: string;

    private dict: any;
    private comment: string;
    private templates: any[];
    private fields: any[];
    private options: any;
    private organisation;
    private tags;

    constructor(
        private $scope,
        private $log,
        private $timeout,
        private $toast,
        private $product,
        private $state,
        private $q,
        private $utils,
        private $dictionaries: DictionariesService,
        private $alerts: AlertService,
        private $tag: TagService,
        private $security,
        private alert: Alert) {

        this.dict = $dictionaries.get();

        this.currentAssigneeLogin = this.alert && this.alert.assignee && this.alert.assignee.userLogin;

        var getOrganisation = () => {
            $alerts
                .getOrganisation()
                .then((result) => {
                    this.organisation = result;
                    this.organisation.getUserGroups($security.getUserLogin());
                });
        };

        $timeout(getOrganisation, 1000);

        this.options = {
            dateFormat: 'dd.MM.yyyy'
        };

        this.templates = [
            {
                type: 'string',
                template: '<div class="form-group">\n    <label ng-bind="$field.label"></label>\n    <input class="form-control"\n           name="{{ $field.code }}"\n           maxlength="128"\n           ng-disabled="{{ $field.readOnly && !$record.isNew() }}"\n           ng-attr-tooltip="{{ $field.description }}"\n           tooltip-placement="bottom"\n           ng-attr-placeholder="{{ $field.description }}">\n</div>'
            },

            {
                type: 'number',
                template: '<div class="form-group">\n    <label ng-bind="$field.label"></label>\n    <input class="form-control"\n           type="text"\n           validate-number maxlength="16"\n           name="{{ $field.code }}"\n           ng-disabled="{{ $field.readOnly && !$record.isNew() }}"\n           tooltip="{{ $field.description }}"\n           tooltip-placement="bottom"\n           placeholder="{{ $field.description }}">\n    <div class="error-message"\n         ng-show="form.{{$field.code}}.$dirty && form.{{$field.code}}.$invalid" >Pole musi zawierać numer np. 123,12 \n    </div>\n</div>'
            },

            {
                type: 'date',
                template: '<div class="form-group">\n    <label tooltip="{{ $field.description }}" tooltip-placement="bottom" ng-bind="$field.label"></label>\n\n    <datetimepicker ng-disabled="{{ $field.readOnly && !$record.isNew() }}" date-format="' + this.options.dateFormat + '"> </datetimepicker>\n    \n    <div class="error-message"\n         ng-show="form.{{$field.code}}.$dirty && form.{{$field.code}}.$invalid">\n        Wymagany format daty: \'' + this.options.dateFormat + '\n    </div>\n</div>'
            },

            {
                type: 'boolean',
                template: '<div class="form-group">\n    <label class="checkbox checkbox-inline">\n        <input type="checkbox"\n               name="{{ $field.code }}"\nng-disabled="{{ $field.readOnly && !$record.isNew() }}"\n      placeholder="{{ $field.description }}"><i class="input-helper"></i> &nbsp;<span ng-bind="$field.label" ng-attr-tooltip="{{ $field.description }}" tooltip-placement="right"></span></label></div>'
            },

            {
                type: 'text',
                template: '<div class="form-group">\n    <label ng-bind="$field.label" ></label>\n    <textarea class="form-control"\n              autosize\n              name="{{ $field.code }}"\n              ng-attr-tooltip="{{ $field.description }}"\n              tooltip-placement="bottom"\n              ng-disabled="{{ $field.readOnly && !$record.isNew() }}"\n              ng-attr-placeholder="{{ $field.description }}"></textarea>\n</div>'
            },

            {
                type: 'url',
                template: '<div class="form-group">\n    <label ng-bind="$field.label"></label>\n    <input class="form-control"\n           name="{{ $field.code }}"\n           maxlength="128"\n           ng-disabled="{{ $field.readOnly && !$record.isNew() }}"\n           ng-attr-tooltip="{{ $field.description }}"\n           tooltip-placement="bottom"\n           ng-attr-placeholder="{{ $field.description }}">\n</div>'
            },

        ];

        $scope.$watch(() => this.alert.product, (product) => {
            this.fields = $product.getMetadata(product);
        });

        $scope.$watch(() => this.alert.assignee, (assignee) => {
            if (assignee && !assignee.assignable) {
                this.foreignAssignee = true;
            } else {
                this.foreignAssignee = false;
            }
        })
    }

    isValid(form) {
        return this.$utils.isReadyToSave(this.$scope.form);
    }

    hasPermissionToAssign() {
        return !this.alert.isNew() &&
            !this.$security.authorize('ALERTER_ALERT_ASSIGN_FOREIGN') &&
            !(this.$security.authorize('ALERTER_ALERT_ASSIGN_OWN') && this.$security.owner(this.currentAssigneeLogin));
    }

    loadTags(query) {
        return this.$tag.find(query);
    }

    submitForm(form) {
        let changes = this.$utils.formChanges(form, this.alert);
        let comment = this.comment && this.comment.trim();

        changes.tags = this.alert.tags.map((item) => item.code);
        changes.extras = this.$utils.formChanges(form, this.alert.extras);

        if (comment) {
            changes['comment'] = comment;
        }

        if (this.alert.isNew()) {
            return this.$alerts.add(changes);
        } else {
            return this.$alerts.update(this.alert.id, changes);
        }
    }

    saveChanges(form) {
        this.submitForm(form)
            .then((result) => {
                this.$scope.$close();

                if (form.assignee.$dirty && form.assignee.$modelValue.assignable === false) {
                    this.$timeout(() => this.$alerts.broadcast('reload'));
                    this.$toast.info('Alert saved but you lost access to it');
                } else {
                    this.$toast.info('Alert {0} saved', `<a href="#/alerts/view/${result.id}">${result.id}</a>`);
                }
            });
    }

}

export default AlertEditController;
