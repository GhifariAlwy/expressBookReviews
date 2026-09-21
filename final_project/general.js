// ============================================================
// general.js — Task 10: Axios client for the four public endpoints
//
// Calls the running REST API over HTTP with Axios (NOT by calling
// the router functions directly):
//   1. Get all books            -> async/await
//   2. Get book by ISBN         -> async/await
//   3. Get books by author      -> Promise .then()/.catch()
//   4. Get books by title       -> Promise .then()/.catch()
//
// Run while the server is up:   node general.js
// ============================================================
const axios = require('axios');

// Base URL of the running server (can be overridden with BASE_URL / PORT)
const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5001}`;

// --- 1. Get all books: async/await with try/catch ------------------------
async function getAllBooks() {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log("1. All books:");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("1. Error fetching all books:", error.message);
  }
}

// --- 2. Get book by ISBN: async/await with try/catch ---------------------
async function getBooksByISBN(isbn) {
  try {
    const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
    console.log(`2. Book with ISBN ${isbn}:`);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error(`2. Error fetching book with ISBN ${isbn}:`, error.message);
  }
}

// --- 3. Get books by author: Promise .then()/.catch() --------------------
function getBooksByAuthor(author) {
  axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`)
    .then((response) => {
      console.log(`3. Books by ${author}:`);
      console.log(JSON.stringify(response.data, null, 2));
    })
    .catch((error) => {
      console.error(`3. Error fetching books by ${author}:`, error.message);
    });
}

// --- 4. Get books by title: Promise .then()/.catch() ---------------------
function getBooksByTitle(title) {
  axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
    .then((response) => {
      console.log(`4. Books titled "${title}":`);
      console.log(JSON.stringify(response.data, null, 2));
    })
    .catch((error) => {
      console.error(`4. Error fetching books titled "${title}":`, error.message);
    });
}

// --- Run all four requests when executed directly ------------------------
(async () => {
  await getAllBooks();
  await getBooksByISBN(1);                     // first book: Things Fall Apart
  getBooksByAuthor("Unknown");                 // books 4-7
  getBooksByTitle("One Thousand and One Nights");
})();
