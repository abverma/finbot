import React from 'react'
import { useState, useEffect } from 'react'
import Table from './table'
import CardList from './cardList'

export default function ExpenseList(props) {
  const [accountList, setAccountList] = useState([])
  const [expenseCategories, setExpenseCategories] = useState([])
  const [titleDateString, setTitleDateString] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterAccount, setFilterAccount] = useState('')

  useEffect(() => {
    if (props.dateString) {
      const dateString = ` - ${new Date(props.dateString).toLocaleString(
        'en-US',
        { month: 'long' }
      )} ${new Date(props.dateString).getFullYear()}`
      setTitleDateString(dateString)
    }

    fetch('/accounts')
      .then((data) => data.json())
      .then((data) => {
        setAccountList(data.data)
      })
      .catch((e) => {
        console.log(e)
      })

    fetch('/expenseCategories')
      .then((data) => data.json())
      .then((data) => {
        setExpenseCategories(data.data)
      })
      .catch((e) => {
        console.log(e)
      })
  }, [props.dateString])

  return (
    <div className="card border-0 table-responsive shadow">
      <div className="card-header border-0 row white text-center">
        <div className="col-12">
          <h6 className="card-header-title h6 p-2 text-muted mb-0">
            EXPENSES {titleDateString}
          </h6>
        </div>
      </div>
      <div className="card-body row justify-content-center">
        <div className="col-md-4 col-12 row align-items-center">
          <label className="col-5">Category</label>
          <div className="col-7">
            <select
              id="selectCategory"
              className="form-select form-select-sm"
              value={props.resetFilter ? '' : filterCategory}
              onChange={(e) => {
                props.setResetFilter(false)
                setFilterCategory(e.target.value)
                props.handleSelectCategory(e.target.value, 'category')
              }}
            >
              <option value="" defaultValue>
                No filter
              </option>
              {expenseCategories
                .sort((a, b) => {
                  return a.category < b.category ? -1 : 1
                })
                .map((x) => (
                  <option value={x.category} key={x._id}>
                    {x.category.replace(
                      x.category.charAt(0),
                      x.category.charAt(0).toUpperCase()
                    )}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div className="col-md-4 col-12 row align-items-center">
          <label className="col-5">Account</label>
          <div className="col-7">
            <select
              id="selectSource"
              className="form-select form-select-sm"
              value={props.resetFilter ? '' : filterAccount}
              onChange={(e) => {
                props.setResetFilter(false)
                setFilterAccount(e.target.value)
                props.handleSelectCategory(e.target.value, 'source')
              }}
            >
              <option value="" defaultValue>
                No filter
              </option>
              {accountList.map((x) => (
                <option key={x._id} value={x.value}>
                  {x.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="col-md-4 col-12 row align-items-center">
          <label className="col-5">Priority</label>
          <div className="col-7">
            <select
              id="selectPriority"
              className="form-select form-select-sm"
              value={props.resetFilter ? '' : filterPriority}
              onChange={(e) => {
                props.setResetFilter(false)
                setFilterPriority(e.target.value)
                props.handleSelectCategory(e.target.value, 'priority')
              }}
            >
              <option value="" defaultValue>
                No filter
              </option>
              <option value="fixed">Fixed</option>
              <option value="necessary">Necessary</option>
              <option value="avoidable">Avoidable</option>
              <option value="one-off">One-off</option>
            </select>
          </div>
        </div>
      </div>
      {/* <Table
        expenses={props.expenses}
        expenseCategories={expenseCategories}
        updateRow={props.updateRow}
        saveRow={props.saveRow}
      ></Table> */}
      <CardList
        expenses={props.expenses}
        expenseCategories={expenseCategories}
        updateRow={props.updateRow}
        saveRow={props.saveRow}
      ></CardList>
    </div>
  )
}
