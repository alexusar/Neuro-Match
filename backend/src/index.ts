import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
const PORT = 6969;

app.use(cors());
app.use(express.json());

//connecting to database through connection string
const dbURI = 'mongodb+srv://awesomeomsurve:4BXq1l6JPTLdxq4p@cluster2.vlpzm8k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster2';
mongoose.connect(dbURI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log('MongoDB connection error:', err));


  app.get('/', (req, res) => {
  res.send('API is live');
});
