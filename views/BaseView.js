const url = require('url'); 

class BaseView{

	constructor(template, data){
		this.template = template;
		this.data = data || {};
	}

	attachData(key, data){
		this.data[key] = data;
	}

	render(response){
		if(this.template) {
			response.render(this.template, this.data);
		}
	}


	static render(response, template, data){
		response.render(template, data);
	}


	static redirect(response, template, query){
		
		response.redirect(
			url.format(
				{
					pathname:"/".concat(template),
					query: query
				}
			)
		);
		
	}


	static send(response, message){
		response.send(message);
	}

}

module.exports = BaseView;
