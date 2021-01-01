var mongoose=require('mongoose');

var UserSchema =mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    username:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    }

});
var User =module.exports=mongoose.model('User',UserSchema);