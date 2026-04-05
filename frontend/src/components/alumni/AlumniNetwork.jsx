import React, { useEffect, useState } from 'react';
import useAlumniStore from '../../stores/alumniStore';
import { 
  Users, 
  Briefcase, 
  MapPin, 
  Linkedin, 
  MessageSquare,
  GraduationCap,
  Search,
  Filter
} from 'lucide-react';
import { FaUserCircle } from 'react-icons/fa';
import './alumni.css';

const AlumniNetwork = () => {
  const { alumni, fetchAlumni, loading } = useAlumniStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  const filteredAlumni = alumni.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'mentors' && item.isMentor);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="alumni-container">
      <div className="alumni-header">
        <div className="flex items-center gap-3">
          <Users size={32} className="text-indigo-600" />
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Alumni Network</h2>
        </div>
        <p className="text-gray-500 mt-2">Connect with graduates for mentorship and professional guidance.</p>
      </div>

      <div className="alumni-filters">
        <div className="search-box">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or company..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Graduates
          </button>
          <button 
            className={`filter-btn ${filter === 'mentors' ? 'active' : ''}`}
            onClick={() => setFilter('mentors')}
          >
            Mentors
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Finding your future connections...</div>
      ) : (
        <div className="alumni-grid">
          {filteredAlumni.map((person) => (
            <div key={person._id} className="alumni-card">
              <div className="card-top">
                {person.profilePicture ? (
                  <img src={person.profilePicture} alt={person.name} className="alumni-avatar" />
                ) : (
                  <FaUserCircle className="alumni-avatar text-gray-200" />
                )}
                {person.isMentor && <span className="mentor-badge">Mentor</span>}
              </div>
              
              <div className="card-body">
                <h3 className="alumni-name">{person.name}</h3>
                <div className="alumni-role">
                  <Briefcase size={16} />
                  <span>{person.position || 'Professional'} @ {person.company || 'Tech Corp'}</span>
                </div>
                
                <div className="alumni-meta">
                  <div className="meta-item">
                    <GraduationCap size={16} />
                    <span>Class of {person.graduatedYear || '2024'}</span>
                  </div>
                  <div className="meta-item">
                    <MapPin size={16} />
                    <span>{person.department || 'Campus'}</span>
                  </div>
                </div>

                <div className="card-actions">
                  <a 
                    href={person.linkedinProfile || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="action-link linkedin"
                  >
                    <Linkedin size={18} />
                    Profile
                  </a>
                  <button className="action-link message">
                    <MessageSquare size={18} />
                    Connect
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredAlumni.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border-2 border-dashed">
              No alumni found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlumniNetwork;
