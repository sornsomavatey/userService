require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Blog = require('./shared/models/Blog');
const authenticate = require('./shared/middleware/authenticate');


const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI) 
    .then(() => console.log("Create service is Connected to MongoDB"))
    .catch((err) => console.log("MongoDB connection error:", err));

    app.post('/blog/create', authenticate, async (req, res) => {
        try {
            // Ensure the role is 'user'
            if (req.user.role !== 'user') {
                return res.status(403).json({ status: 403, message: 'Forbidden: Only users can create blogs' });
            }
    
            const { title, description, blogImage } = req.body;
            const author = req.user.userId;
    
            const newBlog = new Blog({
                title,
                description,
                author,
                blogImage,
            });
    
            await newBlog.save();
    
            res.status(201).json({
                status: 201,
                message: 'Blog created successfully',
                body: {
                    blogId: newBlog._id,
                    title: newBlog.title,
                    description: newBlog.description,
                    author: newBlog.author,
                    blogImage: newBlog.blogImage,
                    createdAt: newBlog.createdAt,
                    updatedAt: newBlog.updatedAt
                }
            });
    
        } catch (error) {
            console.error("Create blog error:", error);
            res.status(500).json({ status: 500, message: 'Internal server error' });
        }
    });
    

app.listen(process.env.CREATE_BLOG_PORT, () => console.log(`Create Blog service listening on port ${process.env.CREATE_BLOG_PORT}`));