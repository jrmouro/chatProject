const DbModel = require("./DbModel");

class DocsModel extends DbModel{

    constructor(dbClient, dbName){
        super(dbClient, dbName, "docs");
    }

    insertDoc(userId, docName, subjectId, callback){
        this.insertOne({userId: userId, docName: docName, subjectId: subjectId}, callback);
    }

    getDocsByIdUser(userId, callback){
        this.find({userId: this.getObjectID(userId)}, callback);
    }

    getOneDocByIdUserAndDocName(userId, docName, callback){
        this.findOne({userId: this.getObjectID(userId), docName: docName}, callback);
    }
    
    deleteDocsByIdUser(userId, callback){
        this.deleteMany({userId: this.getObjectID(userId)}, callback);
    }

    deleteDocsByIdUserAndSubject(userId, subjectId, callback){
        this.deleteMany({userId: this.getObjectID(userId), subjectId: subjectId}, callback);
    }

    deleteDocByIdUserAndDocName(userId, docName,  callback){
        this.deleteOne({userId: this.getObjectID(userId), docName: docName}, callback);
    }

}

module.exports = DocsModel;