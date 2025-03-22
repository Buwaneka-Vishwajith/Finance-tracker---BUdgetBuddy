import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.EXCHANGE_KEY;
const BASE_URL = 'https://api.exchangeratesapi.io/v1/latest';

const ExchangeRateService = {
    async convertCurrency(amount, fromCurrency, toCurrency) {
        try {
            if (fromCurrency === toCurrency) return amount;

            const response = await axios.get(BASE_URL, {
                params: { access_key: API_KEY }
            });

            const rates = response.data.rates;

            if (!rates) {
                throw new Error('Rates not found');
            }

            let convertedAmount = amount;

            if (fromCurrency === 'EUR') {
                // EUR to target currency
                convertedAmount = amount * rates[toCurrency];
            } else if (toCurrency === 'EUR') {
                // Source currency to EUR
                convertedAmount = amount / rates[fromCurrency];
            } else {
                // Source to target through EUR
                convertedAmount = (amount / rates[fromCurrency]) * rates[toCurrency];
            }

            return convertedAmount.toFixed(2);
        } catch (error) {
            console.error('Currency conversion error:', error.message);
            throw new Error('Could not perform currency conversion');
        }
    }
};

export default ExchangeRateService;
