/**
 * Request Audit Logger
 * Tracks all API requests to detect:
 * - Infinite request loops
 * - Duplicate simultaneous requests
 * - Requests without responses (timeouts)
 * - Slow requests
 */

const requestLog = [];
const MAX_LOG_SIZE = 500;
const TIME_WINDOW_MS = 5000; // 5 second window
const LOOP_THRESHOLD = 10; // More than 10 identical requests in 5 seconds = loop

export const requestAudit = {
  /**
   * Log a request start
   */
  logRequestStart(endpoint, method) {
    const id = `${method} ${endpoint}`;
    const timestamp = Date.now();
    requestLog.push({
      endpoint,
      method,
      timestamp,
      completed: false
    });

    // Keep log size under control
    if (requestLog.length > MAX_LOG_SIZE) {
      requestLog.shift();
    }

    // Check for infinite loops
    this.checkForLoops(id, timestamp);
  },
  /**
   * Log a request completion
   */
  logRequestComplete(endpoint, method, status, duration) {
    const record = requestLog.find(r => r.endpoint === endpoint && r.method === method && !r.completed);
    if (record) {
      record.status = status;
      record.duration = duration;
      record.completed = true;
    }
  },
  /**
   * Check for infinite request loops
   */
  checkForLoops(requestId, currentTime) {
    const windowStart = currentTime - TIME_WINDOW_MS;
    const recentRequests = requestLog.filter(r => `${r.method} ${r.endpoint}` === requestId && r.timestamp > windowStart);
    if (recentRequests.length > LOOP_THRESHOLD) {
      console.error(`🚨 [REQUEST AUDIT] INFINITE LOOP DETECTED!`, `Request: ${requestId}`, `Count: ${recentRequests.length} in last ${TIME_WINDOW_MS}ms`, `Recent requests:`, recentRequests.map(r => ({
        time: new Date(r.timestamp).toISOString(),
        status: r.status,
        duration: r.duration
      })));

      // Trigger alert
      this.alertInfiniteLoop(requestId, recentRequests.length);
    }
  },
  /**
   * Alert about infinite loop
   */
  alertInfiniteLoop(requestId, count) {
    // You can dispatch this to error tracking service
    console.error(`⚠️  Infinite request loop detected: ${requestId} (${count} requests)`);

    // Optionally pause the app or redirect to error page
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('apiLoopDetected', {
        detail: {
          requestId,
          count
        }
      }));
    }
  },
  /**
   * Get request statistics
   */
  getStats() {
    const now = Date.now();
    const last5s = requestLog.filter(r => now - r.timestamp < 5000);
    const pending = last5s.filter(r => !r.completed);
    const completed = last5s.filter(r => r.completed);
    const avgDuration = completed.length > 0 ? completed.reduce((sum, r) => sum + (r.duration || 0), 0) / completed.length : 0;
    return {
      lastRequestsCount: last5s.length,
      pendingRequests: pending.length,
      completedRequests: completed.length,
      averageDuration: Math.round(avgDuration),
      allRequests: requestLog.map(r => ({
        ...r,
        time: new Date(r.timestamp).toISOString()
      }))
    };
  },
  /**
   * Clear audit log
   */
  clear() {
    requestLog.length = 0;
    console.log('✅ [REQUEST AUDIT] Log cleared');
  },
  /**
   * Print summary to console
   */
  printSummary() {
    const stats = this.getStats();
    console.group('📊 [REQUEST AUDIT] Summary');
    console.log('Last 5 seconds:');
    console.log(`  Pending: ${stats.pendingRequests}`);
    console.log(`  Completed: ${stats.completedRequests}`);
    console.log(`  Average duration: ${stats.averageDuration}ms`);
    console.log('Last 10 requests:', stats.allRequests.slice(-10));
    console.groupEnd();
  }
};

// Export helper for debugging
if (typeof window !== 'undefined') {
  window.requestAudit = requestAudit;
}