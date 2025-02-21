import React, { useState, useEffect, useRef } from 'react'

export default function AnalyticsPage() {
  const [year, setYear] = useState('2025')
  let chart = useRef({})

  useEffect(() => {
    fetchData()
  }, [year])

  async function fetchData() {
    try {
      const data = await (await fetch(`/graphByMonths?year=${year}`)).json()
      const ctx = document.getElementById('analyticsChart')
      const chartData = {
        labels: data.map((x) => x._id.month + '/' + x._id.year),
        datasets: [
          {
            label: 'Expenses',
            data: data.map((x) => x.total_expense),
            borderColor: 'rgb(75, 192, 192)',
          },
          {
            label: 'Average',
            data: Array(data.length).fill(
              data.reduce((p, c) => p + c.total_expense, 0) / data.length
            ),
            borderColor: 'blue',
          },
        ],
      }
      if (chart.current.id !== undefined) {
        chart.current.data = chartData
        chart.current.update()
      } else {
        chart.current = new Chart(ctx, {
          type: 'line',
          data: chartData,
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  function handleSelect(e) {
    setYear(e.target.value)
  }

  return (
    <div className="container p-3 m-auto">
      <form className="row">
        <div className="col-md-3 mx-auto">
          <select
            class="form-select"
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
      <div>
        <canvas
          id="analyticsChart"
          style={{ position: 'relative', height: '40vh', width: '60vw' }}
        ></canvas>
      </div>
    </div>
  )
}
