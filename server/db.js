/* eslint-disable no-undef */
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
  update_date: Date,
})
const DB_HOST = process.env.DB_HOST
const DB_NAME = process.env.DB_NAME
const DB_USER = process.env.DB_USER
const DB_PWD = process.env.DB_PWD
const Expense = mongoose.model('expenses', expenseSchema)

const Months = mongoose.model('list_of_months', {
  value: String,
  label: String,
  enabled: Boolean,
})

const ExpenseCategories = mongoose.model('expense_categories', {
  category: String,
})

const Accounts = mongoose.model('accounts', {
  value: String,
  label: String,
  enabled: Boolean,
})

const connect = async function () {
  // await mongoose.connect(`mongodb://${DB_HOST}/${DB_NAME}`)
  await mongoose.connect(`mongodb://${DB_USER}:${DB_PWD}@${DB_HOST}/${DB_NAME}`) //if your database has auth enabled
}

const bulkCreateExpense = async (expenses) => {
  return Expense.insertMany(expenses)
}

// eslint-disable-next-line no-unused-vars
const createExpense = async (expense) => {
  return Expense.create(expense)
}

const queryExpense = async (query, limit, sort) => {
  return Expense.find(query)
    .limit(limit)
    .sort(sort || { date: 1 })
}

// eslint-disable-next-line no-unused-vars
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

const queryMonths = async (query, limit = 25) => {
  return Months.find(query).limit(limit).sort({ _id: -1 })
}

const getTotalMonths = async (query) => {
  return Months.count(query)
}

const addMonth = async (list) => {
  return Months.insertMany(list)
}

const updateMonths = async (query, item) => {
  return Months.updateOne(query, item)
}

const queryExpenseCategories = async (query) => {
  return ExpenseCategories.find(query)
}

const queryAccounts = async (query) => {
  return Accounts.find(query)
}

const addAccount = async (list) => {
  return Accounts.insertMany(list)
}

const updateAccounts = async (query, item) => {
  return Accounts.updateOne(query, item)
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
  updateExpense,
  queryMonths,
  addMonth,
  updateMonths,
  queryExpenseCategories,
  queryAccounts,
  addAccount,
  updateAccounts,
  getTotalMonths,
}
