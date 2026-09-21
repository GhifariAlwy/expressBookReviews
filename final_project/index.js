const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Session middleware for the /customer routes
app.use("/customer", session({
  secret: process.env.SESSION_SECRET || "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// --- Authentication middleware (routing: protects /customer/auth/* routes) ---
// Accepts the JWT either from the login session or the Authorization header.
app.use("/customer/auth/*", function auth(req, res, next) {
  // Prefer the token stored in the session at login time...
  let token = req.session.authorization ? req.session.authorization.accessToken : null;

  // ...otherwise fall back to the "Authorization: Bearer <token>" header
  const authHeader = req.headers['authorization'];
  if (!token && authHeader) {
    token = authHeader.split(' ')[1]; // format: "Bearer <token>"
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: no access token provided" });
  }

  // Verify the JWT (error handling: reject with 403 on invalid/expired token)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret_change_me");
    req.user = decoded.data; // { username } attached for the review routes
    next();
  } catch (err) {
    return res.status(403).json({ message: "Forbidden: invalid or expired token" });
  }
});

// Port 5000 is used by ControlCenter (AirPlay) on macOS, so default to 5001.
// Override with the PORT environment variable if needed.
const PORT = process.env.PORT || 5001;

app.use("/customer", customer_routes);
app.use("/customer", genl_routes); // register also reachable at /customer/register
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
