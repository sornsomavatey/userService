require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./shared/models/User');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Register service is Connected to MongoDB"))
    .catch((err) => console.log("MongoDB connection error:", err));

app.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: 400, message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: role || 'user',
        });

        await newUser.save();

        res.status(201).json({
            status: 201,
            message: 'User registered successfully',
            body: {
                userId: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                role: newUser.role,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt,
            }
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ status: 500, message: 'Internal server error' });
    }
});

app.listen(process.env.REGISTER_PORT, () => {
    console.log(`Register service is running on PORT NO: ${process.env.REGISTER_PORT}`);
});