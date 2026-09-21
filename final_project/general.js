// ============================================================
// general.js — Task 10: Axios client for the four public endpoints
//
// Calls the running REST API over HTTP with Axios (NOT by calling
// the router functions directly). All four requests use the
// async/await style for consistency:
//   1. Get all books
//   2. Get book by ISBN
//   3. Get books by author
//   4. Get books by title
//
// Run while the server is up:   node general.js
// ============================================================
const axios = require('axios');

// Base URL of the running server (can be overridden with BASE_URL / PORT)
const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5001}`;

// Consistent error reporting for every function:
// - HTTP error (e.g. 404 "Book not found")  -> "<label> Error [<status>]: <server message>"
// - No response (server down)               -> "<label> Error: no response from server (...)"
// - Request setup failure                   -> "<label> Error: <message>"
function logError(label, error) {
  if (error.response) {
    // Server replied with an error status code
    const { status, data } = error.response;
    const detail = data && data.message ? data.message : JSON.stringify(data);
    console.error(`${label} Error [${status}]: ${detail}`);
  } else if (error.request) {
    // Request was sent but no response arrived
    console.error(`${label} Error: no response from server (${error.message})`);
  } else {
    // Something went wrong while setting up the request
    console.error(`${label} Error: ${error.message}`);
  }
}

// --- 1. Get all books -----------------------------------------------------
async function getAllBooks() {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log("1. getAllBooks:");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    logError("1. getAllBooks", error);
  }
}

// --- 2. Get book by ISBN ----------------------------------------------------
async function getBooksByISBN(isbn) {
  try {
    const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
    console.log(`2. getBooksByISBN (${isbn}):`);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    logError("2. getBooksByISBN", error);
  }
}

// --- 3. Get books by author -------------------------------------------------
async function getBooksByAuthor(author) {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    console.log(`3. getBooksByAuthor (${author}):`);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    logError("3. getBooksByAuthor", error);
  }
}

// --- 4. Get books by title ----------------------------------------------------
async function getBooksByTitle(title) {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    console.log(`4. getBooksByTitle (${title}):`);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    logError("4. getBooksByTitle", error);
  }
}

// --- Run all four requests when executed directly ------------------------
if (require.main === module) {
  (async () => {
    await getAllBooks();
    await getBooksByISBN(1);                     // first book: Things Fall Apart
    await getBooksByAuthor("Unknown");           // books 4-7
    await getBooksByTitle("One Thousand and One Nights");
  })();
}

// Exported so the client functions can be reused or tested elsewhere
module.exports = { getAllBooks, getBooksByISBN, getBooksByAuthor, getBooksByTitle };
