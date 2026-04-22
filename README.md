# AfterBell - Setup Instructions

## Quick Start

### Prerequisites
- Node.js (v16 or higher) - [Download here](https://nodejs.org/)
- MongoDB (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)

### Installation

1. **Install Frontend Dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Install Backend Dependencies**
   ```bash
   cd ../server
   npm install
   ```

3. **Configure Environment Variables**
   
   Edit `server/config/config.env` (see `server/.env.example` for a template):
   ```
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/afterbell
   JWT_SECRET=your_secret_key_here
   PORT=5000
   CLIENT_URL=http://localhost:3000
   ```
   
   **Parent verification emails (optional in dev):** To send real verification emails when a teen signs up, set SMTP variables in `server/config/config.env`:
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (and optionally `SMTP_FROM`, `SMTP_SECURE`).
   - If SMTP is not configured in development, the register API returns `parentVerifyUrl` in the response so you can test the flow manually.

4. **Start MongoDB**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

5. **Run the Application**

   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

   **Terminal 2 - Frontend:**
   ```bash
   cd client
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

6. **Open Browser**
   Navigate to: `http://localhost:5173`

## Test Accounts (for testing)

- **Admin**: `admin@afterbell.com` / `Admin@123` — Create once: `cd server && npm run seed:admin`
- **Demo teen** (linked to admin): `teenadmin@afterbell.com` / `TeenAdmin@123` — Create once: `cd server && npm run seed:demo-teen`

## Available Scripts

### Frontend (client/)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend (server/)
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload

## Project Structure

```
AfterBell-Clean/
├── client/          # React frontend application
│   ├── src/         # Source code
│   ├── public/      # Static assets
│   └── package.json # Frontend dependencies
└── server/          # Node.js backend API
    ├── config/      # Configuration files
    ├── controllers/ # Route handlers
    ├── models/      # Database models
    ├── routes/      # API routes
    └── package.json # Backend dependencies
```

## Troubleshooting

- **MongoDB Connection Error**: Make sure MongoDB is running
- **Port Already in Use**: Change PORT in config.env or kill the process using the port
- **Module Not Found**: Run `npm install` in the respective folder
- **Build Errors**: Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## Support

For issues or questions, check the console for error messages.

