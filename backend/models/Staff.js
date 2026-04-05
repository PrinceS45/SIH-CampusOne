import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import Counter from './Counter.js';

const addressSchema = new mongoose.Schema({
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
});

const staffSchema = new mongoose.Schema({
    staffId: {
        type: String,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    phone: String,
    dateOfBirth: Date,
    gender: String,
    address: addressSchema,
    designation: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    joiningDate: {
        type: Date,
        default: Date.now
    },
    qualification: String,
    experience: String,
    status: {
        type: String,
        enum: ['active', 'inactive', 'on-leave', 'retired'],
        default: 'active'
    },
    photo: {
        type: String,
    },
    photoPublicId: {
        type: String,
    },
}, {
    timestamps: true
});

// Pre-save hook to auto-generate staffId with SF- prefix
staffSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findByIdAndUpdate(
                { _id: 'staffId' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            // Format the ID (e.g., SF-00001)
            this.staffId = `SF-${counter.seq.toString().padStart(5, '0')}`;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

staffSchema.plugin(mongoosePaginate);

const Staff = mongoose.model('Staff', staffSchema);

export default Staff;
