import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider, useDispatch, useSelector } from 'react-redux'

import HomePage from './pages/home/home'
import SetupPage from './pages/setup'
import AnalyticsPage from './pages/analytics'
import PortFolioPage from './pages/portfolio'
import store from '../lib/store'
import { toggleDemoModeAction } from '../lib/slice'

function App() {
  const [currentPage, setCurrentPage] = useState('HomePage')
  const [darkModeEnabled, setDarkModeEnabled] = useState(
    JSON.parse(localStorage.getItem('darkModeEnabled'))
  )
  const demoMode = useSelector((state) => state.app.demoMode)

  const dispatch = useDispatch()
  useEffect(() => {
    if (darkModeEnabled) {
      document.documentElement.setAttribute('data-bs-theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-bs-theme', 'light')
    }
    const setupLink = document.getElementById('setupLink')
    setupLink.addEventListener('click', async () => {
      setCurrentPage('SetupPage')
      switchPage()
    })

    const homeLink = document.getElementById('homeLink')
    homeLink.addEventListener('click', async () => {
      setCurrentPage('HomePage')
      switchPage()
    })

    const analyticsLink = document.getElementById('analyticsLink')
    analyticsLink.addEventListener('click', async () => {
      setCurrentPage('AnalyticsPage')
      switchPage()
    })

    const portfolioLink = document.getElementById('portfolioLink')
    portfolioLink.addEventListener('click', async () => {
      setCurrentPage('PortFolioPage')
      switchPage()
    })
    switchPage()
  }, [currentPage, demoMode])

  function switchPage() {
    const main = ReactDOM.createRoot(document.getElementById('main'))
    switch (currentPage) {
      case 'HomePage':
        main.render(<HomePage />)
        break
      case 'SetupPage':
        main.render(<SetupPage />)
        break
      case 'AnalyticsPage':
        main.render(<AnalyticsPage />)
        break
      case 'PortFolioPage':
        main.render(<PortFolioPage />)
        break
    }
  }
  function toggleDarkMode() {
    if (darkModeEnabled) {
      localStorage.setItem('darkModeEnabled', false)
      document.documentElement.setAttribute('data-bs-theme', 'light')
      setDarkModeEnabled(false)
    } else {
      localStorage.setItem('darkModeEnabled', true)
      document.documentElement.setAttribute('data-bs-theme', 'dark')
      setDarkModeEnabled(true)
    }
  }
  function toggleDemoMode() {
    dispatch(toggleDemoModeAction())
  }

  return (
    <div className="container-fluid p-0">
      <nav className="navbar navbar-expand-lg shadow px-3">
        <span className="navbar-brand" href="#">
          FinTrack
        </span>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a
                id="homeLink"
                className="nav-link"
                aria-current="page"
                href="#"
              >
                Home
              </a>
            </li>
            <li className="nav-item">
              <a id="portfolioLink" className="nav-link" href="#portfolio">
                Portfolio
              </a>
            </li>
            <li className="nav-item">
              <a id="analyticsLink" className="nav-link" href="#analytics">
                Analytics
              </a>
            </li>
            <li className="nav-item">
              <a id="setupLink" className="nav-link" href="#setup">
                Setup
              </a>
            </li>
          </ul>
          <div className="d-flex">
            <button
              type="button"
              className={demoMode ? 'btn active' : 'btn'}
              onClick={(e) => toggleDemoMode()}
              title="Demo Mode"
            >
              <i className="bi bi-incognito"></i>
            </button>
            <button
              type="button"
              className={darkModeEnabled ? 'btn active' : 'btn'}
              onClick={(e) => toggleDarkMode()}
              title="Dark Mode"
            >
              <i className="bi bi-moon-stars-fill"></i>
            </button>
          </div>
        </div>
      </nav>
      <div id="main"></div>
    </div>
  )
}

const app = ReactDOM.createRoot(document.getElementById('app'))
app.render(
  <Provider store={store}>
    <App />
  </Provider>
)
