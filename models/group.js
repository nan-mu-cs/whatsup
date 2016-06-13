/**
 * Created by andyyang on 16/6/8.
 */
var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;
var Group = new Schema({
    name:String,
    id:String
});
var GroupSchema = new Schema({
    userid:String,
    username:String,
    group:[Group]
});

module.exports = mongodb.mongoose.model('Group', GroupSchema);
