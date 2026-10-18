# QueueInClick

A full-stack appointment scheduling platform for service-based businesses (salons, clinics, beauty parlors), with separate experiences for business owners and customers.

**Tech:** React · Node.js · Express · MySQL · Socket.IO

<!-- Add screenshots here, e.g.: ![Landing page](docs/landing.png) -->

## Features

**For business owners**
- Multi-step business registration and profile management
- Manage offered services (duration, pricing)
- Set working hours and block specific days, with automatic customer notifications
- Calendar view of upcoming appointments
- View customer reviews and average rating

**For customers**
- Search and browse service providers by domain and city
- Book, view and cancel appointments based on real-time availability
- Appointment history and in-app messages
- Rate and review providers

## Architecture

```
client/   React app (React Router, Axios, Socket.IO client)
Server/   Node.js + Express REST API
  ├── routes/     REST endpoints (queues, schedules, professionals, customers, ...)
  ├── database/   MySQL data-access layer (mysql2 connection pool)
  └── socket.js   Real-time notifications via Socket.IO
```

Socket.IO pushes real-time updates to connected clients: when an appointment is booked or cancelled, available slots refresh instantly for everyone viewing them.

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+

### 1. Clone
```bash
git clone https://github.com/taliachoen/QueueInClick.git
cd QueueInClick
```

### 2. Server
```bash
cd Server
npm install
cp .env.example .env   # fill in your MySQL connection details
npm run dev            # or: npm start
```

### 3. Client
```bash
cd ../client
npm install
cp .env.example .env   # set REACT_APP_API_URL to the server URL
npm start
```

The client runs on http://localhost:3000.

## Author

**Talia Cohen** – Full Stack Developer
[GitHub](https://github.com/taliachoen) · taliachoen1@gmail.com
