# ⚙️ Ecomora — Backend

REST API for **Ecomora**, an e-commerce platform. Built with Node.js + Express + MongoDB, handling auth, products, cart, orders/payments (Razorpay), and email flows.

🔗 **Live Frontend:** https://comora-frontend.vercel.app
📦 **Frontend Repo:** [Ecomora-frontend](https://github.com/aceraspire5121-debug/Ecomora-frontend)

## ✨ Features

- 🔐 JWT-based authentication with email verification & password reset
- 🛍️ Product CRUD with image uploads (Cloudinary + Multer), admin-only protected
- 🛒 Cart management (add / update quantity / remove)
- 💳 Razorpay payment integration with signature verification
- 📦 Order management (create, fetch, admin view)
- 📊 Admin dashboard data endpoint
- 👥 Customer management (admin-only)
- 📧 Transactional emails via SendGrid / Brevo / Resend / Nodemailer

## 🧰 Tech Stack

| Layer          | Tech |
|----------------|------|
| Runtime        | Node.js + Express 5 |
| Database       | MongoDB + Mongoose |
| Auth           | JWT (`jsonwebtoken`) + `bcrypt` |
| File Uploads   | Multer → Cloudinary |
| Payments       | Razorpay |
| Email          | SendGrid / Brevo (`sib-api-v3-sdk`) / Resend / Nodemailer |

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB instance (local or Atlas)
- Cloudinary account (for image uploads)
- Razorpay account (for payments)
- An email provider account (SendGrid / Brevo / Resend)

### Setup

```bash
git clone https://github.com/aceraspire5121-debug/Ecomora-backend.git
cd Ecomora-backend
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
PORT=3000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

EMAIL_USER=your_email
BREVO_API_KEY=your_brevo_api_key
```

### Run

```bash
npm start
```

Server runs at `http://localhost:3000` (or your configured `PORT`).

## 📡 API Endpoints

### Users — `/api/users`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | – | Register new user |
| POST | `/login` | – | Login, returns JWT |
| GET | `/getSingleUser` | ✅ | Get logged-in user |

### Email / Password — `/api/email`, `/api/reset`, `/api/reset-password`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/verify/:token` | Verify email |
| POST | `/checkemail` | Trigger password reset email |
| POST | `/:token` | Update password with reset token |

### Products — `/api/products`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/getProducts` | – | List products (search/paginate) |
| GET | `/:id` | – | Get single product |
| POST | `/addProducts` | ✅ Admin | Add product (up to 4 images) |
| PUT | `/:id` | ✅ Admin | Update product |
| DELETE | `/:id` | ✅ Admin | Delete product |

### Cart — `/api/cart`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | ✅ | Get cart items |
| POST | `/:id` | ✅ | Add product to cart |
| PUT | `/:id` | ✅ | Update quantity |
| DELETE | `/:id` | ✅ | Remove from cart |

### Payments — `/api/payments`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/create` | ✅ | Create Razorpay order |
| POST | `/verify-payment` | ✅ | Verify payment signature |

### Orders — `/api/orders`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/getOrders` | ✅ | Get all orders |
| GET | `/:id` | ✅ | Get single order |

### Dashboard — `/api/dashboard`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/fetchData` | ✅ Admin | Dashboard stats |

### Customers — `/api/customers`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/getAllCustomers` | ✅ Admin | List all customers |
| GET | `/:userid` | – | Get single customer |

## 📁 Project Structure
