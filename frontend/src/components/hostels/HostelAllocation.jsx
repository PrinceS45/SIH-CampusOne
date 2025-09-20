import { useState, useEffect } from 'react';
import { UserIcon, BuildingIcon, HomeIcon } from 'lucide-react';
import useHostelStore from '../../stores/hostelStore';
import useStudentStore from '../../stores/studentStore';
import Modal from '../common/Modal';
import Loader from '../common/Loader';

const HostelAllocation = () => {
  const { hostels, rooms, loading, getRooms, allocateRoom, deallocateRoom, getOccupancyStats } = useHostelStore();
  const { students, getStudents } = useStudentStore();
  const [selectedHostel, setSelectedHostel] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showDeallocationModal, setShowDeallocationModal] = useState(false);
  const [currentAction, setCurrentAction] = useState('allocate');

  useEffect(() => {
    getStudents({ limit: 1000 });
    getHostels();
    getOccupancyStats();
  }, []);

  useEffect(() => {
    if (selectedHostel) {
      getRooms(selectedHostel, { available: true });
    }
  }, [selectedHostel]);

  const filteredStudents = students.filter(student => {
    if (currentAction === 'allocate') {
      return !student.hostel; // Students without hostel allocation
    } else {
      return student.hostel; // Students with hostel allocation
    }
  });

  const handleAllocate = async () => {
    if (selectedStudent && selectedRoom) {
      try {
        await allocateRoom({
          studentId: selectedStudent,
          roomId: selectedRoom
        });
        setShowAllocationModal(false);
        setSelectedStudent('');
        setSelectedRoom('');
        setSelectedHostel('');
        getStudents({ limit: 1000 });
        getOccupancyStats();
      } catch (error) {
        console.error('Error allocating room:', error);
      }
    }
  };

  const handleDeallocate = async () => {
    if (selectedStudent) {
      try {
        await deallocateRoom({
          studentId: selectedStudent
        });
        setShowDeallocationModal(false);
        setSelectedStudent('');
        getStudents({ limit: 1000 });
        getOccupancyStats();
      } catch (error) {
        console.error('Error deallocating room:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hostel Allocation</h1>
        <p className="text-gray-600">Manage student hostel room allocations</p>
      </div>

      {/* Action Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setCurrentAction('allocate')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentAction === 'allocate'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Allocate Room
            </button>
            <button
              onClick={() => setCurrentAction('deallocate')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentAction === 'deallocate'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Deallocate Room
            </button>
          </nav>
        </div>

        <div className="p-6">
          {currentAction === 'allocate' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Student</label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Student</option>
                    {filteredStudents.map((student) => (
                      <option key={student._id} value={student.studentId}>
                        {student.firstName} {student.lastName} ({student.studentId})
                      </option>
                    ))}
                  </select>
                </div>

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
                  <label className="block text-sm font-medium text-gray-700">Select Room</label>
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    disabled={!selectedHostel}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  >
                    <option value="">Select Room</option>
                    {rooms.map((room) => (
                      <option key={room._id} value={room._id}>
                        Room {room.roomNumber} (Floor {room.floor}) - {room.capacity - room.currentOccupancy} beds available
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => setShowAllocationModal(true)}
                disabled={!selectedStudent || !selectedRoom}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Allocate Room
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Student</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Student</option>
                  {filteredStudents.map((student) => (
                    <option key={student._id} value={student.studentId}>
                      {student.firstName} {student.lastName} ({student.studentId}) - 
                      {student.hostel?.name} (Room {student.room?.roomNumber})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowDeallocationModal(true)}
                disabled={!selectedStudent}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Deallocate Room
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Allocation Modal */}
      <Modal
        isOpen={showAllocationModal}
        onClose={() => setShowAllocationModal(false)}
        title="Confirm Room Allocation"
        size="sm"
      >
        <div className="space-y-4">
          <p>Are you sure you want to allocate the selected room to this student?</p>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="font-medium">Student: {selectedStudent}</p>
            <p className="font-medium">Room: {rooms.find(r => r._id === selectedRoom)?.roomNumber}</p>
            <p className="font-medium">Hostel: {hostels.find(h => h._id === selectedHostel)?.name}</p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowAllocationModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleAllocate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Confirm Allocation
            </button>
          </div>
        </div>
      </Modal>

      {/* Deallocation Modal */}
      <Modal
        isOpen={showDeallocationModal}
        onClose={() => setShowDeallocationModal(false)}
        title="Confirm Room Deallocation"
        size="sm"
      >
        <div className="space-y-4">
          <p>Are you sure you want to deallocate the room from this student?</p>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="font-medium">Student: {selectedStudent}</p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeallocationModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleDeallocate}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Confirm Deallocation
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HostelAllocation;