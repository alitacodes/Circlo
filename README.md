# Circlo - Rental Platform

A modern rental platform built with React, TypeScript, and Node.js with integrated Razorpay payment system.

## Features

- 🔐 User authentication and authorization
- 📦 Item listing and management
- 📅 Booking system with date selection
- 💳 Integrated Razorpay payment processing
- 💬 Real-time chat system
- ⭐ Review and rating system
- 🏛️ Cultural vault for special items
- 📱 Responsive design

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- Framer Motion for animations

### Backend
- Node.js with Express
- SAP HANA database
- JWT authentication
- Razorpay payment integration
- Multer for file uploads

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- SAP HANA database (or use mock data)

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
cd circlov3/Circlo.in
npm install

# Install backend dependencies
cd backend
npm install
```

### 2. Environment Configuration

#### Backend Configuration
Copy the example environment file and configure your settings:

```bash
cd backend
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
HOST=127.0.0.1
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database Configuration (SAP HANA)
HANA_HOST=your-hana-host
HANA_PORT=443
HANA_USER=your-hana-user
HANA_PASSWORD=your-hana-password
HANA_SCHEMA=your-schema

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

#### Frontend Configuration
Copy the example environment file:

```bash
cd ../
cp env.example .env
```

Edit `.env` with your configuration:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### 3. Razorpay Setup

1. Create a Razorpay account at [razorpay.com](https://razorpay.com)
2. Get your test API keys from the Razorpay dashboard
3. Update the environment variables with your keys:
   - `RAZORPAY_KEY_ID`: Your Razorpay public key
   - `RAZORPAY_KEY_SECRET`: Your Razorpay secret key

### 4. Database Setup

#### Option A: SAP HANA (Recommended)
1. Set up SAP HANA database
2. Run the table creation script:
   ```bash
   cd backend/scripts
   node table.js
   ```
3. Update the database connection in `.env`

#### Option B: Mock Data (Development)
The application will automatically fall back to mock data if the database is not available.

### 5. Start the Application

#### Start Backend
```bash
cd backend
npm run dev
```

The backend will be available at `http://localhost:5000`

#### Start Frontend
```bash
# In a new terminal
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Payment Flow

1. **User selects dates** and clicks "Confirm & Pay"
2. **Booking is created** with pending status
3. **Razorpay order is created** with calculated amount
4. **Payment modal opens** with Razorpay checkout
5. **User completes payment** through Razorpay
6. **Payment is verified** on the backend
7. **Booking is confirmed** and status updated

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Items
- `GET /api/items` - Get all items
- `POST /api/items` - Create new item
- `GET /api/items/:id` - Get specific item

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `PUT /api/bookings/:id/status` - Update booking status

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment signature

## Development

### Project Structure
```
circlov3/Circlo.in/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   └── contexts/      # React contexts
├── backend/
│   ├── routes/        # API routes
│   ├── scripts/       # Database scripts
│   └── services/      # Business logic
└── public/            # Static assets
```

### Available Scripts

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

#### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check your HANA connection settings in `.env`
   - Ensure the database is running and accessible
   - The app will fall back to mock data if needed

2. **Razorpay Payment Fails**
   - Verify your Razorpay keys are correct
   - Check that the keys are for the correct environment (test/live)
   - Ensure the payment amount is in paise (multiply by 100)

3. **CORS Errors**
   - Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
   - Check that both servers are running on the correct ports

4. **File Upload Issues**
   - Ensure the `uploads` directory exists in the backend
   - Check file size limits in the configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 