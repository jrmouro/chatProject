var LoginRequiredController = require("./LoginRequiredController"),
	InvitationsModel = require('../models/InvitationsModel');

class EnvitationsController extends LoginRequiredController{
	
	constructor(data){

		super('invitations', data, true);

		var self = this;

		/*this.actions.push(function (req, res, cb) {

			var invitationsModel = new InvitationsModel(req.app.locals.dbClient, req.app.locals.dbName);
			
			invitationsModel.getInvitationsGroupsByReceiverId(req.session.userId, function(err, result){
				self.attachFrontData('groups', result || []);					
				cb(err, true);
			});
			

		});*/

		this.actions.push(function (req, res, cb) {

			var invitationsModel = new InvitationsModel(req.app.locals.dbClient, req.app.locals.dbName);
			
			invitationsModel.getInvitationsByReceiverId(req.session.userId, function(err, result){
				self.attachFrontData('invitations', result || []);					
				cb(err, true);
			});			

		});

		
	}
}

module.exports = EnvitationsController;

