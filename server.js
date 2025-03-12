const express = require('express');
const path = require('path');

const app = express();

// Set the folder where Angular's built files are stored
const distFolder = path.join(__dirname, 'dist/angular-app/browser');

// Serve static files (HTML, CSS, JS, assets, etc.)
app.use(express.static(distFolder));

// Handle all Angular routes by serving `index.html`
app.get('*', (req, res) => {
  res.sendFile(path.join(distFolder, 'index.html'));
});

// Start the server
const PORT = 4201
app.listen(PORT, () => {
  console.log(`Angular app running on http://localhost:${PORT}`);
});
