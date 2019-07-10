var LoginRequiredController = require("./LoginRequiredController"),
	ContactsModel = require('../models/ContactsModel'),
	GroupsModel = require('../models/GroupsModel'),
	FeedbackController = require("./FeedbackController"),
	multer = require('multer'),
	fs = require('fs'),
	path = require('path');

class CreateGroupController extends LoginRequiredController {

	constructor(data) {

		super(undefined, data);

		var self = this;

		this.upload = multer({
			storage: multer.diskStorage({
				destination: function (req, file, cb) {
					cb(null, self.dataBack.photoUploadPath);
				},
				filename: function (req, file, cb) {
					cb(null, file.fieldname + '-' + Date.now());
				}
			})
		}).single(self.dataBack.photoUploadName);



		this.actions.push(function (req, res, cb) {

			var avatar;

			if (req.file)
				avatar = req.file.filename;

			var groupsModel = new GroupsModel(req.app.locals.dbClient, req.app.locals.dbName);

			groupsModel.insertGroup(req.session.userId, req.body.groupname, req.body.description, avatar, function (err, result) {
				
				var feedback;

				if (result.result.n == 1) {

					var constactsModel = new ContactsModel(req.app.locals.dbClient, req.app.locals.dbName);

					constactsModel.pushGroup(req.session.userId, result.ops[0]._id, function (err, result) {
						if (err) throw err;

						feedback = new FeedbackController(
							'Warning',
							'Create Group successful',
							'/groups',
							'ok',
							self.data
						);

						feedback.run(req, res);

						cb(err, false);

					});

				} else {

					var p = path.join(req.app.locals.path, req.file.path);

					try {
						fs.unlinkSync(p);
					} catch (err) {
						console.error(err);
					}

					var feedback = new FeedbackController(
						'Warning',
						'Create Group failed',
						'/groups',
						'ok',
						self.data
					);

					feedback.run(req, res);

					cb(err, false);
					
				}
			

			});
		});

		this.actions.push(function (req, res, cb) {

			self.upload(req, res, function (err) {
				if (err) throw err;
				cb(err, true);
			});

		});

	}
}

module.exports = CreateGroupController;