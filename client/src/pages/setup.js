import Papa from 'papaparse'
import React from 'react'
import { useState, useEffect, useReducer, useRef } from 'react'

export default function SetupPage() {
  const [accountList, dispatch] = useReducer(listReducer, [])
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
      <ul className="nav nav-tabs" id="myTab" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className="nav-link active"
            id="import-tab"
            data-bs-toggle="tab"
            data-bs-target="#import-tab-pane"
            type="button"
            role="tab"
            aria-controls="import-tab-pane"
            aria-selected="true"
          >
            Import
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className="nav-link"
            id="metadata-tab"
            data-bs-toggle="tab"
            data-bs-target="#metadata-tab-pane"
            type="button"
            role="tab"
            aria-controls="metadata-tab-pane"
            aria-selected="false"
          >
            Metadata
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className="nav-link"
            id="config-tab"
            data-bs-toggle="tab"
            data-bs-target="#config-tab-pane"
            type="button"
            role="tab"
            aria-controls="config-tab-pane"
            aria-selected="false"
          >
            Configuration
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className="nav-link"
            id="custom-query-tab"
            data-bs-toggle="tab"
            data-bs-target="#custom-query-tab-pane"
            type="button"
            role="tab"
            aria-controls="custom-query-tab-pane"
            aria-selected="false"
          >
            Custom Query
          </button>
        </li>
      </ul>
      <div className="tab-content" id="myTabContent">
        <div
          className="tab-pane fade show active"
          id="import-tab-pane"
          role="tabpanel"
          aria-labelledby="import-tab"
          tabIndex="0"
        >
          <ImportComponent
            accountList={accountList}
            showToastMessage={showToastMessage}
          ></ImportComponent>
        </div>
        <div
          className="tab-pane fade"
          id="metadata-tab-pane"
          role="tabpanel"
          aria-labelledby="metadata-tab"
          tabIndex="0"
        >
          <div className="card border-0 shadow my-2 p-2">
            <div className="card-body">
              <YearList showToastMessage={showToastMessage}></YearList>
              <AccountList
                accountList={accountList}
                dispatch={dispatch}
              ></AccountList>
            </div>
          </div>
        </div>
        <div
          className="tab-pane fade"
          id="config-tab-pane"
          role="tabpanel"
          aria-labelledby="config-tab"
          tabIndex="0"
        >
          <div className="card border-0 shadow my-2 p-2">
            <div className="card-body">
              <ExpenseCategoryList
                showToastMessage={showToastMessage}
              ></ExpenseCategoryList>
              <ConfigList showToastMessage={showToastMessage}></ConfigList>
              <MiscConfigList
                showToastMessage={showToastMessage}
              ></MiscConfigList>
              <IgnoredExpensesList
                showToastMessage={showToastMessage}
              ></IgnoredExpensesList>
            </div>
          </div>
        </div>
        <div
          className="tab-pane fade"
          id="custom-query-tab-pane"
          role="tabpanel"
          aria-labelledby="custom-query-tab"
          tabIndex="0"
        >
          <CustomQueryCompoent></CustomQueryCompoent>
        </div>
      </div>
    </div>
  )
}

function CustomQueryCompoent() {
  const [result, setResult] = useState([])
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(0)
  const [filter, setFilter] = useState(sessionStorage.getItem('lastQuery'))
  const [update, setUpdate] = useState('')

  function executeQuery() {
    if (!filter) {
      return
    }
    sessionStorage.setItem('lastQuery', filter)
    const payload = {
      filter: JSON.parse(filter),
    }
    execute(payload)
  }

  function executeUpdateQuery() {
    const selectedIds = result.filter((x) => x.selected).map((x) => x._id)
    const payload = {
      filter: {
        _id: { $in: selectedIds },
      },
      update: JSON.parse(update),
    }
    debugger
    execute(payload)
  }

  function execute(payload) {
    const url = limit ? `/customQuery?limit=${limit}` : `/customQuery`
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        return response.json()
      })
      .then((response) => {
        setResult(response.data)
        setTotal(response.total)
      })
      .catch((e) => {
        console.log(e)
      })
  }

  function onChange(value, key) {
    switch (key) {
      case 'limit':
        setLimit(value)
        break
      case 'filter':
        setFilter(value)
        break
      case 'update':
        setUpdate(value)
        break
    }
  }

  function selectAll(event) {
    const checked = event.target.checked
    setResult(
      result.map((x) => {
        return { ...x, selected: checked }
      })
    )
  }

  function checkRow(event, idx) {
    setResult(
      result.map((row, rowId) => {
        return rowId === idx ? { ...row, selected: event.target.checked } : row
      })
    )
  }

  return (
    <div className="card border-0 shadow my-2 p-2">
      <div className="card-body">
        <div className="card-header border-0 row justify-content-between px-0 px-md-3">
          <h5 className="col-auto card-title">Custom Query</h5>
        </div>
        <div className="row pb-2">
          <div className="col form-floating p-1">
            <textarea
              id="filter"
              className="form-control"
              style={{ height: '100px' }}
              value={filter}
              onChange={(e) => onChange(e.target.value, 'filter')}
            ></textarea>
            <label htmlFor="filter">Filter</label>
          </div>
          <div className="col-auto form-floating p-1">
            <input
              id="limit"
              type="number"
              className="form-control"
              value={limit}
              onChange={(e) => onChange(e.target.value, 'limit')}
            ></input>
            <label htmlFor="limit">Limit</label>
          </div>
          <div className="col-auto">
            <button className="btn btn-primary col-auto" onClick={executeQuery}>
              Execute
            </button>
          </div>
        </div>
        {result.length ? (
          <div>
            <div className="row pb-2">
              <div className="col form-floating p-1">
                <textarea
                  id="update"
                  className="form-control"
                  style={{ height: '100px' }}
                  value={update}
                  onChange={(e) => onChange(e.target.value, 'update')}
                ></textarea>
                <label htmlFor="update">Update</label>
              </div>

              <div className="col-auto">
                <button
                  className="btn btn-primary col-auto"
                  onClick={executeUpdateQuery}
                >
                  Update
                </button>
              </div>
            </div>
            <div className="row pb-2">
              <div className="col form-floating p-1">
                <textarea
                  id="selected"
                  className="form-control"
                  style={{ height: '100px' }}
                  value={result.filter((x) => x.selected).map((x) => x._id)}
                ></textarea>
                <label htmlFor="update">Selected Ids</label>
              </div>
            </div>
          </div>
        ) : (
          ''
        )}

        <table className="table table-hover card-body align-middle mt-2">
          <thead className="table">
            <tr>
              <th scope="col" className="text-muted">
                <input type="checkbox" onChange={(e) => selectAll(e)}></input>
              </th>
              <th scope="col" className="text-muted">
                #
              </th>
              {result.length
                ? Object.keys(result[0])
                    .filter((x) => x !== 'selected')
                    .map((column) => (
                      <th scope="col" className="text-muted">
                        {column}
                      </th>
                    ))
                : ''}
            </tr>
          </thead>
          <tbody className="list">
            {result.map((row, idx) => (
              <tr key={idx}>
                <th>
                  <input
                    type="checkbox"
                    checked={row.selected}
                    onChange={(e) => checkRow(e, idx)}
                  ></input>
                </th>
                <th scope="row" className="text-muted">
                  {idx + 1}
                </th>
                {Object.keys(row)
                  .filter((x) => x !== 'selected')
                  .map((column, idx) => (
                    <td key={idx}>{row[column] + ''}</td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="card-header row border-0 align-items-center justify-content-end">
          <small className="col-md-2 col-6 text-end">
            Showing {result.length} of {total}
          </small>
          <div className="col-md-1 col-3 d-flex">
            <button className="btn border me-1" type="button">
              <i className="bi bi-chevron-left"></i>
            </button>
            <button className="btn border" type="button">
              <i className="bi bi-chevron-right"></i>
            </button>
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

function YearList({ showToastMessage }) {
  const [yearList, dispatch] = useReducer(yearListReducer, [])
  const changedIdList = useRef([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchYearList()
  }, [page])

  function fetchYearList() {
    fetch(`/yearList?start=${(page - 1) * 10}&limit=10`)
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
      return yearList.find((y) => y._id === x)
    })
    const newRows = yearList.filter((x) => {
      return !x._id
    })
    saveChangedRows(changedRows)
    saveNewRows(newRows)
  }

  function saveNewRows(rows) {
    if (!rows.length) {
      return
    }
    fetch('/yearList', {
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
    fetch('/yearList', {
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
      yearList[idx]['_id'] &&
      !changedIdList.current.find((x) => x === yearList[idx]['_id'])
    ) {
      changedIdList.current.push(yearList[idx]['_id'])
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
      <div className="card-header border-0 row justify-content-between px-0 px-md-3">
        <h5 className="col-auto card-title">Years</h5>
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
        <thead className="table">
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
              From
            </th>
            <th scope="col" className="text-muted">
              To
            </th>
            <th scope="col" className="text-muted">
              Enabled
            </th>
          </tr>
        </thead>
        <tbody className="list">
          {yearList.map((item, idx) => (
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
                  type="date"
                  className="form-control"
                  value={item.from ? item.from.split('T')[0] : ''}
                  onChange={(e) =>
                    handleChange(e.target.valueAsDate, idx, 'from')
                  }
                ></input>
              </td>
              <td>
                <input
                  type="date"
                  className="form-control"
                  value={item.to ? item.to.split('T')[0] : ''}
                  onChange={(e) =>
                    handleChange(e.target.valueAsDate, idx, 'to')
                  }
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
      <div className="card-header row border-0 align-items-center justify-content-end">
        <small className="col-md-2 col-6 text-end">
          Showing {yearList.length} of {total}
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
      <div className="card-header border-0 row justify-content-between">
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
        <thead className="table">
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

function ConfigList({ showToastMessage }) {
  const [configList, dispatch] = useReducer(configListReducer, [])
  const changedIdList = useRef([])

  useEffect(() => {
    fetchConfigList()
  }, [])

  function fetchConfigList() {
    fetch(`/categorycatchwords?start=0&limit=10`)
      .then((data) => data.json())
      .then((data) => {
        // setTotal(data.count)
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
      category: '',
      catchwords: [],
    })
  }

  function save() {
    const changedRows = changedIdList.current.map((x) => {
      return configList.find((y) => y._id === x)
    })
    const newRows = configList.filter((x) => {
      return !x._id
    })
    saveChangedRows(changedRows)
    saveNewRows(newRows)
  }

  function saveNewRows(rows) {
    if (!rows.length) {
      return
    }
    fetch('/categorycatchwords', {
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
    fetch('/categorycatchwords', {
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
      configList[idx]['_id'] &&
      !changedIdList.current.find((x) => x === configList[idx]['_id'])
    ) {
      changedIdList.current.push(configList[idx]['_id'])
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
      <div className="card-header border-0 row justify-content-between">
        <h5 className="col-auto card-title">Expense Category Catchwords</h5>
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
        <thead className="table">
          <tr>
            <th scope="col" className="text-muted">
              #
            </th>
            <th scope="col" className="text-muted">
              Category
            </th>
            <th scope="col" className="text-muted">
              Catch Words
            </th>
          </tr>
        </thead>
        <tbody className="list">
          {configList.map((item, idx) => (
            <tr key={idx}>
              <th scope="row" className="text-muted">
                {idx + 1}
              </th>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={item.category}
                  onChange={(e) =>
                    handleChange(e.target.value, idx, 'category')
                  }
                ></input>
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={item.catchwords?.join(',') || ''}
                  onChange={(e) =>
                    handleChange(e.target.value.split(','), idx, 'catchwords')
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

function MiscConfigList({ showToastMessage }) {
  const [configList, dispatch] = useReducer(miscListReducer, [])
  const changedIdList = useRef([])

  useEffect(() => {
    fetchConfigList()
  }, [])

  function fetchConfigList() {
    fetch(`/miscellaneouscatchwords?start=0&limit=10`)
      .then((data) => data.json())
      .then((data) => {
        // setTotal(data.count)
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
      expense_source: '',
      catchwords: [],
    })
  }

  function save() {
    const changedRows = changedIdList.current.map((x) => {
      return configList.find((y) => y._id === x)
    })
    const newRows = configList.filter((x) => {
      return !x._id
    })
    saveChangedRows(changedRows)
    saveNewRows(newRows)
  }

  function saveNewRows(rows) {
    if (!rows.length) {
      return
    }
    fetch('/miscellaneouscatchwords', {
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
    fetch('/miscellaneouscatchwords', {
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
      configList[idx]['_id'] &&
      !changedIdList.current.find((x) => x === configList[idx]['_id'])
    ) {
      changedIdList.current.push(configList[idx]['_id'])
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
      <div className="card-header border-0 row justify-content-between">
        <h5 className="col-auto card-title">
          Miscellaneous Expenses Catchwords
        </h5>
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
        <thead className="table">
          <tr>
            <th scope="col" className="text-muted">
              #
            </th>
            <th scope="col" className="text-muted">
              Expense Source
            </th>
            <th scope="col" className="text-muted">
              Catch Words
            </th>
          </tr>
        </thead>
        <tbody className="list">
          {configList.map((item, idx) => (
            <tr key={idx}>
              <th scope="row" className="text-muted">
                {idx + 1}
              </th>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={item.expense_source}
                  onChange={(e) =>
                    handleChange(e.target.value, idx, 'expense_source')
                  }
                ></input>
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={item.catchwords?.join(',') || ''}
                  onChange={(e) =>
                    handleChange(e.target.value.split(','), idx, 'catchwords')
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

function ExpenseCategoryList({ showToastMessage }) {
  const [categoryList, dispatch] = useReducer(expenseCategoryListReducer, [])
  const changedIdList = useRef([])

  useEffect(() => {
    fetchList()
  }, [])

  function fetchList() {
    fetch(`/expenseCategories`)
      .then((data) => data.json())
      .then((data) => {
        // setTotal(data.count)
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
      category: '',
    })
  }

  function save() {
    const changedRows = changedIdList.current.map((x) => {
      return categoryList.find((y) => y._id === x)
    })
    const newRows = categoryList.filter((x) => {
      return !x._id
    })
    saveChangedRows(changedRows)
    saveNewRows(newRows)
  }

  function saveNewRows(rows) {
    if (!rows.length) {
      return
    }
    fetch('/expenseCategories', {
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
    fetch('/expenseCategories', {
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
      categoryList[idx]['_id'] &&
      !changedIdList.current.find((x) => x === categoryList[idx]['_id'])
    ) {
      changedIdList.current.push(categoryList[idx]['_id'])
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
      <div className="card-header border-0 row justify-content-between">
        <h5 className="col-auto card-title">Expense Categories</h5>
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
        <thead className="table">
          <tr>
            <th scope="col" className="text-muted">
              #
            </th>
            <th scope="col" className="text-muted">
              Category
            </th>
          </tr>
        </thead>
        <tbody className="list">
          {categoryList.map((item, idx) => (
            <tr key={idx} className="">
              <th scope="row" className="text-muted">
                {idx + 1}
              </th>
              <td>
                <input
                  type="text"
                  className="form-control w-25"
                  value={item.category}
                  onChange={(e) =>
                    handleChange(e.target.value, idx, 'category')
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

function IgnoredExpensesList({ showToastMessage }) {
  const [expenseList, dispatch] = useReducer(expenseReducer, [])
  const changedIdList = useRef([])

  useEffect(() => {
    fetchConfigList()
  }, [])

  function fetchConfigList() {
    fetch(`/ignoredExpenses?start=0&limit=10`)
      .then((data) => data.json())
      .then((data) => {
        // setTotal(data.count)
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
      expense_source: '',
      catchwords: [],
    })
  }

  function save() {
    const changedRows = changedIdList.current.map((x) => {
      return expenseList.find((y) => y._id === x)
    })
    const newRows = expenseList.filter((x) => {
      return !x._id
    })
    saveChangedRows(changedRows)
    saveNewRows(newRows)
  }

  function saveNewRows(rows) {
    if (!rows.length) {
      return
    }
    fetch('/ignoredExpenses', {
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
    const promises = []
    rows.forEach((row) => {
      promises.push(
        fetch(`/ignoredExpenses?_id=${row._id}`, {
          method: 'PUT',
          body: JSON.stringify(row),
          headers: {
            'Content-Type': 'application/json',
          },
        })
      )
    })
    Promise.all(promises)
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
      expenseList[idx]['_id'] &&
      !changedIdList.current.find((x) => x === expenseList[idx]['_id'])
    ) {
      changedIdList.current.push(expenseList[idx]['_id'])
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
      <div className="card-header border-0 row justify-content-between">
        <h5 className="col-auto card-title">Ignored Expenses</h5>
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
        <thead className="table">
          <tr>
            <th scope="col" className="text-muted">
              #
            </th>
            <th scope="col" className="text-muted">
              Description
            </th>
            <th scope="col" className="text-muted">
              Enabled
            </th>
          </tr>
        </thead>
        <tbody className="list">
          {expenseList.map((item, idx) => (
            <tr key={idx}>
              <th scope="row" className="text-muted">
                {idx + 1}
              </th>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={item.desc}
                  onChange={(e) => handleChange(e.target.value, idx, 'desc')}
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

function listReducer(list, action) {
  switch (action.type) {
    case 'set':
      return action.data
    case 'add':
      return [
        { value: action.value, label: action.label, enabled: action.enabled },
        ...list,
      ]
    case 'change':
      return list.map((item, idx) => {
        if (idx === action.idx) {
          item[action.field] = action.value
        }
        return item
      })
    default:
      console.log('listReducer: Invalid reducer action.')
  }
}

function yearListReducer(yearList, action) {
  switch (action.type) {
    case 'set':
      return action.data
    case 'add':
      return [
        { value: action.value, label: action.label, enabled: action.enabled },
        ...yearList,
      ]
    case 'change':
      return yearList.map((item, idx) => {
        if (idx === action.idx) {
          item[action.field] = action.value
        }
        return item
      })
    default:
      console.log('yearListReducer: Invalid reducer action.')
  }
}

function configListReducer(configList, action) {
  switch (action.type) {
    case 'set':
      return action.data
    case 'add':
      return [
        { category: action.category, catchwords: action.catchwords },
        ...configList,
      ]
    case 'change':
      return configList.map((item, idx) => {
        if (idx === action.idx) {
          item[action.field] = action.value
        }
        return item
      })
    default:
      console.log('configListReducer: Invalid reducer action.')
  }
}

function miscListReducer(configList, action) {
  switch (action.type) {
    case 'set':
      return action.data
    case 'add':
      return [
        {
          expense_source: action.expense_source,
          catchwords: action.catchwords,
        },
        ...configList,
      ]
    case 'change':
      return configList.map((item, idx) => {
        if (idx === action.idx) {
          item[action.field] = action.value
        }
        return item
      })
    default:
      console.log('miscListReducer: Invalid reducer action.')
  }
}

function expenseCategoryListReducer(list, action) {
  switch (action.type) {
    case 'set':
      return action.data
    case 'add':
      return [
        {
          category: action.category,
        },
        ...list,
      ]
    case 'change':
      return list.map((item, idx) => {
        if (idx === action.idx) {
          item[action.field] = action.value
        }
        return item
      })
    default:
      console.log('expenseCategoryListReducer: Invalid reducer action.')
  }
}

function expenseReducer(list, action) {
  switch (action.type) {
    case 'set':
      return action.data
    case 'add':
      return [{ desc: action.desc, enabled: action.enabled }, ...list]
    case 'change':
      return list.map((item, idx) => {
        if (idx === action.idx) {
          item[action.field] = action.value
        }
        return item
      })
    default:
      console.log('expenseReducer: Invalid reducer action.')
  }
}
