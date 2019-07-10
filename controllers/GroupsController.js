var LoginRequiredController = require("./LoginRequiredController"),
	ContactsModel = require('../models/ContactsModel'),
	GroupsModel = require('../models/GroupsModel');

class GroupsController extends LoginRequiredController {

	constructor(data) {

		super('groups', data, true);

		var self = this;		

		this.actions.push(function (req, res, cb) {

			var constactsModel = new ContactsModel(req.app.locals.dbClient, req.app.locals.dbName);

			constactsModel.getContactsByUserId(req.session.userId, function (err, result) {

				if (result && result.groupsId.length > 0) {

					var groupsModel = new GroupsModel(req.app.locals.dbClient, req.app.locals.dbName);

					groupsModel.findMany({
						_id: {
							$in: result.groupsId
						}
					}, function (err, result) {

						self.attachFrontData('groups', result || []);

						cb(err, true);

					});

				}else{

					cb(err, true);

				}
			});
		});		
	}
}

module.exports = GroupsController;