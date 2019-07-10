const DbModel = require("./DbModel");

class UsersModel extends DbModel{

    constructor(dbClient, dbName){
        super(dbClient, dbName, "users");
    }

    insertUser(username, email, password, avatar, callback){
        this.insertOne({username: username, email: email, password: password, avatar: avatar}, callback);
    }

    getUserById(id, callback){
        this.findOne({_id: DbModel.getObjectID(id)}, callback);
    }

    getUserById_noPassword(id, callback){
        this.findOneProject({_id: DbModel.getObjectID(id)}, {fields:{password: 0}}, callback);
    }

    getUserByEmail(email, callback){
        this.findOne({email: email}, callback);
    }

    deleteUserById(id, callback){
        this.deleteOne({_id: DbModel.getObjectID(id)}, callback);
    }

}

module.exports = UsersModel;