import { useState } from 'react'
import React from 'react'
import { useSelector } from 'react-redux'

export default function SplitModal({ expenseCategories }) {
  const currentExpense = useSelector((state) => state.app.currentExpense)
  const [newExpenses, setNewExpenses] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasChange, setHasChange] = useState(false)

  function addRow() {
    const newExpense = structuredClone(currentExpense)
    newExpense.debit_amount = ''
    newExpense.parent_id = currentExpense._id
    delete newExpense._id
    setNewExpenses([newExpense, ...newExpenses])
  }

  function formatString(str) {
    return str ? str.charAt(0).toUpperCase() + str.substring(1, str.length) : ''
  }

  async function save() {
    try {
      setIsLoading(true)
      await Promise.all([createNewExpenses(), updateParentExpense()])
      setNewExpenses([])
      setIsLoading(false)
    } catch (e) {
      console.log()
    }
  }

  function close() {
    setNewExpenses([])
  }

  async function createNewExpenses() {
    await fetch('/expenses', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(newExpenses),
    })
  }

  async function updateParentExpense() {
    const parentExpense = structuredClone(currentExpense)
    parentExpense.debit_amount -= newExpenses.reduce(
      (p, c) => p + c.debit_amount,
      0
    )
    await fetch(`/expenses?_id=${parentExpense._id}`, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(parentExpense),
    })
  }

  function onRowChange(idx, value, key) {
    setHasChange(true)
    const currentRow = structuredClone(newExpenses[idx])
    currentRow[key] = key === 'debit_amount' ? parseFloat(value) : value
    console.log(currentRow[key])
    setNewExpenses(newExpenses.map((e, id) => (id === idx ? currentRow : e)))
  }

  return (
    <div
      className="modal fade modal-lg "
      id="splitModal"
      tabIndex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header row">
            <h2 className="col-auto modal-title fs-5" id="exampleModalLabel">
              Split expense
            </h2>
            <span className="col">
              {currentExpense
                ? `${formatString(
                    currentExpense.expense_source
                  )} / ${formatString(currentExpense?.category)} / ${new Date(
                    currentExpense?.date?.split('T'[0])
                  ).toDateString()}`
                : ''}
            </span>

            <button
              type="button"
              className="col-auto btn-close mx-0 px-2"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={() => close()}
            ></button>
          </div>
          <div className="modal-body container">
            <div className="row mb-4 align-items-center">
              <span className="col-5 lead">
                Original Amount: &nbsp;
                {currentExpense?.debit_amount?.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                })}
              </span>
              <button
                className="col-auto btn btn-sm btn-primary"
                onClick={() => addRow()}
              >
                <i className="bi bi-plus" type="button"></i>
              </button>
            </div>

            {isLoading ? (
              <div className="d-flex justify-content-center">
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              newExpenses.map((expense, idx) => {
                return (
                  <div className="row" key={idx}>
                    <div className="col-auto">
                      <select
                        id="selectCategory"
                        className="form-select form-select-sm"
                        value={expense.category}
                        onChange={(e) =>
                          onRowChange(idx, e.target.value, 'category')
                        }
                      >
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
                    <div className="col-auto">
                      <input
                        type="number"
                        className="form-control form-control-sm mb-1"
                        placeholder="Amount"
                        value={expense.debit_amount}
                        onChange={(e) =>
                          onRowChange(idx, e.target.value, 'debit_amount')
                        }
                      ></input>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => save()}
              disabled={!hasChange}
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
