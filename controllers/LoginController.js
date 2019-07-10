var BaseController = require("./BaseController"),
	View = require("../views/BaseView"),
	UsersModel = require("../models/UsersModel"),
	FeedbackController = require("./FeedbackController");

class LoginController extends BaseController {

	constructor(data) {

		super(undefined, data);

		var self = this;

		this.actions.push(function(req, res, cb){
			var usersModel = new UsersModel(req.app.locals.dbClient, req.app.locals.dbName);
			usersModel.getUserByEmail(req.body.email, function (err, result) {
				var feedback;
				if (result) {
					if (result.password == req.body.password) {
						req.session.regenerate(function (err) {
							if(err)throw err;
							req.session.userId = result._id;
							View.redirect(res, '');
							cb(err, false);
						});
					} else {

						feedback = new FeedbackController(
							'Warning',
							'Invalid password',
							'/loginForm',
							'ok',
							self.data
						);

						feedback.run(req, res);

						cb(err, false);

					}

				} else {

					feedback = new FeedbackController(
						'Warning',
						'Invalid email',
						'/loginForm',
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

module.exports = LoginController;