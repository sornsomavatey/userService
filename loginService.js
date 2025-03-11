require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./shared/models/User');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI) 
    .then(() => console.log("Login service is Connected to MongoDB"))
    .catch((err) => console.log("MongoDB connection error:", err));
    app.post('/login', async (req, res) => {
        try {
            const { email, password } = req.body;
    
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ status: 401, message: 'Invalid credentials' });
            }
    
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ status: 401, message: 'Invalid credentials' });
            }
    
            const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
            res.status(200).json({
                status: 200,
                message: 'Login successful',
                body: {
                    token,
                    userId: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            });
    
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ status: 500, message: 'Internal server error' });
        }
    });
    
app.listen(process.env.LOGIN_PORT, () => console.log(`Login service on ${process.env.LOGIN_PORT}`));