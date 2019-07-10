const DbModel = require("./DbModel");

class ProfilesModel extends DbModel{

    constructor(dbClient, dbName){
        super(dbClient, dbName, "profiles");
    }

    insertProfile(userId, profileName, profileData, callback){
        this.insertOne({userId: this.getObjectID(userId), profileName: profileName, profileData: profileData}, callback);
    }

    getProfileById(id, callback){
        this.findOne({_id: this.getObjectID(id)}, callback);
    }

    getProfilesByUserId(userId, callback){
        this.findOne({userId: this.getObjectID(userId)}, callback);
    }

    getProfileByUserIdAndProfileName(userId, profileName, callback){
        this.findOne({userId: this.getObjectID(userId), profileName: profileName}, callback);
    }

    getProfilesByProfileName(profileName, callback){
        this.findOne({profileName: profileName}, callback);
    }

    getProfilesByUserIdAndProfileName(userId, profileName, callback){
        this.findOne({userId: this.getObjectID(userId), profileName: profileName}, callback);
    }

    deleteProfileById(id, callback){
        this.deleteOne({_id: this.getObjectID(id)}, callback);
    }

    deleteProfilesByUserId(userId, callback){
        this.deleteMany({userId: this.getObjectID(userId)}, callback);
    }

}

module.exports = ProfilesModel;