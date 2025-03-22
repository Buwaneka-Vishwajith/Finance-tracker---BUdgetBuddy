import express from 'express';
import Account from "../Models/accounts.js";
import { auth } from '../Middleware/auth.js';
import ExchangeRateService from '../Services/ExchangeRateService.js';

const router = express.Router();

// Create account with multi-currency support
router.post('/', auth, async (req, res) => {
    try {
        const { name, type, balance, currency = 'USD' } = req.body;
        
        // Validate currency code
        if (!/^[A-Z]{3}$/.test(currency)) {
            return res.status(400).json({ message: "Invalid currency code" });
        }

        const account = new Account({
            user: req.user.userId,
            name,
            type,
            balance,
            currency
        });

        await account.save();
        res.status(201).json(account);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get accounts with optional currency conversion
router.get("/", auth, async (req, res) => {
    try {
        const { convertTo } = req.query;
        let accounts = await Account.find({ user: req.user.userId });

        // If conversion is requested
        if (convertTo) {
            const convertedAccounts = await Promise.all(accounts.map(async (account) => {
                // Create a new object to avoid modifying the original
                const convertedAccount = account.toObject();
                
                // Convert balance if different currency requested
                if (account.currency !== convertTo) {
                    convertedAccount.balance = await ExchangeRateService.convertCurrency(
                        account.balance, 
                        account.currency, 
                        convertTo
                    );
                    convertedAccount.currency = convertTo;
                }
                
                return convertedAccount;
            }));

            return res.json(convertedAccounts);
        }

        res.json(accounts);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update account with currency conversion support
router.put("/:id", auth, async (req, res) => {
    try {
        const { name, type, balance, currency } = req.body;
        
        // If balance is provided in a different currency, convert to account's currency
        let convertedBalance = balance;
        const account = await Account.findById(req.params.id);
        
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        // Convert balance if currency differs
        if (currency && currency !== account.currency && balance !== undefined) {
            convertedBalance = await ExchangeRateService.convertCurrency(
                balance, 
                currency, 
                account.currency
            );
        }

        const updatedAccount = await Account.findByIdAndUpdate(
            req.params.id,
            { 
                name, 
                type, 
                balance: convertedBalance, 
                ...(currency && { currency }) 
            },
            { new: true }
        );

        res.json(updatedAccount);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete account
router.delete("/:id", auth, async (req, res) => {
    try {
        const account = await Account.findByIdAndDelete(req.params.id);
        
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Additional route for currency conversion
router.get("/convert", auth, async (req, res) => {
    try {
        const { amount, fromCurrency, toCurrency } = req.query;
        
        if (!amount || !fromCurrency || !toCurrency) {
            return res.status(400).json({ message: "Missing conversion parameters" });
        }

        const convertedAmount = await ExchangeRateService.convertCurrency(
            parseFloat(amount), 
            fromCurrency, 
            toCurrency
        );

        res.json({ 
            amount, 
            fromCurrency, 
            toCurrency, 
            convertedAmount 
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
