import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode; fallback?: ReactNode; resetKey?: unknown };
type State = { hasError: boolean; message: string };

/** Catches render errors so one broken section never blanks the whole page. */
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : String(error) };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.hasError && prev.resetKey !== this.props.resetKey) this.setState({ hasError: false, message: '' });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-foreground">Algo deu errado ao mostrar esta parte do site.</p>
            <div className="flex gap-3">
              <button
                type="button"
                className="rounded-md border border-border px-4 py-2 font-semibold text-foreground"
                onClick={() => this.setState({ hasError: false, message: '' })}
              >
                Tentar de novo
              </button>
              <button
                type="button"
                className="rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground"
                onClick={() => window.location.reload()}
              >
                Recarregar página
              </button>
            </div>
            {this.state.message && (
              <p className="max-w-md text-xs text-muted-foreground">Detalhe: {this.state.message}</p>
            )}
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
