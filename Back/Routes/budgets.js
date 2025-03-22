import express, { json } from 'express';
import Budget from '../Models/Budget.js';
import { auth, checkRole } from '../Middleware/auth.js';

const router = express.Router();

//get budgets
router.get('/', auth, async(req,res) => {
    try{
        const budgets = await Budget.find({ user: req.user.userId});
        res.json(budgets);
    }catch(error){
        res.status(400).json({message: error.message});
    }
});

//get budget by ID
router.get('/:id',auth, async(req,res) => {
    try{
        const budget = await Budget.findOne({
            _id: req.params.id,
            user: req.user.userId
        });

        if(!budget){
            return res.status(404).json({message: 'Budget notfound'});
        }

        res.json(budget);
    }catch(error){
        res.status(400).json({message: error.message})
    }
});

//create budget
router.post('/', auth, async(req,res) => {
    try{
        const budget = new Budget({
            ...req.body,
            user: req.user.userId
        });
        await budget.save();
        res.status(201).json(budget);
    }catch(error){
        res.status(400).json({ message: error.message});
    }
});

//update budget
router.put('/:id', auth,async (req,res) => {
    try {
        const budget = await Budget.findOneAndUpdate(
            { _id: req.params.id, user: req.user.userId},
            req.body,
            { new: true}
        );

        if(!budget){
            return res.status(404).json({ message: 'Budget not found'});
        }

        res.json(budget);
    } catch (error) {
        res.status(400).json({ message: error.message});
    }
});

//delete budget
router.delete('/:id', auth , async(req,res) => {
    try{
        const budget = await Budget.findOneAndDelete ({
            _id: req.params.id,
            user: req.user.userId
        });

        if(!budget){
            return res.status(404).json({ message: 'Budget not found'});
        }

        res.json({ message: 'Budget deleted successfully'});
    }catch(error){
        res.status(400).json({ message: error.message});
    }
});

export default router;