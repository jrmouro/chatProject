var LoginRequiredController = require("./LoginRequiredController"),
	ContactsModel = require('../models/ContactsModel'),
	UserModel = require('./../models/UsersModel');

class ContactsController extends LoginRequiredController {

	constructor(data) {

		super('contacts', data, true);

		var self = this;

		this.actions.push(function (req, res, cb) {

			var constactsModel = new ContactsModel(req.app.locals.dbClient, req.app.locals.dbName);

			constactsModel.getContactsByUserId(req.session.userId, function (err, result) {
				
					if (result && result.usersId.length > 0) {

						var userModel = new UserModel(req.app.locals.dbClient, req.app.locals.dbName);
						userModel.findMany({
							_id: {
								$in: result.usersId
							}
						}, function (err, result) {

							self.attachFrontData('contacts', result || []);
							cb(err, true);

						});
					}else{
						cb(err, true);
					}

					

			});
		});
	}
}

module.exports = ContactsController;