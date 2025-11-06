# Experience Sharing Platform Backend

This is the backend API for an experience-sharing platform where users can discover, book, and share unique experiences with local guides.

## Features

- **User Authentication**: Registration, login, and JWT-based authentication
- **Experience Guide System**: Users can apply to become experience guides
- **Experience Management**: Guides can create and manage experiences
- **Booking System**: Users can book experiences and guides can manage bookings
- **Review System**: Users can rate and review completed experiences
- **Search & Filter**: Advanced filtering for experiences by category, location, price, and date

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile (protected)

### Experience Guide Management
- `POST /guide/apply` - Apply to become an experience guide (protected)
- `GET /guide/profile` - Get own guide profile (protected)
- `PUT /guide/profile` - Update guide profile (protected)
- `GET /guide/profile/:guideId` - Get public guide profile

### Experience Management
- `GET /experiences` - Get all experiences (with filters)
- `GET /experiences/:experienceId` - Get single experience details
- `POST /experiences` - Create new experience (protected, guide only)
- `PUT /experiences/:experienceId` - Update experience (protected, guide only)
- `DELETE /experiences/:experienceId` - Delete experience (protected, guide only)
- `GET /experiences/guide/my-experiences` - Get guide's own experiences (protected)

### Booking Management
- `POST /bookings` - Book an experience (protected)
- `GET /bookings/my-bookings` - Get user's bookings (protected)
- `GET /bookings/guide-bookings` - Get guide's bookings (protected)
- `PUT /bookings/:bookingId/status` - Update booking status (protected, guide only)
- `PUT /bookings/:bookingId/cancel` - Cancel booking (protected, user only)
- `POST /bookings/:bookingId/review` - Add review to booking (protected)

## Request/Response Examples

### Register as Experience Guide
```http
POST /guide/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "علی",
  "lastName": "احمدی",
  "bio": "عاشق طبیعتگردی و ماجراجویی هستم",
  "expertise": "طبیعتگردی و کوهنوردی",
  "activityField": "گردشگری طبیعی",
  "city": "تهران",
  "activityArea": "شمال تهران",
  "email": "ali@example.com",
  "phone": "09123456789",
  "socialMedia": {
    "instagram": "@ali_ahmadi",
    "telegram": "@ali_telegram"
  }
}
```

### Create Experience
```http
POST /experiences
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "تور طبیعتگردی در جنگل البرز",
  "category": "طبیعتگردی",
  "description": "یک روز کامل در دل طبیعت با پیادهروی در جنگل و صرف صبحانه سنتی",
  "steps": [
    "ملاقات در میدان اصلی",
    "حرکت به سمت جنگل",
    "پیادهروی در مسیر جنگلی",
    "صرف صبحانه سنتی",
    "بازگشت به نقطه شروع"
  ],
  "dateTime": "2024-12-25T08:00:00Z",
  "duration": 6,
  "capacity": 10,
  "price": 150000,
  "address": "جنگل البرز، ورودی اصلی",
  "images": ["image1.jpg", "image2.jpg"]
}
```

### Book Experience
```http
POST /bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "experienceId": "6571f8a9b2c8d9e0f1a2b3c4",
  "numberOfParticipants": 2,
  "notes": "لطفاً غذای گیاهی هم در نظر بگیرید"
}
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
MONGODB_URI=mongodb://127.0.0.1:27017/experience_platform
```

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Start MongoDB server

3. Run the development server:
```bash
npm run dev
```

The server will start on port 5000 by default.

## Database Models

### User Model
- Basic authentication fields (email, password, name)
- Experience guide profile fields
- Approval status for guides

### Experience Model
- Title, category, description
- Steps and itinerary
- Date, time, duration, capacity
- Price and location
- Guide reference
- Rating and reviews

### Booking Model
- User and experience references
- Booking details (participants, price)
- Status tracking
- Payment information
- Review system

## Error Handling

All endpoints return consistent error responses:

```json
{
  "message": "Error description"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Validation Error
- 500: Internal Server Error