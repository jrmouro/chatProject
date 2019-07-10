var multer = require('multer'),
	BaseController = require("./BaseController");

class ProfilePhotoController extends BaseController {

	constructor(data) {

		super(undefined, data);

		var self = this;

		this.upload = multer({
			storage: multer.diskStorage({
				destination: function (req, file, cb) {
					//cb(null, "./public/uploads/avatars/");
					cb(null, self.data.back.photoUploadPath);
				},
				filename: function (req, file, cb) {
					cb(null, file.fieldname + '-' + Date.now());
				}
			})
		}).single(self.data.back.photoUploadName);


		


		this.run = function (req, res, next) {
			self.upload(req, res, function (err) {
				if (err instanceof multer.MulterError) {
					console.log('A Multer error occurred when uploading.');
					console.log(err);
				} else if (err) {
					throw err;
				}
				next(req, res);
			});
		};

	}
}


module.exports = ProfilePhotoController;