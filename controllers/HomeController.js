var LoginRequiredController = require("./LoginRequiredController");

class HomeController extends LoginRequiredController{
	constructor(data){
		super('home', data, true);
	}
}


module.exports = HomeController;