const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const chatRoutes = require('./routes/chat');
const uploadRoutes = require('./routes/upload');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/upload-resume', uploadRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'MockMate AI Backend' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
