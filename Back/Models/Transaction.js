import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        required: true,
        trim: true, 
    },
    category: {
        type: String,
        required: true,
        trim: true, 
    },
    description: {
        type: String,
        trim: true, 
    },
    tags: [String], 
    date: {
        type: Date,
        default: Date.now,
    },
    isRecurring: {
        type: Boolean,
        default: false,
    },
    recurringDetails: {
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'yearly'],
        },
    },
});

// Prevents saving recurringDetails if isRecurring is false
transactionSchema.pre("save", function (next) {
    if (!this.isRecurring) {
        this.recurringDetails = undefined;
    }
    next();
});

export default mongoose.model('Transaction', transactionSchema);
