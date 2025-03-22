import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
    },
    deadline: {
        type: Date,
        validate: {
            validator: function (value) {
                return value > new Date(); 
            },
            message: "Deadline must be a future date",
        },
    },    
    autoSave: {
      enabled: {
        type: Boolean,
        default: false,
      },
      amount: {
        type: Number,
        min:0,
      },
      frequency: {
        type: String,
        enum: ['weekly', 'monthly'],
      },
    },
  }, {timestamps:true});
  
 export default mongoose.model('Goal', goalSchema);
  