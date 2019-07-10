var BaseController = require("./BaseController"),
	UsersModel = require("../models/UsersModel"),
	FeedbackController = require("./FeedbackController");

class LoginRequiredController extends BaseController {

	constructor(template, data, attachUserData) {

		super(template, data);

		var self = this;

		if (attachUserData) {

			this.prioActions.push(function (req, res, cb) {

				
				var usersModel = new UsersModel(req.app.locals.dbClient, req.app.locals.dbName);

				usersModel.getUserById_noPassword(req.session.userId, function (err, result) {

					if (result) {
						self.user = result;
						self.attachFrontData('user', result);
						cb(err, true);
					} else {
						cb(err, false);
					}

				});
				
			});
		}

		this.prioActions.push(function (req, res, cb) {

			if (req.session.userId) {

				cb(null, true);

			} else {

				var feedback = new FeedbackController(
					'Warning',
					'Login needed',
					'/loginForm',
					'ok',
					data
				);

				feedback.run(req, res);

				cb(null, false);

			}

		});


	}


}

module.exports = LoginRequiredController;