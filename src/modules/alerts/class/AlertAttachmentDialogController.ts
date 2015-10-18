/// <reference path="../../../typings/types.d.ts" />

import Alert from './Alert';
import AlertService from './AlertService';

/*@ngInject*/
class AttachmentDialogController {

    private type;
    private url;
    private file;
    private comment;
    private isUploading;
    private isReadyToUpload;

    constructor(
        private $scope,
        private $timeout,
        private $error,
        private $toast,
        private $config,
        private $fileSize,
        private $alerts: AlertService,
        private alert: Alert) {

        $scope.$watch(() => this.file, (file) => {
            var reader;

            if (!file) {
                this.isReadyToUpload = false;

                return;
            }

            reader = new FileReader();

            reader.onload = (e) => {
                $scope.$apply(() => {
                    this.file.content = e.target.result;
                    this.isReadyToUpload = true;
                });
            };

            reader.readAsDataURL(file);
        });
    }

    validateFile(file) {
        if (file.size > this.$config.maxFileAttachmentSize) {
            this.$toast.warn('Maximum file size is {0}', this.$fileSize(this.$config.maxFileAttachmentSize));

            return false;
        }

        return true;
    }

    select(type) {
        this.type = type;

        switch (type) {
            case 'file':
                this.url = undefined;
                break;
            case 'url':
                this.file = undefined;
                break;
        }
    }

    upload() {
        var data;

        if (this.type === 'file') {
            data = {
                name: this.file.name,
                size: this.file.size,
                description: this.comment,
                content: this.file.content,
                type: this.file.type
            }
        } else {
            data = {
                url: this.url,
                description: this.comment
            }
        }

        this.isUploading = true;

        this.$timeout(() => this.$alerts
            .addAttachment(this.alert.id, data)

            .then(() => {
                this.$toast.info('Attachment added');

                this.$scope.$close(data);
            })

            .catch((error) => {
                this.$error.critical(error);
            })

            .finally(() => {
                this.isUploading = false;
                this.isReadyToUpload = false;
            }), 500);
    }
}

export default AttachmentDialogController;
