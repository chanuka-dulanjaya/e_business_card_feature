# Online Business Card Application

A full-stack employee management system with QR code business cards. Built with React, Express, MongoDB, and JWT authentication.

## Features

### Admin Features
- Full employee management panel (create, update, delete)
- View all employees in a professional grid layout
- Generate downloadable QR codes for each employee profile
- Assign admin/user roles

### User Features
- Personal dashboard showing their profile
- Update mobile number and profile picture
- Clean, intuitive interface

### Public Profile Pages
- Standalone view-only pages (no navigation)
- Accessible via QR code scans
- Professional business card design
- URL format: `/profile/{employee-id}`

### Security
- Email/password authentication with JWT
- Role-based access control (Admin/User)
- Admins control all employee data
- Users can only edit their own mobile number and profile picture

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- Vite for bundling
- Lucide React for icons

**Backend:**
- Node.js + Express
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing

## Prerequisites

- Node.js (v16 or higher)
- MongoDB database (local or MongoDB Atlas)
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   cd "Online Business Card"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env` and update with your values:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_random_string
   PORT=5000
   VITE_API_URL=http://localhost:5000/api
   ```

   **Getting MongoDB URI:**
   - **MongoDB Atlas (Cloud)**:
     1. Go to https://www.mongodb.com/cloud/atlas
     2. Create a free cluster
     3. Get connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)

   - **Local MongoDB**:
     ```
     MONGODB_URI=mongodb://localhost:27017/business-card
     ```

   **Generate JWT Secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## Running the Application

**Start the application (runs both backend and frontend):**
```bash
npm run dev
```

This will start:
- Backend API server on `http://localhost:5000`
- Frontend React app on `http://localhost:5173`

**Alternative: Run separately**
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client
```

## First Time Setup

1. **Create your first admin user**

   After starting the app, go to `http://localhost:5173`

   You'll see the login page. Since no users exist yet, you need to create the first admin:

   **Option 1: Use API directly**
   ```bash
   curl -X POST http://localhost:5000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@company.com",
       "password": "your-secure-password",
       "fullName": "Admin User",
       "role": "admin"
     }'
   ```

   **Option 2: Temporarily modify signup endpoint**

   You can uncomment the signup route in the frontend if needed, or use a tool like Postman to make the API call.

2. **Login with your admin account**

   Go to `http://localhost:5173` and login with the credentials you just created.

3. **Start adding employees**

   Click "Add Employee" to create new employee accounts. Each employee will receive:
   - Login credentials (email/password)
   - A unique profile page
   - A QR code for their business card

## Usage

### Admin Dashboard
- View all employees
- Create new employees (generates login credentials)
- Edit employee information
- Delete employees
- Generate QR codes for business cards

### User Dashboard
- View personal profile
- Update mobile number
- Update profile picture URL

### Public Profiles
- Access via QR code or direct URL: `http://localhost:5173/profile/{employee-id}`
- No login required
- Perfect for business card QR codes
- Clean, professional design

### QR Codes
- Generated automatically for each employee
- Download as PNG image
- Scan to view employee's public profile
- Great for printing on business cards

## Project Structure

```
Online Business Card/
├── server/                    # Backend
│   ├── index.js              # Express server
│   ├── models/               # MongoDB models
│   │   ├── User.js          # User authentication model
│   │   └── Employee.js      # Employee data model
│   ├── routes/              # API routes
│   │   ├── auth.js          # Authentication endpoints
│   │   └── employees.js     # Employee CRUD endpoints
│   └── middleware/          # Express middleware
│       └── auth.js          # JWT authentication
├── src/                      # Frontend
│   ├── components/          # React components
│   │   ├── AdminDashboard.tsx
│   │   ├── UserDashboard.tsx
│   │   ├── EmployeeForm.tsx
│   │   └── QRCodeDisplay.tsx
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication state
│   ├── lib/                 # Utilities
│   │   └── api.ts          # API client
│   ├── pages/              # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   └── PublicProfile.tsx
│   ├── App.tsx             # Main app component
│   └── main.tsx            # React entry point
├── .env                     # Environment variables (not in git)
├── .env.example            # Example environment file
├── package.json            # Dependencies
└── README.md               # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user (admin only in production)
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - Get all employees (authenticated)
- `GET /api/employees/:id` - Get single employee (public)
- `POST /api/employees` - Create employee (admin only)
- `PUT /api/employees/:id` - Update employee (admin or own profile)
- `DELETE /api/employees/:id` - Delete employee (admin only)

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## Troubleshooting

**MongoDB Connection Error:**
- Check your `MONGODB_URI` is correct
- Ensure MongoDB is running (if local)
- Check network access in MongoDB Atlas

**Port Already in Use:**
- Change `PORT` in `.env` file
- Kill process using the port: `npx kill-port 5000`

**JWT Token Issues:**
- Clear browser localStorage
- Ensure `JWT_SECRET` is set in `.env`
- Re-login to get a new token

**Cannot Create Admin:**
- Use the API directly (curl command above)
- Check MongoDB connection
- Verify email doesn't already exist

## Security Notes

- Never commit `.env` file to git
- Use strong JWT_SECRET in production
- Use HTTPS in production
- Change default admin password after first login
- Regularly update dependencies

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
