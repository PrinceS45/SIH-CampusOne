import React, { useEffect, useState } from 'react';
import useFeedStore from '../../stores/feedStore';
import useAuthStore from '../../stores/authStore';
import { FaUserCircle } from 'react-icons/fa';
import Loader from '../common/Loader';
import { toast } from 'react-hot-toast';

function CommentModal({ feedId, onClose }) {
  const { fetchComments, addComment, likeComment } = useFeedStore();
  const { user } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (feedId) {
      setLoading(true);
      fetchComments(feedId).then(data => {
        setComments(data || []);
        setLoading(false);
      }).catch(err => {
        console.error("Error fetching comments:", err);
        setError(err.response?.data?.message || "Error fetching comments");
        setLoading(false);
      });
    }
  }, [feedId]);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      const newComment = await addComment(feedId, commentText);
      setComments([newComment, ...comments]);
      setCommentText('');
      toast.success('Comment posted!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding comment');
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const response = await likeComment(commentId);
      setComments(comments.map(comment => 
        comment._id === commentId 
          ? { ...comment, likes: response.likes }
          : comment
      ));
      toast.success(response.message);
    } catch (error) {
      toast.error('Error updating like');
    }
  };

  return (
    <div className="premium-modal-overlay" onClick={onClose}>
      <div className="premium-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Comments</h3>
          <button onClick={onClose} className="close-btn" style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader message="Loading comments..." />
            </div>
          ) : comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="comment-item" style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
                {comment.user?.profilePicture ? (
                  <img 
                    src={comment.user.profilePicture} 
                    alt={comment.user?.name} 
                    style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                  />
                ) : (
                  <FaUserCircle style={{ color: '#ccc', width: '32px', height: '32px' }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ background: '#f0f2f5', padding: '8px 12px', borderRadius: '12px' }}>
                    <div style={{ fontWeight: '700', fontSize: '13px' }}>{comment.user?.name || 'User'}</div>
                    <div style={{ fontSize: '14px', color: '#1c1e21' }}>{comment.text}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px', paddingLeft: '8px' }}>
                    <button 
                      onClick={() => handleLikeComment(comment._id)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        color: comment.likes?.includes(user?._id || user?.id) ? '#007bff' : '#65676b',
                        cursor: 'pointer'
                      }}
                    >
                      Like ({comment.likes?.length || 0})
                    </button>
                    <span style={{ fontSize: '12px', color: '#65676b' }}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#65676b' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px', opacity: 0.5 }}>
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-7.6 8.38 8.38 0 0 1 3.8.9L21 3.5z" />
              </svg>
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ padding: '16px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '12px', width: '100%', alignItems: 'center' }}>
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt="Me" 
                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
              />
            ) : (
              <FaUserCircle style={{ color: '#ccc', width: '32px', height: '32px' }} />
            )}
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="premium-input"
              style={{ flex: 1, minHeight: '40px', maxHeight: '120px', resize: 'none' }}
            />
            <button
              onClick={handleAddComment}
              disabled={!commentText.trim() || loading}
              style={{
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: '600',
                cursor: 'pointer',
                opacity: !commentText.trim() ? 0.5 : 1
              }}
            >
              Post
            </button>
          </div>
        </div>
        {error && <p style={{ color: 'red', fontSize: '12px', padding: '0 16px 8px' }}>{error}</p>}
      </div>
    </div>
  );
}

export default CommentModal;