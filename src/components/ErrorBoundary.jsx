import React, { Component } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo })
    console.error('Critical Layout Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center font-sans">
          <FiAlertTriangle className="text-red-500 text-6xl mb-6 animate-pulse" />
          <h1 className="text-4xl font-bold mb-4">Something went wrong.</h1>
          <p className="text-gray-400 mb-8 max-w-lg">
            Stream-X encountered a critical error. This usually happens due to a network glitch or a corrupted cached state.
          </p>
          
          <div className="bg-gray-900 p-4 rounded-lg mb-8 text-left overflow-auto max-w-2xl w-full border border-gray-800">
            <code className="text-red-400 text-sm font-mono">{this.state.error?.toString()}</code>
            <br />
            <br />
            <pre className="text-gray-500 text-xs whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
          </div>

          <button 
            onClick={() => {
                localStorage.clear();
                window.location.reload();
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-all"
          >
            Hard Reset App
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
