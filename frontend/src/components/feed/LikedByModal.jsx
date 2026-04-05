import useFeedStore from '../../stores/feedStore';
import { FaUserCircle } from 'react-icons/fa';

function LikedByModal({ feedId, onClose }) {
  const { fetchLikedUsers } = useFeedStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const data = await fetchLikedUsers(feedId);
        setUsers(data || []);
      } catch (error) {
        console.error("Error fetching liked users:", error);
      } finally {
        setLoading(false);
      }
    };
    getUsers();
  }, [feedId]);

  return (
    <div className="premium-modal-overlay" onClick={onClose}>
      <div className="premium-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Liked by</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
          ) : users.length > 0 ? (
            <div className="user-list">
              {users.map((user) => (
                <div key={user._id} className="user-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
                  {user.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user.name} 
                      className="user-avatar" 
                      style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                    />
                  ) : (
                    <FaUserCircle style={{ color: '#ccc', width: '40px', height: '40px' }} />
                  )}
                  <span className="username" style={{ fontWeight: '600' }}>{user.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#666' }}>No likes yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LikedByModal;
