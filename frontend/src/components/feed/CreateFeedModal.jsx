import React, { useState } from 'react';
import useFeedStore from '../../stores/feedStore';

function CreateFeedModal({ isOpen, onClose, onFeedCreated }) {
  const { createFeed, fetchFeeds } = useFeedStore();
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
      alert('Please enter text or select an image');
      return;
    }

    setIsCreating(true);
    try {
      const formData = new FormData();
      if (feedText) formData.append('text', feedText);
      if (feedImage) formData.append('image', feedImage);

      await createFeed(formData);
      
      // Reset form
      setFeedText('');
      setFeedImage(null);
      setImagePreview(null);
      
      // Refresh feeds
      await fetchFeeds();
      
      // Notify parent
      if (onFeedCreated) onFeedCreated();
      
      // Close modal
      onClose();
    } catch (error) {
      console.error("Error creating feed:", error);
      alert('Failed to create feed');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '30px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #eee',
          paddingBottom: '15px'
        }}>
          <h2 style={{ margin: 0 }}>Create a New Post</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreateFeed}>
          {/* Text Input */}
          <textarea
            value={feedText}
            onChange={(e) => setFeedText(e.target.value)}
            placeholder="What's on your mind?"
            style={{
              width: '100%',
              height: '120px',
              padding: '12px',
              marginBottom: '15px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontFamily: 'Arial',
              fontSize: '14px',
              boxSizing: 'border-box',
              resize: 'none'
            }}
          />

          {/* Image Preview */}
          {imagePreview && (
            <div style={{ marginBottom: '15px', position: 'relative' }}>
              <img 
                src={imagePreview} 
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px' }}
              />
              <button
                type="button"
                onClick={() => {
                  setFeedImage(null);
                  setImagePreview(null);
                }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Image Upload */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#333'
            }}>
              Upload Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#e9ecef',
                color: '#333',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || (!feedText && !feedImage)}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '10px 25px',
                border: 'none',
                borderRadius: '6px',
                cursor: isCreating || (!feedText && !feedImage) ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                opacity: isCreating || (!feedText && !feedImage) ? 0.6 : 1
              }}
            >
              {isCreating ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default CreateFeedModal;
