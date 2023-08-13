require('dotenv').config()
const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema({
	date: Date,
	details: String,
	value_dat: Date,
	debit_amount: Number,
	credit_amount: Number,
	reference_number: String,
	closing_balance: Number,
	source: String,
	category: String,
	expense_source: String,
	trx_type: String,
	creation_date: {
		type: Date,
		default: Date.now,
	},
	update_date: Date
})
const DB_HOST = process.env.DB_HOST
const DB_NAME = process.env.DB_NAME
const currentDate = '31/10/22'
const mockExpense = {
	date: new Date('20' + currentDate.split('/')[2] + '/' + currentDate.split('/')[1] + '/' + currentDate.split('/')[0]),
	details: 'UPI-ROLLA HYPER MARKET-ROLLAHYPERMARKET.42392290@HDFCBANK-HDFC0000001-230403568836-PAYMENT FROM PHONE',
	value_dat: new Date('20' + currentDate.split('/')[2] + '/' + currentDate.split('/')[1] + '/' + currentDate.split('/')[0]),
	debit_amount: '3220.00',
	credit_amount: '0.00',
	reference_number: '0000230403568836',
	closing_balance: '591340.00',
	source: 'hdfc account',
	category: 'groceries',
	expense_source: 'rolla',
	trx_type: 'debit',
}
const Expense = mongoose.model('expenses', expenseSchema)

const connect = async function () {
	await mongoose.connect(`mongodb://${DB_HOST}/${DB_NAME}`)
	// use `await mongoose.connect('mongodb://user:password@localhost:27017/test')` if your database has auth enabled
}

const bulkCreateExpense = async (expenses) => {
	return Expense.insertMany(expenses)
}

const createExpense = async (expense) => {
	return Expense.create(expense)
}

const queryExpense = async (query, limit, sort) => {
	return Expense.find(query).limit(limit).sort(sort || { date: 1 })
}
const deleteAllExpenses = async () => {
	return Expense.deleteMany()
}
const disconnect = async () => {
	return mongoose.disconnect()
}

const aggregate = async (pipelines) => {
	return Expense.aggregate(pipelines)
}

const updateExpense = async (query, updateObj) => {
	return Expense.updateOne(query, updateObj)
} 

// connect()
// .then(() => {
//     return deleteAllExpenses()
// })
// .then(() => {
//     return createExpense(mockExpense)
// })
// .then(() => {
//     return queryExpense()
// })
// .then((result) => {
//     console.log(new Date(result[0].date).toDateString())
//     mongoose.disconnect()
// })
// .catch((e) => {
//     console.log(e)
//     mongoose.disconnect()
// })


module.exports = {
	connect,
	bulkCreateExpense,
	disconnect,
	queryExpense,
	aggregate,
	updateExpense
}
