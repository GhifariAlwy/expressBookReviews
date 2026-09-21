const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { // returns boolean
  // The username is valid (available) only if it is not already registered
  return !users.some((user) => user.username === username);
}

const authenticatedUser = (username, password) => { // returns boolean
  // Check if username and password match the ones we have in records
  return users.some((user) => user.username === username && user.password === password);
}

// --- Task 7: Only registered users can login (JWT + session) ---
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Validate credentials presence
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Error handling: unknown or mismatched credentials
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials. Please check your username and password." });
  }

  // Generate a JWT (secret comes from the environment, not hardcoded)
  let accessToken = jwt.sign({ data: { username: username } },
    process.env.JWT_SECRET || "default_jwt_secret_change_me",
    { expiresIn: 60 * 60 }); // 1 hour

  // Store the token in the session so protected routes can use it
  req.session.authorization = { accessToken: accessToken };

  return res.status(200).json({ message: "User successfully logged in", token: accessToken });
});

// --- Task 8: Add or modify a book review (registered users only) ---
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review; // review text is passed as a query parameter

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review text is required as ?review=" });
  }

  // req.user is set by the JWT middleware in index.js
  const username = req.user.username;
  if (!username) {
    return res.status(401).json({ message: "Unauthorized: username not found in token" });
  }

  // Each user can only keep one review per book: adding again overwrites their own
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: `The review for the book with ISBN ${isbn} has been added/updated by user ${username}.`
  });
});

// --- Task 9: Delete a book review (only the user's own review) ---
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  const username = req.user.username;
  const reviews = books[isbn].reviews;

  // Error handling: the user has no review to delete on this book
  if (!reviews || !reviews[username]) {
    return res.status(404).json({ message: "No review by this user found for this book" });
  }

  // A user can only delete their own review
  delete reviews[username];

  return res.status(200).json({ message: `Review for the book with ISBN ${isbn} deleted by user ${username}.` });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
