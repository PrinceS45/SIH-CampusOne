import Feed from "../models/FeedModels.js";
import Comment from "../models/feedCommentSchema.js";
import { cloudinaryUpload, deleteFromCloudinary } from "../lib/cloudinary.js";

// Create a new feed post
export const createFeedPost = async (req, res) => {
  try {
    const { text } = req.body;
    const file = req.file;

    if (!text && !file) {
      return res.status(400).json({ message: "Post cannot be empty" });
    }

    const feedData = {
      user: req.user.id,
      text: text,
      likes: [],
      comments: [],
    };

    if (file) {
      const result = await cloudinaryUpload(file);
      if (result) {
        feedData.image = result.secure_url;
        feedData.imagePublicId = result.public_id;
      }
    }

    const newFeed = new Feed(feedData);
    await newFeed.save();

    // Populate user info for the response
    const populatedFeed = await Feed.findById(newFeed._id).populate("user", "-password");

    return res.status(201).json(populatedFeed);
  } catch (error) {
    console.error("Error creating feed post: ", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all feed posts
export const getAllFeeds = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 15;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const feeds = await Feed.find()
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
};

// Get feeds by user ID
export const getFeedsByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    const limit = parseInt(req.query.limit) || 15;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const feeds = await Feed.find({ user: userId })
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
};

// Delete a feed post
export const deleteFeedPost = async (req, res) => {
  try {
    const feedId = req.params.id;
    const feed = await Feed.findById(feedId);

    if (!feed) {
      return res.status(404).json({ message: "Feed not found" });
    }

    if (feed.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    if (feed.imagePublicId) {
      await deleteFromCloudinary(feed.imagePublicId);
    }

    await Feed.findByIdAndDelete(feedId);
    await Comment.deleteMany({ feed: feedId });

    return res.status(200).json({ message: "Feed deleted successfully" });
  } catch (error) {
    console.error("Error deleting feed post: ", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Toggle like on a feed post
export const toggleLikeFeed = async (req, res) => {
  try {
    const { feedId } = req.params;
    const userId = req.user.id;

    const feed = await Feed.findById(feedId);
    if (!feed) {
      return res.status(404).json({ message: "Feed not found" });
    }

    if (!Array.isArray(feed.likes)) {
      feed.likes = [];
    }
    const isLiked = feed.likes.includes(userId);

    if (isLiked) {
      // Unlike
      feed.likes = feed.likes.filter((id) => id.toString() !== userId);
    } else {
      // Like
      feed.likes.push(userId);
    }

    await feed.save();
    return res.status(200).json({ 
      message: isLiked ? "Unliked" : "Liked", 
      likes: feed.likes,
      likeCount: feed.likes.length 
    });
  } catch (error) {
    console.error("Error toggling like on feed: ", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Add a comment
export const addComment = async (req, res) => {
  try {
    const feedId = req.params.id;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const feed = await Feed.findById(feedId);
    if (!feed) {
      return res.status(404).json({ message: "Feed not found" });
    }

    const newComment = new Comment({
      user: req.user.id,
      feed: feedId,
      text: text,
      likes: [],
    });

    await newComment.save();

    // Add comment reference to feed
    feed.comments.push(newComment._id);
    await feed.save();

    // Populate user info
    const populatedComment = await Comment.findById(newComment._id).populate("user", "-password");

    return res.status(201).json(populatedComment);
  } catch (error) {
    console.error("Error adding comment: ", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get comments for a feed
export const getCommentsForFeed = async (req, res) => {
  try {
    const feedId = req.params.id;
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
};

// Toggle like on a comment
export const toggleLikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (!Array.isArray(comment.likes)) {
      comment.likes = [];
    }
    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    return res.status(200).json({ 
      message: isLiked ? "Unliked" : "Liked", 
      likes: comment.likes,
      likeCount: comment.likes.length 
    });
  } catch (error) {
    console.error("Error toggling like on comment: ", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get users who liked a post
export const getLikedUsers = async (req, res) => {
  try {
    const { feedId } = req.params;
    const feed = await Feed.findById(feedId).populate("likes", "name profilePicture");
    
    if (!feed) {
      return res.status(404).json({ message: "Feed not found" });
    }

    res.status(200).json(feed.likes);
  } catch (error) {
    console.error("Error fetching liked users:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
