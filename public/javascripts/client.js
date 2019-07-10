var pingTimeout;

function config1() {
  var input = document.getElementById("textchat");
  if (input)
    input.addEventListener("keyup", function (event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById("btnSend").click();
        input.value = '';
      }
    });
}

function config2() {

  var chatDiv = document.getElementById("chatdiv");

  if (chatDiv) {
    var shouldScroll = chatDiv.scrollTop + chatDiv.clientHeight === chatDiv.scrollHeight;

    if (!shouldScroll) {
      chatDiv.scrollTop = chatDiv.scrollHeight;
    }
  }
}

function heartbeat() {

  clearTimeout(pingTimeout);
  pingTimeout = setTimeout(() => {
    //this.terminate();//resolver isso
  }, 30000 + 1000);
}

function receiveMessage(emmiter, msg) {

  var chatDiv = document.getElementById("chatdiv");


  var div0 = document.createElement("div");
  var div1 = document.createElement("div");
  var div2 = document.createElement("div");

  var img = document.createElement("img");
  img.className = "menu-img";
  img.src = "/upload/avatars/" + msg.emmiter.avatar;
  img.alt = "Smiley face";
  img.height = "42";
  img.width = "42";

  var pUsername = document.createElement("p");
  pUsername.className = "chatUsername";

  //pUsername.appendChild(document.createTextNode(msg.emmiter.username));

  //div1.appendChild(img);
  //div1.appendChild(pUsername);

  var pContent = document.createElement("p");
  pContent.appendChild(document.createTextNode(msg.content));
  div2.appendChild(pContent);


  if (emmiter._id == msg.emmiter._id) {
    pUsername.appendChild(document.createTextNode("Me"));
    div0.className = "chatMe";
    div1.className = "msgMe";
    div2.className = "msgMe";
  } else {
    pUsername.appendChild(document.createTextNode(msg.emmiter.username));
    div0.className = "chatUser";
    div1.className = "chatMsg";
    div2.className = "chatMsg";
  }

  div1.appendChild(img);
  div1.appendChild(pUsername);

  chatDiv.appendChild(div0);
  div0.appendChild(div1);
  div0.appendChild(div2);

  config2();
}

function isOnLine(line) {
  var isonline = document.getElementById("isonline");
  if (line) {
    isonline.innerHTML = 'online';
    isonline.style.color = "green";
  } else {
    isonline.innerHTML = 'offline';
    isonline.style.color = "red";
  }
}

function createClientSocket(server, port, emmiter, receiver, group, sessionId) {
  if (server != 'undefined' && port != 'undefined') {
    config1();
    var e = JSON.parse(JSON.stringify(emmiter));

    var r;
    if(receiver)
      r = JSON.parse(JSON.stringify(receiver));
    var g;

    if(group)
      g = JSON.parse(JSON.stringify(group));

    return new ClientSocket(server, port, e, r, g, sessionId);
  }
  return undefined;
}


class ClientSocket {

  constructor(server, port, emmiter, receiver, group, sessionId) {

    this.emmiter = emmiter;
    this.receiver = receiver;
    this.group = group;
    this.sessionId = sessionId;

    var self = this;

    if (server != 'undefined' && port != 'undefined') {

      this.socket = new WebSocket('ws://' + server + ':' + port);

      this.socket.addEventListener('ping', event => {
        if (event.data) {
          console.log('onping:' + JSON.stringify(event.data));
          var data = JSON.parse(event.data);
          if (data.receiver) {
            isOnLine(true);
          } else {
            isOnLine(false);
          }
        } else {
          console.log('onping');
        }
        heartbeat();
      });

      this.socket.addEventListener('close', () => {
        clearTimeout(pingTimeout);
      });


      this.socket.sendMessage = function (type, content) {
        if (content != '')
          this.send(
            JSON.stringify({
              type: type,
              data: {
                emmiter: self.emmiter,
                receiver: self.receiver,
                group: self.group,
                sessionId: self.sessionId,
                content: content
              }
            })
          );
      };



      this.socket.onopen = function () {
        this.sendMessage('open', 'open');
        heartbeat();
        console.log("WebSocket is open now.");
      };

      this.socket.onclose = function (event) {
        console.log("WebSocket is closed now.");
      };

      this.socket.onmessage = function (event) {

        var msg = JSON.parse(event.data);

        if (msg.data.receiver) {
          isOnLine(true);
        } else {
          isOnLine(false);
        }

        switch (msg.type) {
          case 'chatMsg':
            receiveMessage(self.emmiter, msg.data);
            break;
          case 'ping':
            console.log("WebSocket ping received:", event);
            this.sendMessage('pong', 'pong');
            break;
          case 'pong':
            console.log("WebSocket pong received:", event);
            break;
          default:
            console.log("WebSocket message received:", event);
        }
        heartbeat();
      };

      this.socket.onerror = function (event) {
        console.log("WebSocket error observed:", event);
      };



    }
  }
}