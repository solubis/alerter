/// <reference path="../../../typings/types.d.ts" />

class WorkflowDefinition {

    id:number;
    name:string;
    description:string;
    modificationDate:number;
    creationDate:number;
    createdBy:string;
    definition:string;
    active:boolean;
    comments:Comment[];

    constructor(data) {
        angular.extend(this, data);
    }

    isNew() {
        return !this.id;
    }
}

export default WorkflowDefinition;
