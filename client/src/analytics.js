import React from 'react'

export default class AnalyticsPage extends React.Component {
    constructor (props) {
        super(props)
    }
    async componentDidMount () {
		const ctx = document.getElementById('myChart')
        const data = await this.fetchData()
        new Chart(ctx, {
			type: 'line',
			data: {
				labels: data.map(x => x._id.month + '/' + x._id.year),
				datasets: [{
                    label: 'Expenses',
                    data: data.map(x => x.total_expense),
                    borderColor: 'rgb(75, 192, 192)',
                }, {
                    label: 'Average',
                    data: Array(data.length).fill(data.reduce((p, c) => p + c.total_expense, 0)/data.length),
                    borderColor: 'blue',
                }],
			}
		})
    }
    async fetchData () {
        try {
            const resp = await (await fetch('/graphByMonths')).json()
            return resp
        } catch (e) {
            console.log(e)
        }
    }
    render () {
        return <div className="container p-3 m-auto">
			<div>
				<canvas id='myChart' style={{position: 'relative', height: '40vh', width: '60vw'}}></canvas>
			</div>
        </div>
    }
}