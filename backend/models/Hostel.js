import mongoose from 'mongoose';





const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['boys', 'girls'],
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  warden: {
    name: String,
    contact: String,
    email: String
  },
  totalRooms: {
    type: Number,
    required: true,
    min: 1
  },
  occupiedRooms: {
    type: Number,
    default: 0
  },
  availableRooms: {
    type: Number,
    default: function() {
      return this.totalRooms;
    }
  },
  amenities: [String],
  rules: [String],
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Virtual for rooms
hostelSchema.virtual('rooms', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'hostel'
});

// Update room counts
hostelSchema.methods.updateRoomCounts = async function() {
  const Room = mongoose.model('Room');
  const roomCounts = await Room.aggregate([
    { $match: { hostel: this._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  let occupied = 0;
  let available = 0;
  
  roomCounts.forEach(count => {
    if (count._id === 'occupied') {
      occupied = count.count;
    } else if (count._id === 'available') {
      available = count.count;
    }
  });
  
  this.occupiedRooms = occupied;
  this.availableRooms = available;
  return this.save();
};

const Hostel = mongoose.model('Hostel', hostelSchema);

export { Hostel };