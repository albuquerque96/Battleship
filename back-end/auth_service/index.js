const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
//const errorMiddleware = require('./middleware/errorMiddleware');

require('dotenv').config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: "http://localhost", // Origem do Nginx
        credentials: true,
    })
);
//app.use(errorMiddleware);
app.use("/api/auth", authRoutes);


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}...`);
});

module.exports = app;
