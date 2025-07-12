const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const { TrackingModel } = require('./TrackingModel');
const mongoose = require('mongoose');
const { Types } = mongoose;
const { UserModel } = require('./UserModel');

dotenv.config();

const connectToMongoDB = async () => {
  await mongoose.connect(process.env.DB_URL);
  console.log('Connected to Mongo')
};

const port = process.env.PORT;

const start = async () => {
  await connectToMongoDB();
  
  if (process.env.ENVIRONMENT === "dev") {
    app.listen(port, () => {
      console.log(`Application running on: http://localhost:${port}`);
    })
  }

  module.exports = app;
};

const app = express();

app.use(express.json());
app.use(cors());

app.post('/save-url', async (req, res) => {
  const { url, userId } = req.body;
  if (!url || !userId) throw new Error('Error');

  const user = await UserModel.findById(userId);
  if (!user) throw new Error('USER_NOT_FOUND');

  const model = new TrackingModel({ userId: new Types.ObjectId(userId), url });
  await model.save()

  return res.status(201).send()
});

app.post('/create-user', async (req, res) => {
  const { token } = req.headers;
  if (!token || token !== process.env.CREATE_USER_TOKEN) throw new Error('INVALID_AUTHENTICATION')
  
  const user = new UserModel()
  await user.save(); 

  const id = user._id.toString();
  const baseUrl = process.env.BASE_URL;

  const script = `<script>
  fetch("${baseUrl}/save-url", {
    method: "POST", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "${id}",
      url: window.location.href
    }),
 });
</script>`;
  
  return res.status(200).header('Content-Type', 'text/plain').send(script);
});


app.delete('/delete-user', async (req, res) => {
  const { token } = req.headers;
  if (!token || token !== process.env.DELETE_USER_TOKEN) throw new Error('INVALID_AUTHENTICATION')

  const id = req.body.userId
  await UserModel.findByIdAndDelete(id)

  return res.status(204).send()
});

app.get('/list-urls/:userId', async (req, res) => {
  const { token } = req.headers;
  if (!token || token !== process.env.LIST_URLS_TOKEN) throw new Error('INVALID_AUTHENTICATION')

  const { userId } = req.params;
  
  const models = await TrackingModel.find({
    userId,
  }).sort({ 
    createdAt: -1,
  }).limit(100);

  const urls = models.map(({ url, createdAt }) => ({ url, createdAt }));


  return res.status(200).json({
    urls
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  
  const status = err.status ?? 500;
  const message = err.message ?? 'Erro interno do servidor';

  return res.status(status).json({
    status,
    message,
  });
});

start();

