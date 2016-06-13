var mongoose = require('mongoose');
mongoose.connect('mongodb://'+process.env.MONGO_PORT_27017_TCP_ADDR+':'+process.env.MONGO_PORT_27017_TCP_PORT+'/whatsup');
//mongoose.connect('mongodb://localhost/whatsup');

var db = mongoose.connection;

db.on('error', function (err) {
console.log('connection error', err);
});
db.once('open', function () {
console.log('connected.');
});

exports.mongoose = mongoose;
