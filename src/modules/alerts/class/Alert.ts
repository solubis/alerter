/// <reference path="../../../typings/types.d.ts" />

const DEFAULT_PRIORITY_CODE = '10';

interface Assignee {
    userLogin:string;
    groupId:number;
    hierarchyId:number;
    userFullName?:string;
    groupName?:string;
    hierarchyName?:string;
}

class Alert {

    id:number;
    state:string;
    category:string;
    product:string;
    title:string;
    priority:string;
    finalized: boolean;
    finalizeDate:number;
    assignee:Assignee;
    description:string;
    comments:Comment[];
    attachments: any[];
    linkedAlerts:any[]; 
    tags:any[];
    availableTransitions:any[];
    creationDate:number;
    modificationDate:number;
    testMode: boolean;
    originalTestMode:boolean;
    extras: any = {};

    constructor(data) {

        data = data || {priority: DEFAULT_PRIORITY_CODE};

        angular.extend(this, data);

        this.originalTestMode = data.testMode;
    }

    addComment(commentText) {

        if (!commentText.trim()) {
            return;
        }

        this.comments = this.comments || [];
        this.comments.unshift(commentText);

    }

    isTestModeEnabled(){

        return this.originalTestMode === true;
    }

    isNew() {

        return !this.id;
    }
}

export default Alert;
