var mongoose =require('mongoose')


var articlSchema =mongoose.Schema({
    title:{
        type:String,
        require:true
    },
    author:{
        type:String,
        require:true
    },
    area:{
        type:String,
        require:true
    },
    body:{
        type:String,
        require:true
    }
});

var Articles =module.exports=mongoose.model('Article',articlSchema);