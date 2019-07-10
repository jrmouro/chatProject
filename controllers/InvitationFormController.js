var LoginRequiredController = require("./LoginRequiredController"),
	GroupsModel = require('../models/GroupsModel'),
	FeedbackController = require("./FeedbackController");

class InvitationFormController extends LoginRequiredController {

	constructor(data) {

		super('invitationForm', data, true);

		var self = this;

		this.actions.push(function (req, res, cb) {

			if (req.query.groupId) {

				var groupsModel = new GroupsModel(req.app.locals.dbClient, req.app.locals.dbName);

				groupsModel.getGroupById(req.query.groupId, function (err, result) {

					var feedback;

					if (result.length > 0) {

						if (result[0].ownerId.valueOf() == req.session.userId) {

							self.attachFrontData('group', result[0]);

							cb(null, true);

						} else {

							feedback = new FeedbackController(
								'Warning',
								'Owner Group no match',
								'/groups',
								'ok',
								data
							);

							feedback.run(req, res);

							cb(null, false);

						}

					} else {

						feedback = new FeedbackController(
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
				cb(null, true);
			}

		});
	}
}

module.exports = InvitationFormController;