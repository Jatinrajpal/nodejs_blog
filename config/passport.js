var localstrategy=require('passport-local').Strategy;
var User=require('../models/user')
var config=require('../config/database')
var passwordHash=require('password-hash')



module.exports=function(passport){
    //local strategy
    passport.use(new localstrategy(function(username,password,done){
        var query={username:username};
        User.findOne(query,function(err,user){
            if(err){
                console.log('error');
                throw err;
            }
            if (!user){
                return done(null,false,{message:'No user found'}); 
            }
            //match Password
            var check=passwordHash.verify(password,user.password);
            if(check){
                return done(null,user);
            }
            else{
                return done(null,false,{message:'wrong password'});
            }


        });
    }));
    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
      });
}