var LoginRequiredController = require("./LoginRequiredController"),
	GroupsModel = require('../models/GroupsModel');

class GroupController extends LoginRequiredController {

	constructor(data) {

		super('group', data, true);

		var self = this;

		this.actions.push(function (req, res, cb) {

			var groupsModel = new GroupsModel(req.app.locals.dbClient, req.app.locals.dbName);

			groupsModel.getGroupById(req.query.groupId, function (err, result) {

				if(result.length > 0)
					self.attachFrontData('group', result[0]);
				
				cb(err, true);

			});

		});
	}
}

module.exports = GroupController;