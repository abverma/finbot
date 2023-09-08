import React from 'react'
import { useState, useEffect } from 'react'

export default class HomePage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      expenses: [],
      filteredExpenses: [],
      aggregates: [],
      date: new Date().setDate(1),
      total: 0,
      filter: {},
      totalFixed: 0,
      totalNecessary: 0,
      totalAvoidable: 0,
      totalDoesntHurt: 0,
      openingBalance: 0,
      closingBalance: 0,
      monthList: [],
      resetFilter: false,
    }
  }
  componentDidMount() {
    this.fetchExpenses()
    this.fetchMonthBalances()
    this.fetchMonthList()
  }

  fetchMonthList() {
    fetch('/monthList?enabled=true')
      .then((data) => data.json())
      .then((data) => {
        this.setState((state) => ({
          monthList: data.data,
        }))
      })
      .catch((e) => {
        console.log(e)
      })
  }

  fetchExpenses() {
    let url = `/expenses?startDate=${new Date(this.state.date).toJSON()}`
    fetch(url)
      .then((data) => {
        return data.json()
      })
      .then((data) => {
        this.loadPage(data)
      })
      .catch((e) => {
        console.log(e)
      })
  }

  searchExpenses(searchCriterias) {
    let url = `/searchExpenses?`
    if (searchCriterias) {
      url += `search=${JSON.stringify(searchCriterias)}`
    }

    fetch(url)
      .then((data) => {
        return data.json()
      })
      .then((data) => {
        this.loadPage(data)
      })
      .catch((e) => {
        console.log(e)
      })
  }

  loadPage(data) {
    let total = 0
    this.tagExpenses(data.expenses)
    if (data.aggregate && data.aggregate.length) {
      total = data.aggregate.reduce((sum, rec) => {
        return sum + (rec._id == 'investment' ? 0 : parseFloat(rec.total))
      }, 0)
    }
    this.setState((state) => ({
      expenses: data.expenses,
      filteredExpenses: data.expenses,
      aggregate: data.aggregate,
      total,
      totalFixed: data.expenses
        .filter((x) => x.priority === 'fixed')
        .reduce((p, c) => p + c.debit_amount, 0),
      totalNecessary: data.expenses
        .filter((x) => x.priority === 'necessary')
        .reduce((p, c) => p + c.debit_amount, 0),
      totalAvoidable: data.expenses
        .filter((x) => x.priority === 'avoidable')
        .reduce((p, c) => p + c.debit_amount, 0),
      totalDoesntHurt: data.expenses
        .filter((x) => x.priority === 'one-off')
        .reduce((p, c) => p + c.debit_amount, 0),
    }))
  }

  fetchMonthBalances() {
    fetch(
      '/getMonthBalance' + '?startDate=' + new Date(this.state.date).toJSON()
    )
      .then((data) => {
        return data.json()
      })
      .then((data) => {
        this.setState((state) => ({
          openingBalance: data.opening_balance,
          closingBalance: data.closing_balance,
        }))
      })
      .catch((e) => {
        console.log(e)
      })
  }

  tagExpenses(expenses) {
    if (expenses.length) {
      expenses.forEach((expense) => {
        if (
          expense.expense_source !== 'loan' &&
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
          [
            'car wash',
            'zee5',
            'donation',
            'gifts',
            'car service',
            'loan',
            'one-off',
          ].includes(expense.expense_source) ||
          expense.expense_source.includes('one-off')
        ) {
          expense['priority'] = 'one-off'
        }
      })
    }
  }

  updateRow(row) {
    const tempRows = this.state.filteredExpenses
    const changedIdx = tempRows.findIndex((x) => x._id == row._id)
    tempRows[changedIdx] = row
    this.setState((state) => ({
      filteredExpenses: tempRows,
    }))
  }

  async saveRow(row) {
    const resp = await fetch(`/expenses?_id=${row._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(row),
    })
    this.tagExpenses(this.state.expenses)
    this.tagExpenses(this.state.filteredExpenses)
  }

  handleSelectCategory(value, filter) {
    if (filter) {
      let filteredExpenses = this.state.expenses
      let filterState = this.state.filter

      if (value) {
        filterState[filter] = value
        console.log('filter table by ' + value)
      } else {
        delete filterState[filter]
      }

      if (Object.keys(filterState).length) {
        Object.keys(filterState).forEach((key) => {
          filteredExpenses = Object.assign([], filteredExpenses).filter(
            (x) => x[key] == filterState[key]
          )
        })
        this.setState((state) => ({
          filteredExpenses: filteredExpenses,
          filter: filterState,
        }))
      } else {
        this.setState((state) => ({
          filteredExpenses: this.state.expenses,
          filter: filterState,
        }))
      }
    }
  }

  async handleSelectMonth(e) {
    if (e.target.value) {
      await this.setState((state) => ({
        date: e.target.value,
      }))
      document.getElementById('selectCategory').value = ''
      document.getElementById('selectSource').value = ''
      this.fetchExpenses()
      this.fetchMonthBalances()
    }
  }

  handleSearch(criterias) {
    console.log(`Search criteria:`)
    console.log(JSON.stringify(criterias))
    this.searchExpenses(criterias)
    this.setState((state) => ({
      date: '',
    }))
  }

  handleClearSearch() {
    if (this.state.date) {
      this.fetchExpenses()
      this.fetchMonthBalances()
    } else {
      this.setState((state) => ({
        date: new Date().setDate(1),
      }))
      this.loadPage({ expenses: [] })
    }
  }

  refreshPage() {
    this.fetchExpenses()
    this.setState((state) => ({
      resetFilter: true,
    }))
  }

  render() {
    return (
      <div className="container p-3 m-auto">
        <div className="row justify-content-start align-items-center">
          <div className="ps-0 col-4">
            <select
              id="selectMonth"
              className="form-select form-select-md m-2"
              aria-label="Default select example"
              onChange={(e) => this.handleSelectMonth(e)}
            >
              <option defaultValue value="">
                Select month
              </option>
              {this.state.monthList.map((x) => (
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
              onClick={() => this.refreshPage()}
            ></i>
          </div>
        </div>
        <div className="row p-2">
          <SearchBar
            handleSearch={(c) => this.handleSearch(c)}
            handleClearSearch={() => this.handleClearSearch()}
          ></SearchBar>
        </div>
        <div id="summary" className="row p-2">
          <Summary
            aggregate={this.state.aggregate}
            dateString={this.state.date}
            total={this.state.total}
            totalFixed={this.state.totalFixed}
            totalNecessary={this.state.totalNecessary}
            totalAvoidable={this.state.totalAvoidable}
            totalDoesntHurt={this.state.totalDoesntHurt}
            openingBalance={this.state.openingBalance}
            closingBalance={this.state.closingBalance}
          ></Summary>
        </div>
        <div id="expenseList" className="row p-2">
          <Table
            expenses={this.state.filteredExpenses}
            dateString={this.state.date}
            handleSelectCategory={(value, filter) =>
              this.handleSelectCategory(value, filter)
            }
            updateRow={(row) => this.updateRow(row)}
            saveRow={(row) => this.saveRow(row)}
            resetFilter={this.state.resetFilter}
          ></Table>
        </div>
      </div>
    )
  }
}

function TRow(props) {
  function onChange(e) {
    console.log(e.target.value)
    props.row.expense_source = e.target.value
    props.updateRow(props.row)
  }

  function onKeyUp(e, rowKey) {
    if (e.code == 'Enter' && e.key == 'Enter') {
      const updateObj = {}
      updateObj[rowKey] = e.target.value
      updateObj['_id'] = props.row._id
      props.saveRow(updateObj)
      e.target.blur()
    }
  }

  function getTextColor() {
    let color = ''
    switch (props.row.priority) {
      case 'fixed':
        color = 'primary'
        break
      case 'necessary':
        color = 'success'
        break
      case 'avoidable':
        color = 'danger'
        break
      case 'one-off':
        color = 'light'
        break
    }
    return color
  }

  return (
    <tr className={`table-${getTextColor()}`}>
      <th scope="row" className="text-muted">
        {props.idx}
      </th>
      <td>{new Date(props.row.date).toDateString()}</td>
      <td>
        {(
          props.row.credit_amount * -1 || props.row.debit_amount
        ).toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
        })}
      </td>
      <td>{props.row.category}</td>
      <td>
        <input
          type="text"
          value={props.row.expense_source}
          className="form-control"
          onChange={(e) => onChange(e)}
          onKeyUp={(e) => onKeyUp(e, 'expense_source')}
        ></input>
      </td>
      <td>{props.row.source}</td>
      <td className="text-wrap" style={{ width: 10 + 'rem' }}>
        {props.row.details}
      </td>
      <td className="text-center">
        <i className="bi bi-three-dots"></i>
      </td>
    </tr>
  )
}

function Table(props) {
  const [accountList, setAccountList] = useState([])
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
  }, [])

  return (
    <div className="card border-0 table-responsive shadow">
      <div className="card-header border-0 row white">
        <div className="col-md-3 col-12 ">
          <h6 className="card-header-title h6 p-2 text-muted mb-0">
            EXPENSES {titleDateString}
          </h6>
        </div>
        <div className="col-md-3 col-12 row align-items-center">
          <label className="col-4">Category</label>
          <div className="col-8">
            <select
              id="selectCategory"
              className="form-select form-select-sm"
              value={props.resetFilter ? '' : filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value)
                props.handleSelectCategory(e.target.value, 'category')
              }}
            >
              <option value="">No filter</option>
              <option value="amazon">Amazon</option>
              <option value="apparel">Apparel</option>
              <option value="baby">Baby</option>
              <option value="car-emi">Car-emi</option>
              <option value="eating-out">Eating-out</option>
              <option value="entertainment">Entertainment</option>
              <option value="groceries">Groceries</option>
              <option value="investment">Investment</option>
              <option value="medical">Medical</option>
              <option value="misc">Misc</option>
              <option value="phone">Phone</option>
              <option value="travel">Travel</option>
            </select>
          </div>
        </div>
        <div className="col-md-3 col-12 row align-items-center">
          <label className="col-4">Account</label>
          <div className="col-8">
            <select
              id="selectSource"
              className="form-select form-select-sm"
              value={props.resetFilter ? '' : filterAccount}
              onChange={(e) => {
                setFilterAccount(e.target.value)
                props.handleSelectCategory(e.target.value, 'source')
              }}
            >
              <option value="">No filter</option>
              {accountList.map((x) => (
                <option key={x._id} value={x.value}>
                  {x.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="col-md-3 col-12 row align-items-center">
          <label className="col-4">Priority</label>
          <div className="col-8">
            <select
              id="selectPriority"
              className="form-select form-select-sm"
              value={props.resetFilter ? '' : filterPriority}
              onChange={(e) => {
                setFilterPriority(e.target.value)
                props.handleSelectCategory(e.target.value, 'priority')
              }}
            >
              <option value="">No filter</option>
              <option value="fixed">Fixed</option>
              <option value="necessary">Necessary</option>
              <option value="avoidable">Avoidable</option>
              <option value="one-off">One-off</option>
            </select>
          </div>
        </div>
      </div>
      <table className="table card-body align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th scope="col" className="text-muted">
              #
            </th>
            <th scope="col" className="text-muted">
              Date
            </th>
            <th scope="col" className="text-muted">
              Amount
            </th>
            <th scope="col" className="text-muted">
              Category
            </th>
            <th scope="col" className="text-muted">
              Source
            </th>
            <th scope="col" className="text-muted">
              Account
            </th>
            <th scope="col" className="text-muted">
              Details
            </th>
            <th scope="col" className="text-muted">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="list">
          {props.expenses.map((row, idx) => {
            return (
              <TRow
                key={idx}
                row={row}
                idx={idx + 1}
                updateRow={props.updateRow}
                saveRow={props.saveRow}
              ></TRow>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Summary(props) {
  let titleDateString = ''

  if (props.dateString) {
    titleDateString =
      ' - ' +
      new Date(props.dateString).toLocaleString('en-US', { month: 'long' }) +
      ' ' +
      new Date(props.dateString).getFullYear()
  }

  return (
    <div className="row card mx-auto border-0 shadow">
      <div className="card-header border-0 white text-center">
        <h6 className="card-header-title h6 p-2 text-muted ">
          SUMMARY {titleDateString}
        </h6>
      </div>
      <div className="card-body">
        {props.aggregate
          ? props.aggregate.map((rec, idx) => {
              return (
                <dl key={idx} className="row mb-1">
                  <dt className="col-md-2 col-6">
                    {rec._id.replace(
                      rec._id.charAt(0),
                      rec._id.charAt(0).toUpperCase()
                    )}
                  </dt>
                  <dd className="col-md-10 col-6">
                    {rec.total.toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </dd>
                </dl>
              )
            })
          : ''}
        {props.total ? (
          <dl className="row mt-4 mb-0">
            <dt className="col-md-2 col-6">Total Expense</dt>
            <dd className="col-md-10 col-6">
              {props.total.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}

        {props.totalFixed ? (
          <dl className="row mb-0">
            <dt className="col-md-2 col-6 text-primary">Fixed Expense</dt>
            <dd className="col-md-10 col-6">
              {props.totalFixed.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}

        {props.totalNecessary ? (
          <dl className="row mb-0">
            <dt className="col-md-2 col-6 text-success">Necessary Expense</dt>
            <dd className="col-md-10 col-6">
              {props.totalNecessary.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}

        {props.totalAvoidable ? (
          <dl className="row mb-0">
            <dt className="col-md-2 col-6 text-danger">Avoidable Expense</dt>
            <dd className="col-md-10 col-6">
              {props.totalAvoidable.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}

        {props.totalDoesntHurt ? (
          <dl className="row mb-0">
            <dt className="col-md-2 col-6 text-secondary">One-off Expense</dt>
            <dd className="col-md-10 col-6">
              {props.totalDoesntHurt.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}

        {props.openingBalance ? (
          <dl className="row mb-0">
            <dt className="col-md-2 col-6">Opening Balance</dt>
            <dd className="col-md-10 col-6">
              {props.openingBalance.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}

        {props.closingBalance ? (
          <dl className="row mb-0">
            <dt className="col-md-2 col-6">Closing Balance</dt>
            <dd className="col-md-10 col-6">
              {props.closingBalance.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </dd>
          </dl>
        ) : null}
      </div>
    </div>
  )
}

function SearchBar({ handleSearch, handleClearSearch }) {
  const [searchCriterias, setSearchCriterias] = useState([
    {
      query: {
        field: '',
        operator: '===',
        value: '',
      },
      operand: '',
    },
  ])

  const [isDirty, setIsDirty] = useState(false)

  function handleAddCriteriaRow(idx, operand) {
    console.log(`Add ${operand} criteria`)
    searchCriterias[idx].operand = operand
    setSearchCriterias(
      searchCriterias.concat({
        query: {
          field: '',
          operator: '===',
          value: '',
        },
        operand: null,
      })
    )
  }

  function handleChangeCriteria(value, idx, property) {
    const newCriterias = searchCriterias.map((c, i) => {
      if (i === idx) {
        c.query[property] = value
        return c
      } else {
        return c
      }
    })
    setSearchCriterias(newCriterias)
    checkIsDirty()
  }

  function checkIsDirty() {
    let dirty = true
    searchCriterias.forEach((c) => {
      Object.keys(c.query).forEach((key) => {
        if (!c.query[key]) {
          dirty = false
        }
      })
    })
    setIsDirty(dirty)
  }

  function handleClear() {
    setIsDirty(false)
    setSearchCriterias([
      {
        query: {
          field: '',
          operator: '===',
          value: '',
        },
        operand: null,
      },
    ])
    handleClearSearch()
  }

  function handleDeleteCriteriaRow(idx) {
    const newCriterias = searchCriterias.filter((c, i) => i !== idx)
    setSearchCriterias(newCriterias)
  }

  return (
    <div className="card border-0 shadow">
      <div className="card-header row white">
        <h3 className="card-title col">Search</h3>
        <div className="col-2 text-end">
          <i
            className="bi bi-chevron-down"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseExample"
          ></i>
        </div>
      </div>
      <div id="collapseExample" className="card-body collapse">
        <div className="my-2 px-md-4">
          {searchCriterias.map((criteria, idx) => {
            return (
              <SearchCriteria
                key={idx}
                idx={idx}
                criteria={criteria}
                handleAddCriteriaRow={handleAddCriteriaRow}
                handleChangeCriteria={handleChangeCriteria}
                handleDeleteCriteriaRow={handleDeleteCriteriaRow}
              ></SearchCriteria>
            )
          })}
          <div className="row justify-content-start my-2">
            <div className="col-6 col-md-2">
              <button
                className="btn btn-primary"
                disabled={!isDirty}
                onClick={(e) => handleSearch(searchCriterias)}
              >
                Search
              </button>
            </div>
            <div className="col-6 col-md-2">
              <button className="btn btn-primary" onClick={() => handleClear()}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SearchCriteria({
  criteria,
  idx,
  handleAddCriteriaRow,
  handleDeleteCriteriaRow,
  handleChangeCriteria,
}) {
  return (
    <div className="row justify-content-start my-3">
      <div className="col-12 col-md-auto mt-1">
        <select
          className="form-select form-select-md"
          value={criteria.query.field}
          onChange={(e) => handleChangeCriteria(e.target.value, idx, 'field')}
        >
          <option defaultValue value="">
            Select field
          </option>
          <option value="details">Details</option>
          <option value="category">Category</option>
          <option value="expense_source">Source</option>
          <option value="debit_amount">Amount</option>
        </select>
      </div>
      <div className="col-12 col-md-auto mt-1">
        <select
          className="form-select form-select-md col"
          value={criteria.query.operator}
          onChange={(e) =>
            handleChangeCriteria(e.target.value, idx, 'operator')
          }
        >
          <option defaultValue value="">
            Select operator
          </option>
          <option value="$eq">equals</option>
          <option value="$gt">greater than</option>
          <option value="$lt">less than</option>
          <option value="$ne">not equals</option>
          <option value="$regex">includes</option>
        </select>
      </div>
      <div className="col-12 col-md-auto mt-1">
        <input
          className="form-control"
          type="text"
          placeholder="Enter search value"
          value={criteria.query.value}
          onChange={(e) => handleChangeCriteria(e.target.value, idx, 'value')}
        ></input>
      </div>
      <div className="col-auto mt-1">
        <button
          className={
            'btn border' + (criteria.operand === '$and' ? ' btn-primary' : '')
          }
          onClick={(e) => handleAddCriteriaRow(idx, '$and')}
        >
          And
        </button>
      </div>
      <div className="col-auto mt-1">
        <button
          className={
            'btn border' + (criteria.operand === '$or' ? ' btn-primary' : '')
          }
          onClick={(e) => handleAddCriteriaRow(idx, '$or')}
        >
          Or
        </button>
      </div>
      {idx > 0 ? (
        <div className="col-auto mt-1">
          <button
            className="btn border"
            onClick={(e) => handleDeleteCriteriaRow(idx)}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      ) : null}
    </div>
  )
}
