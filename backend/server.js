const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

// Trust proxy for Render deployment
app.enable('trust proxy');

// Logging Middleware
app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url}`);
    console.log(`[Origin] ${req.headers.origin}`);
    next();
});

// Manual CORS Middleware
app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:5173', 'https://work.xplnhub.tech', 'http://localhost:5001'];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.head('/', (req, res) => {
    res.status(200).end();
});

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/meetings', require('./routes/meetingRoutes'));

// 404 Handler with CORS headers
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
