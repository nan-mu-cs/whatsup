/**
 * Created by andyyang on 16/6/10.
 */
var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;
var ProfileSchema = new Schema({
    name:{type:String,required:true},
    id:{type:Schema.ObjectId,required: Schema.ObjectId},
    gender:{type:String,default:''},
    birthday:{type:Date,default:''},
    status:{type:String,default:''},

});

module.exports = mongodb.mongoose.model('Profile', ProfileSchema);

