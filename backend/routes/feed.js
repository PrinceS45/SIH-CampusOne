import feedSchema from  "../models/FeedModels.js" ; 
import Comment from "../models/feedCommentSchema.js";
import express from "express" ;
import {auth} from "../middleware/auth.js" ;
import multerMiddleware from "../middleware/multerMiddlware.js"
import {cloudinaryUpload , deleteFromCloudinary} from "../lib/cloudinary.js" ;

const router = express.Router() ; 

// @route POST api/feed/
// @desc Create a new feed post
// @access Private
router.post("/", auth , multerMiddleware.single("image"), async (req , res) => {
       try {
           const {text} = req.body ; 
           const file = req.file ; 
           if(!text && !file) {
               return res.status(400).json({message : "Post cannot be empty"}) ; 
           }
           const feedData = {
               user : req.user.id , 
               text  : text , 
           } ;
           if(file ) {
            const result = await cloudinaryUpload(file) ; 
            if(result ) {
                feedData.image = result.secure_url ; 
                feedData.imagePublicId = result.public_id ; 
            }
        }
         const newFeed = new feedSchema(feedData)  ; 
            await newFeed.save() ;
            return res.status(201).json(newFeed) ;
       } catch (error) {
           console.error("Error creating feed post: ", error) ; 
           res.status(500).json({message : "Server Error"}) ;   
       }
} ) ; 

// @route GET api/feed/
// @desc Get all feed posts and all feed reutrn maximum one comment and it will be in array
// @access Private
router.get("/", auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 15;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const feeds = await feedSchema
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "-password")
      .populate({
        path: "comments",
        options: {
          sort: { createdAt: -1 }, 
          limit: 1,                
        },
        populate: {
          path: "user",
          select: "-password",
        },
      });

    res.status(200).json(feeds);
  } catch (error) {
    console.error("Error fetching feed posts:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


// @route get api/feed/:id 
// @desc Get feeds by userid
// @access Private
router.get("/user/:id", auth, async (req, res) => {
  try {
    const userId = req.params.id;
    const limit = parseInt(req.query.limit) || 15;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const feeds = await feedSchema
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "-password")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "-password",
        },
      });

    res.status(200).json(feeds);
  } catch (error) {
    console.error("Error fetching user feeds:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route DELETE api/feed/:id
// @desc Delete a feed post
// @access Private  
router.delete("/:id", auth , async (req , res) => {
    try {
        const feedId = req.params.id ;
        const feed = await feedSchema.findById(feedId) ; 
        if(!feed) {
            return res.status(404).json({message : "Feed not found"}) ; 
        }
        if(feed.user.toString() !== req.user.id) {
            return res.status(401).json({message : "User not authorized"}) ; 
        }
        const deletedFeed = await feedSchema.findByIdAndDelete(feedId) ; 
        if(deletedFeed.imagePublicId) {
            await deleteFromCloudinary(deletedFeed.imagePublicId) ; 
        }
        await Comment.deleteMany({feed : feedId}) ;

        return res.status(200).json({message : "Feed deleted successfully"}) ; 
    } catch (error) {
        console.error("Error deleting feed post: ", error) ; 
        res.status(500).json({message : "Server Error"}) ;   
    }
}) ;

// @route POST api/feed/comment/:id
// @desc Add a comment to a feed post by feed id
// @access Private

router.post("/comment/:id" , auth , async (req , res) => {
    try {
        const feedId = req.params.id ; 
        const {text} = req.body ; 
        if(!text) {
            return res.status(400).json({message : "Comment cannot be empty"}) ; 
        }
        const userId = req.user.id ; 
        const newComment = new Comment({
            user : userId , 
            feed : feedId ,
            text : text ,
            likes : 0  , 
        }) ; 
        await newComment.save() ; 
        return res.status(201).json(newComment) ;
    } catch (error) {
        console.error("Error adding comment: ", error) ; 
        res.status(500).json({message : "Server Error"}) ;
    }
}) ; 

// @route GET api/feed/comment/:id 
// @desc Get comments for a feed post by feed id
// @access Private

router.get("/comment/:id" , auth , async (req , res) => {
    try {
        const feedId = req.params.id ; 
        const limit = parseInt(req.query.limit) || 15;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        const comments = await Comment.find({ feed: feedId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user", "-password");
        res.status(200).json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Server Error" });
    }
})  ; 

//@ ROUT POST api/feed/like/feed/:feedId
//@ DESC LIKE A FEED POST
//@ ACCESS PRIVATE
router.post("/like/feed/:feedId" , auth , async (req , res) => {
    try {
        const feedId = req.params.feedId ;

        const feed = await feedSchema.findById(feedId) ; 
        if(!feed) {
            return res.status(404).json({message : "Feed not found"}) ; 
        }
        feed.likes += 1 ; 
        await feed.save() ; 
        return res.status(200).json({message : "Feed liked successfully" , likes : feed.likes}) ; 
    } catch (error) {
        console.error("Error liking feed: ", error) ; 
        res.status(500).json({message : "Server Error"}) ;   
    }
}) ;

// @ route post api/feed/like/:commentId
// @ desc like a comment
// @ access Private
router.post("/like/:commentId" , auth , async (req , res) => {
    try {
        const commentId = req.params.commentId ; 
        const comment = await Comment.findById(commentId) ; 
        if(!comment) {
            return res.status(404).json({message : "Comment not found"}) ; 
        }           
        comment.likes += 1 ; 
        await comment.save() ; 
        return res.status(200).json({message : "Comment liked successfully" , likes : comment.likes}) ; 
    } catch (error) {
        console.error("Error liking comment: ", error) ; 
        res.status(500).json({message : "Server Error"}) ;   
    }
}) ; 

export default router ;