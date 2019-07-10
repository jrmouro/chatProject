/* eslint-disable no-console */
/**
 * Module dependencies.
 */

var express = require('express'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	logger = require('morgan'),
	http = require('http'),
	path = require('path'),
	config = require('./config')(),
	app = express(),
	BaseController = require('./controllers/BaseController'),
	HomeController = require('./controllers/HomeController'),
	LoginController = require('./controllers/LoginController'),
	LogoutController = require('./controllers/LogoutController'),
	RegisterController = require('./controllers/RegisterController'),
	InvitationController = require('./controllers/InvitationController'),
	InvitationFormController = require('./controllers/InvitationFormController'),
	AcceptInvitationController = require('./controllers/AcceptInvitationController'),
	RefuseInvitationController = require('./controllers/RefuseInvitationController'),
	DeleteInvitationController = require('./controllers/DeleteInvitationController'),
	InvitationsController = require('./controllers/InvitationsController'),
	ContactsController = require('./controllers/ContactsController'),
	GroupsController = require('./controllers/GroupsController'),
	GroupController = require('./controllers/GroupController'),
	CreateGroupController = require('./controllers/CreateGroupController'),
	ChatController = require('./controllers/ChatController'),
	MongoClient = require('mongodb').MongoClient,
	WebSocketServerController = require('./controllers/WebSocketServerController');

// all environments
// app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/templates');
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(
  { 
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
  })
);



MongoClient.connect('mongodb://' + config.mongo.host + ':' + config.mongo.port + '/', {
	useNewUrlParser: true
}, function (err, dbClient) {
	if (err) {
		console.log('Sorry, there is no mongo db server running.');
	} else {

		app.locals.wssCtrl = new WebSocketServerController(dbClient, config.appInfo, function(msgData){
			console.log(msgData);
		});

		var attachDB = function (req, res, next) {
			req.app.locals.dbClient = dbClient;
			req.app.locals.dbName = config.appInfo.back.appDbName;
			app.locals.path = __dirname;
			next();
		};

		app.all('/fileUploadChat', attachDB, function (req, res, next) {
			var ctrl = req.app.locals.wssCtrl;
			ctrl.run(req, res, next);
		});

		app.all('/register', attachDB, function (req, res, next) {
			var ctrl = new RegisterController(config.appInfo);
			ctrl.run(req, res, next);
		});

		app.all('/chatForm', attachDB, function (req, res, next) {
			var ctrl = new ChatController(config.appInfo);
			ctrl.run(req, res, next);
		});

		app.all('/registerForm', function (req, res, next) {			
			var ctrl = new BaseController('registerForm', config.appInfo);
			ctrl.run(req, res, next);
		});

		app.all('/loginForm', function (req, res, next) {
			var ctrl = new BaseController('loginForm', config.appInfo);
			ctrl.run(req, res, next);
		});

		app.all('/invitations', function (req, res, next) {
			var ctrl = new InvitationsController(config.appInfo);
			ctrl.run(req, res, next);
		});

		app.all('/invitation', function (req, res, next) {
			var ctrl = new InvitationController(config.appInfo);
			ctrl.run(req, res, next);
		});

		app.all('/invitationForm', function (req, res, next) {
			var ctrl = new InvitationFormController(config.appInfo);
			ctrl.run(req, res, next);
		});

		app.all('/acceptInvitation', function (req, res, next) {
			var ctrl = new AcceptInvitationController(config.appInfo);
			ctrl.run(req, res, next);
		});

		app.all('/refuseInvitation', function (req, res, next) {
			var ctrl = new RefuseInvitationController(config.appInfo);
			ctrl.run(req, res, next);
		});

		app.all('/deleteInvitation', function (req, res, next) {
			var ctrl = new DeleteInvitationController(config.appInfo);
			ctrl.run(req, res, next);
		});

		app.all('/login', attachDB, function (req, res, next) {
			var ctrl = new LoginController(config.appInfo);
			ctrl.run(req, res, next);
		});

		app.all('/logout', attachDB, function (req, res, next) {
			var ctrl = new LogoutController(config.appInfo);
			ctrl.run(req, res, next);
		});

		app.all('/contacts', attachDB, function (req, res, next) {
			var ctrl = new ContactsController(config.appInfo);
			ctrl.run(req, res, next);
		});

		app.all('/groups', attachDB, function (req, res, next) {
			var ctrl = new GroupsController(config.appInfo);
			ctrl.run(req, res, next);
		});

		app.all('/group', attachDB, function (req, res, next) {
			var ctrl = new GroupController(config.appInfo);
			ctrl.run(req, res, next);
		});
		
		app.all('/createGroup', attachDB, function (req, res, next) {
			var ctrl = new CreateGroupController(config.appInfo);
			ctrl.run(req, res, next);
		});

		app.all('/groupForm', attachDB, function (req, res, next) {
			var ctrl = new BaseController('groupForm', config.appInfo);
			ctrl.run(req, res, next);
		});

		app.all('/', attachDB, function (req, res, next) {
			var ctrl = new HomeController(config.appInfo);
			ctrl.run(req, res, next);
		});

		http.createServer(app).listen(config.port, function () {
			console.log(
				'Successfully connected to mongodb://' + config.mongo.host + ':' + config.mongo.port,
				'\nExpress server listening on port ' + config.port
			);
		});

		
		

	}
});