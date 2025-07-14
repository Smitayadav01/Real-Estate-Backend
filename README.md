# Vasai Properties Backend API

A comprehensive backend API for the Vasai Properties real estate platform built with Node.js, Express.js, and MongoDB.

## 🚀 Features

- **User Authentication**: JWT-based authentication with registration and login
- **Property Management**: CRUD operations for property listings
- **Inquiry System**: Handle property inquiries and notifications
- **Email Notifications**: Automated email notifications for property submissions and inquiries
- **Wishlist**: Users can save favorite properties
- **Search & Filter**: Advanced property search with multiple filters
- **Security**: Rate limiting, CORS, input validation, and security headers
- **Database**: MongoDB with Mongoose ODM

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Gmail account for email notifications

## 🛠️ Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

3. **Configure Environment Variables**
   Edit `.env` file with your configurations:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/vasai-properties
   
   # JWT Secret (generate a strong secret)
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Email Configuration
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📧 Email Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Use the app password** in `EMAIL_PASS` environment variable

## 🗄️ Database Schema

### User Schema
```javascript
{
  name: String (required, 2-50 chars),
  email: String (required, unique, valid email),
  phone: String (required, valid phone),
  password: String (required, min 6 chars, hashed),
  role: String (enum: ['user', 'admin'], default: 'user'),
  isActive: Boolean (default: true),
  wishlist: [ObjectId] (references Property),
  profileImage: String,
  timestamps: true
}
```

### Property Schema
```javascript
{
  title: String (required, 5-100 chars),
  type: String (enum: ['apartment', 'house', 'villa', 'commercial']),
  bhk: String (enum: ['1', '2', '3', '4', '5']),
  bathrooms: Number (1-10),
  area: Number (100-50000 sq ft),
  price: Number (1000-1000000000),
  location: String (required, 5-100 chars),
  description: String (required, 20-1000 chars),
  status: String (enum: ['sale', 'rent']),
  images: [String],
  amenities: [String],
  features: [String],
  nearbyPlaces: [String],
  owner: ObjectId (references User),
  ownerName: String (required),
  ownerPhone: String (required),
  ownerEmail: String (required),
  isApproved: Boolean (default: false),
  isActive: Boolean (default: true),
  views: Number (default: 0),
  rating: Number (1-5, default: 4.8),
  coordinates: { latitude: Number, longitude: Number },
  timestamps: true
}
```

### Inquiry Schema
```javascript
{
  property: ObjectId (references Property),
  inquirer: {
    name: String (required),
    email: String (required),
    phone: String (required)
  },
  message: String (required, 10-1000 chars),
  status: String (enum: ['pending', 'responded', 'closed']),
  response: String,
  respondedAt: Date,
  timestamps: true
}
```

## 🔗 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile

### Property Routes (`/api/properties`)
- `GET /` - Get all approved properties (with filters)
- `GET /:id` - Get single property by ID
- `POST /` - Create new property (auth required)
- `PUT /:id` - Update property (owner only)
- `DELETE /:id` - Delete property (owner only)
- `GET /user/my-properties` - Get user's properties
- `POST /:id/wishlist` - Add/remove from wishlist
- `GET /user/wishlist` - Get user's wishlist

### Inquiry Routes (`/api/inquiries`)
- `POST /:propertyId` - Send inquiry for property
- `GET /property/:propertyId` - Get property inquiries (owner only)
- `GET /my-inquiries` - Get all inquiries for user's properties
- `PUT /:id/respond` - Respond to inquiry (owner only)

### Utility Routes
- `GET /api/health` - Health check
- `GET /` - API welcome message

## 🔍 Query Parameters

### Property Search (`GET /api/properties`)
```
?page=1&limit=12&location=vasai&type=apartment&bhk=2&status=sale&minPrice=1000000&maxPrice=5000000&search=modern&sortBy=price&sortOrder=asc
```

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: express-validator for all inputs
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **MongoDB Injection Protection**: Mongoose sanitization

## 📧 Email Templates

The API sends beautiful HTML email templates for:
- **Property Submission**: Notification to admin and confirmation to owner
- **Property Inquiries**: Notification to property owner
- **Responsive Design**: Mobile-friendly email templates

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vasai-properties
JWT_SECRET=your-production-jwt-secret
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-production-app-password
FRONTEND_URL=https://your-frontend-domain.com
```

### MongoDB Atlas Setup
1. Create MongoDB Atlas account
2. Create new cluster
3. Create database user
4. Whitelist IP addresses
5. Get connection string

## 🧪 Testing

```bash
# Test API health
curl http://localhost:5000/api/health

# Test user registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"1234567890","password":"password123"}'
```

## 📝 Error Handling

The API includes comprehensive error handling:
- **Validation Errors**: Detailed field-level validation messages
- **Authentication Errors**: Clear JWT and permission messages
- **Database Errors**: Mongoose validation and duplicate key handling
- **Global Error Handler**: Catches and formats all errors

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Start production server
npm start
```

## 📊 Monitoring

- **Health Check**: `/api/health` endpoint for monitoring
- **Error Logging**: Console logging for all errors
- **Request Logging**: Basic request information

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.