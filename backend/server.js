require('dotenv').config();
const express = require('express');
const cors = require("cors");
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

const productsRouter = require('./Routes/productRoutes');
app.use(express.json());


app.use(cors());


app.get('/health', (req, res) => {
  res.json({ status: 'ok',
    message: 'Backend is live',});
});


app.use('/api', productsRouter);

app.use(express.static(
  path.join(__dirname, 'dist')
));


app.use((req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      'dist',
      'index.html'
    )
  );
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is live',
  });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});