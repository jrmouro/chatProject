var LoginRequiredController = require("./LoginRequiredController"),
	View = require("../views/BaseView"),
	InvitationsModel = require('../models/InvitationsModel'),
	ContactsModel = require('../models/ContactsModel'),
	UsersModel = require('../models/UsersModel'),
	GroupModel = require('../models/GroupsModel');

class AcceptInvitationController extends LoginRequiredController{

	constructor(data){

		super(undefined, data);

		this.actions.push(function(req, res, cb){

			var envitationsModel = new InvitationsModel(req.app.locals.dbClient, req.app.locals.dbName);

			envitationsModel.acceptInvitationById(req.query.id, function(err, result){
				
				if(err) throw err;

				if(result.result.ok == 1){

					var usersModel = new UsersModel(req.app.locals.dbClient, req.app.locals.dbName);

					usersModel.getUserById(req.query.emmiter, function(err, result){
						if(result){
							var emmiter = result;
							usersModel.getUserById(req.query.receiver, function(err, result){
								if(result){
									var receiver = result;
									var contactsModel = new ContactsModel(req.app.locals.dbClient, req.app.locals.dbName);
									if(req.query.group != "null"){
										var groupModel = new GroupModel(req.app.locals.dbClient, req.app.locals.dbName);
										groupModel.getGroupById(req.query.group, function(err, result){
											if(result){
												var group = result;
												contactsModel.pushGroup(receiver._id, group[0]._id, function(err, result){
													if(err) throw err;
													groupModel.pushContactById(group[0]._id, receiver._id,function(err, result){
														View.redirect(res, 'invitations');
														cb(err, false);
													});													
												});
											}										
										});
									}else{
										contactsModel.pushContact(receiver._id, emmiter._id, function(err, result){
											if(result){
												contactsModel.pushContact(emmiter._id, receiver._id, function(err, result){													
													View.redirect(res, 'invitations');	
													cb(err, false);												
												});
											}
										});
									}
								}else{
									View.redirect(res, 'invitations');
									cb(err, false);
								}
							});
						}else{
							cb(err, false);
						}
					});
				}else{
					cb(err, false);
				}
			});
		});
	}
}

module.exports = AcceptInvitationController;

