import React from 'react'
import ReactDOM from 'react-dom/client'

import HomePage from './home'
import ImportPage from './import'
import AnalyticsPage from './analytics'

class App extends React.Component {
    constructor (props) {
        super (props)
        this.state = {
            currentPage: 'HomePage'
        }
    }
    componentDidMount() {
        const main = ReactDOM.createRoot(document.getElementById('main'))

        const importLink = document.getElementById('importLink')
        importLink.addEventListener('click', async (e) => {
            console.log('click import')
            await this.setState({
                currentPage: 'ImportPage'
            })
            this.switchPage(main)
        })

        const homeLink = document.getElementById('homeLink')
        homeLink.addEventListener('click', async (e) => {
            await this.setState({
                currentPage: 'HomePage'
            })
            this.switchPage(main)
        })

        const analyticsLink = document.getElementById('analyticsLink')
        analyticsLink.addEventListener('click', async (e) => {
            console.log('click analytics')
            await this.setState({
                currentPage: 'AnalyticsPage'
            })
            this.switchPage(main)
        })
        this.switchPage(main)
    }

    switchPage(main) {
        console.log(this.state.currentPage)
        switch (this.state.currentPage) {
            case 'HomePage': 
                main.render(<HomePage />)
                break
            case 'ImportPage': 
                main.render(<ImportPage />)
                break
            case 'AnalyticsPage': 
                main.render(<AnalyticsPage />)
                break
        }
    }
    render () {
        return (
					<div className='container-fluid p-0'>
                        <nav className="navbar navbar-expand-lg bg-light shadow px-2">
                            <span className="navbar-brand" href="#">FinTrack</span>
                            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                                <span className="navbar-toggler-icon"></span>
                            </button>
                            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                                    <li className="nav-item">
                                        <a id="homeLink" className="nav-link" aria-current="page" href="#">Home</a>
                                    </li>
                                    <li className="nav-item">
                                        <a id="importLink" className="nav-link" href="#import">Import</a>
                                    </li>
                                    <li className="nav-item">
                                        <a id="analyticsLink" className="nav-link" href="#analytics">Analytics</a>
                                    </li>
                                </ul>
                            </div>
                        </nav>
						<div id='main'>
                            
                        </div>
					</div>
				)
    }

}

const app = ReactDOM.createRoot(document.getElementById('app'))
app.render(<App />)
