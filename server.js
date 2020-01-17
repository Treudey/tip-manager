const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const tipsRoutes = require('./routes/tips');
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 5000;

require('dotenv').config();

app.use(cors());
app.use(express.json());

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message, data });
});

app.use('/tips', tipsRoutes);
app.use('/auth', authRoutes);

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { 
  useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true 
})
.then(result => {
  console.log('MongoDB database connection established successfully')
  app.listen(port, () => console.log(`Server running on port ${port}`));
});

