const cors = require('cors');
const dotenv = require("dotenv");
const express = require('express');
const mongoose = require('mongoose');
dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// cors setup
app.use(cors());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

// db setup
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, () => console.log("db connected..."));

// model setup
// 1. user model
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }
})
const UsertModel = mongoose.model('user', userSchema);


// 2. revenue model
const revenueSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    dateReceived: { type: Number, required: true } // taking as timestamp
})
const RevenueModel = mongoose.model('revenue', revenueSchema);

// index page
app.get('/', (req, res) => res.send("welcome to project hub!"))

// server up page
const serverUP = Date();
app.get('/up', (req, res) => {
    res.send("server running from " + serverUP)
})

//* revenue and user counter
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_IN_MS = 86400000;

app.get('/last-year-revenue', async (req, res) => {
    const timestamp_of_one_year_ago = Date.now() - DAY_IN_MS * 365;

    try {
        // get user data
        const users = await UsertModel.find();
        const userCount = users.length;

        // get revenue data
        const revenueData = await RevenueModel.find();

        let last_360days_revenue = revenueData.filter(item => item.dateReceived > timestamp_of_one_year_ago)
        last_360days_revenue.sort((a, b) => b.dateReceived - a.dateReceived)

        let monthly_data = {};

        last_360days_revenue.map(item => {
            let year = new Date(item.dateReceived).getFullYear();
            let month = months[new Date(item.dateReceived).getMonth()];
            let newKey = month + "-" + year;

            if (newKey in monthly_data) {
                monthly_data[newKey].totalAmount = monthly_data[newKey].totalAmount + item.amount;
            } else {
                monthly_data[newKey] = { month: month, year: year, totalAmount: item.amount };
            }
        })

        // console.log(last_360days_revenue.length , " of ", revenueData.length);

        console.log(monthly_data)

        const pastRevenueReceveivedByMonth = Object.values(monthly_data);

        res.status(200).json({ noOfUsers: userCount, pastRevenueReceveivedByMonth })
    } catch (error) {
        res.status(401).json({ message: error.message })
    }
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("running on port 5000"));