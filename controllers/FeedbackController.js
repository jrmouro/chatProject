var BaseController = require("./BaseController");

class FeedbackController extends BaseController{

	constructor(title, message, link, btValue, data){

		super('feedback', data);
		this.attachFrontData('titleFeedback', title);
		this.attachFrontData('message', message);
		this.attachFrontData('link', link);
		this.attachFrontData('btValue', btValue);		

	}
}

module.exports = FeedbackController;

