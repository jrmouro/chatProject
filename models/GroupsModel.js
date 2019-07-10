const DbModel = require("./DbModel");

class GroupsModel extends DbModel{

    constructor(dbClient, dbName){
        super(dbClient, dbName, "groups");
    }

    getGroupsByOwner(ownerId, callback){
        this.findMany({ownerId: DbModel.getObjectID(ownerId)}, callback);
    }

    getGroupByGroupName(groupname, callback){
        this.findOne({groupname: groupname}, callback);
    }

    getGroupById(id, callback){

        this.findAggregate(
            [
                {
                    $lookup:
                        {
                            from: "users",
                            localField: "contactsId",
                            foreignField: "_id",
                            as: "users"
                        }
                },
                { $project : { "users.password" : 0} },
                {
                    $match: {_id: DbModel.getObjectID(id)}
                }
            ], 
            callback);
    }

    insertGroup(ownerId, groupname, description, avatar, callback){
        var self = this;
        this.findOne({groupname: groupname}, function(err, result){
            if(result == undefined){
                self.insertOne(
                    {
                        ownerId: DbModel.getObjectID(ownerId), 
                        groupname: groupname,
                        description: description,
                        avatar: avatar,
                        date: new Date(),
                        contactsId: [DbModel.getObjectID(ownerId)]
                    }, 
                    callback);
            }else{
                callback();
            }
        });
    }

    pushContactById(id, contactId, callback){
        var self = this;
        this.findOne({_id: DbModel.getObjectID(id)}, function(err, result){
            if(result){
                var found = result.contactsId.find(function(el){
                    return el.valueOf().equals(contactId);
                });
                if(found == undefined)
                    self.updateOne({_id: DbModel.getObjectID(id)}, {$push:{contactsId: DbModel.getObjectID(contactId)}}, callback);
                else
                    callback();
            }else{
                callback();
            }
        });
    }

    pushContactByOwnerIdAndGroupName(ownerId, groupname, contactId, callback){
        this.findOne({ownerId: DbModel.getObjectID(ownerId), groupname: groupname}, function(err, result){
            if(result){
                var found = result.contactsId.find(function(el){
                    return el == DbModel.getObjectID(contactId);
                });
                if(found == undefined)
                    this.updateOne({ownerId: DbModel.getObjectID(ownerId), groupname: groupname}, {$push:{contactsId: DbModel.getObjectID(contactId)}}, callback);
                else
                    callback();
                }else{
                callback();
            }
        });
    }


    deleteGroup(id, callback){
        this.deleteOne({_id: DbModel.getObjectID(id)}, callback);
    }

    deleteContact(id, contactId, callback){
        var self = this;
        this.findOne({_id: DbModel.getObjectID(id)}, function(err, result){
            if(result){
                var found = result.contactsId.find(function(el){
                    return el == DbModel.getObjectID(contactId);
                });
                if(found != undefined){
                    result.contactsId.splice(found, 1);
                    self.updateOne({_id: DbModel.getObjectID(id)}, {$set:{contactsId: result.contactsId}}, callback);
                }else{
                    callback();
                }               
            }else{
                callback();
            }
        });
    }

}

module.exports = GroupsModel;