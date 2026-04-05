import React, { useEffect, useState } from 'react';
import CreateFeedModal from './CreateFeedModal';
import useFeedStore from '../../stores/feedStore';
import useAuthStore from '../../stores/authStore';
import CommentModal from "./CommentModal.jsx";
import LikedByModal from "./LikedByModal.jsx";
import { FaUserCircle } from 'react-icons/fa';
import Loader from '../common/Loader';
import { toast } from 'react-hot-toast';
import './feed.css';

function Feed() {
  const { feeds, fetchFeeds, loading, error, likeFeed, deleteFeed } = useFeedStore();
  const { user } = useAuthStore();
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLikedByModal, setShowLikedByModal] = useState(false);
  const [selectedFeedId, setSelectedFeedId] = useState(null);

  useEffect(() => {
    fetchFeeds();
  }, []);

  const handleCommentClick = (feedId) => {
    setSelectedFeedId(feedId);
    setShowCommentModal(true);
  };

  const handleLikedByClick = (feedId) => {
    setSelectedFeedId(feedId);
    setShowLikedByModal(true);
  };

  const handleDeleteFeed = async (feedId) => {
    if (window.confirm('Delete this post? This action cannot be undone.')) {
      try {
        await deleteFeed(feedId);
        toast.success('Post deleted successfully');
      } catch (error) {
        toast.error(error.message || 'Error deleting post');
      }
    }
  };

  const handleLike = async (feedId) => {
    try {
      const response = await likeFeed(feedId);
      toast.success(response.message);
    } catch (error) {
      toast.error('Error updating like');
    }
  };

  if (loading && feeds.length === 0) return (
    <div className="feed-container">
      <Loader message="Loading social feed..." />
    </div>
  );
  if (error) return <div className="feed-container">Error: {error}</div>;

  const currentUserId = user?._id || user?.id;

  return (
    <div className="feed-container">
      <div className="feed-header">
        <h2 className="feed-title">Explore Feed</h2>
        <button className="create-post-btn" onClick={() => setShowCreateModal(true)}>
          New Post
        </button>
      </div>

      {feeds && feeds.length > 0 ? (
        feeds.map((feed) => (
          <div key={feed._id} className="feed-card">
            <div className="feed-card-header">
              <div className="user-info">
                {feed.user?.profilePicture ? (
                  <img 
                    src={feed.user.profilePicture} 
                    className="user-avatar" 
                    alt={feed.user?.name} 
                  />
                ) : (
                  <FaUserCircle className="user-avatar" style={{ color: '#ccc', width: '44px', height: '44px' }} />
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="username">{feed.user?.name || 'Anonymous'}</span>
                    {feed.user?.role === 'alumni' && (
                      <span className="alumni-badge" title="Verified Alumni">Alumni</span>
                    )}
                  </div>
                  <div className="post-time">{new Date(feed.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              {feed.user?._id === currentUserId && (
                <button className="delete-btn" onClick={() => handleDeleteFeed(feed._id)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                  </svg>
                </button>
              )}
            </div>

            <div className="feed-content">
              {feed.text && (
                <>
                  {feed.text.toLowerCase().includes('job') || feed.text.toLowerCase().includes('hiring') || feed.text.toLowerCase().includes('referral') ? (
                    <div className="referral-tag">💼 Job Opportunity / Referral</div>
                  ) : null}
                  <p className="feed-text">{feed.text}</p>
                </>
              )}
              {feed.image && (
                <div className="feed-image-container">
                  <img src={feed.image} className="feed-image" alt="Post" />
                </div>
              )}
            </div>

            <div className="feed-actions">
              <button 
                className={`action-btn ${feed.likes?.includes(currentUserId) ? 'liked' : ''}`} 
                onClick={() => handleLike(feed._id)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {feed.likes?.length || 0}
              </button>
              <button className="action-btn" onClick={() => handleCommentClick(feed._id)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-7.6 8.38 8.38 0 0 1 3.8.9L21 3.5z" />
                </svg>
                {feed.comments?.length || 0}
              </button>
            </div>

            {feed.likes?.length > 0 && (
              <div className="liked-by-section" onClick={() => handleLikedByClick(feed._id)}>
                Liked by {feed.likes.length} people
              </div>
            )}

            {feed.comments && feed.comments.length > 0 && (
              <div className="comment-preview">
                <div className="preview-user">{feed.comments[0].user?.name || 'User'}</div>
                <div className="preview-text">{feed.comments[0].text}</div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="no-feeds">No posts to show yet. Start sharing!</div>
      )}

      {showCommentModal && (
        <CommentModal 
          feedId={selectedFeedId} 
          onClose={() => setShowCommentModal(false)}
        />
      )}

      {showLikedByModal && (
        <LikedByModal
          feedId={selectedFeedId}
          onClose={() => setShowLikedByModal(false)}
        />
      )}

      <CreateFeedModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onFeedCreated={() => fetchFeeds()}
      />
    </div>
  );
}

export default Feed;
