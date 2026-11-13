StockFlow – Inventory Management System

StockFlow is a multi-tenant inventory management application that helps organizations manage products, monitor stock levels, and identify low-stock items through a simple dashboard.

Features

- User registration and login with JWT authentication
- Organization-based data isolation
- Product creation, viewing, updating, and deletion
- Product search by name and SKU
- Dashboard with inventory statistics
- Low-stock alerts based on configurable thresholds
- Responsive user interface

Tech Stack

Frontend

- React
- Vite
- JavaScript
- CSS
- Lucide React

Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication

Database

- PostgreSQL

Project Structure

stockflow-mvp/
├── backend/
│   ├── main.py
│   ├── auth.py
│   ├── products.py
│   ├── dashboard.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── security.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   └── src/
│       ├── App.jsx
│       └── App.css
├── .gitignore
└── README.md

Getting Started

Prerequisites

- Python 3.12+
- Node.js and npm
- PostgreSQL

1. Clone the repository

git clone https://github.com/U15LC23S0010/stockflow-mvp.git
cd stockflow-mvp

2. Backend Setup

cd backend
py -m venv .venv

Activate the virtual environment on Windows:

.venv\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt

Create a ".env" file in the backend directory and configure your local PostgreSQL database credentials and JWT settings according to the backend configuration.

Start the backend:

py -m uvicorn main:app --reload

Backend API: "http://127.0.0.1:8000"

API documentation: "http://127.0.0.1:8000/docs"

3. Frontend Setup

Open another terminal:

cd frontend
npm install
npm run dev

Frontend: "http://localhost:5173"

Low-Stock Logic

A product is considered low stock when its available quantity is less than or equal to its configured low-stock threshold.

quantity_on_hand <= low_stock_threshold

Security and Data Isolation

- Password-based authentication
- JWT-protected API endpoints
- Organization-scoped product data
- Environment variables for sensitive configuration