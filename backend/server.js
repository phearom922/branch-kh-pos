const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const branchRoutes = require('./routes/branches');
const userRoutes = require('./routes/users');
const saleRoutes = require('./routes/sales');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const reportRoutes = require('./routes/reports');
const groupRoutes = require('./routes/group');
const errorHandler = require('./utils/errorHandler');

require('./models/Group');
require('./models/Category');
require('./models/Product');
require('./models/HistoryOrder');
require('./models/Counter');
require('./models/Branch');
require('./models/User');

dotenv.config();
const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/groups', groupRoutes);

app.use(errorHandler);

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} `));