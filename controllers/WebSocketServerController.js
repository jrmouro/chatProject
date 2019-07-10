var WebSocket = require('ws'),
    multer = require('multer'),
    LoginRequiredController = require("./LoginRequiredController"),
    ChatModel = require('./../models/ChatModel'),
    FeedbackController = require("./FeedbackController"),
    UsersModel = require('./../models/UsersModel');

class ClientsChat {

    constructor() {
        this.clientChatList = {};
    }

    addClient(clientSocket) {
        this.clientChatList[clientSocket.emmiterId + clientSocket.receiverId + clientSocket.groupId] = clientSocket;
    }

    delClient(clientSocket) {
        delete this.clientChatList[clientSocket.emmiterId + clientSocket.receiverId + clientSocket.groupId];
    }

    getClientSocket(userId, userChatTo, groupId) {
        return this.clientChatList[userId + userChatTo + groupId];
    }

    send(userId, userChatTo, groupId, msg) {
        var client = this.getClientSocket(userId, userChatTo, groupId);
        if (client) {
            var client2 = this.getClientSocket(userChatTo, userId, groupId);
            if (client2) {
                client.send(JSON.stringify(msg));
                client2.send(JSON.stringify(msg));
                return 2;
            } else {
                msg.data.receiver = undefined;
                client.send(JSON.stringify(msg));
            }
            return 1;
        }
        return 0;
    }

}

class WebSocketServerController extends LoginRequiredController {

    constructor(dbClient, data, msgCb) {

        super(undefined, data, true);

        var self = this;

        this.upload = multer({
			storage: multer.diskStorage({
				destination: function (req, file, cb) {
					cb(null, self.dataBack.chatFileUploadPath);
				},
				filename: function (req, file, cb) {
					cb(null, file.fieldname + '-' + Date.now());
				}
			})
        }).single(self.dataBack.chatFileUploadName);

        this.actions.push(function (req, res, cb) {


			if (req.file){

                var file = {local: req.file.filename, original: req.file.originalname};

                self.chatModel.insertChat(
                    req.body.emmiterId,
                    req.body.receiverId,
                    req.body.groupId,
                    undefined,
                    file,
                    function (err, result) {

                        //if (err) throw err;  

                        if(result.result.ok == 1){

                            self.clientsChat.send(
                                req.body.emmiterId,
                                req.body.receiverId,
                                req.body.groupId, 
                                {
                                    type: 'chatMsg',
                                    data: {
                                        emmiter: self.user,
                                        receiver: req.body.receiverId,
                                        groupId: req.body.receiverId,
                                        sessionId: req.session._Id,
                                        file:req.file.filename,
                                        content: ''
                                    }
                                });

                                cb(err, true);

                        }else{

                            var feedback = new FeedbackController(
                                'Warning',
                                'Message register error',
                                '/',
                                'ok',
                                self.data
                            );
            
                            feedback.run(req, res);
            
                            cb(null, false);
                        }


                    });
                
            }else{

                var feedback = new FeedbackController(
                    'Warning',
                    'File upload error',
                    '/',
                    'ok',
                    self.data
                );

                feedback.run(req, res);

                cb(null, false);

            }
        });
        
        this.actions.push(function (req, res, cb) {

			self.upload(req, res, function (err) {
				if (err) throw err;
				cb(err, true);
			});

		});

        this.server = new WebSocket.Server({
            port: data.back.wss.port,
            clientTracking: true,
            verifyClient: (info, cb) => {
                cb(true);
            }
        });

        if (msgCb)
            this.msgCb = [msgCb];
        else
            this.msgCb = [];

        this.clientsChat = new ClientsChat();

        this.chatModel = new ChatModel(dbClient, data.back.appDbName);

        this.usersModel = new UsersModel(dbClient, data.back.appDbName);

        this.interval = setInterval(() => {

            this.server.clients.forEach(function each(ws) {

                if (ws.isAlive == false) {
                    console.log('ws.terminate()');
                    self.clientsChat.delClient(ws);
                    return ws.terminate();
                }

                ws.isAlive = false;

                if (self.clientsChat.getClientSocket(ws.receiverId, ws.emmiterId, ws.groupId)) {

                    ws.send(JSON.stringify({
                        type: 'ping',
                        data: {
                            emmiter: ws.emmiterId,
                            receiver: ws.receiverId,
                            groupId: ws.groupId,
                            sessionId: ws.sessionId,                            
                            content: ''
                        }
                    }), false, function () {});

                } else {

                    ws.send(JSON.stringify({
                        type: 'ping',
                        data: {
                            emmiter: ws.emmiterId,
                            receiver: undefined,
                            groupId: ws.groupId,
                            sessionId: ws.sessionId,
                            content: ''
                        }
                    }), false, function () {});

                }

            });
        }, 30000);

        this.server.on('connection', (socket, req) => {

            socket.isAlive = true;

            socket.on('close', () => {

                var receiverSocket = this.clientsChat.getClientSocket(socket.receiverId, socket.emmiterId, socket.groupId);

                if (receiverSocket) {

                    receiverSocket.send(JSON.stringify({
                        type: 'ping',
                        data: {
                            emmiter: receiverSocket.receiverId,
                            receiver: undefined,
                            groupId: receiverSocket.groupId,
                            sessionId: receiverSocket.sessionId,
                            content: ''
                        }
                    }), false, function () {});

                }

                this.clientsChat.delClient(socket);

            });

            socket.on('message', message => {

                var msg = JSON.parse(message);
                socket.isAlive = true;
                socket.emmiterId = msg.data.emmiter._id;
                if(msg.data.receiver)
                    socket.receiverId = msg.data.receiver._id;
                if(msg.data.group)
                    socket.groupId = msg.data.group._id;
                socket.sessionId = msg.data.sessionId;

                self.clientsChat.addClient(socket);

                switch (msg.type) {

                    case 'chatMsg':

                        self.usersModel.getUserById(msg.data.emmiter._id, function (err, result) {

                            if (err) throw err;

                            if (result) {

                                msg.data.emmiter.avatar = result.avatar || undefined;
                                msg.data.emmiter.username = result.username || undefined;

                                var gId;
                                if(msg.data.group)
                                    gId = msg.data.group._id;

                                var rId;
                                if(msg.data.receiver)
                                    rId = msg.data.receiver._id;

                                self.chatModel.insertChat(
                                    msg.data.emmiter._id,
                                    rId,
                                    gId,
                                    msg.data.content,
                                    undefined,
                                    function (err, result) {

                                        if (err) throw err;  

                                        self.clientsChat.send(
                                            msg.data.emmiter._id, 
                                            rId, 
                                            gId, 
                                            JSON.parse(JSON.stringify(msg)));

                                    });
                            }else{

                                throw new Error('there is no user emmiter');

                            }
                            
                        });

                        this.msgCb.forEach((cb) => {
                            cb(msg.data);
                        });

                        break;
                    case 'ping':
                        console.log("WebSocket ping received:");
                        break;
                    case 'pong':
                        console.log("WebSocket pong received:");
                        break;
                    case 'open':
                        console.log("WebSocket open received:");

                        var receiverSocket = this.clientsChat.getClientSocket(socket.receiverId, socket.emmiterId);

                        if (receiverSocket) {

                            socket.send(JSON.stringify({
                                type: 'ping',
                                data: {
                                    emmiter: socket.emmiterId,
                                    receiver: socket.receiverId,
                                    group: socket.groupId,
                                    sessionId: socket.sessionId,
                                    content: ''
                                }
                            }), false, function () {});

                            receiverSocket.send(JSON.stringify({
                                type: 'ping',
                                data: {
                                    emmiter: socket.emmiterId,
                                    receiver: socket.receiverId,
                                    group: socket.groupId,
                                    sessionId: socket.sessionId,
                                    content: ''
                                }
                            }), false, function () {});

                        } else {

                            socket.send(JSON.stringify({
                                type: 'ping',
                                data: {
                                    emmiter: socket.emmiterId,
                                    receiver: undefined,
                                    group: socket.groupId,
                                    sessionId: socket.sessionId,
                                    content: ''
                                }
                            }), false, function () {});

                        }
                        break;
                    default:
                        console.log("WebSocket message received:", msg);
                }

            });
        });

        this.server.on('close', () => {
            console.log("WebSocketServer closed");
        });


    }

    addMsgListening(cb) {
        this.msgCb.push(cb);
    }

}

module.exports = WebSocketServerController;