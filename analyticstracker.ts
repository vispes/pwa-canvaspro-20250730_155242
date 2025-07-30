const payload = {
      event,
      data: {
        ...data,
        userId: this.userId,
        timestamp: new Date().toISOString(),
        path: window.location.pathname
      }
    };

    this.sendToAnalytics(payload);
  }

  logPageView(path: string): void {
    if (!this.shouldSend()) return;
    this.trackEvent('page_view', { path });
  }

  private setupRouteTracking(): void {
    const originalPushState = history.pushState;
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.handleRouteChange();
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.handleRouteChange();
    };

    window.addEventListener('popstate', this.handleRouteChange.bind(this));
    window.addEventListener('load', () => this.logPageView(window.location.pathname));
  }

  private handleRouteChange(): void {
    this.logPageView(window.location.pathname);
  }

  private async sendToAnalytics(payload: unknown): Promise<void> {
    try {
      await fetch(`${this.serviceUrl}/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Analytics delivery failed:', error);
    }
  }

  private shouldSend(): boolean {
    return this.isInitialized && this.isEnabled;
  }
}

export const analyticsTracker = new AnalyticsTracker();