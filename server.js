var express = require('express');
var app = express();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/message_board');
var commentSchema = new mongoose.Schema({
    comment: {type: String, required: [true, 'comment is empty']},
    name: {type: String, required: [true, 'name is empty']}
}, {timestamps: true});
mongoose.model('Comment', commentSchema);
var Comment = mongoose.model('Comment');
var messageSchema = new mongoose.Schema({
    message: {type: String, required: [true, 'message is empty']},
    name: {type: String, required: [true, 'name is empty']},
    comments: [commentSchema]
}, {timestamps: true});
mongoose.model('Message', messageSchema);
var Message = mongoose.model('Message');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
var path = require('path');
app.use(express.static(path.join(__dirname + '/static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
var session = require('express-session');
app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));
const flash = require('express-flash');
app.use(flash());
app.get('/', function(req, res){
    Message.find({}, function(err, all_messages){
        if(err){console.log(err)}
        res.render('index', {all_messages});
    });
});
app.post('/messages', function(req, res){
    var message = new Message({message: req.body.message, name: req.body.name});
    message.save(function(err){
        if(err){
            console.log(err.errors);
            for(var key in err.errors){
                req.flash('messages_error', err.errors[key].message);
            }
            res.redirect('/');
        }else{
            res.redirect('/');
        }
    });
});
app.post('/messages/:id/comments', function(req, res){
    Comment.create({comment: req.body.comment, name: req.body.name}, function(err, data){
        if(err){
            console.log(err.errors);
            for(var key in err.errors){
                req.flash('comments', err.errors[key].message);
            }
            res.redirect('/');
        }else{
            Message.findOneAndUpdate({_id: req.params.id}, {$push: {comments: data}}, function(err, data){
                res.redirect('/');
            });
        }
    });
});
app.listen(8000);