const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// --- Task 6: Register a new user (error handling: reject duplicates with 400) ---
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Validate the request body
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check that the username is not already taken
  // isValid(username) === true means the username is still available.
  // Reject only when it is NOT available (already registered).
  if (!isValid(username)) {
    return res.status(400).json({ message: "Username already exists. Please log in instead." });
  }

  users.push({ "username": username, "password": password });
  return res.status(201).json({ message: "User registered successfully. You can now log in." });
});

// --- Task 1: Get the book list available in the shop (async callback style) ---
public_users.get('/', function (req, res) {
  // Non-blocking: simulate a small delay, then send the books via callback
  const getBooks = (callback) => {
    setTimeout(() => callback(null, books), 50);
  };

  getBooks((err, bookList) => {
    if (err) {
      // Error handling: unexpected server-side failure
      return res.status(500).json({ message: "Error retrieving book list" });
    }
    return res.status(200).json(bookList);
  });
});

// --- Task 2: Get book details based on ISBN (Promise style) ---
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const findByIsbn = new Promise((resolve, reject) => {
    setTimeout(() => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject(new Error("Book not found"));
      }
    }, 50);
  });

  findByIsbn
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(404).json({ message: err.message }));
});

// --- Task 3: Get book details based on author (Promise style, case-insensitive) ---
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();

  const findByAuthor = new Promise((resolve, reject) => {
    setTimeout(() => {
      const matchingBooks = Object.keys(books)
        .filter((isbn) => books[isbn].author.toLowerCase() === author)
        .map((isbn) => ({ isbn: isbn, ...books[isbn] }));

      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject(new Error("No books found by this author"));
      }
    }, 50);
  });

  findByAuthor
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(404).json({ message: err.message }));
});

// --- Task 4: Get all books based on title (Promise style, case-insensitive) ---
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();

  const findByTitle = new Promise((resolve, reject) => {
    setTimeout(() => {
      const matchingBooks = Object.keys(books)
        .filter((isbn) => books[isbn].title.toLowerCase() === title)
        .map((isbn) => ({ isbn: isbn, ...books[isbn] }));

      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject(new Error("No books found with this title"));
      }
    }, 50);
  });

  findByTitle
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(404).json({ message: err.message }));
});

// --- Task 5: Get book review (the first book's reviews are used as proof) ---
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
