# Node.js REST API for Product, Order, and User Management

This project is a REST API for managing products, orders, users, and nearby locations. It is built using Node.js, Express, MongoDB, and several middlewares for handling various HTTP requests. 

## Table of Contents

- [Technologies Used](#technologies-used)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [Products Routes](#products-routes)
  - [Orders Routes](#orders-routes)
  - [User Routes](#user-routes)
  - [Nearby Routes](#nearby-routes)
  - [Home Routes](#home-routes)
- [License](#license)

## Technologies Used

- **Node.js**: JavaScript runtime for building the backend API.
- **Express**: Web framework for building the API.
- **MongoDB**: NoSQL database for storing product and user data.
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB and Node.js.
- **Morgan**: HTTP request logger middleware for node.js.
- **Body-parser**: Middleware for parsing incoming request bodies.
- **JWT**: For generating and verifying JSON Web Tokens for user authentication.

## Setup

Follow these steps to set up the project locally:

### 1. Clone the repository

```bash
git clone https://github.com/your-username/node-rest-api.git
cd node-rest-api
