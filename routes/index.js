var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Message = require('../models/message');
var Group = require('../models/group');
var Friend = require('../models/friend');
var Profile = require('../models/profile');
var mongodb = require('../models/mongodb');
var EventEmitter = require('events').EventEmitter;
/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });
router.get('/',function(req,res,next){
   res.render('index.html');
});

// router.get('/json/init.json',function(req,res) {
//     res.json('json/init.json');
// });
// router.get('/login',function(req,res){
//     res.render('login',{title:"What's Up"});
// });

router.post('/post/login',
  passport.authenticate('local'),
  function(req, res) {
    //console.log(req.query.form);
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    //res.redirect('/users/' + req.user.username);
      res.send(true);
  });

router.post('/post/register',function (req,res) {
    //res.render('register',{title:"What's Up"});
    console.log(req.body.form);
    var photoStr = req.body.image;

    try{
        var user = new User({
            username: req.body.form.username,
            password: req.body.form.password,
            email: req.body.form.email,
            photo: new Buffer(photoStr.split('data:image/png;base64,')[1],"base64")
        });
    }
    catch (err){
        console.log(err);
    }
    //console.log(user);
    user.save(function (err,doc) {
        //console.log("before");
        if(!doc)
            return ;
        //console.log("after");
        var profile = new Profile({
            name:req.body.form.username,
            id: doc._id
        });
        profile.save();
    });
    // User.findOne({username:req.body.form.username},function (err,doc) {
    //     console.log(doc);
    //     if(!doc)
    //         return ;
    //     var profile = new Profile({
    //         name:req.body.form.username,
    //         id: doc._id
    //     });
    //     profile.save();
    // })
    //console.log(user);
    res.send(true);
});
router.get('/checkusername',function (req,res) {
    //var username = req.body.username;
    User.findOne({username:req.query.username},function (err,doc) {
        if(!doc)
            res.send(true);
        else res.send(false);
    });
});
function findField(arr,field,value) {
    var i = 0;
    for(i = 0;i<arr.length;i++)
        if(arr[i][field] == value)
            break;
    return i;
}
router.get('/json/init.json',function (req,res) {
    //console.log(req.query.name);
    //var emmiter = EventEmitter();
    var emitter = new EventEmitter();
    User.findOne({username:req.query.username},function (err,doc) {
        //if(!doc)
        //    res.send(true);
        //else res.send(false);
        var person = {
            "name": undefined,
            "id":undefined,
            "photo": undefined
        }
        var friendlist = [];
        var init = {
            "user":person,
            "friendlist":[]
        }
        if(!doc)
        {

            res.json(init);
            return ;
        }
        person.name = doc.username;
        person.id = doc._id;
        person.photo = doc.photo.toString('base64');
        //console.log(doc);
        Group.findOne({userid:person.id},function (err,doc) {
            if(!doc){
                res.json(init);
                return ;
            }
            //console.log(doc);
            var count = 0;
            var newgroup = function (times) {
                var count = 0;
                return function (group) {
                    if(group){
                        init.friendlist.push(group);
                        count++;
                    }
                    //console.log('new group '+ times);
                    if(count == times)
                        return res.json(init);
                }
            }
            emitter.on('new group',newgroup(doc.group.length));
            if(doc.group.length == 0)
                emitter.emit('newgroup');
            for(var i = 0;i<doc.group.length;i++){
                Friend.findOne({_id:doc.group[i].id},function (err,doc){
                    //console.log(doc);
                    if(!doc)
                        return ;
                    //console.log('test');
                    var group = {
                                   "tagname":doc.groupname,
                                   "tagid":doc._id,
                                   "tagmember":[]
                               };
                    var newfriend = function(times) {
                        var count = 0;
                        return function(friend){
                            if(friend){
                                group.tagmember.push(friend);
                                count++;
                            }
                            //console.log('new friend '+times);
                            if(count == times){
                                //console.log('emit group '+ times);
                                emitter.emit('new group',group);
                            }
                        }
                    };
                    emitter.on(group.tagid,newfriend(doc.member.length));
                    var id = doc._id;
                    if(doc.member.length == 0)
                        emitter.emit(id);
                    for(var i = 0;i<doc.member.length;i++){
                        //var len = doc.member.length;
                        //console.log('test');
                        User.findOne({_id:doc.member[i].id},function (err,doc) {
                            //console.log('test');
                            if(!doc)
                                return ;
                            var friend = {
                                "name":doc.username,
                                "id":doc._id,
                                "photo":doc.photo.toString('base64')
                            }
                            emitter.emit(id,friend);
                        })
                    }
                });
            }
            // var groupresult = doc.group;
            // Friend.find({_id:doc.group},function (err,doc) {
            //    for(var i = 0;i<doc.length;i++){
            //        var group = {
            //            "tagname":doc[i].groupname,
            //            "tagid":doc[i]._id,
            //            "tagmember":doc[i].member
            //        };
            //        init.friendlist.push(group);
            //    }
            //     res.json(init);
            // });
            // var resultgroup = doc.group;
            // for(var i = 0;i<resultgroup.length;i++){
            //     var group = {
            //         "tagname":doc.group[i].name,
            //         "tagid":doc.group[i].id,
            //         "tagmember":[]
            //     };
            //     //init.friendlist.push(group);
            //     Friend.findOne({_id:doc.group[i].id},function (err,doc) {
            //         //console.log(doc);
            //         if(!doc)
            //             return ;
            //         var member = doc.member;
            //        for(var j = 0;j<member.length;j++){
            //            var friend = {
            //                        "name":member[j].name,
            //                        "id":member[j].id,
            //                    };
            //            group.tagmember.push(friend);
            //            // User.findOne({_id:member[j].id},function (err,doc) {
            //            //     //friend.photo = doc.photo.toString('base64');
            //            //     //console.log(friend);
            //            //     //init.friendlist[init.friendlist.length-1].tagmember.push(friend);
            //            //     //group.tagmember.push(friend);
            //            //     if(!doc)
            //            //         return ;
            //            //     var friend = {
            //            //         "name":doc.username,
            //            //         "id":doc._id,
            //            //         "photo":doc.photo.toString('base64')
            //            //     };
            //            //     var index = findField(init.friendlist,"tagid",group.tagid);
            //            //     if(index<init.friendlist.length) {
            //            //         init.friendlist[index].tagmember.push(friend);
            //            //         console.log("test");
            //            //     }
            //            //     if(j == member.length-1&&i == resultgroup.length-1)
            //            //         return res.json(init);
            //            // });
            //        }
            //         console.log(group);
            //         init.friendlist.push(group);
            //         if(i == resultgroup.length-1)
            //             return res.json(init);
            //         //console.log(group);
            //     });
                //console.log(group);
            //}
            // for(var i = 0;i<doc.length;i++){
            //     var group = {
            //         "tagname":doc.group.tagname,
            //         "tagid":doc.group.tagid,
            //         "tagmember":[]
            //     };
            //     Group.find({group:doc.group},"friend",function (err,doc) {
            //         group.tagmember = doc;
            //         init.friendlist.push(group);
            //     });
            // }
            //res.json(init);
        });
    });
});
function findSenderAndReciever(message,array) {
    var i = 0;
    for(i = 0;i<array.length;i++)
        if(message.sendername == array[i].user.name|| message.receivername == array[i].user.name)
            break;
    return i;
}
router.get('/json/messages.json',function (req,res) {
    var message = [];
    Message.find({$or:[{sendername:req.query.username},{receivername:req.query.username}]},function (err,doc) {
        for(var i = 0;i<doc.length;i++){
            var index = findSenderAndReciever(doc[i],message);
            var item = {
                "sender":{
                    "name":doc[i].sendername,
                    "id":doc[i].senderid
                },
                "receiver":{
                    "name":doc[i].receivername,
                    "id":doc[i].receiverid
                },
                "status":doc[i].status,
                "time":doc[i].time,
                "value":doc[i].value,
            };
            if(doc[i].senderid == '0')
                item.extra = doc[i].extra;
            if(index>= message.length)
            {
                var name,id;
                if(doc[i].sendername == req.query.username) {
                    name = doc[i].receivername;
                    id = doc[i].receiverid;
                }
                else{
                    name = doc[i].sendername;
                    id = doc[i].senderid;
                }
                var user = {
                    "user":{
                        "name":name,
                        "id":id
                    },
                    "messages":[item]
                };
                message.push(user);
            }
            else{
                //console.log(message);
                message[index].messages.push(item);
            }
        }
        res.json(message);
    });
});
router.get('/json/profile.json',function (req,res) {
    var userid = req.query.userid;
    User.findOne({_id:userid},function (err,doc) {
        var profile={
            "name":undefined,
            "id":undefined,
            "photo":undefined,
            "status":undefined,
            "birthday":undefined,
            "password":undefined,
            "gender":undefined,
        };
        if(!doc){
            res.json(profile);
            return ;
        }
        profile.name = doc.name;
        profile.id = doc._id;
        profile.photo = doc.photo.toString('base64');
        profile.password = doc.password;
        profile.name = doc.name;
        Profile.findOne({id:profile.id},function (err,doc) {
            //console.log("before");
            if(!doc)
            {
                res.json(profile);
                return ;
            }
            //console.log("after");
            profile.status = doc.status;
            profile.birthday = doc.birthday;
            profile.gender = doc.gender;
            res.json(profile);
        })
    })
});

router.get('/json/friendprofile.json',function (req,res) {
   var userid = req.query.userid;
   User.findOne({_id:userid},function (err,doc) {
       var profile={
           "name":undefined,
           "id":undefined,
           "photo":undefined,
           "status":undefined,
           "birthday":undefined,
           "gender":undefined,
       };
       if(!doc){
           res.json(profile);
           return ;
       }
       profile.name = doc.name;
       profile.id = doc._id;
       profile.photo = doc.photo.toString('base64');
       profile.name = doc.name;
       Profile.findOne({id:profile.id},function (err,doc) {
           //console.log("before");
           if (!doc) {
               res.json(profile);
               return;
           }
           //console.log("after");
           profile.status = doc.status;
           profile.birthday = doc.birthday;
           profile.gender = doc.gender;
           res.json(profile);
       });
   }) ;
});
router.post('/post/profile',function (req,res) {
    var profile = req.body.profile;
    var id = req.body.id;
    //console.log("test");
    console.log(id);
    try{
        User.update({_id:id},
            {password:profile.password, photo: new Buffer(profile.photo,"base64")},function (err,doc) {
                if (err)
                    console.log(err);
            });
        Profile.findOne({id:id},function (err,doc) {
            // if (err)
            //     console.log(err);
            console.log(doc);
            doc.status = profile.status;
            doc.gender = profile.gender;
            if(profile.birthday)
                doc.birthday = Date.parse(profile.birthday);
            doc.save();
            //console.log(doc);
        });
        // if(profile.birthday)
        //     Profile.findOneAndUpdate({id:id},{birthday:Date.parse(profile.birthday)},function (err,doc) {
        //         if (err)
        //             console.log(err);
        //     });
    }
    catch(err){
        console.log(err);
    }
});
function isFriend(userid,friendid) {
    if(userid == friendid)
        return true;
    Group.findOne({userid:userid},function (err,doc) {
       if(err)
           console.log(err);
       if(!doc)
           return false;
       for(var i = 0;i<doc.group.length;i++){
           Friend.findOne({_id:doc.group[i].id},function (err,doc) {
               if(err)
                   console.log(err);
               if(doc){
                   for(var i = 0;i<doc.member.length;i++)
                    if(doc.member[i].id == friendid)
                        return true;
               }
           });
       }
       return false;
    });
}
router.post('/json/searchbyname.json',function (req,res) {
   var name = req.body.name;
   var user = req.body.user;
   var result = [];
    console.log(name+user);
    try{
        User.find({username:new RegExp('^\w*'+name+'\w*$','i')},function (err,doc) {
            if(err)
                console.log(err);
            console.log(doc);
            for(var i = 0;i<doc.length;i++){
                if(!isFriend(user.id,doc[i]._id)){
                    var person = {
                        "name":doc[i].username,
                        "id":doc[i]._id,
                        "photo":doc[i].photo.toString('base64')
                    };
                    result.push(person);
                }
                res.json(result);
            }
        });
    }catch (err){
        console.log(err);
    }

});
router.get('/json/searchbyemail.json',function (req,res) {
    var user = req.query.user;
    var email = req.query.name;
    var result = [];
    User.find({email:new RegExp('^\w'+name+'\w$','i')},function (err,doc) {
        for(var i = 0;i<doc.length;i++){
            if(!isFriend(user.id,doc[i]._id)){
                var person = {
                    "name":doc[i].username,
                    "id":doc[i]._id,
                    "photo":doc[i].photo.toString('base64')
                };
                result.push(person);
            }
            res.json(result);
        }
    });
});

router.post('/post/addgroup',function (req,res) {
    var user = req.body.user;
    var groupname = req.body.groupname;
    Friend.findOne({userid:user.id,groupname:groupname},function (err,doc) {
        if(!doc){
            var friend = new Friend({
                userid:user.id,
                username:user.name,
                groupname:groupname,
            });
            friend.save(function (err,doc) {
                var newgroup = {
                    "id":doc._id,
                    "name":doc.groupname
                };
                Group.findOne({userid:user.id},function (err,doc) {
                    if(!doc){
                        var group = new Group({
                            userid:user.id,
                            username:user.name,
                            group:[newgroup]
                        });
                        group.save();
                    }
                    else {
                        doc.group.push(newgroup);
                        doc.save();
                    }
                    res.send(newgroup);
                });
            });
        }
    });
});
router.get('/userphoto',function (req,res) {
    var id = req.query.id;
    User.findOne({_id:id},function (err,doc) {
       if(!doc)
       {
           res.send('');
           return ;
       }
        res.send(doc.photo.toString('base64'))
    });
})

// router.post('/post/addfriends',function (req,res) {
//     var newfriend = req.body;
//     var message = {
//         "sender":{
//             "name":"Friend Request",
//             "id":"0"
//         },
//         "receiver":{
//             "name":newfriend.adduser.name,
//             "id":newfriend.adduser.id
//         },
//         "value":"New Friend Request",
//         "time":Date(),
//         "status":"0",
//         "extra":{
//             "user":{
//                 "name":newfriend.user.name,
//                 "id":newfriend.user.id,
//                 "photo":newfriend.user.id
//             },
//             "groupid":newfriend.groupid,
//             "message":newfriend.message,
//             "status":"0"
//         }
//     };
//     try{
//
//         app.io.on('connection',function (socket) {
//             socket.emit(newfriend.adduser.id);
//         });
//     }catch (err){
//         console.log(err);
//     }
//     // User.findOne({_id:newfriend.user.id},)
// })
// router.post('/register',function (req,res) {
//     var user = new User({
//         username: req.body.username,
//         password: req.body.password,
//         email:    req.body.email,
//         nickname: req.body.nickname,
//     });
//     user.save();
//     req.login(user,function(err){
//         if (err) { return next(err); }
//         return res.redirect('/');
//     });
//     next();
// });

// router.get('/chat',function (req,res) {
//     res.render('client',{
//         title:"What's Up",
//         senderid:"12345",
//         receiverid:"54321",
//     });
// })

router.get('/logout', function(req, res){
  //req.logout();
  //res.redirect('/');
});

// router.get('/user',function (req,res) {
//     if(!req.user)
//         return res.redirect('/login');
//     return res.render('user',{title:req.user.username,senderid:req.user.id});

// })
// router.get('/friendlist',function (req,res) {
//     if(!req.user)

//         return res.redirect('/login');
//    var userjson = [];
//    User.find({username:{$ne:req.user.username}},'id username',function (err,data) {
//         if (err) return handleError(err);
//        return res.json(data);
//     });
// })
// router.get('/demo',function(req,res){
//     return res.render('demo');
// })
// router.get('/check/username',function(req,res){
//     console.log(req.query.username);
//     return res.json('catch');
// })
module.exports = router;
