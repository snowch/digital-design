// Copyright © 2026 Christopher Snow

// A part of the page that throws shows its error where it would have been, and the page around it
// stands: a figure in a lesson (LessonView), and a challenge's editor (ChallengeRunner), whose run
// and reset buttons must stay usable when the editor cannot draw the saved work.

import { Component, type ErrorInfo, type ReactNode } from "react";

export class Boundary extends Component<
  { children: ReactNode; fallback: (message: string) => ReactNode },
  { error?: string }
> {
  override state: { error?: string } = {};
  static getDerivedStateFromError(error: unknown): { error: string } {
    return { error: error instanceof Error ? error.message : String(error) };
  }
  override componentDidCatch(_error: unknown, _info: ErrorInfo): void {
    // The message is already on the page.
  }
  override render(): ReactNode {
    return this.state.error !== undefined
      ? this.props.fallback(this.state.error)
      : this.props.children;
  }
}
