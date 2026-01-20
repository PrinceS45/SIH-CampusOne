import React, { useEffect, useState } from 'react'
import useFeedStore from '../../stores/feedStore';

function CommentModal({ feedId, onClose }) {
  const { fetchComments, addComment, likeComment } = useFeedStore();
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
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await likeComment(commentId);
      setComments(comments.map(comment => 
        comment._id === commentId 
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      ));
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Comments</h3>
          <button onClick={onClose} style={{ padding: '5px 10px', cursor: 'pointer' }}>Close</button>
        </div>

        {/* Add Comment Input */}
        <div style={{ marginBottom: '20px' }}>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ddd',
              minHeight: '80px',
              fontFamily: 'Arial'
            }}
          />
          <button
            onClick={handleAddComment}
            disabled={loading}
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </div>

        {/* Comments List */}
        <div>
          {comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} style={{
                backgroundColor: '#f5f5f5',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '5px'
              }}>
                <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
                  {comment.user?.name || 'User'}
                </p>
                <p style={{ margin: '5px 0' }}>{comment.text}</p>
                <button
                  onClick={() => handleLikeComment(comment._id)}
                  style={{
                    marginTop: '5px',
                    padding: '5px 10px',
                    backgroundColor: '#e9ecef',
                    border: '1px solid #dee2e6',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  ❤️ {comment.likes || 0}
                </button>
              </div>
            ))
          ) : (
            <p>No comments yet</p>
          )}
        </div>

        {error && <p style={{ color: 'red', marginTop: '10px' }}>Error: {error}</p>}
      </div>
    </div>
  )
}

export default CommentModal