import { create } from "zustand";
import api from "../services/api";

const useFeedStore = create((set, get) => ({
  feeds: [],
  userFeeds: [],
  comments: [],
  loading: false,
  error: null,

  // Create a new feed post
  createFeed: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/feed", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      set((state) => ({
        feeds: [response.data, ...state.feeds],
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error creating feed",
        loading: false,
      });
      throw error;
    }
  },

  // Get all feed posts
  fetchFeeds: async (page = 1, limit = 15) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/feed", {
        params: { page, limit },
      });
      set({ feeds: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error fetching feeds",
        loading: false,
      });
      throw error;
    }
  },

  // Get feeds by user ID
  fetchUserFeeds: async (userId, page = 1, limit = 15) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/feed/user/${userId}`, {
        params: { page, limit },
      });
      set({ userFeeds: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error fetching user feeds",
        loading: false,
      });
      throw error;
    }
  },

  // Delete a feed post
  deleteFeed: async (feedId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/feed/${feedId}`);
      set((state) => ({
        feeds: state.feeds.filter((feed) => feed._id !== feedId),
        userFeeds: state.userFeeds.filter((feed) => feed._id !== feedId),
        loading: false,
      }));
      return { message: "Feed deleted successfully" };
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error deleting feed",
        loading: false,
      });
      throw error;
    }
  },

  // Add a comment to a feed post
  addComment: async (feedId, text) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/feed/comment/${feedId}`, { text });
      set((state) => ({
        comments: [response.data, ...state.comments],
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error adding comment",
        loading: false,
      });
      throw error;
    }
  },

  // Get comments for a feed post
  fetchComments: async (feedId, page = 1, limit = 15) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/feed/comment/${feedId}`, {
        params: { page, limit },
      });
      set({ comments: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error fetching comments",
        loading: false,
      });
      throw error;
    }
  },

  // Like a comment
  likeComment: async (commentId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/feed/like/${commentId}`);
      set((state) => ({
        comments: state.comments.map((comment) =>
          comment._id === commentId
            ? { ...comment, likes: response.data.likes }
            : comment
        ),
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error liking comment",
        loading: false,
      });
      throw error;
    }
  },

  // Like a feed post
  likeFeed: async (feedId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/feed/like/feed/${feedId}`);
      set((state) => ({
        feeds: state.feeds.map((feed) =>
          feed._id === feedId
            ? { ...feed, likes: response.data.likes }
            : feed
        ),
        userFeeds: state.userFeeds.map((feed) =>
          feed._id === feedId
            ? { ...feed, likes: response.data.likes }
            : feed
        ),
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error liking feed",
        loading: false,
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Clear feeds
  clearFeeds: () => set({ feeds: [], userFeeds: [], comments: [] }),
}));

export default useFeedStore;
