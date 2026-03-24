import { Component } from "react";
import type { ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-6 bg-red-50 dark:bg-red-950 rounded-2xl border border-red-200 dark:border-red-800 space-y-2">
          <p className="font-bold text-red-700 dark:text-red-400">Something went wrong</p>
          <pre className="text-xs text-red-600 dark:text-red-300 whitespace-pre-wrap break-all">
            {this.state.error.message}
            {"\n"}
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
