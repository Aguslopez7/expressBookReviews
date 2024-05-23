const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

/***** I need help with Task 10, 11, 12, 13 *****/

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registred. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    res.send(JSON.stringify({ books }, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn]);
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    let booksByAuthor = [];

    for (let key in books) {
        let book = books[key];
        if (book.author === author) {
            booksByAuthor.push(book);
        }
    }

    if (booksByAuthor.length > 0) {
        res.send(booksByAuthor);
    } else {
        res.status(404).send({ message: "No books found by the specified author -> " + author });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    let booksByTitle = [];

    for (let key in books) {
        let book = books[key];
        if (book.title === title) {
            booksByTitle.push(book);
        }
    }

    if (booksByTitle.length > 0) {
        res.send(booksByTitle);
    } else {
        res.status(404).send({ message: "No books found by the specified Title -> " + title });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (Object.keys(books[isbn].reviews).length > 0) {
        res.send({ reviews: books[isbn].reviews });
    } else {
        res.status(404).send({ message: "No reviews added for this book" });
    }
});

module.exports.general = public_users;
