# Firebase Authentication POC

A web application demonstrating Firebase Authentication with React frontend and Express backend.

## Prerequisites

- Node.js (v14 or higher)
- npm
- Firebase project with Authentication enabled
- Firebase Admin SDK private key

## Project Structure
```plaintext
project/
├── frontend/    # React application
└── backend/     # Express server
```

## Environment Variables

### Frontend (.env)
Create a `.env` file in the frontend directory by referring to `.env.example`


### Backend (.env)
Create a `.env` file in the backend directory by referring to `.env.example`

## Setup Instructions

1. Clone the repository
2. Set up the backend:

```plaintext
cd backend
npm install
```

Update your Firebase Admin SDK private key (jw-social-key.json) in the backend directory
1. Set up the frontend:


```plaintext
cd frontend
npm install
```
## Running the Application

1. Start the backend server:

```plaintext
cd backend
node index.js
```

The backend server will start on http://localhost:3001

1. In a new terminal, start the frontend development server:

```plaintext
cd frontend
npm start
```

The frontend application will start on http://localhost:3000

