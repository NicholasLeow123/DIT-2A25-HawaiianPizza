const express = require('express');
const cors = require('cors');
const authRouter = require('./routers/Auth.router');
const userRouter = require('./routers/User.router');
const createError = require('http-errors');

const somethingRouter = require('./routers/Something.router');
const personRouter = require('./routers/Person.router');
const cartRouter = require('./routers/Cart.router');
const compareRoutes = require('./routers/compareRoutes');
const categoriesRouter = require('./routers/categories');
const carPartsRoutes = require('./routers/carPartsRoutes');
const wishlistRoutes = require("./routes/wishlistRoutes");

const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//cars page routes
app.use('/cars', require('./routers/carsRoutes'));

//car parts page routes
app.use('/carParts', require('./routers/carPartsRoutes'));

//compare page routes
app.use('/api/compare', compareRoutes);

//categories page routes
app.use('/api/categories', categoriesRouter);
//car parts page routes
app.use('/api/carParts', carPartsRoutes);
//wishlist routes
app.use("/api/wishlist", wishlistRoutes);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/somethings', somethingRouter);
app.use('/persons', personRouter);
app.use('/cart', cartRouter);

app.use((req, res, next) => {
  next(createError(404, `Unknown resource ${req.method} ${req.originalUrl}`));
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  console.error(error);
  res
    .status(error.status || 500)
    .json({ error: error.message || 'Unknown Server Error!' });
});

app.use('/auth', authRouter);
app.use('/user', userRouter);

module.exports = app;
