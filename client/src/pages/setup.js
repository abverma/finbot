import Papa from 'papaparse'
import React from 'react'
import { useState, useEffect, useReducer, useRef } from 'react'

export default function SetupPage() {
  const [accountList, dispatch] = useReducer(accountListReducer, [])
  const [toastMessage, setToastMessage] = useState('')
  const toast = document.getElementById('liveToast')
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast)
  useEffect(() => {
    fetch('/accounts')
      .then((data) => data.json())
      .then((data) => {
        dispatch({
          type: 'set',
          data: data.data,
        })
      })
      .catch((e) => {
        console.log(e)
      })
  }, [])

  function showToastMessage(msg) {
    setToastMessage(msg)
    toastBootstrap.show()
  }

  return (
    <div className="container p-2">
      <div class="toast-container fixed-bottom p-3">
        <div
          id="liveToast"
          class="toast"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div class="d-flex">
            <div class="toast-body">{toastMessage}</div>
            <button
              type="button"
              class="btn-close me-2 m-auto"
              data-bs-dismiss="toast"
              aria-label="Close"
            ></button>
          </div>
        </div>
      </div>
      <ul className="nav nav-tabs" id="myTab" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className="nav-link active"
            id="home-tab"
            data-bs-toggle="tab"
            data-bs-target="#home-tab-pane"
            type="button"
            role="tab"
            aria-controls="home-tab-pane"
            aria-selected="true"
          >
            Import
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className="nav-link"
            id="profile-tab"
            data-bs-toggle="tab"
            data-bs-target="#profile-tab-pane"
            type="button"
            role="tab"
            aria-controls="profile-tab-pane"
            aria-selected="false"
          >
            Metadata
          </button>
        </li>
      </ul>
      <div className="tab-content" id="myTabContent">
        <div
          className="tab-pane fade show active"
          id="home-tab-pane"
          role="tabpanel"
          aria-labelledby="home-tab"
          tabindex="0"
        >
          <ImportComponent
            accountList={accountList}
            showToastMessage={showToastMessage}
          ></ImportComponent>
        </div>
        <div
          className="tab-pane fade"
          id="profile-tab-pane"
          role="tabpanel"
          aria-labelledby="profile-tab"
          tabindex="0"
        >
          <div className="card border-0 shadow my-2 p-2">
            <div className="card-body">
              <MonthList showToastMessage={showToastMessage}></MonthList>
              <AccountList
                accountList={accountList}
                dispatch={dispatch}
              ></AccountList>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ImportComponent({ accountList, showToastMessage }) {
  const [error, setError] = useState(false)
  const [isAccountSelected, setIsAccountSelected] = useState(false)
  const [accountName, setAccountName] = useState()
  const [header, setHeader] = useState([])
  const [data, setData] = useState([])
  const [fileName, setFilename] = useState()

  function handleShow() {
    // eslint-disable-next-line no-undef
    const file = fileUpload.files[0]
    setFilename(file.name)
    const reader = new FileReader()
    if (!file) {
      setError(true)
      return
    }
    if (file.type == 'text/csv') {
      reader.readAsText(file, 'utf-8')
    } else if (file.type == 'application/pdf') {
      readPdfHandler(file)
    }
    reader.onload = (e) => {
      if (file.type == 'text/csv') {
        readCsvHandler(e)
      }
    }
  }

  function handleAccountSelect(e) {
    setAccountName(e.target.value)
    if (e.target.value) {
      setIsAccountSelected(true)
    }
  }

  function readPdfHandler(file) {
    const formData = new FormData(document.getElementById('myForm'))
    fetch('convertPdf', {
      method: 'PUT',
      body: formData,
    })
      .then((response) => {
        return response.json()
      })
      .then(({ header, rows }) => {
        setHeader(header)
        setData(rows)
      })
      .catch((e) => {
        console.log('Unable to parse pdf file. ', e)
      })
  }

  function transformHeader(header) {
    if (header.includes(' (in Rs.)')) {
      header = header.split(' (in Rs.)')[0]
    }
    if (header.includes('(INR)')) {
      header = header.split('(INR)')[0]
    }
    if (header.includes('Transaction Date')) {
      header = 'Date'
    }

    if (header.includes('Narration') || header.includes('Description')) {
      header = 'Details'
    }

    if (header.includes('Ref Number')) {
      header = 'Reference Number'
    }
    return header.toLowerCase().trim().replace(' ', '_')
  }

  function readCsvHandler(e) {
    let file = e.target.result
    let csvString = ''
    const lines = skipUseLessLines(accountName, file)
    // This is a regular expression to identify carriage
    // Returns and line breaks
    // const lines = file.split(/\r\n|\n/)
    csvString += lines.join('\n')
    const csvJson = Papa.parse(csvString, {
      delimiter: ',',
      encoding: 'utf-8',
      header: true,
      skipEmptyLines: true,
      transformHeader: transformHeader,
      transform: (value) => {
        return value.trim()
      },
    })
    setHeader(csvJson?.meta?.fields.filter((x) => x !== ''))
    setData(csvJson.data)
  }

  function skipUseLessLines(accountName, file) {
    console.log('skip useless lines')
    if (accountName == 'icici credit card') {
      file = file.split('Transaction Details')[1]
      if (file) {
        const idx = file.search('\n')
        file = file.substr(idx + 1)
      }
    }
    return file.split(/\r\n|\n/)
  }

  function upload() {
    const payload = Object.assign({ fileName, account: accountName }, { data })
    // console.log(JSON.stringify(csvJson.data))

    fetch('/importFile', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((resp) => {
        if (resp.ok) {
          setHeader([])
          setData([])
          showToastMessage('Uploaded successfully.')
        }
      })
      .catch((e) => {
        console.log(
          new Error('Error uploading file', {
            cause: e,
          })
        )
        showToastMessage('Uploaded failed.')
      })
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  return (
    <div className="card border-0 shadow my-2 p-2">
      <div className="card-body">
        <h4 className="card-title">Import statements</h4>
        {error ? (
          <p className="text-danger">Error: Check the file selected</p>
        ) : null}
        <div className="row g-2 justify-content-start mb-2">
          <div className="col-md-3 col-12">
            <select
              className="form-select form-select-md"
              onChange={handleAccountSelect}
            >
              <option defaultValue value="">
                Select account
              </option>
              {accountList.map((x) => (
                <option key={x._id} value={x.value}>
                  {x.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="row g-2 justify-content-start">
          <form className="col-md-6 col-12" id="myForm">
            <input
              type="file"
              className="form-control"
              id="fileUpload"
              name="upload"
              disabled={!isAccountSelected}
            ></input>
          </form>
          <div className="col-md-1 col-12">
            <button
              type="button"
              className="form-control btn btn-primary"
              id="showBtn"
              onClick={handleShow}
              disabled={!isAccountSelected}
            >
              Show
            </button>
          </div>
          <div className="col-md-1 col-12">
            <button
              type="button"
              className="form-control btn btn-primary"
              id="uploadBtn"
              onClick={upload}
              disabled={!isAccountSelected}
            >
              Upload
            </button>
          </div>
        </div>
        <table className={header.length ? 'table mt-2' : 'table mt-2 d-none'}>
          <thead>
            <tr>
              <th scope="col">#</th>
              {header.map((h, idx) => {
                return (
                  <th key={idx} scope="col">
                    {capitalizeFirstLetter(h.replace('_', ' '))}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              return (
                <tr key={idx}>
                  <th scope="row">{idx + 1}</th>
                  {Object.keys(row)
                    .filter((x) => x !== '')
                    .map((k, idx) => {
                      return <td key={idx}>{row[k]}</td>
                    })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MonthList({ showToastMessage }) {
  const [monthList, dispatch] = useReducer(monthListReducer, [])
  const changedIdList = useRef([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchMonthList()
  }, [page])

  function fetchMonthList() {
    fetch(`/monthList?start=${(page - 1) * 10}&limit=10`)
      .then((data) => data.json())
      .then((data) => {
        setTotal(data.count)
        dispatch({
          type: 'set',
          data: data.data,
        })
      })
      .catch((e) => {
        console.log(e)
      })
  }

  function addRow() {
    dispatch({
      type: 'add',
      label: '',
      value: '',
      enabled: false,
    })
  }

  function save() {
    const changedRows = changedIdList.current.map((x) => {
      return monthList.find((y) => y._id === x)
    })
    const newRows = monthList.filter((x) => {
      return !x._id
    })
    saveChangedRows(changedRows)
    saveNewRows(newRows)
  }

  function saveNewRows(rows) {
    if (!rows.length) {
      return
    }
    fetch('/monthList', {
      method: 'POST',
      body: JSON.stringify(rows),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(() => {
        showToastMessage('Saved successfully.')
      })
      .catch((e) => {
        console.log(e)
        showToastMessage('Could not save.')
      })
  }

  function saveChangedRows(rows) {
    if (!rows.length) {
      return
    }
    fetch('/monthList', {
      method: 'PUT',
      body: JSON.stringify(rows),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(() => {
        showToastMessage('Saved successfully.')
      })
      .catch((e) => {
        console.log(e)
        showToastMessage('Could not save.')
      })
  }

  function handleChange(value, idx, field) {
    if (
      monthList[idx]['_id'] &&
      !changedIdList.current.find((x) => x === monthList[idx]['_id'])
    ) {
      changedIdList.current.push(monthList[idx]['_id'])
    }
    dispatch({
      type: 'change',
      idx,
      field,
      value,
    })
  }

  function next() {
    setPage(page + 1)
  }

  return (
    <div className="card-body">
      <div className="card-header border-0 row justify-content-between white px-0 px-md-3">
        <h5 className="col-auto card-title">Months</h5>
        <div className="col-2 d-flex flex-row-reverse justify-content-start">
          <button className="btn btn-primary mx-1" onClick={save}>
            Save
          </button>
          <button className="btn btn-primary mx-1" onClick={addRow}>
            Add
          </button>
        </div>
      </div>

      <table className="table table-hover card-body align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th scope="col" className="text-muted">
              #
            </th>
            <th scope="col" className="text-muted">
              Label
            </th>
            <th scope="col" className="text-muted">
              Value
            </th>
            <th scope="col" className="text-muted">
              Enabled
            </th>
          </tr>
        </thead>
        <tbody className="list">
          {monthList.map((item, idx) => (
            <tr key={idx}>
              <th scope="row" className="text-muted">
                {idx + 1}
              </th>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={item.label}
                  onChange={(e) => handleChange(e.target.value, idx, 'label')}
                ></input>
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={item.value}
                  onChange={(e) => handleChange(e.target.value, idx, 'value')}
                ></input>
              </td>
              <td>
                <input
                  className="form-check-input mt-0"
                  type="checkbox"
                  checked={item.enabled}
                  onChange={(e) =>
                    handleChange(e.target.checked, idx, 'enabled')
                  }
                ></input>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="card-header row border-0 align-items-center justify-content-end white">
        <small className="col-md-2 col-6 text-end">
          Showing {monthList.length} of {total}
        </small>
        <div className="col-md-1 col-3 d-flex">
          <button className="btn border me-1" type="button">
            <i className="bi bi-chevron-left"></i>
          </button>
          <button className="btn border" type="button" onClick={(e) => next()}>
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

function AccountList({ accountList, dispatch }) {
  const changedIdList = useRef([])

  function addRow() {
    dispatch({
      type: 'add',
      label: '',
      value: '',
      enabled: false,
    })
  }

  function save() {
    const changedRows = changedIdList.current.map((x) => {
      return accountList.find((y) => y._id === x)
    })
    const newRows = accountList.filter((x) => {
      return !x._id
    })
    saveChangedRows(changedRows)
    saveNewRows(newRows)
  }

  function saveNewRows(rows) {
    if (!rows.length) {
      return
    }
    fetch('/accounts', {
      method: 'POST',
      body: JSON.stringify(rows),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(() => {})
      .catch((e) => {
        console.log(e)
      })
  }

  function saveChangedRows(rows) {
    if (!rows.length) {
      return
    }
    fetch('/accounts', {
      method: 'PUT',
      body: JSON.stringify(rows),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(() => {})
      .catch((e) => {
        console.log(e)
      })
  }

  function handleChange(value, idx, field) {
    if (
      accountList[idx]['_id'] &&
      !changedIdList.current.find((x) => x === accountList[idx]['_id'])
    ) {
      changedIdList.current.push(accountList[idx]['_id'])
    }
    dispatch({
      type: 'change',
      idx,
      field,
      value,
    })
  }

  return (
    <div className="card-body">
      <div className="card-header border-0 row justify-content-between white">
        <h5 className="col-auto card-title">Accounts</h5>
        <div className="col-2 d-flex flex-row-reverse justify-content-start">
          <button className="btn btn-primary mx-1" onClick={save}>
            Save
          </button>
          <button className="btn btn-primary mx-1" onClick={addRow}>
            Add
          </button>
        </div>
      </div>

      <table className="table table-hover card-body align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th scope="col" className="text-muted">
              #
            </th>
            <th scope="col" className="text-muted">
              Label
            </th>
            <th scope="col" className="text-muted">
              Value
            </th>
            <th scope="col" className="text-muted">
              Enabled
            </th>
          </tr>
        </thead>
        <tbody className="list">
          {accountList.map((item, idx) => (
            <tr key={idx}>
              <th scope="row" className="text-muted">
                {idx + 1}
              </th>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={item.label}
                  onChange={(e) => handleChange(e.target.value, idx, 'label')}
                ></input>
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={item.value}
                  onChange={(e) => handleChange(e.target.value, idx, 'value')}
                ></input>
              </td>
              <td>
                <input
                  className="form-check-input mt-0"
                  type="checkbox"
                  checked={item.enabled}
                  onChange={(e) =>
                    handleChange(e.target.checked, idx, 'enabled')
                  }
                ></input>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function accountListReducer(accountList, action) {
  switch (action.type) {
    case 'set':
      return action.data
    case 'add':
      return [
        ...accountList,
        { value: action.value, label: action.label, enabled: action.enabled },
      ]
    case 'change':
      return accountList.map((item, idx) => {
        if (idx === action.idx) {
          item[action.field] = action.value
        }
        return item
      })
    default:
      console.log('accountListReducer: Invalid reducer action.')
  }
}

function monthListReducer(monthList, action) {
  switch (action.type) {
    case 'set':
      return action.data
    case 'add':
      return [
        { value: action.value, label: action.label, enabled: action.enabled },
        ...monthList,
      ]
    case 'change':
      return monthList.map((item, idx) => {
        if (idx === action.idx) {
          item[action.field] = action.value
        }
        return item
      })
    default:
      console.log('monthListReducer: Invalid reducer action.')
  }
}
