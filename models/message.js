var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;

var MessageSchema = new Schema({
    sendername:String,
    senderid:String,
    receivername:String,
    receiverid:String,
    value:String,
    time:{ type: Date, default: Date.now },
    status:Number,
    extra:{}
});

module.exports = mongodb.mongoose.model('Message', MessageSchema);
