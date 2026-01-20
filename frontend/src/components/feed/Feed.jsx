import React, { useEffect, useState } from 'react' ; 
import CreateFeedModal from './CreateFeedModal';
import useFeedStore from '../../stores/feedStore';
import CommentModal from "./CommentModal.jsx"
function Feed() {
  const { feeds, fetchFeeds, loading, error, likeFeed, deleteFeed } = useFeedStore();           
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFeedId, setSelectedFeedId] = useState(null);

  useEffect(() => {
    fetchFeeds();
  }, []);

  const handleCommentClick = (feedId) => {
    setSelectedFeedId(feedId);
    setShowCommentModal(true);
  };

  const handleDeleteFeed = async (feedId) => {
    if (window.confirm('Are you sure you want to delete this feed?')) {
      try {
        await deleteFeed(feedId);
      } catch (error) {
        console.error("Error deleting feed:", error);
        alert('Failed to delete feed');
      }
    }
  };

  const handleLike = async (feedId) => {
    try {
      await likeFeed(feedId);
    } catch (error) {
      console.error("Error liking feed:", error);
    }
  };

  if (loading) return <div>Loading feeds...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: 0 }}>Feed</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          + Make Post
        </button>
      </div>

      {/* Feeds List */}
      {feeds && feeds.length > 0 ? (
        feeds.map((feed) => (
          <div key={feed._id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '20px', borderRadius: '8px' }}>
            {/* User Details */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {feed.user?.profilePicture && (
                  <img 
                    src={feed.user.profilePicture} 
                    alt={feed.user?.name}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                  />
                )}
                <div>
                  <p style={{ margin: '0', fontWeight: 'bold' }}>{feed.user?.name || 'User'}</p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteFeed(feed._id)}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Delete
              </button>
            </div>

            {/* Feed Text */}
            {feed.text && (
              <p style={{ marginBottom: '10px' }}>{feed.text}</p>
            )}

            {/* Feed Image */}
            {feed.image && (
              <img 
                src={feed.image} 
                alt="Feed"
                style={{ maxWidth: '100%', height: 'auto', marginBottom: '10px', borderRadius: '5px' }}
              />
            )}

            {/* Like and Comment Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <button onClick={() => handleLike(feed._id)}>
                👍 Like ({feed.likes || 0})
              </button>
              <button onClick={() => handleCommentClick(feed._id)}>
                💬 Comment ({feed.comments?.length || 0})
              </button>
            </div>

            {/* First Comment */}
            {feed.comments && feed.comments.length > 0 && (
              <div style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
                <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
                  {feed.comments[0].user?.name || 'User'}
                </p>
                <p style={{ margin: '5px 0' }}>{feed.comments[0].text}</p>
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                  ❤️ {feed.comments[0].likes || 0}
                </p>
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No feeds available</p>
      )}

      {/* Comment Modal */}
      {showCommentModal && (
        <CommentModal 
          feedId={selectedFeedId} 
          onClose={() => setShowCommentModal(false)}
        />
      )}

      {/* Create Feed Modal */}
      <CreateFeedModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onFeedCreated={() => fetchFeeds()}
      />
    </div>
  )
}

export default Feed
