import React, { useState } from 'react';
import useFeedStore from '../../stores/feedStore';
import useAuthStore from '../../stores/authStore';
import { FaUserCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

function CreateFeedModal({ isOpen, onClose, onFeedCreated }) {
  const { createFeed, fetchFeeds } = useFeedStore();
  const { user } = useAuthStore();
  const [feedText, setFeedText] = useState('');
  const [feedImage, setFeedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateFeed = async (e) => {
    e.preventDefault();
    if (!feedText && !feedImage) {
      return;
    }

    setIsCreating(true);
    try {
      const formData = new FormData();
      if (feedText) formData.append('text', feedText);
      if (feedImage) formData.append('image', feedImage);

      await createFeed(formData);
      
      setFeedText('');
      setFeedImage(null);
      setImagePreview(null);
      
      await fetchFeeds();
      if (onFeedCreated) onFeedCreated();
      onClose();
      toast.success('Post shared successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating post');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="premium-modal-overlay" onClick={onClose}>
      <div className="premium-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Create Post</h3>
          <button onClick={onClose} className="close-btn" style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
        </div>

        <form onSubmit={handleCreateFeed} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt="Me" 
                  style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                />
              ) : (
                <FaUserCircle style={{ color: '#ccc', width: '40px', height: '40px' }} />
              )}
              <span style={{ fontWeight: '700', fontSize: '15px' }}>{user?.name || 'User'}</span>
            </div>

            <textarea
              value={feedText}
              onChange={(e) => setFeedText(e.target.value)}
              placeholder="What's on your mind?"
              className="premium-input"
              style={{
                width: '100%',
                minHeight: '150px',
                border: 'none',
                padding: '0',
                fontSize: '18px',
                resize: 'none',
                outline: 'none'
              }}
            />

            {imagePreview && (
              <div style={{ marginTop: '16px', position: 'relative' }}>
                <img 
                  src={imagePreview} 
                  alt="Preview"
                  style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', maxHeight: '300px' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setFeedImage(null);
                    setImagePreview(null);
                  }}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer'
                  }}
                >
                  &times;
                </button>
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
            <div className="image-upload-wrapper">
              <label htmlFor="image-input" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#45bd62', fontWeight: '600' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z" />
                </svg>
                Photo
              </label>
              <input
                id="image-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>
            
            <button
              type="submit"
              disabled={isCreating || (!feedText && !feedImage)}
              style={{
                backgroundColor: '#007bff', // Added primary color fallback
                color: 'white',
                padding: '10px 32px',
                border: 'none',
                borderRadius: '20px',
                fontWeight: '700',
                cursor: (isCreating || (!feedText && !feedImage)) ? 'not-allowed' : 'pointer',
                opacity: (isCreating || (!feedText && !feedImage)) ? 0.6 : 1,
                transition: 'var(--transition)'
              }}
            >
              {isCreating ? 'Sharing...' : 'Share Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateFeedModal;
