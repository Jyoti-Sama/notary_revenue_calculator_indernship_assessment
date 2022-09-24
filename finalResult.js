const dotenv = require("dotenv");
const mongoose = require('mongoose');
dotenv.config();

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


//* revenue and user counter
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_IN_MS = 86400000;


const generateRandomRevenueData = async () => {
    const today_timestamp = Date.now();
    // creating 50 records
    for (let i = 0; i < Array(50).length; i++) {
        let random_timestamp = today_timestamp - Math.floor(Math.random() * 500 * DAY_IN_MS);
        let amount = Math.ceil(Math.random() * 5000);

        let newRevenueModel = new RevenueModel({
            amount: amount,
            dateReceived: random_timestamp
        })

        await newRevenueModel.save();
    }

    console.log("complete")
}
// generateRandomRevenueData()

const generateRandomUser = async () => {
    // adding 10 users
    for (let i = 0; i < Array(10).length; i++) {
        let email = `user${i}@gmail.com`;
        let name = `user${i}`;
        let new_user_model = new UsertModel({ name: name, email: email });
        await new_user_model.save();
    }

    console.log("complete")
}
// generateRandomUser();

// * (final result) <- evaluate this one
const getLastYearRevenue = async () => {
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

        // console.log(monthly_data)

        const pastRevenueReceveivedByMonth = Object.values(monthly_data);
        console.log({ noOfUsers: userCount, pastRevenueReceveivedByMonth })
    } catch (error) {
        console.log(error)
    }
}

getLastYearRevenue();