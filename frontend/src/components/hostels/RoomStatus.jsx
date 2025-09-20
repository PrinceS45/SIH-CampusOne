import { useState, useEffect } from 'react';
import { BuildingIcon, UsersIcon, HomeIcon } from 'lucide-react';
import useHostelStore from '../../stores/hostelStore';
import Loader from '../common/Loader';

const RoomStatus = () => {
  const { hostels, rooms, loading, getHostels, getRooms } = useHostelStore();
  const [selectedHostel, setSelectedHostel] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [roomStatusFilter, setRoomStatusFilter] = useState('');

  useEffect(() => {
    getHostels();
  }, []);

  useEffect(() => {
    if (selectedHostel) {
      getRooms(selectedHostel, { status: roomStatusFilter, floor: selectedFloor });
    }
  }, [selectedHostel, selectedFloor, roomStatusFilter]);

  const floors = [...new Set(rooms.map(room => room.floor))].sort();
  const statusOptions = ['available', 'occupied', 'maintenance', 'reserved'];

  if (loading && !hostels.length) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Room Status</h1>
        <p className="text-gray-600">View and manage hostel room occupancy</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Hostel</label>
            <select
              value={selectedHostel}
              onChange={(e) => setSelectedHostel(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Hostel</option>
              {hostels.map((hostel) => (
                <option key={hostel._id} value={hostel._id}>
                  {hostel.name} ({hostel.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Select Floor</label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              disabled={!selectedHostel}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="">All Floors</option>
              {floors.map((floor) => (
                <option key={floor} value={floor}>Floor {floor}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Room Status</label>
            <select
              value={roomStatusFilter}
              onChange={(e) => setRoomStatusFilter(e.target.value)}
              disabled={!selectedHostel}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="">All Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Room Grid */}
      {selectedHostel && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {hostels.find(h => h._id === selectedHostel)?.name} - Room Status
            </h3>
            <div className="text-sm text-gray-600">
              {rooms.length} rooms found
            </div>
          </div>

          {floors.length > 0 ? (
            <div className="space-y-8">
              {floors.map((floor) => {
                const floorRooms = rooms.filter(room => room.floor === floor);
                if (floorRooms.length === 0) return null;

                return (
                  <div key={floor} className="border rounded-lg p-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                      <BuildingIcon className="h-5 w-5 mr-2" />
                      Floor {floor}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {floorRooms.map((room) => (
                        <div
                          key={room._id}
                          className={`border rounded-lg p-4 ${
                            room.status === 'available' ? 'bg-green-50 border-green-200' :
                            room.status === 'occupied' ? 'bg-blue-50 border-blue-200' :
                            room.status === 'maintenance' ? 'bg-yellow-50 border-yellow-200' :
                            'bg-purple-50 border-purple-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold text-gray-900">Room {room.roomNumber}</h5>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              room.status === 'available' ? 'bg-green-100 text-green-800' :
                              room.status === 'occupied' ? 'bg-blue-100 text-blue-800' :
                              room.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {room.status}
                            </span>
                          </div>

                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <UsersIcon className="h-4 w-4 mr-1" />
                              <span>Capacity: {room.capacity} beds</span>
                            </div>
                            <div className="flex items-center">
                              <HomeIcon className="h-4 w-4 mr-1" />
                              <span>Occupied: {room.currentOccupancy} beds</span>
                            </div>
                            {room.amenities && room.amenities.length > 0 && (
                              <div>
                                <span className="font-medium">Amenities:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {room.amenities.slice(0, 3).map((amenity, index) => (
                                    <span
                                      key={index}
                                      className="px-1 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                                    >
                                      {amenity}
                                    </span>
                                  ))}
                                  {room.amenities.length > 3 && (
                                    <span className="text-xs text-gray-500">
                                      +{room.amenities.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {room.status === 'available' && (
                            <div className="mt-3 pt-2 border-t border-gray-200">
                              <button className="w-full bg-green-600 text-white py-1 px-2 rounded text-sm hover:bg-green-700">
                                Allocate Room
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No rooms found for the selected filters.
            </div>
          )}
        </div>
      )}

      {/* Statistics */}
      {selectedHostel && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-blue-600">{rooms.length}</div>
            <div className="text-sm text-gray-600">Total Rooms</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-green-600">
              {rooms.filter(r => r.status === 'available').length}
            </div>
            <div className="text-sm text-gray-600">Available Rooms</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-blue-600">
              {rooms.filter(r => r.status === 'occupied').length}
            </div>
            <div className="text-sm text-gray-600">Occupied Rooms</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {rooms.filter(r => r.status === 'maintenance').length}
            </div>
            <div className="text-sm text-gray-600">Under Maintenance</div>
          </div>
        </div>
      )}

      {!selectedHostel && (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <BuildingIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Hostel</h3>
          <p className="text-gray-600">Please select a hostel to view room status and occupancy details.</p>
        </div>
      )}
    </div>
  );
};

export default RoomStatus;