import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode; fallback?: ReactNode; resetKey?: unknown };
type State = { hasError: boolean };

/** Catches render errors so one broken section never blanks the whole page. */
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.hasError && prev.resetKey !== this.props.resetKey) this.setState({ hasError: false });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-foreground">Algo deu errado ao mostrar esta parte do site.</p>
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground"
              onClick={() => window.location.reload()}
            >
              Recarregar página
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
