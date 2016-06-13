var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var app = express();

var User = require('./models/user');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname,'node_modules')));
//app.use(express.static(path.join(__dirname,'../client/dist')));
//???????????
 app.use(require('express-session')({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
//passport strategy
// passport.use(new LocalStrategy(
//   function(username, password, done) {
//     User.findOne({ username: username }, function (err, user) {
//       if (err) { return done(err); }
//       if (!user) {
//         console.log('Incorrect username.');
//         return done(null, false, { message: 'Incorrect username.' });
//       }
//       user.comparePassword(password, done);
//     //   if (!user.validPassword(password)) {
//     //     console.log('Incorrect password.');
//     //     return done(null, false, { message: 'Incorrect password.' });
//     //   }
//       //return done(null, user);
//     });
//   }
// ));
passport.use(new LocalStrategy(
    function(username,password,done){
        User.getAuthenticated(username,password,done)
    }
));
passport.serializeUser(function(user, done) {
  done(null, {id:user.id,username:user.username});
});

passport.deserializeUser(function(user, done) {
  User.findById(user.id, function(err, user) {
    done(err, user);
  });
});


var debug = require('debug')('whatsup:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '8000');
//app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
//server.on('error', onError);
//server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

var io = require( "socket.io" )( server );

var Message = require('./models/message');
var connectList = Array();
io.sockets.on('connection', function(socket) {
                  //console.log("Connection");
                  socket.on('add user',function(userid){
                      connectList.push(userid);
                      socket.userid = userid;
                      console.log("add user"+userid);
                  });
                  socket.on('message from client',function(message){
                      console.log(message);
                      var m = new Message({
                          sendername:message.sender.name,
                          senderid:message.sender.id,
                          receivername:message.receiver.name,
                          receiverid:message.receiver.id,
                          value:message.value,
                          time:message.time,
                          status:message.status,
                      });
                      m.save();
                      var data = {
                          "val":message,
                          "type":1
                      }
                      io.emit(message.receiver.id,data);
                      //socket.emit(data.sender.id,"Your message have been delievered successful");
                  });
                  socket.on('disconnection',function(){

                      var index = connectList.indexOf(socket.userid);
                      if(index>-1){
                        connectList.slice(index,1);
                      }
                 });
          });
routes.post('/post/addfriends',function (req,res) {
    var newfriend = req.body;
    //console.log(newfriend);
    var message = {
        "sender":{
            "name":"Friend Request",
            "id":"0"
        },
        "receiver":{
            "name":newfriend.adduser.name,
            "id":newfriend.adduser.id
        },
        "value":"New Friend Request",
        "time":Date(),
        "status":"0",
        "extra":{
            "user":{
                "name":newfriend.user.name,
                "id":newfriend.user.id,
                "photo":newfriend.user.photo
            },
            "groupid":newfriend.groupid,
            "message":newfriend.message,
            "status":"0"
        }
    };
    var m = new Message({
        sendername:message.sender.name,
        senderid:message.sender.id,
        receivername:message.receiver.name,
        receiverid:message.receiver.id,
        value:message.value,
        time:message.time,
        status:message.status,
        extra:message.extra
    });
    m.save();
    try{
        var data = {
            "val":message,
            "type":1
        };
        io.emit(newfriend.adduser.id,data);
    }catch (err){
        console.log(err);
    }
    // User.findOne({_id:newfriend.user.id},)
});

var Friend = require('./models/friend');
var Group = require('./models/group');
routes.post('/post/dealfriendrequest',function (req,res) {
    var user = req.body.user;
    var friend = req.body.friend;
    var status = req.body.status;
    if(status!=1)
        return ;
    Friend.findOne({_id:user.groupid},function (err,doc) {
        if(!doc)
            return ;
        doc.member.push({"name":friend.name,"id":friend.id});
        doc.save(function (err,doc) {
            Friend.findOne({_id:friend.groupid},function (err,doc) {
                if(!doc)
                    return ;
                doc.member.push({"name":user.name,"id":user.id});
                doc.save();
                var message = {
                    "groupid":friend.groupid,
                    "user":{
                        "name":user.name,
                        "id":user.id,
                        "photo":user.photo
                    }
                }
                var data = {
                    "type":2,
                    "val":message
                };
                io.emit(friend.id,data);
                res.send(true);
            });
        });
    });
});
routes.post('/post/deletefriend',function (req,res) {
    var user = req.body.user;
    var deluser = req.body.deletedfriend;
    var groupid = req.body.groupid;
    Friend.findOne({_id:groupid},function (err,doc) {
        if(!doc)
            return ;
        for(var i = 0;i<doc.member.length;i++)
            if(doc.member[i].id == deluser.id){
                doc.member.splice(i,1);
                break;
            }
        doc.save(function (err,doc) {
            if(!doc)
                return ;
            Group.findOne({userid:deluser.id},function (err,doc) {
                if(!doc)
                    return ;
                for(var i = 0;i<doc.group.length;i++){
                    Friend.findOne({_id:doc.group[i].id},function (err,doc) {
                        if(!doc)
                            return;
                        for(var i = 0;i<doc.member.length;i++)
                            if(doc.member[i].id == user.id){
                                doc.member.splice(i,1);
                                doc.save();
                                var data = {
                                    "type":3,
                                    "val":{
                                        "name":user.name,
                                        "id":user.id,
                                    }
                                };
                                io.emit(deluser.id,data);
                                res.send(true);
                                break;
                            }
                    });
                }
            })
        });
    });
});
module.exports = app;
