'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-900/20 border border-red-500 rounded-lg font-mono">
          <h2 className="text-xl text-red-500 font-bold mb-4">React Error Caught!</h2>
          <details className="whitespace-pre-wrap text-xs text-red-300">
            <summary className="cursor-pointer text-red-400 font-bold">Error: {this.state.error?.toString()}</summary>
            <br />
            {this.state.errorInfo?.componentStack}
          </details>
        </div>
      )
    }

    return this.props.children
  }
}
