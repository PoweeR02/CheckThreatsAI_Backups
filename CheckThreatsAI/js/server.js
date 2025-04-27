// Framework to handle HTTP requests
const express = require('express');
// Middleware to enable CORS
const cors = require('cors');
// MySQL client to connect to the database
const mysql = require('mysql2');
// Module to handle file paths
const path = require('path');
// Library for password hashing
const bcrypt = require('bcrypt');
// Library to send emails
const nodemailer = require('nodemailer');
// UUID generator
const { v4: uuidv4 } = require('uuid');

// Create an instance of the Express app
const app = express();
// Port where the server will run
const port = 3000;

// Enable CORS for all requests
app.use(cors());
// Parse request bodies as JSON
app.use(express.json());
// Serve static files from the 'public' folder
app.use(express.static('public')); // Serve static files

// Database connection configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ronaldo0102',
    database: 'mydb',
});

// Connecting to the database
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database');
});

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'checkthreats.ai@gmail.com',
        pass: 'q v w w g v w a s s r l w y z v'
    },
});

// Route for registration
app.post('/register', async (req, res) => {
    // Extract data from request body
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ success: false, error: 'Required data is missing' });
    }

    // Check if the username or email already exists
    const checkUserSql = 'SELECT * FROM users_credentials WHERE username = ? OR email = ?';
    db.query(checkUserSql, [username, email], async (err, results) => {
        if (err) {
            console.error('Error verifying user:', err);
            return res.status(500).json({ success: false, error: 'Error verifying user' });
        }

        // If the username or email already exists, return an error
        if (results.length > 0) {
            return res.status(400).json({ success: false, error: 'Username or email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // If not exists, insert the new user
        const sql = 'INSERT INTO users_credentials (username, email, password) VALUES (?, ?, ?)';
        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error registering user:', err);
                return res.status(500).json({ success: false, error: 'Error registering user' });
            }
            // Confirm successful registration
            res.json({ success: true, message: 'User registered successfully' });
        });
    });
});

// Route for login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Required data is missing' });
    }

    // Query the database to find the user
    const sql = 'SELECT * FROM users_credentials WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if (err) {
            console.error('Error logging in:', err);
            return res.status(500).json({ error: 'Error logging in' });
        }

        // Check if the user was found
        if (results.length > 0) {
            const user = results[0];
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            // Confirm successful login and include the email in the response
            res.json({
                success: true,
                message: 'Login successful',
                email: user.email  // Asegúrate de que `user.email` contiene el correo de la base de datos
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});


// Route for forgot password
app.post('/forgot-password', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    // Query the database to find the user associated with the email
    const query = 'SELECT id_user FROM users_credentials WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error looking up email:', err);
            return res.status(500).json({ error: 'Error looking up email' });
        }

        // Check if the email was found
        if (results.length === 0) {
            return res.status(404).json({ error: 'Email not found' });
        }

        // Get the user ID
        const userId = results[0].id_user;

        // Generate a 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000);
        const expirationDuration = (3 * 60 * 60 * 1000) - (50 * 60 * 1000);
        const expiresAt = new Date(Date.now() + expirationDuration)
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ');

        // Insert the verification code into the database
        const insertTokenSql = 'INSERT INTO password_resets (user_id, verification_code, expires_at) VALUES (?, ?, ?)';
        db.query(insertTokenSql, [userId, verificationCode, expiresAt], (err, result) => {
            if (err) {
                console.error('Error storing verification code:', err);
                return res.status(500).json({ error: 'Error storing verification code' });
            }

            // Email configuration to send the verification code
            const mailOptions = {
                from: 'checkthreats.ai@gmail.com',
                to: email,
                subject: 'Verification Code for Password Reset',
                html: `<p>Your verification code is: <strong>${verificationCode}</strong></p><p>This code will expire in 10 minutes.</p>`,

            };

            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    return res.status(500).json({ error: 'Error sending email' });
                } else {
                    // Respond to the client, indicating the code has been sent
                    res.status(200).json({
                        message: 'A verification code has been sent to your email.',
                        user_id: userId // Añadir user_id a la respuesta
                    });
                }
            });
        });
    });
});

// Route for verifying the code
app.post('/verify-code', (req, res) => {
    const { verificationCode } = req.body;

    if (!verificationCode) {
        return res.status(400).json({ error: 'Verification code is required' });
    }

    // Query the database to verify the code
    const query = 'SELECT user_id FROM password_resets WHERE verification_code = ? AND used = 0 AND expires_at > NOW()';
    db.query(query, [verificationCode], (err, results) => {
        if (err) {
            console.error('Error verifying code:', err);
            return res.status(500).json({ error: 'Error verifying code' });
        }

        // Check if the code was found
        if (results.length === 0) {
            return res.status(404).json({ error: 'Invalid verification code or code has expired' });
        }

        // Get the user ID
        const userId = results[0].user_id;

        // Mark the verification code as used
        const updateQuery = 'UPDATE password_resets SET used = 1 WHERE verification_code = ?';
        db.query(updateQuery, [verificationCode], (err) => {
            if (err) {
                console.error('Error updating verification code status:', err);
                return res.status(500).json({ error: 'Error updating verification code status' });
            }

            // Return the user ID for further use
            res.status(200).json({ success: true, user_id: userId, verificationCode });
        });
    });
});

// Route to reset the password
app.post('/reset-password', async (req, res) => {
    const { email, password } = req.body;  // Eliminamos el token

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if the email exists in the database
    const checkEmailQuery = 'SELECT * FROM users_credentials WHERE email = ?';
    db.query(checkEmailQuery, [email], async (err, results) => {
        if (err) {
            console.error('Error checking email:', err);
            return res.status(500).json({ error: 'Error checking email' });
        }

        // If no results are found, the email doesn't exist
        if (results.length === 0) {
            return res.status(404).json({ error: 'Email not found' });
        }

        try {
            // Hash the new password using bcrypt for security
            const hashedPassword = await bcrypt.hash(password, 10);

            // Update the user's password in the database using the email as the identifier
            const updatePasswordSql = 'UPDATE users_credentials SET password = ? WHERE email = ?';
            db.query(updatePasswordSql, [hashedPassword, email], (err) => {
                if (err) {
                    console.error('Error updating password:', err);
                    return res.status(500).json({ error: 'Error updating password' });
                }
                // Send success response when password is updated
                res.status(200).json({ success: true, message: 'Password updated successfully' });
            });
        } catch (err) {
            console.error('Error resetting password:', err);
            // Respond with a 500 status code
            return res.status(500).json({ error: 'Error resetting password' });
        }
    });
});

// Route to get all reviews
app.get('/reviews', (req, res) => {
    // SQL query to select all reviews
    const sql = 'SELECT name, city, message, DATE_FORMAT(date, "%Y-%m-%d %H:%i:%s") as date FROM reviews';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error getting reviews:', err);
            return res.status(500).json({ error: 'Error getting reviews' });
        }
        // Send the retrieved reviews as JSON response
        res.json(result);
    });
});

// Route to add a new review
app.post('/reviews', (req, res) => {
    const { name, city, message, username } = req.body;

    if (!name || !city || !message || !username) {
        return res.status(400).json({ error: 'Required data is missing' });
    }

    // Query the database to find the user associated with the email
    const query = 'SELECT id_user FROM users_credentials WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error looking up email:', err);
            return res.status(500).json({ error: 'Error looking up email' });
        }

        // Check if the email was found
        if (results.length === 0) {
            return res.status(404).json({ error: 'Email not found' });
        }

        // Get the user ID
        const userId = results[0].id_user;

        // SQL query to insert a new review into the database, including userId
        const sql = 'INSERT INTO reviews (name, city, message, id_profile) VALUES (?, ?, ?, ?)';
        db.query(sql, [name, city, message, userId], (err, result) => {
            if (err) {
                console.error('Error adding review:', err);
                return res.status(500).json({ error: 'Error adding review' });
            }

            // Respond with success message and include the ID of the newly added review
            res.json({ message: 'Review added', reviewId: result.insertId });
        });
    });
});

// Route to get reviews for a specific user by email
app.get('/user-profile-reviews', (req, res) => {
    const email = req.query.email;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    // SQL query to get the user ID based on the email
    const getUserIdQuery = 'SELECT id_user FROM users_credentials WHERE email = ?';
    db.query(getUserIdQuery, [email], (err, userResult) => {
        if (err) {
            console.error('Error looking up user ID:', err);
            return res.status(500).json({ error: 'Error looking up user ID' });
        }

        if (userResult.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userId = userResult[0].id_user;

        // SQL query to select all reviews for the specific user
        const getReviewsQuery = `
            SELECT name, city, message, DATE_FORMAT(date, "%Y-%m-%d %H:%i:%s") as date
            FROM reviews
            WHERE id_profile = ?`;

        db.query(getReviewsQuery, [userId], (err, reviewsResult) => {
            if (err) {
                console.error('Error getting reviews:', err);
                return res.status(500).json({ error: 'Error getting reviews' });
            }

            // Send the retrieved reviews as JSON response
            res.json(reviewsResult);
        });
    });
});

// Route to delete a review
app.delete('/delete-review', (req, res) => {
    const { message, date } = req.body;

    if (!message || !date) {
        return res.status(400).json({ success: false, message: 'Message and date are required' });
    }

    const sql = 'DELETE FROM reviews WHERE message = ? AND date = ?';
    db.query(sql, [message, date], (err, result) => {
        if (err) {
            console.error('Error deleting review:', err);
            return res.status(500).json({ success: false, message: 'Error deleting review' });
        }
        res.json({ success: true });
    });
});


// Route to delete a user account
app.delete('/delete-account', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Query to remove the account based on the email
    const sql = 'DELETE FROM users_credentials WHERE email = ?';
    db.query(sql, [email], (err, result) => {
        if (err) {
            console.error('Error deleting account:', err);
            return res.status(500).json({ success: false, message: 'Error deleting account' });
        }
        res.json({ success: true });
    });
});

// Route to get analyses for a specific user by email
app.get('/user-profile-analyses', (req, res) => {
    const email = req.query.email;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    // SQL query to get the user ID based on the email
    const getUserIdQuery = 'SELECT id_user FROM users_credentials WHERE email = ?';
    db.query(getUserIdQuery, [email], (err, userResult) => {
        if (err) {
            console.error('Error looking up user ID:', err);
            return res.status(500).json({ error: 'Error looking up user ID' });
        }

        if (userResult.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userId = userResult[0].id_user;

        // SQL query to select all analyses for the specific user
        const getAnalysesQuery = `
            SELECT id_file_analysis, file_name, file_type, DATE_FORMAT(analysis_date, "%Y-%m-%d %H:%i:%s") as analysis_date
            FROM file_analysis
            WHERE id_profile2 = ?`;

        db.query(getAnalysesQuery, [userId], (err, analysesResult) => {
            if (err) {
                console.error('Error getting analyses:', err);
                return res.status(500).json({ error: 'Error getting analyses' });
            }

            // Send the retrieved analyses as JSON response
            res.json(analysesResult);
        });
    });
});

// Route to delete a specific analysis
app.delete('/delete-analysis', (req, res) => {
    const { id_file_analysis } = req.body;

    if (!id_file_analysis) {
        return res.status(400).json({ success: false, message: 'Analysis ID is required' });
    }

    const sql = 'DELETE FROM file_analysis WHERE id_file_analysis = ?';
    db.query(sql, [id_file_analysis], (err, result) => {
        if (err) {
            console.error('Error deleting analysis:', err);
            return res.status(500).json({ success: false, message: 'Error deleting analysis' });
        }
        res.json({ success: true });
    });
});

const multer = require('multer');
const FormData = require('form-data');
const axios = require('axios');
const upload = multer();

// Route to analyze an analysis
app.post('/analyze-file', upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file received" });
        }

        const form = new FormData();
        form.append("file", req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        const response = await axios.post("http://localhost:5000/analyze", form, {
            headers: form.getHeaders()
        });

        res.json(response.data);
    } catch (error) {
        console.error("❌ Error in /analyze-file:", error);
        res.status(500).json({ error: "Flask is not running or analysis failed." });
    }
});

// Route to save an analysis result
app.post('/resultsFiles', (req, res) => {
    const { username, file_name, file_type } = req.body;

    if (!username || !file_name || !file_type) {
        return res.status(400).json({ error: 'Required data is missing' });
    }

    const query = 'SELECT id_user FROM users_credentials WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error looking up user ID' });
        if (results.length === 0) return res.status(404).json({ error: 'User not found' });

        const userId = results[0].id_user;

        const sql = 'INSERT INTO file_analysis (id_profile2, file_name, file_type) VALUES (?, ?, ?)';
        db.query(sql, [userId, file_name, file_type], (err, result) => {
            if (err) return res.status(500).json({ error: 'Error saving analysis' });
            res.json({ message: 'Analysis saved successfully' });
        });
    });
});


// Route to serve the main HTML file (index.html)
app.get('/', (req, res) => {
    // Serve the index.html file located in the public directory
    res.sendFile(path.join('index.html'));
});

// Start the server
app.listen(port, () => {
    // Log the server URL to the console when the server starts
    console.log(`Server running at http://localhost:${port}`);
});
