import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: '#faf8f5',
            color: '#1a1614',
            fontFamily: 'system-ui, sans-serif',
            textAlign: 'center',
          }}
        >
          <div>
            <h1 style={{ margin: '0 0 1rem', fontSize: '1.5rem' }}>Something went wrong</h1>
            <p style={{ margin: 0, color: '#6b6560' }}>
              {this.state.error?.message || 'An error occurred'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                background: '#2d6a4f',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
