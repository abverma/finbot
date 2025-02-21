import React, { useState, useEffect, useReducer } from 'react'
import { formatCurrency } from '../../lib/uiHelper'

export default function PortfolioPage() {
  const [mutualFunds, dispatch] = useReducer(reducer, [])
  const [totalInvested, setTotalInvested] = useState(0)
  const [totalCurrent, setTotalCurrent] = useState(0)
  const [returns, setReturns] = useState(0)
  const [show, setShow] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [dirty, setDirty] = useState(false)
  const toast = document.getElementById('liveToast')
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast)

  useEffect(() => {
    setLoading(true)
    fetch('/mutualfunds')
      .then((result) => result.json())
      .then((result) => {
        setLoading(false)
        setPageData(result)
      })
      .catch((e) => {
        console.log(e)
      })
  }, [])

  function setPageData(result) {
    const tolalInv = result.data.reduce((p, c) => p + c.invested_value, 0)
    const totalCurr = result.data.reduce((p, c) => p + c.current_value, 0)
    const totalRet = returns > 1 ? 'text-success' : 'text-danger'
    setTotalInvested(tolalInv)
    setTotalCurrent(totalCurr)
    setReturns(tolalInv > 0 ? ((totalCurr - tolalInv) / tolalInv) * 100 : 0)

    dispatch({
      type: 'set',
      data: result.data.map((x) => {
        return {
          ...x,
          showDisplayValue: true,
          current_value_display: formatCurrency(x.current_value),
          invested_value_display: formatCurrency(x.invested_value),
          returns: (
            ((x.current_value - x.invested_value) / x.invested_value) *
            100
          ).toFixed(2),
        }
      }),
    })
    setShow(true)
  }

  function onChange(value, idx, field) {
    setDirty(true)
    dispatch({
      type: 'change',
      idx,
      field,
      value,
    })
  }

  function addRow() {
    dispatch({
      type: 'add',
      name: '',
      type: '',
      date: '',
      invested_value: 0.0,
      current_value: 0.0,
    })
  }

  async function save() {
    setLoading(true)
    const changedList = mutualFunds.filter((x) => x.dirty)
    const allUpdates = []
    changedList.forEach((row) => {
      allUpdates.push(saveChangedRows(row))
    })
    Promise.all(allUpdates)
      .then((result) => result[0].json())
      .then((result) => {
        setPageData(result)
        showToastMessage('Saved successfully')
        setDirty(false)
      })
      .catch((e) => {
        showToastMessage('Could not save')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  function saveChangedRows(row) {
    return fetch(`/mutualFunds?_id=${row._id}`, {
      method: 'PUT',
      body: JSON.stringify(row),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  function showToastMessage(msg) {
    setToastMessage(msg)
    toastBootstrap.show()
  }

  return (
    <div className="p-2">
      <div className="toast-container fixed-bottom p-3">
        <div
          id="liveToast"
          className="toast"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body">{toastMessage}</div>
            <button
              type="button"
              className="btn-close me-2 m-auto"
              data-bs-dismiss="toast"
              aria-label="Close"
            ></button>
          </div>
        </div>
      </div>
      <div className="card border-0 shadow my-2 p-2">
        <div className="card-body">
          <div className="row justify-content-between pb-2">
            <h4 className="col-auto card-title">
              Mutual Funds {show ? ` - ${formatCurrency(totalCurrent)}` : ''}
              {show ? (
                <span
                  className={returns > 1 ? 'text-success' : 'text-danger'}
                >{` (${returns.toFixed(2)} %)`}</span>
              ) : (
                ''
              )}
            </h4>
            <div className="col-2 d-flex flex-row-reverse justify-content-start">
              <button
                className="btn btn-primary mx-1"
                onClick={(e) => save()}
                disabled={!dirty}
              >
                Save
              </button>
              <button className="btn btn-primary mx-1" disabled>
                Add
              </button>
            </div>
          </div>

          <table
            className={
              loading
                ? 'table card-body align-middle mb-0 opacity-50'
                : 'table table-hover card-body align-middle mb-0'
            }
          >
            <thead>
              <tr>
                <th scope="col" className="text-muted">
                  Name
                </th>
                <th scope="col" className="text-muted">
                  Type
                </th>
                <th scope="col" className="text-muted">
                  Start Date
                </th>
                <th scope="col" className="text-muted">
                  Last Updated
                </th>
                <th scope="col" className="text-muted">
                  Invested Value
                </th>
                <th scope="col" className="text-muted">
                  Current Value
                </th>
                <th scope="col" className="text-muted">
                  Returns
                </th>
              </tr>
            </thead>
            <tbody className="list">
              {mutualFunds &&
                mutualFunds.map((data, idx) => {
                  return (
                    <tr key={data._id}>
                      <td>{data.name}</td>
                      <td>{data.type}</td>
                      <td>{new Date(data.date).toDateString()}</td>
                      <td>{new Date(data.update_date).toDateString()}</td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          disabled={
                            data.type.toLowerCase() === 'lumpsum' || loading
                          }
                          value={
                            data.showDisplayValue
                              ? data.invested_value_display
                              : data.invested_value
                          }
                          onChange={(e) => {
                            onChange(e.target.value, idx, 'invested_value')
                            onChange(
                              e.target.value,
                              idx,
                              'invested_value_display'
                            )
                          }}
                          onFocus={(e) => {
                            onChange(false, idx, 'showDisplayValue')
                          }}
                          onBlur={(e) => {
                            onChange(true, idx, 'showDisplayValue')
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          disabled={loading}
                          value={
                            data.showDisplayValue
                              ? data.current_value_display
                              : data.current_value
                          }
                          onChange={(e) => {
                            onChange(e.target.value, idx, 'current_value')
                            onChange(
                              e.target.value,
                              idx,
                              'current_value_display'
                            )
                          }}
                          onFocus={(e) => {
                            onChange(false, idx, 'showDisplayValue')
                          }}
                          onBlur={(e) => {
                            onChange(true, idx, 'showDisplayValue')
                          }}
                        />
                      </td>
                      <td
                        className={
                          data.returns > 0 ? 'text-success' : 'text-danger'
                        }
                      >
                        {data.returns + '%'}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card border-0 shadow my-2 p-2">
        <div className="card-body">
          <h4 className="card-title">
            PPF{' - '}
            <span>{formatCurrency(1900000)}</span>
          </h4>
        </div>
      </div>
    </div>
  )
}

function reducer(list, action) {
  switch (action.type) {
    case 'set':
      return action.data
    case 'add':
      return [
        {
          name: action.name,
          type: action.type,
          date: action.date,
          invested_value: action.invested_value,
          current_value: action.current_value,
        },
        ...list,
      ]
    case 'change':
      return list.map((item, idx) => {
        if (idx === action.idx) {
          switch (action.field) {
            case 'current_value':
              item[action.field] = parseFloat(action.value)
              break
            case 'current_value_display':
              item[action.field] = formatCurrency(parseFloat(action.value))
              break
            case 'invested_value_display':
              item[action.field] = formatCurrency(parseFloat(action.value))
              break
            case 'invested_value':
              item[action.field] = parseFloat(action.value)
              break
            default:
              item[action.field] = action.value
          }
          item.dirty = true
        }
        return item
      })
    default:
      console.log('reducer: Invalid reducer action.')
  }
}
