import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  X
} from 'lucide-react';
import useEventStore from '../../stores/eventStore';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';
import './calendar.css';

const EventCalendar = () => {
  const { events, fetchEvents, createEvent, deleteEvent, loading } = useEventStore();
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Create Event Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'other',
    location: 'Campus'
  });

  useEffect(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    fetchEvents(start.toISOString(), end.toISOString());
  }, [currentDate, fetchEvents]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await createEvent(formData);
      toast.success('Event created successfully!');
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'other',
        location: 'Campus'
      });
    } catch (error) {
      toast.error('Failed to create event');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(id);
        toast.success('Event deleted');
        setSelectedEvent(null);
      } catch (error) {
        toast.error('Failed to delete event');
      }
    }
  };

  const getEventsForDay = (day) => {
    return events.filter(event => isSameDay(parseISO(event.date), day));
  };

  const canManageEvents = user?.role === 'admin' || user?.role === 'staff';

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-title">
          <CalendarIcon size={32} className="text-blue-600" />
          <span>{format(currentDate, 'MMMM yyyy')}</span>
        </div>
        
        <div className="calendar-nav">
          <button onClick={goToToday} className="nav-btn">Today</button>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={prevMonth} className="p-2 hover:bg-white rounded-md transition-all">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-white rounded-md transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
          {canManageEvents && (
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="create-event-btn"
            >
              <Plus size={20} />
              <span>Add Event</span>
            </button>
          )}
        </div>
      </div>

      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="weekday-header">{day}</div>
        ))}
        
        {calendarDays.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, monthStart);
          
          return (
            <div 
              key={idx} 
              className={`calendar-day ${!isCurrentMonth ? 'opacity-30 bg-gray-50' : ''} ${isToday ? 'today' : ''}`}
            >
              <div className="day-number">{format(day, 'd')}</div>
              <div className="day-events">
                {dayEvents.map(event => (
                  <div 
                    key={event._id}
                    onClick={() => setSelectedEvent(event)}
                    className={`event-item event-${event.type}`}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="event-modal-overlay">
          <div className="event-modal" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">New Event</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Title</label>
                <input 
                  type="text" 
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Annual Sports Meet"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Date</label>
                  <input 
                    type="date" 
                    className="w-full p-3 border rounded-xl outline-none"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Type</label>
                  <select 
                    className="w-full p-3 border rounded-xl outline-none"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="festival">Festival</option>
                    <option value="holiday">Holiday</option>
                    <option value="exam">Exam</option>
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Location</label>
                <input 
                  type="text" 
                  className="w-full p-3 border rounded-xl outline-none"
                  placeholder="e.g., Main Auditorium"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea 
                  className="w-full p-3 border rounded-xl min-h-[100px] outline-none"
                  placeholder="Details about the event..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
                Plan Event
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="event-modal-overlay">
          <div className="event-modal">
            <div className={`p-6 rounded-t-2xl mb-4 event-${selectedEvent.type} bg-opacity-20`}>
              <div className="flex justify-between items-start">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider event-${selectedEvent.type}`}>
                  {selectedEvent.type}
                </span>
                <button onClick={() => setSelectedEvent(null)}><X size={20} /></button>
              </div>
              <h3 className="text-2xl font-extrabold mt-4">{selectedEvent.title}</h3>
            </div>
            
            <div className="space-y-4 px-6 pb-6">
              <div className="flex items-center gap-3 text-gray-600 font-medium">
                <CalendarIcon size={18} className="text-blue-500" />
                {format(parseISO(selectedEvent.date), 'PPPP')}
              </div>
              <div className="flex items-center gap-3 text-gray-600 font-medium">
                <MapPin size={18} className="text-red-500" />
                {selectedEvent.location}
              </div>
              
              {selectedEvent.description && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-gray-700 leading-relaxed">{selectedEvent.description}</p>
                </div>
              )}

              {canManageEvents && (
                <div className="mt-8">
                  <button 
                    onClick={() => handleDeleteEvent(selectedEvent._id)}
                    className="w-full py-3 border-2 border-red-100 text-red-500 rounded-xl font-bold hover:bg-red-50 transition-all"
                  >
                    Delete Event
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCalendar;
