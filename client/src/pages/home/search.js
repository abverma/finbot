import React from 'react'
import { useState } from 'react'

export default function SearchBar({ handleSearch, handleClearSearch }) {
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
      <div className="card-header row">
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
