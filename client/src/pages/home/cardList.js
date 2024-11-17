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
            view={props.view}
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
  view,
}) {
  const [isEdit, setIsEdit] = useState(false)

  function onChange(e, rowKey) {
    if (rowKey === 'checked') {
      checkRow(index)
    } else if (e.target) {
      row[rowKey] = e.target.value
    }
    updateRow(row)
    if (rowKey === 'category' || rowKey === 'exclude') {
      const updateObj = {}
      updateObj[rowKey] =
        rowKey === 'exclude' ? e.target.checked : e.target.value
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
          {view === 'list' ? (
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
          ) : (
            <div className="col-1 text-end">{row.items?.length}</div>
          )}
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
            <div>
              <input
                className="form-check-input"
                type="checkbox"
                checked={row.exclude}
                onChange={(e) => onChange(e, 'exclude')}
                id="flexCheckDefault"
                hidden={!isEdit && !row.exclude}
                disabled={!isEdit}
              ></input>
              <label
                className="form-check-label small ps-1"
                htmlFor="flexCheckDefault"
                hidden={!isEdit && !row.exclude}
              >
                Exclude from total
              </label>
            </div>
          </div>
          <div className="col-6 col-md-2 align-items-start text-end">
            <h6 className="card-title">
              {(view === 'list'
                ? row.credit_amount * -1 || row.debit_amount
                : row.amount
              ).toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })}
            </h6>
          </div>
        </div>
        {/* <div className="row pt-2">
          <small className="text-body-secondary">
            {row.source}/&nbsp;{row.details.substring(0, 20)}
          </small>
        </div> */}
        {view === 'group' && row.items?.length ? (
          <div className="row form-control-sm justify-content-end">
            <span className="col-auto text-end pe-0">Details</span>
            <div className="col-auto text-end">
              <i
                className="bi bi-chevron-down"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={'#expenseGroupList' + index}
              ></i>
            </div>
            <div id={'expenseGroupList' + index} className="card-body collapse">
              {row.items?.map((item) => {
                return (
                  <div className="row">
                    <div className="col form-control-sm">
                      {new Date(item.date).toDateString()}
                    </div>
                    <div className="col form-control-sm">
                      {item.category.replace(
                        item.category.charAt(0),
                        item.category.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="col form-control-sm">
                      {item.details.substring(0, 20)}
                    </div>
                    <div className="col text-end">
                      {(
                        item.credit_amount * -1 || item.debit_amount
                      ).toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
      <div className="card-footer">
        <small className="text-body-secondary" title={row.details}>
          {row.source}&nbsp;/&nbsp;{row.details.substring(0, 30)}
          {row.details.length > 30 ? '...' : ''}
        </small>
      </div>
    </div>
  )
}
