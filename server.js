require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { swaggerSpec, swaggerUi } = require('./swagger'); // Import the swaggerSpec and swaggerUi

const app = express();
const PORT = process.env.PORT || 8080;

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend URL
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type",
  })
);

// Middleware
app.use(express.json());

// Swagger route (API documentation)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Access docs at /api-docs

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Routes
const urlRoutes = require('./routes/urlRoutes');
app.use('/', urlRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
