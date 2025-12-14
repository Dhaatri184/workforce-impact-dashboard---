// Chart synchronization utilities for coordinated interactions

export interface ChartSyncEvent {
  type: 'hover' | 'click' | 'zoom' | 'selection';
  chartId: string;
  data: any;
  timestamp: number;
}

export interface SyncedChart {
  id: string;
  element: HTMLElement;
  onSync: (event: ChartSyncEvent) => void;
}

class ChartSyncManager {
  private charts: Map<string, SyncedChart> = new Map();
  private syncGroups: Map<string, Set<string>> = new Map();
  private eventHistory: ChartSyncEvent[] = [];
  private maxHistorySize = 100;

  // Register a chart for synchronization
  registerChart(chart: SyncedChart, syncGroupId?: string): void {
    this.charts.set(chart.id, chart);
    
    if (syncGroupId) {
      if (!this.syncGroups.has(syncGroupId)) {
        this.syncGroups.set(syncGroupId, new Set());
      }
      this.syncGroups.get(syncGroupId)!.add(chart.id);
    }
  }

  // Unregister a chart
  unregisterChart(chartId: string): void {
    this.charts.delete(chartId);
    
    // Remove from all sync groups
    this.syncGroups.forEach((group) => {
      group.delete(chartId);
    });
  }

  // Broadcast an event to synchronized charts
  broadcastEvent(event: ChartSyncEvent, syncGroupId?: string): void {
    // Add to history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Determine target charts
    let targetChartIds: string[];
    
    if (syncGroupId && this.syncGroups.has(syncGroupId)) {
      targetChartIds = Array.from(this.syncGroups.get(syncGroupId)!);
    } else {
      targetChartIds = Array.from(this.charts.keys());
    }

    // Broadcast to all charts except the source
    targetChartIds
      .filter(id => id !== event.chartId)
      .forEach(chartId => {
        const chart = this.charts.get(chartId);
        if (chart) {
          try {
            chart.onSync(event);
          } catch (error) {
            console.warn(`Error syncing chart ${chartId}:`, error);
          }
        }
      });
  }

  // Create a synchronized hover handler
  createHoverHandler(chartId: string, syncGroupId?: string) {
    return (data: any) => {
      this.broadcastEvent({
        type: 'hover',
        chartId,
        data,
        timestamp: Date.now()
      }, syncGroupId);
    };
  }

  // Create a synchronized click handler
  createClickHandler(chartId: string, syncGroupId?: string) {
    return (data: any) => {
      this.broadcastEvent({
        type: 'click',
        chartId,
        data,
        timestamp: Date.now()
      }, syncGroupId);
    };
  }

  // Create a synchronized selection handler
  createSelectionHandler(chartId: string, syncGroupId?: string) {
    return (data: any) => {
      this.broadcastEvent({
        type: 'selection',
        chartId,
        data,
        timestamp: Date.now()
      }, syncGroupId);
    };
  }

  // Get recent events for a specific type
  getRecentEvents(type: ChartSyncEvent['type'], maxAge: number = 5000): ChartSyncEvent[] {
    const cutoff = Date.now() - maxAge;
    return this.eventHistory.filter(event => 
      event.type === type && event.timestamp > cutoff
    );
  }

  // Clear event history
  clearHistory(): void {
    this.eventHistory = [];
  }

  // Get all registered charts in a sync group
  getChartsInGroup(syncGroupId: string): SyncedChart[] {
    const chartIds = this.syncGroups.get(syncGroupId);
    if (!chartIds) return [];
    
    return Array.from(chartIds)
      .map(id => this.charts.get(id))
      .filter((chart): chart is SyncedChart => chart !== undefined);
  }
}

// Global sync manager instance
export const chartSyncManager = new ChartSyncManager();

// Utility functions for common synchronization patterns

export const syncTimeRange = (charts: string[], timeRange: [Date, Date], syncGroupId?: string): void => {
  charts.forEach(chartId => {
    chartSyncManager.broadcastEvent({
      type: 'selection',
      chartId: 'system',
      data: { timeRange, targetChart: chartId },
      timestamp: Date.now()
    }, syncGroupId);
  });
};

export const syncHighlight = (charts: string[], dataKey: string, value: any, syncGroupId?: string): void => {
  charts.forEach(chartId => {
    chartSyncManager.broadcastEvent({
      type: 'hover',
      chartId: 'system',
      data: { dataKey, value, targetChart: chartId },
      timestamp: Date.now()
    }, syncGroupId);
  });
};

export const syncZoom = (charts: string[], zoomState: any, syncGroupId?: string): void => {
  charts.forEach(chartId => {
    chartSyncManager.broadcastEvent({
      type: 'zoom',
      chartId: 'system',
      data: { zoomState, targetChart: chartId },
      timestamp: Date.now()
    }, syncGroupId);
  });
};

// React hook for chart synchronization
export const useChartSync = (
  chartId: string,
  onSyncEvent: (event: ChartSyncEvent) => void,
  syncGroupId?: string
) => {
  const registerChart = () => {
    const chart: SyncedChart = {
      id: chartId,
      element: document.getElementById(chartId) as HTMLElement,
      onSync: onSyncEvent
    };
    
    chartSyncManager.registerChart(chart, syncGroupId);
  };

  const unregisterChart = () => {
    chartSyncManager.unregisterChart(chartId);
  };

  const broadcastHover = (data: any) => {
    chartSyncManager.createHoverHandler(chartId, syncGroupId)(data);
  };

  const broadcastClick = (data: any) => {
    chartSyncManager.createClickHandler(chartId, syncGroupId)(data);
  };

  const broadcastSelection = (data: any) => {
    chartSyncManager.createSelectionHandler(chartId, syncGroupId)(data);
  };

  return {
    registerChart,
    unregisterChart,
    broadcastHover,
    broadcastClick,
    broadcastSelection
  };
};

// Debounced event handler to prevent excessive synchronization
export const createDebouncedSyncHandler = (
  handler: (data: any) => void,
  delay: number = 100
) => {
  let timeoutId: NodeJS.Timeout;
  
  return (data: any) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => handler(data), delay);
  };
};

// Throttled event handler for high-frequency events like mouse moves
export const createThrottledSyncHandler = (
  handler: (data: any) => void,
  interval: number = 50
) => {
  let lastCall = 0;
  
  return (data: any) => {
    const now = Date.now();
    if (now - lastCall >= interval) {
      lastCall = now;
      handler(data);
    }
  };
};