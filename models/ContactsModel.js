const DbModel = require("./DbModel");

class ContactsModel extends DbModel{

    constructor(dbClient, dbName){
        super(dbClient, dbName, "contacts");
    }

    getContactsByUserId(userId, callback){
        this.findOne({userId: DbModel.getObjectID(userId)}, callback);
    }

    getContactsById(id, callback){
        this.findOne({_id: DbModel.getObjectID(id)}, callback);
    }

    pushContact(userId, contactId, callback){
        var self = this;
        self.findOne({userId: DbModel.getObjectID(userId)}, function(err, result){
            if(result){
                var found = result.usersId.find(function(el){
                    return el == DbModel.getObjectID(contactId);
                });
                if(found == undefined)
                    self.updateOne({userId: DbModel.getObjectID(userId)}, {$push:{usersId: DbModel.getObjectID(contactId)}}, callback);
                else
                    callback();
            }else{
                self.insertOne(
                    {
                        userId: DbModel.getObjectID(userId), 
                        usersId: [DbModel.getObjectID(contactId)], 
                        groupsId: []
                    }, 
                    callback);
            }
        });
    }

    pushGroup(userId, groupId, callback){
        var self = this;
        self.findOne({userId: DbModel.getObjectID(userId)}, function(err, result){
            if(result){
                var found = result.groupsId.find(function(el){
                    return el == DbModel.getObjectID(groupId);
                });
                if(found == undefined)
                    self.updateOne({userId: DbModel.getObjectID(userId)}, {$push:{groupsId: DbModel.getObjectID(groupId)}}, callback);
                else
                    callback();
            }else{
                self.insertOne(
                    {
                        userId: DbModel.getObjectID(userId), 
                        usersId: [], 
                        groupsId: [DbModel.getObjectID(groupId)]
                    }, 
                    callback);
            }
        });
    }

    deleteUser(userId, callback){
        this.deleteOne({userId: DbModel.getObjectID(userId)}, callback);
    }

    removeContact(userId, contactId, callback){
        var self = this;
        self.findOne({userId: DbModel.getObjectID(userId)}, function(err, result){
            if(result){
                var found = result.contactsId.find(function(el){
                    return el == DbModel.getObjectID(contactId);
                });
                if(found != undefined){
                    result.usersId.splice(found, 1);
                    self.updateOne({userId: DbModel.getObjectID(userId)}, {$set:{usersId: result.contactsId}}, callback);
                }   
                else
                    callback();                 
            }else
                callback();
        });
    }

    removeGroup(userId, groupId, callback){
        var self = this;
        this.findOne({userId: DbModel.getObjectID(userId)}, function(err, result){
            if(result){
                var found = result.groupsId.find(function(el){
                    return el == DbModel.getObjectID(groupId);
                });
                if(found != undefined){
                    result.groupsId.splice(found, 1);
                    self.updateOne({userId: DbModel.getObjectID(userId)}, {$set:{groupsId: result.groupsId}}, callback);
                }else
                    callback();                   
            }
        });
    }

}

module.exports = ContactsModel;