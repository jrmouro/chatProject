const DbModel = require("./DbModel");

class SubjectsModel extends DbModel{

    constructor(dbClient, dbName){
        super(dbClient, dbName, "subjects");
    }

    insertSubject(subjectName, description, callback){
        this.insertOne({subjectName: subjectName, description: description}, callback);
    }

    getSubjectById(id, callback){
        this.findOne({_id: this.getObjectID(id)}, callback);
    }

    getSubjectByName(subjectName, callback){
        this.findOne({subjectName: subjectName}, callback);
    }

    deleteSubjectById(id, callback){
        this.deleteOne({_id: this.getObjectID(id)}, callback);
    }

}

module.exports = SubjectsModel;