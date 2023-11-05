import React from 'react'
import SearchBar from './search'
import Summary from './summary'
import Table from './table'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [monthList, setMonthList] = useState([])
  const [expenses, setExpenses] = useState([])
  const [filteredExpenses, setFilteredExpenses] = useState([])
  const [aggregates, setAggregates] = useState([])
  const [date, setDate] = useState(new Date().setDate(1))
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState({})
  const [totalFixed, setTotalFixed] = useState(0)
  const [totalNecessary, setTotalNecessary] = useState(0)
  const [totalAvoidable, setTotalAvoidable] = useState(0)
  const [totalDoesntHurt, setTotalDoesntHurt] = useState(0)
  const [credit, setCredit] = useState(0)
  const [salary, setSalary] = useState(0)
  const [openingBalance, setOpeningBalance] = useState(0)
  const [closingBalance, setClosingBalance] = useState(0)
  const [resetFilter, setResetFilter] = useState(false)

  useEffect(() => {
    fetchExpenses()
    fetchMonthBalances()
    fetchMonthList()
  }, [date])

  function fetchMonthList() {
    fetch('/monthList?enabled=true')
      .then((data) => data.json())
      .then((data) => {
        setMonthList(data.data)
      })
      .catch((e) => {
        console.log(e)
      })
  }

  function fetchExpenses() {
    let url = `/expenses?startDate=${new Date(date).toJSON()}`
    fetch(url)
      .then((data) => {
        return data.json()
      })
      .then((data) => {
        loadPage(data)
      })
      .catch((e) => {
        console.log(e)
      })
  }

  function searchExpenses(searchCriterias) {
    let url = `/searchExpenses?`
    if (searchCriterias) {
      url += `search=${JSON.stringify(searchCriterias)}`
    }

    fetch(url)
      .then((data) => {
        return data.json()
      })
      .then((data) => {
        loadPage(data)
      })
      .catch((e) => {
        console.log(e)
      })
  }

  function loadPage(data) {
    console.log('loading home page')
    let total = 0
    tagExpenses(data.expenses)
    if (data.aggregate && data.aggregate.length) {
      total = data.aggregate.reduce((sum, rec) => {
        return sum + (rec._id == 'investment' ? 0 : parseFloat(rec.total))
      }, 0)
    }
    setExpenses(data.expenses)
    setFilteredExpenses(data.expenses)
    setAggregates(data.aggregate)
    setTotal(total)
    setTotalFixed(
      data.expenses
        .filter((x) => x.priority === 'fixed')
        .reduce((p, c) => p + c.debit_amount, 0)
    )
    setTotalNecessary(
      data.expenses
        .filter((x) => x.priority === 'necessary')
        .reduce((p, c) => p + c.debit_amount, 0)
    )
    setTotalAvoidable(
      data.expenses
        .filter((x) => x.priority === 'avoidable')
        .reduce((p, c) => p + c.debit_amount, 0)
    )
    setTotalDoesntHurt(
      data.expenses
        .filter((x) => x.priority === 'one-off')
        .reduce((p, c) => p + c.debit_amount, 0)
    )
    setCredit(
      data.expenses
        .filter((x) => x.trx_type === 'credit' && x.category !== 'salary')
        .reduce((p, c) => p + c.credit_amount, 0)
    )
    setSalary(data.expenses.find((x) => x.category === 'salary')?.credit_amount)
  }

  function fetchMonthBalances() {
    fetch('/getMonthBalance' + '?startDate=' + new Date(date).toJSON())
      .then((data) => {
        return data.json()
      })
      .then((data) => {
        setOpeningBalance(data.opening_balance)
        setClosingBalance(data.closing_balance)
      })
      .catch((e) => {
        console.log(e)
      })
  }

  function tagExpenses(expenses) {
    if (expenses.length) {
      expenses.forEach((expense) => {
        if (
          expense.expense_source !== 'loan' &&
          expense.trx_type !== 'credit' &&
          (['maintenance', 'netflix', 'max life ins', 'maid', 'gail'].includes(
            expense.expense_source
          ) ||
            (expense.details.includes('EAW-512967XXXXXX5130') &&
              expense.debit_amount === 10000) ||
            ['car-emi', 'phone', 'electricity'].includes(expense.category))
        ) {
          expense['priority'] = 'fixed'
        }
      })

      expenses.forEach((expense) => {
        if (
          (expense.expense_source !== 'max life ins' &&
            expense.trx_type !== 'credit' &&
            ['groceries', 'medical'].includes(expense.category)) ||
          [
            'hair cut',
            'petrol',
            'thimmarayaswamy',
            'office meal',
            'billi',
          ].includes(expense.expense_source)
        ) {
          expense['priority'] = 'necessary'
        }
      })

      expenses.forEach((expense) => {
        if (
          ['massage'].includes(expense.expense_source) ||
          expense.expense_source?.includes('splurge')
        ) {
          expense['priority'] = 'avoidable'
        }
      })

      expenses.forEach((expense) => {
        if (
          (expense.trx_type !== 'credit' &&
            [
              'car wash',
              'zee5',
              'donation',
              'gift',
              'car service',
              'loan',
              'one-off',
            ].includes(expense.expense_source)) ||
          expense.expense_source.includes('one-off')
        ) {
          expense['priority'] = 'one-off'
        }
      })
    }
  }

  function updateRow(row) {
    const changedIdx = filteredExpenses.findIndex((x) => x._id == row._id)
    const tempRows = filteredExpenses.map((x, idx) =>
      changedIdx === idx ? row : x
    )
    setFilteredExpenses(tempRows)
  }

  async function saveRow(row) {
    const resp = await fetch(`/expenses?_id=${row._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(row),
    })
    tagExpenses(expenses)
    tagExpenses(filteredExpenses)
  }

  function handleSelectCategory(value, filterLabel) {
    if (filterLabel) {
      let filteredExpenses = expenses
      let filterState = filter

      if (value) {
        filterState[filterLabel] = value
        console.log('filter table by ' + value)
      } else {
        delete filterState[filterLabel]
      }

      if (Object.keys(filterState).length) {
        Object.keys(filterState).forEach((key) => {
          filteredExpenses = Object.assign([], filteredExpenses).filter(
            (x) => x[key] == filterState[key]
          )
        })
        setFilteredExpenses(filteredExpenses)
        setFilter(filterState)
      } else {
        setFilteredExpenses(expenses)
        setFilter(filterState)
      }
    }
  }

  async function handleSelectMonth(e) {
    if (e.target.value) {
      setDate(e.target.value)
      // document.getElementById('selectCategory').value = ''
      // document.getElementById('selectSource').value = ''
      // fetchExpenses()
      // fetchMonthBalances()
    }
  }

  function handleSearch(criterias) {
    console.log(`Search criteria:`)
    console.log(JSON.stringify(criterias))
    searchExpenses(criterias)
    setDate('')
  }

  function handleClearSearch() {
    if (date) {
      fetchExpenses()
      fetchMonthBalances()
    } else {
      setDate(new Date().setDate(1))
      loadPage({ expenses: [] })
    }
  }

  function refreshPage() {
    fetchExpenses()
    resetFilterValue(true)
  }

  function resetFilterValue(value) {
    setResetFilter(value)
  }

  return (
    <div className="container p-3 m-auto">
      <div className="row justify-content-start align-items-center">
        <div className="ps-0 col-4">
          <select
            id="selectMonth"
            className="form-select form-select-md m-2"
            aria-label="Default select example"
            onChange={(e) => handleSelectMonth(e)}
          >
            <option defaultValue value="">
              Select month
            </option>
            {monthList.map((x) => (
              <option key={x._id} value={x.value}>
                {x.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-auto">
          <i
            className="bi bi-arrow-clockwise"
            type="button"
            data-bs-title="Refresh"
            onClick={() => refreshPage()}
          ></i>
        </div>
      </div>
      <div className="row p-2">
        <SearchBar
          handleSearch={(c) => handleSearch(c)}
          handleClearSearch={() => handleClearSearch()}
        ></SearchBar>
      </div>
      <div id="summary" className="row p-2">
        <Summary
          aggregate={aggregates}
          dateString={date}
          total={total}
          totalFixed={totalFixed}
          totalNecessary={totalNecessary}
          totalAvoidable={totalAvoidable}
          totalDoesntHurt={totalDoesntHurt}
          credit={credit}
          salary={salary}
          openingBalance={openingBalance}
          closingBalance={closingBalance}
        ></Summary>
      </div>
      <div id="expenseList" className="row p-2">
        <Table
          expenses={filteredExpenses}
          dateString={date}
          handleSelectCategory={(value, filter) =>
            handleSelectCategory(value, filter)
          }
          updateRow={(row) => updateRow(row)}
          saveRow={(row) => saveRow(row)}
          resetFilter={resetFilter}
          resetFilterValue={(value) => resetFilterValue(value)}
        ></Table>
      </div>
    </div>
  )
}
