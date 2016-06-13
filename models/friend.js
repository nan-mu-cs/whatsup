/**
 * Created by andyyang on 16/6/8.
 */
var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;
var MemberSchema = new Schema({
    name:String,
    id:String
})
var FriendSchema = new Schema({
    groupname:String,
    userid:String,
    username:String,
    member:[MemberSchema]
});

module.exports = mongodb.mongoose.model('Friend', FriendSchema);
