const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const session = require('express-session')

let users = [];

//write code to check is the username is valid.
const isValid = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username
    });
    if (userswithsamename.length > 0) {
        return false;
    } else {
        return true;
    }
}

//write code to check if username and password match the one we have in records.
const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password)
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Endpoint to get the current logged-in user
regd_users.get('/current_user', (req, res) => {
    res.send(req.session.authorization.username);
});

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: '1h' });

        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.query.review; // Get the review from the request query
    const username = req.session.authorization.username; // Get the username from the session

    if (!username) {
        return res.status(401).json({ message: "User not logged in." });
    }

    if (!reviewText) {
        return res.status(400).json({ message: "Review text is required." });
    }

    if (books[isbn]) { // Check if the book exists using the ISBN
        let book = books[isbn];

        let userReviewFound = false;
        for (let reviewId in book.reviews) {
            if (book.reviews[reviewId].username === username) {
                book.reviews[reviewId].comment = reviewText; // Update the existing review
                userReviewFound = true;
                res.status(201).json({ message: "Review updated successfully."});
                break;
            }
        }

        if (!userReviewFound) {
            const reviewId = Object.keys(book.reviews).length + 1; // Generate a new review ID
            book.reviews[reviewId] = { username, comment: reviewText }; // Add the new review
            res.status(201).json({ message: "Review added successfully."});
        }  
    } else {
        res.status(404).json({ message: "Book not found." });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username; // Get the username from the session

    if (!username) {
        return res.status(401).json({ message: "User not logged in." });
    }

    if (books[isbn]) { // Check if the book exists using the ISBN
        let book = books[isbn];

        let userReviewFound = false;
        for (let reviewId in book.reviews) {
            if (book.reviews[reviewId].username === username) {
                delete book.reviews[reviewId]; // Delete the existing review
                userReviewFound = true;
                res.status(201).json({ message: "Review deleted successfully.", reviews: book.reviews });
                break;
            }
        }

        if (!userReviewFound) {
            res.status(404).json({ message: "Not review found." });
        }
    } else {
        res.status(404).json({ message: "Book not found." });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
