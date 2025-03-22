import express from 'express';
import Goal from '../Models/Goal.js'
import { auth , checkRole } from '../Middleware/auth.js';

const router = express.Router();

//get all goals
router.get('/', auth , async(req,res) => {
    try{
        const goals = await Goal.find({ user: req.user.userId});
        res.json(goals);
    }catch(error){
        res.status(400).json({ message: error.message});
    }
});

//get goal by id
router.get('/:id', auth , async(req,res) => {
    try{
        const goal = await Goal.findOne ({
            _id: req.params.id,
            user: req.user.userId
        });

        if  (!goal){
            return res.status(400).json({ message: 'Goal not found'});
        }

        res.json(goal)
    }catch(error){
        res.status(400).json({ message: error.message});
    }
});

//create new goal

router.post('/', auth, async(req,res) => {
    try{
        const goal = new Goal ({
            ...req.body,
            user: req.user.userId
        });

        await goal.save();
        res.status(201).json(goal);
    }catch(error){
        res.status(400).json({message: error.message});
    }
})

//update goal
router.put('/:id', auth, async(req,res) => {
    try{
        const goal = await Goal.findOneAndUpdate(
            { _id: req.params.id, user: req.user.userId},
            req.body,
            {new: true}
        );
        if(!goal){
            return res.status(404).json({ message: 'Goal not found'});
        }

        res.json(goal);
    }catch(error){
        res.status(400).json({  message: error.message});
    }
});

//update goal progress
router.patch('/:id/progress', auth, async(req,res) => {
    try{
        const { currentAmount } = req.body;

        if (currentAmount === undefined) {
            return res.status(400).json({ message: 'Current amount is required' });
        }

        const goal =  await Goal.findOneAndUpdate(
            {_id: req.params.id, user:req.user.userId},
            { currentAmount},
            { new: true}
        );

        if(!goal){
            return res.status(404).json({message: 'Goal not found'});
        }

        res.json(goal);

    }catch(error){
        res.status(400).json({message: error.message});
    }
});

//delete goal
router.delete('/:id', auth, async(req,res) => {
    try{
        const goal = await Goal.findOneAndDelete ({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!goal){
            return res.status(404).json({message: 'Goal not found'});
        }

        res.json({message: 'Goal deleted successfully!'});
    }catch(error){
        res.status(400).json({message: error.message});
    }
});

export default router;