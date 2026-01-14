import mongoose from "mongoose";

const feedSchema = new mongoose.Schema(
  {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    } , 
    text : {
        type: String,
    } , 
    image : {
       type : String ,    
    } , 
    imagePublicId : {
       type : String ,    
    } ,
    likes : {
        type : Number , 
        default : 0 ,
    } , 
    comments : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Comment" , 
    }] , 
}  , {timestamps : true})  ; 

const Feed = mongoose.model("Feed" , feedSchema) ;

export default Feed ;