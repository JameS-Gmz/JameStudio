const Logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  Logger.error('Error:', err.message, err.stack);

  // S'assurer que les headers CORS sont toujours présents même en cas d'erreur
  const origin = req.headers.origin;
  const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV !== 'production';
  
  if (origin) {
    // En développement, autoriser localhost
    if (isDevelopment && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      // En production, vérifier les origines autorisées
      const allowedOrigins = [
        'https://jamestudio.fr',
        'https://www.jamestudio.fr',
        'http://localhost:4200',
        'http://localhost:3000',
        'http://127.0.0.1:4200',
        'http://127.0.0.1:3000'
      ];
      if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

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
    ...(isDevelopment && { stack: err.stack })
  });
};

module.exports = errorHandler;

