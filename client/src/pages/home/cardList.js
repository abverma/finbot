import React from 'react'
import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { setCurrentExpense } from '../../../lib/slice'

export default function CardList(props) {
  const count = useSelector((state) => state.counter.value)
  const dispatch = useDispatch()
  function checkRow(index) {}

  return (
    <div className="p-0">
      {props.expenses.map((row, idx) => {
        return (
          <Card
            key={idx}
            index={idx}
            row={row}
            expenseCategories={props.expenseCategories}
            updateRow={props.updateRow}
            saveRow={props.saveRow}
            checkRow={checkRow}
            dispatch={dispatch}
          ></Card>
        )
      })}
    </div>
  )
}

function Card({
  row,
  expenseCategories,
  updateRow,
  saveRow,
  checkRow,
  index,
  dispatch,
}) {
  const [isEdit, setIsEdit] = useState(false)

  function onChange(e, rowKey) {
    if (rowKey === 'checked') {
      checkRow(index)
    } else if (e.target) {
      row[rowKey] = e.target.value
    }
    updateRow(row)
    if (rowKey === 'category') {
      const updateObj = {}
      updateObj[rowKey] = e.target.value
      updateObj['_id'] = row._id
      saveRow(updateObj)
    }
  }

  function onKeyUp(e, rowKey) {
    if (e.code == 'Enter' && e.key == 'Enter') {
      const updateObj = {}
      updateObj[rowKey] = e.target.value
      updateObj['_id'] = row._id
      saveRow(updateObj)
      e.target.blur()
    }
  }

  async function toggleModal(row) {
    const splitModal = new bootstrap.Modal('#splitModal')
    dispatch(setCurrentExpense(row))
    splitModal.show()
    document
      .getElementById('splitModal')
      .addEventListener('hide.bs.modal', (event) => {
        debugger
        dispatch(setCurrentExpense({}))
      })
  }

  return (
    <div className="card m-1">
      <div className="card-header">
        <div className="row align-items-start">
          <div className="col-1">
            <input
              className="form-check-input"
              type="checkbox"
              defaultChecked
              onChange={(e) => onChange(e, 'checked')}
            ></input>
            <span>&nbsp;#{index + 1}</span>
          </div>
          <div className="col text-center">
            {new Date(row.date).toDateString()}
          </div>
          <div className="col-1 text-end">
            {isEdit ? (
              <i
                className="bi bi-check2"
                type="button"
                data-bs-title="Save"
                onClick={() => setIsEdit(!isEdit)}
              ></i>
            ) : (
              <small>
                <i
                  className="bi bi-pencil"
                  type="button"
                  data-bs-title="Edit"
                  onClick={() => setIsEdit(!isEdit)}
                ></i>
              </small>
            )}
            <small>
              <i
                className="bi bi-vr ms-2"
                type="button"
                data-bs-title="Split"
                onClick={() => toggleModal(row)}
              ></i>
            </small>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="row justify-content-between">
          <div className="col-6 col-md-3">
            {isEdit ? (
              <select
                className="form-select form-select-sm mb-1"
                value={row.category}
                onChange={(e) => onChange(e, 'category')}
              >
                {expenseCategories.map((x) => (
                  <option value={x.category} key={x._id}>
                    {x.category.replace(
                      x.category.charAt(0),
                      x.category.charAt(0).toUpperCase()
                    )}
                  </option>
                ))}
              </select>
            ) : (
              <div className="form-control-plaintext form-control-sm fw-bolder mb-1">
                {row.category.replace(
                  row.category.charAt(0),
                  row.category.charAt(0).toUpperCase()
                )}
              </div>
            )}
            {isEdit ? (
              <input
                type="text"
                value={row.expense_source}
                className="form-control form-control-sm mb-1"
                onChange={(e) => onChange(e, 'expense_source')}
                onKeyUp={(e) => onKeyUp(e, 'expense_source')}
              ></input>
            ) : (
              <div className="form-control-plaintext form-control-sm mb-1">
                {row.expense_source}
              </div>
            )}
          </div>
          <div className="col-6 col-md-2 align-items-start text-end">
            <h6 className="card-title">
              {(row.credit_amount * -1 || row.debit_amount).toLocaleString(
                'en-IN',
                {
                  style: 'currency',
                  currency: 'INR',
                }
              )}
            </h6>
          </div>
        </div>
        <p className="card-text">
          <small className="text-body-secondary">
            {row.source}/&nbsp;{row.details.substring(0, 20)}
          </small>
        </p>
      </div>
    </div>
  )
}
