if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

// Override DNS resolution for MongoDB Atlas SRV records
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const app = express();
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");

// Safe import for connect-mongo across different module resolutions
const MongoStore = require("connect-mongo").default || require("connect-mongo");

const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const PORT = 8080;
const dbUrl = process.env.ATLASDB_URL;

// Database Connection
async function main() {
    await mongoose.connect(dbUrl);
    console.log("Connected to DB");
}

main().catch((err) => {
    console.error("DB Connection Error:", err);
});

// Configuration & View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Create Mongo Session Store
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600, // Lazy session update interval (24 hours)
});

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

// Session Options
const sessionOptions = {
    store: store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

// 1. Session and Flash Middlewares
app.use(session(sessionOptions));
app.use(flash());

// 2. Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// 3. Local variables middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// 4. Routers
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// 5. Catch-all 404 for undefined routes
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// 6. Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});