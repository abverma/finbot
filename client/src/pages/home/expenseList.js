import React, { useState, useEffect, useContext } from 'react'
import { formatCurrency } from '../../../lib/uiHelper'

// import Table from './table'
import CardList from './cardList'
import SplitModal from './splitModal'

export default function ExpenseList(props) {
  const [accountList, setAccountList] = useState([])
  const [expenseCategories, setExpenseCategories] = useState([])
  const [titleDateString, setTitleDateString] = useState('')
  const [filterCategory, setFilterCategory] = useState()
  const [filterPriority, setFilterPriority] = useState()
  const [filterAccount, setFilterAccount] = useState()
  const [view, setView] = useState('group')

  useEffect(() => {
    let titleDateString = props.month || props.year ? ' - ' : ''

    if (props.month) {
      titleDateString += props.month + ' '
    }

    if (props.year) {
      titleDateString += props.year
    }

    setTitleDateString(titleDateString)

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
  }, [props.month, props.year])

  function handleKeywordSearch(value) {
    props.handleLocalSearch(value ?? value.toLowerCase(), 'keyword')
  }
  return (
    <div>
      <SplitModal expenseCategories={expenseCategories}></SplitModal>
      <div className="row card border-0 shadow">
        <div className="card-header border-0">
          <div className="row align-items-center ">
            <span className="col-6 col-md-3 card-header-title py-2 text-muted mb-0">
              Total: &nbsp;
              {formatCurrency(
                props.expenses
                  .filter((e) => e.checked !== false)
                  .reduce(
                    (p, c) =>
                      p +
                      (c.credit_amount ? c.credit_amount * -1 : c.debit_amount),
                    0
                  )
              )}
            </span>
            <h6 className="col-12 col-md-6 card-header-title h6 p-2 text-muted text-center mb-0 order-first order-md-0">
              EXPENSES {titleDateString}
            </h6>
            <div className="col-6 col-md-3">
              <input
                className="form-control form-control-sm"
                type="text"
                placeholder="Search"
                onChange={(e) =>
                  props.handleLocalSearch(
                    e.target.value?.toLowerCase(),
                    'keyword'
                  )
                }
              ></input>
            </div>
          </div>
          <div className="row border-0 justify-content-center mt-1">
            <div className="col-md-3 col-12 row align-items-center justify-content-center gx-1">
              <label className="col-5 form-control-sm">Category</label>
              <div className="col-7">
                <select
                  id="selectCategory"
                  className="form-select form-select-sm"
                  value={props.filter.category || ''}
                  onChange={(e) => {
                    setFilterCategory(e.target.value)
                    props.handleLocalSearch(e.target.value, 'category')
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
            <div className="col-md-3 col-12 row align-items-center justify-content-start gx-1">
              <label className="col-5 form-control-sm">Account</label>
              <div className="col-7">
                <select
                  id="selectSource"
                  className="form-select form-select-sm"
                  value={props.filter.source || ''}
                  onChange={(e) => {
                    props.handleLocalSearch(e.target.value, 'source')
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
            <div className="col-md-3 col-12 row align-items-center justify-content-start gx-1">
              <label className="col-5 form-control-sm">Priority</label>
              <div className="col-7">
                <select
                  id="selectPriority"
                  className="form-select form-select-sm"
                  value={props.filter.priority || ''}
                  onChange={(e) => {
                    props.handleLocalSearch(e.target.value, 'priority')
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
            <div className="col-md-3 col-12 text-end pe-1 pt-1 pt-md-0">
              <button
                type="button"
                className={
                  'col-auto btn btn-light ' + (view === 'group' ? 'active' : '')
                }
                onClick={() => {
                  const viewToSet = view === 'group' ? 'list' : 'group'
                  setView(viewToSet)
                }}
                data-bs-toggle="button"
              >
                <i
                  className="col-auto bi bi-diagram-2"
                  style={{ cursor: 'pointer' }}
                ></i>
              </button>
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
          expenses={view === 'list' ? props.expenses : props.groupedExpenses}
          expenseCategories={expenseCategories}
          updateRow={props.updateRow}
          saveRow={props.saveRow}
          view={view}
        ></CardList>
      </div>
    </div>
  )
}
