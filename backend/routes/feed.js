import express from "express";
import { auth } from "../middleware/auth.js";
import multerMiddleware from "../middleware/multerMiddlware.js";
import {
  createFeedPost,
  getAllFeeds,
  getFeedsByUserId,
  deleteFeedPost,
  toggleLikeFeed,
  addComment,
  getCommentsForFeed,
  toggleLikeComment,
  getLikedUsers
} from "../controllers/feedController.js";

const router = express.Router();

// @route POST api/feed/
// @desc Create a new feed post
// @access Private
router.post("/", auth, multerMiddleware.single("image"), createFeedPost);

// @route GET api/feed/
// @desc Get all feed posts
// @access Private
router.get("/", auth, getAllFeeds);

// @route GET api/feed/user/:id 
// @desc Get feeds by userid
// @access Private
router.get("/user/:id", auth, getFeedsByUserId);

// @route DELETE api/feed/:id
// @desc Delete a feed post
// @access Private  
router.delete("/:id", auth, deleteFeedPost);

// @route POST api/feed/comment/:id
// @desc Add a comment to a feed post by feed id
// @access Private
router.post("/comment/:id", auth, addComment);

// @route GET api/feed/comment/:id 
// @desc Get comments for a feed post by feed id
// @access Private
router.get("/comment/:id", auth, getCommentsForFeed);

//@ ROUT POST api/feed/like/feed/:feedId
//@ DESC LIKE/UNLIKE A FEED POST
//@ ACCESS PRIVATE
router.post("/like/feed/:feedId", auth, toggleLikeFeed);

// @ route post api/feed/like/:commentId
// @ desc like/unlike a comment
// @ access Private
router.post("/like/:commentId", auth, toggleLikeComment);

// @ route get api/feed/liked-by/:feedId
// @ desc Get users who liked a post
// @ access Private
router.get("/liked-by/:feedId", auth, getLikedUsers);

export default router;