var BaseController = require("./BaseController");

class LogoutController extends BaseController{

	constructor(data){

		super('loginForm', data);

		var self = this;

		this.run = function (req, res, next) {
			req.session.userId = undefined;
			self.renderView(res);
		};
	}

}

module.exports = LogoutController;

