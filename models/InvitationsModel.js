const DbModel = require("./DbModel");

class InvitationsModel extends DbModel {

    constructor(dbClient, dbName) {
        super(dbClient, dbName, "invitations");
    }

    getInvitationsContactsByReceiverId(receiverId, callback) {
        this.findAggregate(
            [
                {
                    "$lookup": {
                        "from": "users",
                        "localField": "emmiterId",
                        "foreignField": "_id",
                        "as": "emmiter"
                    }
                },
                {
                    $sort: {
                        date: 1
                    }
                },
                {
                    $match: {
                        receiverId: DbModel.getObjectID(receiverId),
                        groupId: undefined,
                        state: 0
                    }
                }
            ],
            callback);
    }

    getInvitationsByReceiverId(receiverId, callback) {
        this.findAggregate(
            [
                {
                    "$lookup": {
                        "from": "users",
                        "localField": "emmiterId",
                        "foreignField": "_id",
                        "as": "emmiter"
                    }
                },
                {
                    $unwind:{ path: "$emmiter", preserveNullAndEmptyArrays: false }
                },
                {
                    "$lookup": {
                        "from": "groups",
                        "localField": "groupId",
                        "foreignField": "_id",
                        "as": "group"
                    }
                },
                {
                    $sort: {
                        date: 1
                    }
                },
                {
                    $match: {
                        receiverId: DbModel.getObjectID(receiverId),
                        state: 0
                    }
                }
            ],
            callback);
    }


    getInvitationsByEmmiterId(emmiterId, callback) {
        this.findAggregate(
            [{
                    "$lookup": {
                        "from": "users",
                        "localField": "receiverId",
                        "foreignField": "_id",
                        "as": "receiver"
                    }
                },
                {
                    $sort: {
                        date: 1
                    }
                },
                {
                    $match: {
                        emmiterId: DbModel.getObjectID(emmiterId),
                        groupId: undefined,
                        state: 0
                    }
                }
            ],
            callback);
    }


    acceptInvitationById(id, callback) {
        var self = this;
        this.findOne({
            _id: DbModel.getObjectID(id)
        }, function (err, result) {
            if (result != undefined) {
                self.updateOne({
                    _id: DbModel.getObjectID(id)
                }, {
                    $set: {
                        state: 1
                    }
                }, callback);
            } else {
                callback();
            }
        });
    }

    refuseInvitationById(id, callback) {
        var self = this;
        this.findOne({
            _id: DbModel.getObjectID(id)
        }, function (err, result) {
            if (result != undefined) {
                self.updateOne({
                    _id: DbModel.getObjectID(id)
                }, {
                    $set: {
                        state: -1
                    }
                }, callback);
            } else {
                callback();
            }
        });
    }

    insertInvitationContact(emmiterId, receiverId, message, callback) {
        var self = this;
        this.findOne({
            emmiterId: DbModel.getObjectID(emmiterId),
            receiverId: DbModel.getObjectID(receiverId)
        }, function (err, result) {
            if (result == undefined) {
                self.insertOne({
                        emmiterId: DbModel.getObjectID(emmiterId),
                        receiverId: DbModel.getObjectID(receiverId),
                        groupId: undefined,
                        message: message,
                        date: new Date(),
                        state: 0
                    },
                    callback);
            } else {
                callback();
            }
        });
    }

    insertInvitation(emmiterId, receiverId, groupId, message, callback) {
        if (groupId)
            this.insertInvitationGroup(emmiterId, receiverId, groupId, message, callback);
        else
            this.insertInvitationContact(emmiterId, receiverId, message, callback);
    }


    insertInvitationGroup(emmiterId, receiverId, groupId, message, callback) {
        var self = this;
        this.findOne({
                groupId: DbModel.getObjectID(groupId),
                receiverId: DbModel.getObjectID(receiverId)
            },
            function (err, result) {
                if (result == undefined) {
                    self.insertOne({
                            emmiterId: DbModel.getObjectID(emmiterId),
                            receiverId: DbModel.getObjectID(receiverId),
                            groupId: DbModel.getObjectID(groupId),
                            message: message,
                            date: new Date(),
                            state: 0
                        },
                        callback);
                } else {
                    callback();
                }
            });
    }


    deleteInvitationsByReceiverId(receiverId, callback) {
        this.deleteMany({
            receiverId: DbModel.getObjectID(receiverId)
        }, callback);
    }

    deleteInvitationsByEmmiterId(emmiterId, callback) {
        this.deleteMany({
            emmiterId: DbModel.getObjectID(emmiterId)
        }, callback);
    }

    deleteInvitationsByGroupId(groupId, callback) {
        this.deleteMany({
            groupId: DbModel.getObjectID(groupId)
        }, callback);
    }

    deleteInvitationById(id, callback) {
        this.deleteOne({
            _id: DbModel.getObjectID(id)
        }, callback);
    }


}

module.exports = InvitationsModel;