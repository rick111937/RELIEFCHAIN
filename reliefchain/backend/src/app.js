const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api', limiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const projectRoutes = require('./routes/projectRoutes');
const ipfsRoutes = require('./routes/ipfsRoutes');
const vcRoutes = require('./routes/vcRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const fraudRoutes = require('./routes/fraudRoutes');
const oracleRoutes = require('./routes/oracleRoutes');

app.get('/health', (req, res) => res.send('OK'));
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/ipfs', ipfsRoutes);
app.use('/api/v1/vc', vcRoutes);
app.use('/api/v1/predictions', predictionRoutes);
app.use('/api/v1/fraud', fraudRoutes);
app.use('/api/v1/oracle', oracleRoutes);

app.use(errorHandler);
module.exports = app;
