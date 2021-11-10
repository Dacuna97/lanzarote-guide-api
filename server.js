const express = require('express');
const config = require('config');
const cors = require('cors');
const fs = require('fs');
// const http = require('http');
// const https = require('https');
const connectDB = require('./config/db');
// const path = require('path');
// const privateKey = fs.readFileSync('./selfsigned.key', 'utf8');
// const certificate = fs.readFileSync('./selfsigned.crt', 'utf8');

// const credentials = { key: privateKey, cert: certificate };

const app = express();

// Connect Database
connectDB();

// Cors options
const corsOptions = {
  origin: config['origin'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

//Init Middleware
app.use(express.json({ extended: false }));
app.use(cors(corsOptions));

// Define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));

// // Serve static assets in production
// if (process.env.NODE_ENV === 'production') {
//   app.use('/_next', express.static(path.join(__dirname, '.client/.next')));

//   // app.get('*', (req, res) => {
//   //   res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
//   // });
// }

const PORT = process.env.PORT || 3000;
// const httpsServer = https.createServer(credentials, app);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
