import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'regular'],
        default: 'regular'
    },
    preferedCurrency: {
        type: String,
        default: 'USD'
    },
    categories: [{
        type: String
    }],
    settings: {
        notificationsEnabled: {
            type: Boolean,
            default: true
        },
        budgetAlerts: {
            type: Boolean,
            default: true
        },
        alertThreshold: {
            type: Number,
            default: 80 // Percentage of budget before alert
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Helper method to compare passwords
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Helper method to check if user is admin
userSchema.methods.isAdmin = function() {
    return this.role === 'admin';
};

export default mongoose.model('User', userSchema);