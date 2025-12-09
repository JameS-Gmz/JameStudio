const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API James Studio opérationnelle',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

