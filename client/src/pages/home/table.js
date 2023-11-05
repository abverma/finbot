import React from 'react'
import { useState, useEffect } from 'react'

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

  function getRowColor() {
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
    <tr className={`table-${getRowColor()}`}>
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

export default function Table(props) {
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
                props.resetFilterValue(e.target.value ? false : true)
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
                props.resetFilterValue(e.target.value ? false : true)
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
                props.resetFilterValue(e.target.value ? false : true)
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
