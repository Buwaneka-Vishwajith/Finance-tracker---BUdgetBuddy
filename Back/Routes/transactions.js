import express from 'express';
import {auth, checkRole} from '../Middleware/auth.js';
import Transaction from '../Models/Transaction.js';
import { checkUnusualSpending, checkBudgetThresholds } from '../Services/notificationService.js';

const router = express.Router();

//get all transactions
router.get('/', auth, async (req,res) => {
  try{
    const transactions = await Transaction.find({user: req.user.userId});
    res.json(transactions);
  }catch(error){
    res.status(400).json({message: error.message});
  }
});

//new transaction
router.post('/', auth, async( req,res) => {
  try{
    const transaction = new Transaction({
      ...req.body,
      user: req.user.userId,
    });
    
    await transaction.save();
    
    // unusual spending
    await checkUnusualSpending(req.user.userId, transaction);
    await checkBudgetThresholds(req.user.userId, transaction);
    
    res.status(201).json(transaction);
  }catch(error){
    res.status(400).json({message: error.message});
  }
});

//edit transaction
router.put('/:id', auth, async( req,res) => {
  try{
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId},
      req.body,
      {new: true}
    );
    
    if(!transaction){
      return res.status(404).json({message: 'Transaction not found!'});
    }
    
    // Re-check budget thresholds after update
    if (transaction.type === 'expense') {
      await checkBudgetThresholds(req.user.userId, transaction);
    }
    
    res.json(transaction);
  }catch(error){
    res.status(400).json({message: error.message});
  }
});

//delete transaction
router.delete('/:id', auth, async(req,res) => {
  try{
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });
    
    if(!transaction){
      return res.status(404).json({message: 'Transaction not found'});
    }
    
    res.json({message: 'Transaction deleted!'});
  }catch(error){
    res.status(400).json({message: error.message});
  }
});

export default router;