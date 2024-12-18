const express = require('express');
const app = express();
const path = require('path');

// Set view engine menjadi EJS
app.set('view engine', 'ejs');

// Akses file statis (CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Route ke halaman dashboard
app.get('/', (req, res) => {
  res.render('dashboard');
});

// Jalankan server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
