var express =require('express');
var path=require('path')
var mongoose=require('mongoose')
var bodyParser=require('body-parser')
var session = require('express-session')
var connectFlash=require('connect-flash')
var expresSession=require('express-session')
var app=express();
var Article=require('./models/articles')
var User =require('./models/user');
var passwordHash=require('password-hash')
var config=require('./config/database')
var passport=require('passport')


//PORT 
var port=process.env.PORT||8000;
// connecting to db
mongoose.connect(config.database, {useNewUrlParser: true,useUnifiedTopology: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to mongodb');
});


//Body- PArser middleWare
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

//express-session
// app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,

}))

//passprt middleware
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());


app.get('*',function(req,res,next){
    res.locals.user=req.user || null;
    next();
});



//express-messages

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
 
// parse application/json
app.use(bodyParser.json())
 
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs')

//public folder
app.use(express.static(path.join(__dirname+'/public/')));

app.get('/',ensureAuthenticated,function(req,res){
    Article.find({},function(error,articles){
        if(error){
            console.log('error');
        }
        else{
            // console.log(articles);
            res.render('index',{
                arti:articles
            });
        }
        
    });
    
});

app.get('/articles/add-form',ensureAuthenticated,function(req,res){
    res.render('add');
})
//get Single Article

app.get('/articles/:id',ensureAuthenticated,function(req,res){
    Article.findById(req.params.id,function(err,article){
        User.findById(article.author,function(err,user){
            res.render('article',{
                article:article,
                author:user.name
            });
        });
        

    });
});
app.post('/articles/find',function(req,res){
Article.findOne({title:req.body.name},function(err,article){
    if (err){
        console.log('not found');
        req.flash('danger','article not found');
    }
    if(!article){
        console.log(req.body.name);
        req.flash('danger','article not found');
        res.redirect('/');
    }
    else{
        res.redirect('/articles/'+article._id)
    }
    
})
});

app.post('/articles/add',function(req,res){
    var article=new Article();
    article.title=req.body.title;
    article.author=req.user._id;
    article.body=req.body.body;
    article.area=req.body.area;
    
    article.save(function(err){
        if(err){
            console.log('Error');
            return;
        }
        else{
            req.flash('success','Article added succesfully!');
            res.redirect('/');
        }
    })
    
});
//load update form
app.get('/articles/update/:id',ensureAuthenticated,function(req,res){
    Article.findById(req.params.id,function(err,article){
        User.findById(article.author,function(err,user){
            if (article.author!=req.user._id){
                req.flash('danger','Not Authorized!');
                res.redirect('/');
            }
            res.render('update',{
                article:article,
                author:user.name
            });
        });
        

    });
});

//update operation
app.post('/articles/update/:id',function(req,res){
    var article ={}

    // var article=new Article();
    article.title=req.body.title;
    article.author=req.user._id;
    article.body=req.body.body;
    
    var query={_id:req.params.id}
    Article.update(query,article,function(err){
        if(err){
            console.log('Error');
            return;
        }
        else{
            req.flash('success','Article updated succesfully!');
            res.redirect('/');
        }
    })
    
});

//delete
app.delete('/articles/:id',function(req,res){
 var query= {_id:req.params.id}
 Article.remove(query,function(err){
     if(err){
        req.flash('danger','Article cannot be deleted!');
     }
     req.flash('success','Article deleted succesfully!');
     res.send('success');
 })
})

// user routes


//signup form
app.get('/register',function(req,res){
    res.render('register');
})


//login form
app.get('/login',function(req,res){
    res.render('login')
})

//logout 
app.get('/logout',function(req,res){
    req.logout();
    req.flash('success','you are logged out thanks for visiting!');
    res.render('login')
})


//register process/signup
app.post('/user/register',function(req,res){
var newUser =new User({
    name:req.body.name,
    email:req.body.email,
    username:req.body.username,
    password:req.body.password
});
// console.log(newUser.password);
var hashedPassword = passwordHash.generate(newUser.password);
newUser.password=hashedPassword
// console.log(hashedPassword);
newUser.save(function(err){
    if(err){
        console.log('error');
    }
    else{
        console.log('Registered');
        req.flash('success','You are resgistered now you can login')
        res.redirect('/login');
    }
})
});



//login process
app.post('/user/login',function(req,res,next){
    passport.authenticate('local',{
        successRedirect:'/',
        failureRedirect:'/login',
        failureFlash:true
    })(req,res,next);
})


//Access control
function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        req.flash('danger','please login!');
        res.redirect('/login');
    }
}


app.listen(port,function(){
    console.log('up and running');
});

