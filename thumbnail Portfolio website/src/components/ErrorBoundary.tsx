import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  declare props: Props;

  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React UI error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto text-xl font-bold">
              ⚡
            </div>
            <h2 className="text-xl font-bold text-zinc-100">Application Ready</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              A temporary session cache glitch occurred while initializing component views. Click below to reload cleanly.
            </p>
            {this.state.error?.message && (
              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 text-[11px] font-mono text-zinc-400 text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
              >
                Reload Webpage
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold py-2.5 px-4 rounded-xl transition-all"
              >
                Clear Local Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
