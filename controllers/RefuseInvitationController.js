var LoginRequiredController = require("./LoginRequiredController"),
	View = require("../views/BaseView"),
	InvitationsModel = require('../models/InvitationsModel');

class RefuseInvitationController extends LoginRequiredController{

	constructor(data){

		super(undefined, data);

		this.actions.push(function(req, res, cb){
			var envitationsModel = new InvitationsModel(req.app.locals.dbClient, req.app.locals.dbName);
			envitationsModel.refuseInvitationById(req.query.id, function(err, result){
				if(err) throw err;
				View.redirect(res, 'invitations');
				cb(err, false);
			});
		});

		
	}
}

module.exports = RefuseInvitationController;

