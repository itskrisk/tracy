import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class RootErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#F5F3EC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'monospace',
          color: '#0F0F0F'
        }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            backgroundColor: '#ffffff',
            border: '3px solid #000000',
            boxShadow: '6px 6px 0px #000000',
            padding: '24px'
          }}>
            <h1 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '12px' }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: '13px', color: '#666666', marginBottom: '16px' }}>
              {this.state.error?.message || 'Unknown runtime error'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 16px',
                backgroundColor: '#FF2E93',
                color: '#ffffff',
                border: '2px solid #000000',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>,
)
