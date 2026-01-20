import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    variant?: 'full' | 'card';
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.variant === 'card') {
                return (
                    <div className="w-full h-full min-h-[200px] bg-red-950/20 border border-red-500/20 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                        <div className="mb-2 p-2 bg-red-500/10 rounded-full">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        <p className="text-red-200 font-bold text-xs mb-1 uppercase tracking-wider">Component Error</p>
                        <p className="text-red-400/80 text-[10px] mb-3 max-w-[180px] break-words leading-tight">{this.state.error?.message}</p>
                        <button
                            onClick={() => this.setState({ hasError: false, errorInfo: null })}
                            className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-red-500/20 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                );
            }

            return (
                <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">System Critical Error</h1>
                    <p className="text-slate-400 max-w-md mb-8">
                        The application encountered an unexpected state and could not render.
                    </p>

                    <div className="bg-red-950/20 border border-red-500/20 rounded-lg p-6 mb-8 max-w-2xl w-full text-left overflow-auto max-h-[400px]">
                        <p className="text-red-300 font-bold mb-2">{this.state.error?.toString()}</p>
                        <pre className="text-xs text-red-200/70 font-mono whitespace-pre-wrap">
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors border border-white/10 backdrop-blur-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Reboot System</span>
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
