var View = require("../views/BaseView");

class BaseController{
	
	constructor(template, data){

		this.dataBack = {};
		this.dataFront = {};

		if(data){
			if(data.back)
				this.dataBack = JSON.parse(JSON.stringify(data.back));
			if(data.front)
				this.dataFront = JSON.parse(JSON.stringify(data.front));
		}
		
		if(template)
			this.view = new View(template, this.dataFront);
				
		var self = this;

		this.actions = [];
		this.prioActions = [];

		this.actions.push(function(req, res, cb){
			self.renderView(res);
			cb(null, false);
		});

		this.runActions = function(req, res, index){
			if(index >= 0)
				this.actions[index](req, res, function(err, next){
					if(err)throw err;
					if(next && !err)
						self.runActions(req, res, index - 1);
				});
		};

		this.runPrioActions = function(req, res, index){
			if(index >= 0)
				this.prioActions[index](req, res, function(err, next){
					if(err)throw err;
					if(next && !err)
						self.runPrioActions(req, res, index - 1);
				});
			else
				self.runActions(req, res, this.actions.length - 1);
		};
		
		
		this.run = function(req, res, next){

			self.runPrioActions(req, res, this.prioActions.length - 1);

		};

	}
	
	renderView(res){
		if(this.view){
			this.view.render(res);
		}
	}

	attachFrontData(key, data){
		if(this.dataFront)
			this.dataFront[key] = data;
		else
			this.dataFront = {key: data};
	}
	
	attachBackData(key, data){
		if(this.dataBack)
			this.dataBack[key] = data;
		else
			this.dataBack = {key: data};
	}
}

module.exports = BaseController;