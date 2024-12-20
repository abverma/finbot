import React from 'react'
import SearchBar from './search'
import Summary from './summary'
import ExpenseList from './expenseList'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [monthList, setMonthList] = useState([])
  const [expenses, setExpenses] = useState([])
  const [filteredExpenses, setFilteredExpenses] = useState([])
  const [groupedExpenses, setGroupedExpenses] = useState([])
  const [aggregates, setAggregates] = useState([])
  const [date, setDate] = useState()
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
  const [year, setYear] = useState()
  const [yearList, setYearList] = useState([])

  useEffect(() => {
    fetchMonthList()
    fetchYearList()

    if (date || year) {
      fetchExpenses()
      fetchPeriodBalances()
    }
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    )
    const tooltipList = [...tooltipTriggerList].map(
      (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
    )
  }, [date, year])

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

  function fetchYearList() {
    fetch('/yearList?enabled=true')
      .then((data) => data.json())
      .then((data) => {
        setYearList(data.data)
      })
      .catch((e) => {
        console.log(e)
      })
  }

  function fetchExpenses() {
    let url = `/expenses`
    if (date) {
      url += `?date=${date}`
    } else if (year) {
      url += `?year=${year}`
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
        return (
          sum +
          (rec._id == 'investment' || rec.exclude === true
            ? 0
            : parseFloat(rec.total))
        )
      }, 0)
    }
    setExpenses(data.expenses)
    filterExpenses(data.expenses)
    setAggregates(data.aggregate)
    setTotal(total)
    const reducer = (p, c) =>
      p + (c.credit_amount ? -1 * c.credit_amount : c.debit_amount)
    setTotalFixed(
      data.expenses.filter((x) => x.priority === 'fixed').reduce(reducer, 0)
    )
    setTotalNecessary(
      data.expenses.filter((x) => x.priority === 'necessary').reduce(reducer, 0)
    )
    setTotalAvoidable(
      data.expenses.filter((x) => x.priority === 'avoidable').reduce(reducer, 0)
    )
    setTotalDoesntHurt(
      data.expenses.filter((x) => x.priority === 'one-off').reduce(reducer, 0)
    )
    setCredit(
      data.expenses
        .filter((x) => x.trx_type === 'credit' && x.category !== 'salary')
        .reduce((p, c) => p + c.credit_amount, 0)
    )
    setSalary(
      data.expenses
        .filter((x) => x.trx_type === 'credit' && x.category === 'salary')
        .reduce((p, c) => p + c.credit_amount, 0)
    )
    setResetFilter(true)
  }

  function groupExpenses(expenses) {
    const expenseGroup = {}
    const groupedList = []
    expenses.forEach((expense) => {
      if (expense.expense_source) {
        const expenseSource = expense.expense_source.toLowerCase()
        if (
          expenseGroup[expenseSource] &&
          expenseGroup[expenseSource][expense.category]
        ) {
          expenseGroup[expenseSource][expense.category].amount +=
            expense.credit_amount * -1 || expense.debit_amount
          expenseGroup[expenseSource][expense.category].items.push(expense)
        } else {
          if (!expenseGroup[expenseSource]) {
            expenseGroup[expenseSource] = {}
          }
          expenseGroup[expenseSource][expense.category] = {
            expense_source: expense.expense_source,
            amount: expense.credit_amount * -1 || expense.debit_amount,
            items: [expense],
          }
        }
      }
    })

    expenses.forEach((expense) => {
      const expenseSource = expense.expense_source.toLowerCase()
      const expenseCategory = expense.category
      if (expense.expense_source && expenseGroup[expenseSource]) {
        if (
          groupedList.findIndex(
            (item) =>
              item.expense_source.toLowerCase() ===
                expense.expense_source.toLowerCase() &&
              item.category === expenseCategory
          ) === -1
        ) {
          if (
            expenseGroup[expenseSource][expenseCategory] &&
            expenseGroup[expenseSource][expenseCategory].items.length > 1
          ) {
            groupedList.push(
              Object.assign(
                structuredClone({
                  ...expense,
                  amount: expenseGroup[expenseSource][expenseCategory].amount,
                }),
                {
                  items: expenseGroup[expenseSource][expenseCategory].items,
                }
              )
            )
          } else {
            groupedList.push(
              Object.assign(
                structuredClone({
                  ...expense,
                  amount: expense.credit_amount * -1 || expense.debit_amount,
                })
              )
            )
          }
        }
      } else {
        groupedList.push(
          Object.assign(
            structuredClone({
              ...expense,
              amount: expense.credit_amount * -1 || expense.debit_amount,
            })
          )
        )
      }
    })
    return groupedList
  }

  function filterExpenses(rows) {
    setFilteredExpenses(rows)
    setGroupedExpenses(groupExpenses(rows))
  }
  function fetchPeriodBalances() {
    let url = '/getPeriodBalance'
    if (date) {
      url += `?date=${date}`
    } else if (year) {
      url += `?year=${year}`
    }
    fetch(url)
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
        let fixedFlag = false
        const fixeds = [
          'maintenance',
          'netflix',
          'max life ins',
          'maxlife',
          'maid',
          'gail',
          'cook',
          'bisna',
          'saraswati',
        ]
        for (let i = 0; i < fixeds.length; i++) {
          if (expense.expense_source.toLowerCase().includes(fixeds[i])) {
            fixedFlag = true
            break
          }
        }
        if (
          !fixedFlag &&
          ['car-emi', 'phone', 'electricity'].includes(expense.category)
        ) {
          fixedFlag = true
        }
        if (
          expense.expense_source !== 'loan' &&
          expense.trx_type !== 'credit' &&
          fixedFlag
        ) {
          expense['priority'] = 'fixed'
        }
      })

      expenses.forEach((expense) => {
        if (
          (!expense.priority &&
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
          expense.expense_source?.includes('massage') ||
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
              'indigo',
              'chimney',
              'cab',
            ].includes(expense.expense_source)) ||
          expense.expense_source.includes('one-off') ||
          expense.expense_source.includes('tickets') ||
          expense.expense_source.includes('airport') ||
          expense.expense_source.includes('rent') ||
          expense.expense_source.includes('firstcry') ||
          expense.expense_source.includes('yatra')
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
    filterExpenses(tempRows)
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

  function handleLocalSearch(value, filterLabel) {
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
          filteredExpenses = Object.assign([], filteredExpenses).filter((x) =>
            key === 'keyword'
              ? keywordSearch(filterState[key], x)
              : x[key] == filterState[key]
          )
        })
        filterExpenses(filteredExpenses)
        setFilter(filterState)
      } else {
        filterExpenses(expenses)
        setFilter(filterState)
      }
    }
  }

  function keywordSearch(keyword, expense) {
    return (
      expense.details?.toLowerCase().includes(keyword) ||
      expense.source?.toLowerCase().includes(keyword) ||
      expense.expense_source?.toLowerCase().includes(keyword) ||
      expense.expense_category?.toLowerCase().includes(keyword)
    )
  }

  function clearAndApplyFilter(value, criteria) {
    setFilter({})
    handleLocalSearch(value, criteria)
  }

  async function handleSelectMonth(e) {
    if (e.target.value) {
      setDate(e.target.value)
      setYear('')
    }
  }

  async function handleSelectYear(e) {
    if (e.target.value) {
      setDate('')
      setYear(e.target.value)
    }
  }

  function handleSearch(criterias) {
    searchExpenses(criterias)
    setDate('')
  }

  function handleClearSearch() {
    if (date) {
      fetchExpenses()
      fetchPeriodBalances()
    } else {
      setDate(new Date().setDate(1))
      loadPage({ expenses: [] })
    }
  }

  function refreshPage() {
    fetchExpenses()
    setFilter({})
  }

  return (
    <div>
      <div className="container p-3 m-auto">
        <div className="row justify-content-start align-items-center">
          <div className="ps-0 col-10 col-md-4">
            <select
              id="selectMonth"
              className="form-select form-select-md m-2"
              aria-label="Default select example"
              onChange={(e) => handleSelectMonth(e)}
              value={date}
            >
              <option defaultValue value="">
                Select Month
              </option>
              {monthList.map((x, idx) => (
                <option key={x._id} value={x.value}>
                  {x.label}
                </option>
              ))}
            </select>
          </div>
          <div className="ps-0 col-10 col-md-2">
            <select
              id="selectYear"
              className="form-select form-select-md m-2"
              aria-label="Default select example"
              onChange={(e) => handleSelectYear(e)}
              value={year}
            >
              <option defaultValue value="">
                Select Year
              </option>
              {yearList.map((x) => (
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
        <div className="row pb-2">
          <SearchBar
            handleSearch={(c) => handleSearch(c)}
            handleClearSearch={() => handleClearSearch()}
          ></SearchBar>
        </div>
        <div className="row gx-5 gy-2">
          <div className="col-12 col-md-4">
            <Summary
              aggregate={aggregates}
              dateString={date}
              year={year}
              total={total}
              totalFixed={totalFixed}
              totalNecessary={totalNecessary}
              totalAvoidable={totalAvoidable}
              totalDoesntHurt={totalDoesntHurt}
              credit={credit}
              salary={salary}
              openingBalance={openingBalance}
              closingBalance={closingBalance}
              clearAndApplyFilter={clearAndApplyFilter}
            ></Summary>
          </div>
          <div className="col-12 col-md-8">
            <ExpenseList
              expenses={filteredExpenses}
              dateString={date}
              year={year}
              handleLocalSearch={(value, filter) =>
                handleLocalSearch(value, filter)
              }
              updateRow={(row) => updateRow(row)}
              saveRow={(row) => saveRow(row)}
              filter={filter}
              keywordSearch={(keyword) => keywordSearch(keyword)}
              groupedExpenses={groupedExpenses}
            ></ExpenseList>
          </div>
        </div>
      </div>
    </div>
  )
}
