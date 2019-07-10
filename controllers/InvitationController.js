var LoginRequiredController = require("./LoginRequiredController"),
	View = require("../views/BaseView"),
	UsersModel = require("../models/UsersModel"),
	InvitationsModel = require('../models/InvitationsModel'),
	GroupsModel = require('../models/GroupsModel'),
	FeedbackController = require("./FeedbackController");

class InvitationController extends LoginRequiredController {

	constructor(data) {

		super(undefined, data);

		var self = this;

		this.actions.push(function (req, res, cb) {

			var usersModel = new UsersModel(req.app.locals.dbClient, req.app.locals.dbName);

			usersModel.getUserByEmail(req.body.email, function (err, result) {

				if (result && result.email) {

					var userId = result._id;

					var envitationsModel = new InvitationsModel(req.app.locals.dbClient, req.app.locals.dbName);

					if (req.body.groupId) {

						var groupsModel = new GroupsModel(req.app.locals.dbClient, req.app.locals.dbName);
						groupsModel.getGroupById(req.body.groupId, function (err, result) {

							if (result) {

								envitationsModel.insertInvitationGroup(req.session.userId, userId, req.body.groupId, req.body.message, function (err, result) {
									View.redirect(res, 'invitationForm', {'groupId': req.body.groupId});
									cb(err, false);
								});

							} else {

								var feedback = new FeedbackController(
									'Warning',
									'Group no exists',
									'/groups',
									'ok',
									data
								);

								feedback.run(req, res);

								cb(null, false);
							}

						});
					}else{

						envitationsModel.insertInvitationContact(req.session.userId, result._id, req.body.message, function (err, result) {
							View.redirect(res, 'invitationForm',  {'groupId': req.body.groupId});
							cb(err, false);
						});

					}


				} else {

					var feedback = new FeedbackController(
						'Warning',
						'Invalid email',
						'/invitations',
						'ok',
						self.data
					);

					feedback.run(req, res);

					cb(err, false);

				}
			});
		});
	}
}

module.exports = InvitationController;