import { useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';

const Toast = ({ message, isVisible, onClose, type = 'success' }) => {
  useEffect(() => {
    if (isVisible && message) {
      if (type === 'success') {
        toast.success(message);
      } else if (type === 'error') {
        toast.error(message);
      } else {
        toast(message);
      }
      
      if (onClose) {
        const timer = setTimeout(() => {
          onClose();
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, message, type, onClose]);

  return <Toaster position="top-right" />;
};

export default Toast;