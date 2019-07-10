var DbModel = require("./DbModel");

class ChatModel extends DbModel {

	constructor(dbClient, dbName) {
		super(dbClient, dbName, "chats");
	}

	insertChat(emmiterId,
		receiverId,
		groupId,
		content,
		fileUploadId,
		callback) {

		var rId, gId;
		if(receiverId)
			rId = DbModel.getObjectID(receiverId);
		if(groupId)
			gId = DbModel.getObjectID(groupId);

		this.insertOne({
				emmiterId: DbModel.getObjectID(emmiterId),
				receiverId: rId,
				groupId: gId,
				content: content,
				fileUploadId: fileUploadId,
				date: new Date()
			},
			callback);
	}

	getChatsByEmmiterIdAndReceiverId(emmiterId, receiverId, callback) {
		this.findAggregate(
			[{
					"$lookup": {
						"from": "users",
						"localField": "emmiterId",
						"foreignField": "_id",
						"as": "emmiter"
					}
				},
				{
					$sort: {date: 1}
				},
				{
					$match: {
						$or: [{
								emmiterId: DbModel.getObjectID(emmiterId),
								receiverId: DbModel.getObjectID(receiverId)
							},
							{
								emmiterId: DbModel.getObjectID(receiverId),
								receiverId: DbModel.getObjectID(emmiterId)
							}
						]
					}
				}
			],
			callback);
	}

	getChatsByGroupId(groupId, callback) {
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
					$sort: {date: 1}
				},
				{
					$match: { groupId: DbModel.getObjectID(groupId)}
				}
			],
			callback);
	}

	

}

module.exports = ChatModel;