# Vasai Properties Backend

A comprehensive Node.js/Express backend for the Vasai Properties real estate platform with email notifications using Nodemailer.

## 🚀 Features

- **User Authentication** - JWT-based secure authentication
- **Property Management** - CRUD operations for property listings
- **Email Notifications** - Automated emails for all user actions
- **Wishlist System** - Save and manage favorite properties
- **Inquiry System** - Direct communication between users and property owners
- **Image Upload** - Base64 image storage support
- **Search & Filter** - Advanced property search capabilities
- **Auto-Approval** - Properties appear immediately on website

## 📧 Email Notifications

The system sends beautiful HTML emails for:

1. **Welcome Email** - When users register
2. **Property Listed Email** - When property owners list a property
3. **Admin Notification** - When new properties are listed
4. **Inquiry Email** - When someone inquires about a property

## 🛠️ Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Gmail account with App Password

### Setup Steps

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   
   Update `.env` file with your settings:
   ```env
   # Server
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/vasai-properties
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   
   # Email (Gmail)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   EMAIL_FROM=Vasai Properties <your-email@gmail.com>
   
   # Admin
   ADMIN_EMAIL=admin@vasaiproperties.com
   
   # Frontend
   FRONTEND_URL=http://localhost:5173
   SITE_URL=http://localhost:5173
   ```

3. **Gmail Setup**
   - Enable 2-Factor Authentication on Gmail
   - Generate App Password: https://support.google.com/accounts/answer/185833
   - Use App Password in `EMAIL_PASS` environment variable

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo
   ```

5. **Start the Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Properties
- `GET /api/properties` - Get all properties (with filters)
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create new property (auth required)
- `PUT /api/properties/:id` - Update property (owner only)
- `DELETE /api/properties/:id` - Delete property (owner only)
- `GET /api/properties/user/my-properties` - Get user's properties

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist/:id` - Add/remove property from wishlist

### Inquiries
- `POST /api/inquiries/property/:id` - Send inquiry for property
- `GET /api/inquiries/property/:id` - Get property inquiries (owner only)
- `GET /api/inquiries/my-inquiries` - Get user's sent inquiries
- `PUT /api/inquiries/:id/respond` - Respond to inquiry (owner only)

### Health Check
- `GET /api/health` - Server health status

## 🔧 Configuration

### Email Templates
All email templates are responsive HTML with:
- Professional design
- Company branding
- Property details
- Contact information
- Call-to-action buttons

### Security Features
- Helmet for security headers
- CORS configuration
- Rate limiting
- Input validation
- JWT authentication
- Password hashing with bcrypt

### Database Models
- **User** - User accounts with authentication
- **Property** - Property listings with all details
- **Inquiry** - Communication between users and owners

## 🎯 Key Features

### Auto-Approval System
- Properties are automatically approved (`isApproved: true`)
- Immediate visibility on website
- No manual approval required

### Email Notifications
- Welcome emails for new users
- Property listing confirmations
- Admin notifications for new listings
- Inquiry notifications to property owners

### Image Support
- Base64 image storage
- Default fallback images
- Multiple image support

### Search & Filter
- Text search across title, location, description
- Filter by type, BHK, price range, status
- Sorting options
- Pagination support

## 🚀 Production Deployment

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use production MongoDB URI
   - Set secure JWT secret
   - Configure production email settings

2. **Process Management**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start server.js --name "vasai-properties-api"
   ```

3. **Reverse Proxy**
   Configure Nginx or Apache to proxy requests to the Node.js server

## 📊 Monitoring

The server logs all important events:
- ✅ Successful operations
- ❌ Error conditions
- 📧 Email sending status
- 🔐 Authentication attempts

## 🛡️ Security

- JWT tokens with 7-day expiration
- Password hashing with bcrypt (12 rounds)
- Input validation and sanitization
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers

## 🤝 Support

For technical support or questions:
- Check server logs for error details
- Verify environment variables
- Ensure MongoDB connection
- Test email configuration

---

**Vasai Properties Backend** - Powering your real estate platform! 🏠✨