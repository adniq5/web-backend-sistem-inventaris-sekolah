require('dotenv').config();

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const connectDatabase = require('./config/database');
const logger = require('./middleware/logger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./route/authRoutes');
const categoryRoutes = require('./route/categoryRoutes');
const itemRoutes = require('./route/itemRoutes');
const loanRoutes = require('./route/loanRoutes');
const returnRoutes = require('./route/returnRoutes');
const activityLogRoutes = require('./route/activityLogRoutes');
const externalRoutes = require('./route/externalRoutes');

const app = express();
const port = process.env.PORT || 3000;
app.use(logger);
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/', (req, res) => res.status(200).json({ message: 'Sistem Inventaris Sekolah API berjalan.' }));
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/external', externalRoutes);
app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    await connectDatabase();
    app.listen(port, () => console.log(`Server berjalan pada port ${port}.`));
  } catch (error) {
    console.error('Server gagal terhubung ke database. Periksa konfigurasi lokal Anda.');
    process.exitCode = 1;
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
