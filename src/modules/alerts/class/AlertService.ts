/// <reference path="../../../typings/types.d.ts" />

import Alert from './Alert';

interface PagingOptions {
    page: number,
    itemsPerPage: number,
    filter?: any,
    sort?: any
}

/*@ngInject*/
class AlertService {

    constructor(private $rootScope,
        private $rest,
        private $utils,
        private $dictionaries,
        private Organisation) {
    }

    createAlert(data) {
        var alert: Alert = new Alert(data);

        alert.tags = alert.tags ? alert.tags.map((item) => this.$dictionaries.get('tag', item)) : [];

        return alert;
    }

    get(options: PagingOptions = { page: 0, itemsPerPage: 100 }): ng.IPromise<any> {
        var request;

        if (angular.isObject(options)) {
            let params: any = {
                number: options.page || 0,
                size: options.itemsPerPage || 100
            };

            angular.extend(params, options.filter);

            if (options.sort && Object.keys(options.sort).length) {
                params.orderBy = Object.keys(options.sort)[0];
                params.orderDirection = options.sort[params.orderBy];
            }

            request = this.$rest
                .get({
                    command: 'alert',
                    params: params
                })
                .then((result: any) => {
                    result.content = result.content.map((item) => this.createAlert(item));

                    return result;
                });

        } else {
            request = this.$rest
                .get({
                    command: 'alert' + '/' + options
                })
                .then((result) => this.createAlert(result));
        }

        return request;
    }

    count(filter: any): ng.IPromise<any> {
        var request;

        request = this.$rest
            .get({
                command: 'alert/count',
                params: filter
            });

        return request;
    }

    runTransition(id, transition, comment = undefined) {
        var request;
        var data:any = { transition: transition};

        comment = comment && comment.trim();

        if (comment) {
            data.comment = comment;
        }

        request = this.$rest
            .patch({
                command: 'alert/' + id,
                data: data
            })
            .then((result) => {
                var alert = this.createAlert(result);

                this.broadcast('update', alert);

                return alert;
            });

        return request;
    }

    update(id, alert) {
        var request;

        request = this.$rest
            .put({
                command: 'alert/' + id,
                data: alert
            })
            .then((result) => {
                var alert = this.createAlert(result);

                this.broadcast('update', alert);

                return alert;
            });

        return request;
    }

    add(alert) {
        var request;

        request = this.$rest
            .post({
                command: 'alert',
                data: alert
            })
            .then((result) => {
                var alert = this.createAlert(result);

                this.broadcast('add', alert);

                return alert;
            });

        return request;
    }

    remove(alert) {
        var request;

        request = this.$rest
            .remove({
                command: 'alert/' + alert.id,
            })
            .then(() => {
                this.broadcast('remove', alert);
            });

        return request;
    }

    addComment(alertId, text) {
        var request;

        request = this.$rest
            .post({
                command: 'alert/' + alertId + '/comment',
                data: {
                    text: text
                }
            })
            .then((result) => {
                this.broadcast('comment', { id: alertId, comment: result });

                return result;
            });

        return request;
    }

    addLink(alertId, targetId, linkTypeCode, comment = undefined) {
        var request;
        var data;

        data = {
            targetId: targetId,
            linkTypeCode: linkTypeCode
        };

        comment = comment && comment.trim();

        if (comment){
            data.comment = comment.trim();
        }

        request = this.$rest
            .post({
                command: 'alert/' + alertId + '/linkedAlerts',
                data: data
            })
            .then((result) => {
                this.broadcast('link', { id: alertId, link: result });

                return result;
            });

        return request;
    }

    addAttachment(alertId, data) {
        var request;

        if (data.content && data.content.indexOf('base64') > 0) {
            data.content = data.content.split(',')[1];
        }

        request = this.$rest
            .post({
                command: 'alert/' + alertId + '/attachments',
                data: data
            })
            .then((result) => {
                this.broadcast('attachment', { id: alertId, attachment: result });

                return result;
            });

        return request;
    }

    removeLink(alertId, targetId, linkTypeCode) {
        var request;

        request = this.$rest
            .remove({
                command: 'alert/' + alertId + '/linkedAlerts/' + targetId + '/linkType/' + linkTypeCode,
            })
            .then(() => {
                this.broadcast('link');
            });

        return request;
    }

    downloadBase64(alertId, fileId) {
        let request;

        let arrayBufferToBase64 = (buffer) => {
            let binary = '';
            let bytes = new Uint8Array(buffer);
            let len = bytes.byteLength;

            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }

            return btoa(binary);
        }

        request = this.$rest
            .get({
                command: `alert/${alertId}/attachment/${fileId}/file`,
                responseType: "arraybuffer"
            }).then((result) => {
                return arrayBufferToBase64(result);
            })

        return request;
    }

    downloadBlob(alertId, fileId) {
        let request;

        request = this.$rest
            .get({
                command: `alert/${alertId}/attachment/${fileId}/file`,
                responseType: "blob"
            });

        return request;
    }

    removeFile(alertId, fileId) {
        var request;

        request = this.$rest
            .remove({
                command: `alert/${alertId}/attachment/${fileId}`,
            })
            .then(() => {
                this.broadcast('attachment');
            });

        return request;
    }

    broadcast(message, data = undefined) {
        this.$rootScope.$broadcast(`$alerts:${message}`, data);
    }

    audit(id, page = 0, itemsPerPage = 100) {
        var request,
            params;

        params = {
            number: page || 0,
            size: itemsPerPage || 100
        };

        request = this.$rest
            .get({
                command: 'alert' + '/' + id + '/change',
                params: params
            })
            .then((result) => {

                /*
                 Convert values for display
                 */
                angular.forEach(result.content, (item: any) => {
                    switch (item.type) {
                        case 'date':
                            item.oldValue = this.$utils.formatDate(item.oldValue);
                            item.newValue = this.$utils.formatDate(item.newValue);
                            break;
                    }
                });

                this.broadcast('audit', { id: id, audit: result });

                return result;
            });

        return request;
    }

    getOrganisation(): ng.IPromise<any> {
        return this.$rest
            .get({ command: 'hierarchy' })
            .then((result) => {
                return new this.Organisation(result, 'Hierarchies');
            });
    }
}

export default AlertService;
