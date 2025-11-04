import React, { useState, useEffect, useRef } from 'react'

export default function AnalyticsPage() {
  const [year, setYear] = useState('2025')
  const [expenseCategories, setExpenseCategories] = useState([])
  const [category, setCategory] = useState('')
  const mainChart = useRef({})
  const categoryChart = useRef({})

  useEffect(() => {
    // when component unmounts

    fetchMainChartData()
    fetch('/expenseCategories')
      .then((data) => data.json())
      .then((data) => {
        setExpenseCategories(data.data)
      })
      .catch((e) => {
        console.log(e)
      })
    fetchCategoryChartData()
  }, [year, category])

  async function fetchMainChartData() {
    try {
      const data = await (await fetch(`/graphByMonths?year=${year}`)).json()
      const ctx = document.getElementById('analyticsChart')
      const expenses = data.map((x) => x.total_expense).sort((a, b) => a - b)
      const size = expenses.length
      let median
      let medianPos
      if (size % 2) {
        medianPos = (size + 1) / 2
        median = expenses[medianPos - 1]
      } else {
        medianPos = size / 2
        median = (expenses[medianPos - 1] + expenses[medianPos]) / 2
      }
      const chartData = {
        labels: data.map((x) => x._id.month + '/' + x._id.year),
        datasets: [
          {
            label: 'Expenses',
            data: data.map((x) => x.total_expense),
            borderColor: 'rgb(75, 192, 192)',
          },
          {
            label: 'Median',
            data: Array(data.length).fill(median),
            borderColor: 'blue',
          },
        ],
      }
      new Chart(ctx, {
        type: 'line',
        data: chartData,
      })
    } catch (e) {
      console.log(e)
    }
  }

  async function fetchCategoryChartData() {
    try {
      const data = await (
        await fetch(
          `/graphCategoriesByMonths?year=${year}&category=${category}`
        )
      ).json()
      const flatData = data.map((x) => {
        return {
          total_expense: x.total_expense,
          month: x._id.month,
          year: x._id.year,
          category: x._id.category,
        }
      })

      const groupedData = Object.groupBy(flatData, ({ category }) => category)
      const categoryChartCtx = document.getElementById('categoryChart')
      const months = new Set(flatData.map((x) => x.month + '/' + x.year))
      Object.keys(groupedData).forEach((category) => {
        months.forEach((month, idx) => {
          if (
            !groupedData[category].find((x) => `${x.month}/${x.year}` === month)
          ) {
            groupedData[category].push({
              total_expense: 0,
              month: parseInt(month.split('/')[0]),
              year: parseInt(month.split('/')[1]),
              category,
            })
          }
        })
        groupedData[category].sort((a, b) => a.month - b.month)
      })
      const chartData = {
        labels: Array.from(months),
        datasets: Object.keys(groupedData).map((key) => {
          return {
            label: key,
            data: groupedData[key].map((x) => x.total_expense),
          }
        }),
      }
      new Chart(categoryChartCtx, {
        type: 'line',
        data: chartData,
      })
    } catch (e) {
      console.log(e)
    }
  }

  function handleSelect(e) {
    setYear(e.target.value)
  }

  function handleCategorySelect(e) {
    setCategory(e.target.value)
  }

  return (
    <div className="container p-3 m-auto">
      <form className="row">
        <div className="col-md-3 mx-auto">
          <select
            className="form-select"
            onChange={(e) => handleSelect(e)}
            value={year}
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>
      </form>
      <div className="p-5">
        <h4>Total Expenses</h4>
        <canvas
          id="analyticsChart"
          style={{ position: 'relative', height: '40vh', width: '60vw' }}
        ></canvas>
      </div>
      <div className="p-5">
        <div className="col-md-3 mx-auto">
          <select
            className="form-select"
            onChange={(e) => handleSelect(e)}
            value={year}
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>
        <h4>Category-wise Expenses</h4>
        <select
          className="form-select"
          onChange={(e) => handleCategorySelect(e)}
          value={year}
        >
          <option defaultValue value="">
            Select Category
          </option>
          {expenseCategories.map((category) => {
            return (
              <option value={category.category} key={category._id}>
                {category.category}
              </option>
            )
          })}
        </select>

        <canvas
          id="categoryChart"
          style={{ position: 'relative', height: '40vh', width: '60vw' }}
        ></canvas>
      </div>
    </div>
  )
}
