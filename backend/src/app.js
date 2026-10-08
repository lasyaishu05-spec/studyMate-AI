const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const notebookRoutes = require('./routes/notebookRoutes');
const noteRoutes = require('./routes/noteRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
 res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/notebooks', notebookRoutes);
app.use('/notebooks/:notebookId/notes', noteRoutes);

app.use(errorHandler);

module.exports = app;