[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/xIbq4TFL)


# BudgetBuddy - A finance tracker app (MERN)

A comprehensive finance tracking app built with the MERN stack. The app allows users to manage user accounts, budgets, goals, and transactions. It includes JWT authentication with admin and regular user roles. The app also supports *real-time currency conversion* allowing users to manage multi-currency accounts and transactions.

---

## 🚀 Features
✅ User Roles: Admin and Regular User  
✅ Authentication: JWT-based authentication  
✅ Real-Time Currency Conversion: Integrated with [exchangeratesapi.io](https://exchangeratesapi.io)  
✅ Report Generation: PDF reports using `pdfkit`  
✅ Secure Password Handling: Uses `bcrypt` for password hashing  
✅ API Testing: Tested with Postman and Jest  

---

## 🏗️ Installation

### Clone the Repository
```bash
git clone https://github.com/your-username/finance-tracker.git
cd finance-tracker
```

### Install Dependencies
```bash
npm install
```

### Install Dev Dependencies
To install Jest for testing:
```bash
npm install --save-dev jest supertest
```

### Setup Environment Variables
Create a `.env` file in the root directory and add the following:
```env
MONGO_URI=mongodb://localhost:27017/financetracker
JWT_SECRET=your_jwt_secret
EXCHANGE_RATE_API_KEY=your_api_key
PORT=5000
```

---

## 🚦 Running the App

### Start the Development Server
```bash
npm run dev
```

### Start the Production Server
```bash
npm start
```

---

## 🧪 Running Tests

Unit tests are implemented using Jest. To run the tests:
```bash
npm test
```

### Expected Output:
- Models are expected to load within **2.3 seconds** (out of a 3-second threshold)  
- Integration and performance tests should pass under normal load conditions  

---

## 📂 Project Structure
```
PROJECT-BUWANEKA-VISHWAJITH
├── Back
│   ├── Config
│   │   └── db.js
│   ├── Middleware
│   │   └── auth.js
│   ├── Models
│   │   ├── accounts.js
│   │   ├── Budget.js
│   │   ├── Goal.js
│   │   ├── Transaction.js
│   │   └── user.js
│   ├── Routes
│   │   ├── accounts.js
│   │   ├── auth.js
│   │   ├── budgets.js
│   │   ├── goals.js
│   │   ├── reportRoutes.js
│   │   └── transactions.js
│   ├── Services
│   │   └── ExchangeRateService.js
│   ├── Tests
│   │   └── models
│   │       ├── accounts.test.js
│   │       ├── budget.test.js
│   │       ├── goal.test.js
│   │       ├── transaction.test.js
│   │       └── user.test.js
│   ├── Utils
│   │   └── currencyConverter.js
│   ├── .env
│   ├── .gitignore
│   ├── index.js
│   ├── jest.config.js
│   ├── package-lock.json
│   └── postman testing
│       └── Finance tracker.postman_collection.json
```

---

## 🔑 Authentication and Authorization
### User Roles:
- **Admin** – Can manage all users and system settings.  
- **Regular User** – Can manage their own profiles, budgets, and goals.  

### Example JWT Payload:
```json
{
  "userId": "user_id_here",
  "role": "admin",
  "iat": 1710000000,
  "exp": 1710864000
}
```

---

## 📡 API Endpoints

### **Auth Routes**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| **POST** | `/api/auth/register` | Register a new user | ❌ |
| **POST** | `/api/auth/login` | Log in as a user | ✅ |
| **GET** | `/api/auth/profile` | Get user profile | ✅ |
| **POST** | `/api/auth/refresh-token` | Refresh JWT token | ✅ |

---

### **Admin Routes**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| **GET** | `/api/admin/users` | Get all users | ✅ (Admin) |
| **GET** | `/api/admin/users/:userId` | Get user by ID | ✅ (Admin) |
| **PUT** | `/api/admin/users/:userId` | Update user | ✅ (Admin) |
| **DELETE** | `/api/admin/users/:userId` | Delete user | ✅ (Admin) |
| **POST** | `/api/admin/settings` | Configure system settings | ✅ (Admin) |

---

### **Account Routes**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| **POST** | `/api/accounts` | Create a new account | ✅ |
| **GET** | `/api/accounts` | Get all accounts | ✅ |
| **PUT** | `/api/accounts/:id` | Update an account | ✅ |
| **DELETE** | `/api/accounts/:id` | Delete an account | ✅ |
| **GET** | `/api/accounts/convert` | Convert currency for an account | ✅ |

---

### **Budget Routes**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| **GET** | `/api/budgets` | Get all budgets | ✅ |
| **GET** | `/api/budgets/:id` | Get budget by ID | ✅ |
| **POST** | `/api/budgets` | Create a new budget | ✅ |
| **PUT** | `/api/budgets/:id` | Update a budget | ✅ |
| **DELETE** | `/api/budgets/:id` | Delete a budget | ✅ |

---

### **Goal Routes**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| **GET** | `/api/goals` | Get all goals | ✅ |
| **GET** | `/api/goals/:id` | Get goal by ID | ✅ |
| **POST** | `/api/goals` | Create a new goal | ✅ |
| **PUT** | `/api/goals/:id` | Update a goal | ✅ |
| **PATCH** | `/api/goals/:id/progress` | Update goal progress | ✅ |
| **DELETE** | `/api/goals/:id` | Delete a goal | ✅ |

---

### **Transaction Routes**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| **GET** | `/api/transactions` | Get all transactions | ✅ |
| **POST** | `/api/transactions` | Create a new transaction | ✅ |
| **PUT** | `/api/transactions/:id` | Update a transaction | ✅ |
| **DELETE** | `/api/transactions/:id` | Delete a transaction | ✅ |

---

### **Report Routes**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| **GET** | `/api/reports/monthly?month={month}&year={year}` | Get monthly report | ✅ |

---

## 🛠️ Dev Dependencies
```json
"dependencies": {
  "axios": "^1.7.9",
  "bcrypt": "^5.1.1",
  "cors": "^2.8.5",
  "dotenv": "^16.4.7",
  "express": "^4.21.2",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.10.1",
  "nodemon": "^3.1.9"
},
"devDependencies": {
  "jest": "^29.7.0",
  "supertest": "^6.3.3"
}
```

---

## 📢 Contribution
1. Fork the repo  
2. Create a new branch (`git checkout -b feature/your-feature`)  
3. Commit changes (`git commit -am 'Add new feature'`)  
4. Push to the branch (`git push origin feature/your-feature`)  
5. Open a pull request  

