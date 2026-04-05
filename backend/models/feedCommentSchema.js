import mongoose from "mongoose" ;

const CommentSchema = new mongoose.Schema(
  {
    user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    feed : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Feed" , 
        required : true ,
    },
    text : {
        type: String,
    } , 
    likes : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User" , 
    }] , 
}  , {timestamps : true})  ; 

const Comment = mongoose.model("Comment" , CommentSchema) ;

export default Comment ;