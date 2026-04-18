import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="max-w-sm text-center space-y-4">
            <AlertTriangle className="mx-auto h-10 w-10 text-amber-400" />
            <h2 className="text-lg font-semibold text-gray-800">Something went wrong</h2>
            <p className="text-sm text-gray-500">
              This section failed to load. Try refreshing the page — if the problem persists, the data will reappear shortly.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#16304f] transition-colors"
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
