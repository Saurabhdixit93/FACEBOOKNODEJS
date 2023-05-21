const mongoose = require('mongoose');


const likeSchema = new mongoose.Schema({

    user : {
        type:mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    // this defines the object id of the liked object
    likable : {
        type:mongoose.Schema.Types.ObjectId,
        required : true ,
        refPath: 'onModel' //Dynamic Referancing 
    },
    //this is the field used to define the type of the liked object since it is a dynamaic refernace 
    onModel :{
        type: String ,
        required:true,
        enum : ['post' , 'comment'] //enum defines that or our onModel or liked object can either be a post or a commentn
    }
} , {
    timestamps:true
});

const Like = mongoose.model('Likes' , likeSchema);
module.exports = Like;