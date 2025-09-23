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
// Update room counts - IMPROVED VERSION
hostelSchema.methods.updateRoomCounts = async function() {
  const Room = mongoose.model('Room');
  
  const roomStats = await Room.aggregate([
    { $match: { hostel: this._id } },
    {
      $group: {
        _id: null,
        totalRooms: { $sum: 1 },
        occupiedRooms: { 
          $sum: { 
            $cond: [{ $in: ['$status', ['occupied']] }, 1, 0] 
          } 
        },
        availableRooms: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'available'] }, 1, 0] 
          } 
        }
      }
    }
  ]);
  
  if (roomStats.length > 0) {
    this.totalRooms = roomStats[0].totalRooms;
    this.occupiedRooms = roomStats[0].occupiedRooms;
    this.availableRooms = roomStats[0].availableRooms;
  } else {
    this.totalRooms = 0;
    this.occupiedRooms = 0;
    this.availableRooms = 0;
  }
  
  await this.save();
  return this;
};
const Hostel = mongoose.model('Hostel', hostelSchema);

export { Hostel };