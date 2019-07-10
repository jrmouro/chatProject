var LoginRequiredController = require("./LoginRequiredController"),
	ChatModel = require("../models/ChatModel"),
	UsersModel = require("../models/UsersModel"),
	GroupsModel = require('../models/GroupsModel'),
	FeedbackController = require("./FeedbackController");


class ChatController extends LoginRequiredController {

	constructor(data, dbClient, dbName) {

		super('chatForm', data, true);

		this.dbClient = dbClient;
		this.dbName = dbName;
		var self = this;

		self.attachFrontData('wssHost', data.back.wss.host);
		self.attachFrontData('wssPort', data.back.wss.port);

		this.actions.push(function (req, res, cb) {

			if (req.query.groupId) {

				var groupsModel = new GroupsModel(req.app.locals.dbClient, req.app.locals.dbName);

				groupsModel.getGroupById(req.query.groupId, function (err, result) {

					if (err) throw err;

					if (result.length > 0) {

						self.attachFrontData('group', result[0]);

						var chatModel = new ChatModel(req.app.locals.dbClient, req.app.locals.dbName);

						chatModel.getChatsByGroupId(req.query.groupId, function (err, result) {
							self.attachFrontData('chats', result);
							cb(err, true);
						});

					} else {

						var feedback = new FeedbackController(

							'Warning',
							'Group no exists',
							'home',
							'ok',
							data
						);

						feedback.run(req, res);

						cb(null, false);
					}

				});

			} else if (req.query.chatUserId) {

				var usersModel = new UsersModel(req.app.locals.dbClient, req.app.locals.dbName);
				usersModel.getUserById_noPassword(req.query.chatUserId, function (err, result) {

					if (result) {

						self.attachFrontData('chatUser', result);

						var chatModel = new ChatModel(req.app.locals.dbClient, req.app.locals.dbName);
						chatModel.getChatsByEmmiterIdAndReceiverId(req.session.userId, req.query.chatUserId, function (err, result) {
							self.attachFrontData('chats', result);
							cb(err, true);
						});

					}else{
						var feedback = new FeedbackController(

							'Warning',
							'Contact no exists',
							'home',
							'ok',
							data
						);
		
						feedback.run(req, res);
		
						cb(null, false);
					}

				});

			} else {

				var feedback = new FeedbackController(

					'Warning',
					'Group or Contact no exists',
					'home',
					'ok',
					data
				);

				feedback.run(req, res);

				cb(null, false);
			}

		});
	}
}



module.exports = ChatController;