const express = require('express');

const cors = require('cors');

const cookieParser = require('cookie-parser');

const ticketRoutes = require('./routes/tickets');

const authRoutes = require('./routes/auth');

const adminRoutes = require('./routes/admin');

const dashboardRoutes = require('./routes/dashboard');

const errorHandler = require('./middleware/errorHandler');



const app = express();



app.use(

  cors({

    origin: process.env.FRONTEND_URL || 'http://localhost:5173',

    credentials: true,

  })

);

app.use(cookieParser());

app.use(express.json());



app.get('/health', (req, res) => {

  res.json({ status: 'ok' });

});



app.use('/auth', authRoutes);

app.use('/admin', adminRoutes);

app.use('/dashboard', dashboardRoutes);

app.use('/tickets', ticketRoutes);



app.use(errorHandler);



module.exports = app;

