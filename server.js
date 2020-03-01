const path = require('path');

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

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res, next) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { 
  useNewUrlParser: true, 
  useCreateIndex: true, 
  useUnifiedTopology: true,
  useFindAndModify: false
})
.then(result => {
  console.log('MongoDB database connection established successfully')
  app.listen(port, () => console.log(`Server running on port ${port}`));
})
.catch(err => console.log(err));