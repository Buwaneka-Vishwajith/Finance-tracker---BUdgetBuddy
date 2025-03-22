import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["bank", "cash", "credit", "investment"],
        required: true,
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
    },
    currency: {
        type: String,
        default: "USD",
        validate: {
            validator: function(v) {
              
                return /^[A-Z]{3}$/.test(v);
            },
            message: props => `${props.value} is not a valid currency code!`
        }
    },
    balanceHistory: [{
        amount: Number,
        currency: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// Pre-save middleware to track balance history
accountSchema.pre('save', function(next) {
    if (this.isModified('balance')) {
        // Add to balanceHistory only if balance has changed
        this.balanceHistory.push({
            amount: this.balance,
            currency: this.currency
        });
    }
    next();
});

// Index for faster queries (optional)
accountSchema.index({ user: 1, currency: 1 });

export default mongoose.model("Account", accountSchema);
