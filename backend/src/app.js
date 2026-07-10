const express = require('express');
const cookieParser = require("cookie-parser")
const cors = require('cors');

/* require all routes here */
const authRouter = require('./routes/auth.routes');
const interviewRouter = require('./routes/interview.routes')

const app = express();

app.use(express.json());
app.use(cookieParser())


const allowedOrigins = [
    "http://localhost:5173",
    "https://interview-ai-phi-rust.vercel.app"
];
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))

/* using all routes here */
app.use('/api/auth', authRouter);
app.use('/api/interview', interviewRouter);


module.exports = app;