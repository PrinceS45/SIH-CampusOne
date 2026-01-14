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
    likes : {
        type : Number , 
        default : 0 ,
    } , 
}  , {timestamps : true})  ; 

const Comment = mongoose.model("Comment" , CommentSchema) ;

export default Comment ;