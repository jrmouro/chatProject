/* eslint-disable no-console */
var BaseController = require("./BaseController"),
	UsersModel = require("../models/UsersModel"),
	multer = require('multer'),
	FeedbackController = require("./FeedbackController"),
	fs = require('fs'),
	path = require('path');

class RegisterController extends BaseController {

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

			var usersModel = new UsersModel(req.app.locals.dbClient, req.app.locals.dbName);

			var feedback;

			usersModel.getUserByEmail(req.body.email, function (err, result) {

				if (result) {

					feedback = new FeedbackController(
						'Warning',
						'Register failed - invalid email',
						'/registerForm',
						'ok',
						self.data
					);

					var p = path.join(req.app.locals.path, req.file.path);

					try {
						fs.unlinkSync(p);
					} catch (err) {
						console.error(err);
					}

					feedback.run(req, res);

					cb(err, false);

				} else {

					usersModel.insertUser(req.body.username, req.body.email, req.body.password, avatar, function (err, result) {

						if (err) throw err;

						if (result.result.n == 1) {

							feedback = new FeedbackController(
								'Warning',
								'Register successful',
								'/loginForm',
								'ok',
								self.data
							);

						} else {

							feedback = new FeedbackController(
								'Warning',
								'Register failed',
								'/registerForm',
								'ok',
								self.data
							);

						}

						feedback.run(req, res);

						cb(err, false);

					});
				}
			});
		});



		this.actions.push(function (req, res, cb) {

			self.upload(req, res, function (err) {
				if (err) throw err;
				cb(err, true);
			});

		});

		/*this.run = function (req, res, next) {

			var profilePhotoControler = new ProfilePhotoControler(data);

			profilePhotoControler.run(req, res, function (req, res) {

				var avatar;

				if (req.file)
					avatar = req.file.filename;

				var usersModel = new UsersModel(req.app.locals.dbClient, req.app.locals.dbName);

				var feedback;

				usersModel.getUserByEmail(req.body.email, function (err, result) {

					if (result) {

						feedback = new FeedbackController(
							'Register failed - invalid email',
							'/registerForm',
							'ok',
							self.data
						);


						var p = path.join(req.app.locals.path, req.file.path);
						try {
							fs.unlinkSync(p);
						} catch (err) {
							console.error(err);
						}

						feedback.run(req, res, next);

					} else {

						usersModel.insertUser(req.body.username, req.body.email, req.body.password, avatar, function (err, result) {

							if (err) throw err;

							if (result.result.n == 1) {

								feedback = new FeedbackController(
									'Register successful',
									'/loginForm',
									'ok',
									self.data
								);

							} else {

								feedback = new FeedbackController(
									'Register failed',
									'/registerForm',
									'ok',
									self.data
								);

							}

							feedback.run(req, res, next);

						});
					}
				});
			});
		};*/
	}
}

module.exports = RegisterController;