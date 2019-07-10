const path = require('path');

var config = {

	local: {
		mode: 'local',
		port: 3000,
		mongo: {
			host: '127.0.0.1',
			port: 27017
		},		
		appInfo:{
			front: {
				title: 'GeekLearning Local',
				description: 'Learning Site for Geeks'		
			},
			back:{
				photoUploadName: 'avatar',
				photoUploadPath: path.join(path.dirname(__dirname), "public/upload/avatars"),
				chatFileUploadName: 'chatfile',
				chatFileUploadPath: path.join(path.dirname(__dirname), "public/upload/chatfiles"),
				appDirName: path.dirname(__dirname),
				appDbName: 'dblocal',	
				wss: {
					host: '127.0.0.1',
					port: 9191
				}
			}
		}		
	},
	staging: {
		mode: 'staging',
		port: 4000,
		mongo: {
			host: '127.0.0.1',
			port: 27017
		},
		appInfo:{
			front: {
				title: 'GeekLearning staging',
				description: 'Learning Site for Geeks'
			},
			back:{
				photoUploadName: 'avatar',
				photoUploadPath: path.join(path.dirname(__dirname), "public/upload/avatars"),
				chatFileUploadName: 'chatfile',
				chatFileUploadPath: path.join(path.dirname(__dirname), "public/upload/chatfiles"),
				appDirName: path.dirname(__dirname),
				appDbName: 'dbstaging',	
				wss: {
					host: '127.0.0.1',
					port: 9292
				}		
			}
		}					
	},
	production: {
		mode: 'production',
		port: 5000,
		mongo: {
			host: '127.0.0.1',
			port: 27017
		},
		appInfo:{
			front: {
				title: 'GeekLearning',
				description: 'Learning Site for Geeks'
			},
			back:{
				photoUploadName: 'avatar',
				photoUploadPath: path.join(path.dirname(__dirname), "public/upload/avatars"),
				chatFileUploadName: 'chatfile',
				chatFileUploadPath: path.join(path.dirname(__dirname), "public/upload/chatfiles"),
				appDirName: path.dirname(__dirname),
				appDbName: 'dbgeek',		
				wss: {
					host: '127.0.0.1',
					port: 9393
				}	
			}
		}
	}
};

module.exports = function(mode) {
	return config[mode || process.argv[2] || 'local'] || config.local;
};