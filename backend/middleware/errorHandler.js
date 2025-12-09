const Logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  Logger.error('Error:', err.message, err.stack);

  // Erreur de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message
    });
  }

  // Erreur de base de données
  if (err.code === 'SQLITE_ERROR' || err.code === 'SQLITE_CONSTRAINT') {
    return res.status(500).json({
      error: 'Database Error',
      message: 'Une erreur de base de données est survenue'
    });
  }

  // Erreur par défaut
  res.status(err.status || 500).json({
    error: err.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;

