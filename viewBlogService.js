require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Blog = require('./shared/models/Blog');
const User = require('./shared/models/User');
const authenticate = require('./shared/middleware/authenticate');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI) // Remove deprecated options
    .then(() => console.log("View by Id service is Connected to MongoDB"))
    .catch((err) => console.log("MongoDB connection error:", err));

    app.get('/blog/view/:id', authenticate, async (req, res) => {
        try {
            // Check if the user role is not 'user' (or any other role that should not access the blog)
            if (req.user.role !== 'user') {
                return res.status(403).json({ status: 403, message: 'Forbidden: Only users can view blogs' });
            }
    
            const blog = await Blog.findById(req.params.id).populate('author', 'firstName lastName email');
            
            if (!blog) {
                return res.status(404).json({ status: 404, message: 'Blog not found' });
            }
    
            res.status(200).json({ status: 200, message: 'Blog retrieved', body: { blog } });
    
        } catch (error) {
            console.error("View Blog Error:", error);
            res.status(500).json({ status: 500, message: 'Internal server error' });
        }
    });
    

app.listen(process.env.VIEW_BLOG_PORT, () => console.log(`View Blog service on ${process.env.VIEW_BLOG_PORT}`));