var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/whatsup');

var db = mongoose.connection;
 
db.on('error', function (err) {
console.log('connection error', err);
});
db.once('open', function () {
console.log('connected.');
});
 
exports.mongoose = mongoose;