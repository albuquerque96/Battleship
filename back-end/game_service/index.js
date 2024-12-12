require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const gameRoutes = require('./routes/gameRoutes');


app.use(
  cors({
    origin: "http://localhost", // O Nginx vai enviar requests de "http://localhost"
    credentials: true,
  })
);

app.use("/api/game",gameRoutes );

try {
  const port = process.env.PORT|| 3002;
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}...`);
  });
} catch (error) {
  console.error("Error starting server:", error.message);
}

module.exports = app;
