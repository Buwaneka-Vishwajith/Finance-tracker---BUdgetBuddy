import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../Models/user.js';
import { auth, checkRole } from '../Middleware/auth.js';
const router = express.Router();

//new user registration
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists!' });
        }

        const adminDomains = ["@company.com", "@admin.org"]; 

        const isAdmin = adminDomains.some(domain => email.endsWith(domain));

        const user = new User({
            name,
            email,
            password,
            role: isAdmin ? 'admin' : 'regular' 
        });

        await user.save();

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '100d' }
        );

        res.status(201).json({
            token,
            user: { email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


//login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found!' });
        }

        const isPasswordValid = password === user.password;
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials!' });
        }

        const adminDomains = ["@company.com", "@admin.org"];

        if (adminDomains.some(domain => email.endsWith(domain)) && user.role !== 'admin') {
            user.role = 'admin'; 
            await user.save();
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//user profile
router.get('/profile', auth, async(req,res) => {
    try{
        const user = await User.findById(req.user.userId).select('-password');
        
        if(!user) {
            return res.status(404).json({message: 'User not found'});
        }

        user.lastActive = Date.now();
        await user.save();
        
        res.json(user);
    }catch(error){
        res.status(400).json({message: error.message});
    }
});

// ADMIN ROUTES

// Get all users (Admin only)
router.get('/admin/users', auth, checkRole('admin'), async(req,res) => {
    try{
        const users = await User.find().select('-password');
        res.json(users);
    }catch(error){
        res.status(400).json({message: error.message});
    }
});

// Get user by ID (Admin only)
router.get('/admin/users/:userId', auth, checkRole('admin'), async(req,res) => {
    try{
        const { userId } = req.params;
        const user = await User.findById(userId).select('-password');
        
        if(!user) {
            return res.status(404).json({message: 'User not found'});
        }
        
        res.json(user);
    }catch(error){
        res.status(400).json({message: error.message});
    }
});

// Update user (Admin only)
router.put('/admin/users/:userId', auth, checkRole('admin'), async(req,res) => {
    try{
        const { userId } = req.params;
        const { name, email, role, preferedCurrency, categories, settings } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email, role, preferedCurrency, categories, settings },
            { new: true }
        ).select('-password');
        
        if(!updatedUser) {
            return res.status(404).json({message: 'User not found'});
        }
        
        res.json(updatedUser);
    }catch(error){
        res.status(400).json({message: error.message});
    }
});

// Delete user (Admin only)
router.delete('/admin/users/:userId', auth, checkRole('admin'), async(req,res) => {
    try{
        const { userId } = req.params;
        
        const deletedUser = await User.findByIdAndDelete(userId);
        
        if(!deletedUser) {
            return res.status(404).json({message: 'User not found'});
        }
        
        res.json({message: 'User deleted successfully'});
    }catch(error){
        res.status(400).json({message: error.message});
    }
});

// Configure system settings (Admin only)
router.post('/admin/settings', auth, checkRole('admin'), async(req,res) => {
    try{
        // Here you would implement logic to configure system settings
        // For example, default categories, default limits, etc.
        const { defaultCategories, transactionLimits } = req.body;
        
        // This would typically save to a Settings model
        // For now, we'll just return success
        res.json({
            message: 'System settings updated successfully',
            settings: { defaultCategories, transactionLimits }
        });
    }catch(error){
        res.status(400).json({message: error.message});
    }
});



// REGULAR USER ROUTES

// Update user profile
router.put('/profile', auth, async(req,res) => {
    try{
        const { name, email, preferedCurrency, categories, settings } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { name, email, preferedCurrency, categories, settings },
            { new: true }
        ).select('-password');
        
        if(!updatedUser) {
            return res.status(404).json({message: 'User not found'});
        }
        
        res.json(updatedUser);
    }catch(error){
        res.status(400).json({message: error.message});
    }
});

// Change password
router.put('/change-password', auth, async(req,res) => {
    try{
        const { currentPassword, newPassword } = req.body;
        
        const user = await User.findById(req.user.userId);
        
        if(!user) {
            return res.status(404).json({message: 'User not found'});
        }
        
        if(!(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(401).json({message: 'Current password is incorrect'});
        }
        
        user.password = newPassword;
        await user.save();
        
        res.json({message: 'Password updated successfully'});
    }catch(error){
        res.status(400).json({message: error.message});
    }
});

// Token refresh route
router.post('/refresh-token', auth, async(req,res) => {
    try{
        const user = await User.findById(req.user.userId);
        
        if(!user) {
            return res.status(404).json({message: 'User not found'});
        }
        
        // Update last active timestamp
        user.lastActive = Date.now();
        await user.save();
        
        const token = jwt.sign(
            {userId: user._id, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: '24h'}
        );
        
        res.json({token});
    }catch(error){
        res.status(400).json({message: error.message});
    }
});

export default router;