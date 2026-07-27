import { requestMetrics } from '../middleware/logger.js';
import { JobScheduler } from '../jobs/JobScheduler.js';
import { getSupabaseAdmin, isConfigured } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import os from 'os';

export const AdminController = {
  /**
   * Diagnostics Endpoint (serves JSON or HTML based on headers)
   */
  async getDiagnostics(req, res, next) {
    try {
      const startTime = Date.now();
      
      // 1. Database Health Check
      let dbConnected = false;
      let dbError = null;
      let dbLatencyMs = 0;
      if (isConfigured) {
        try {
          const dbStart = Date.now();
          const db = getSupabaseAdmin();
          const { error } = await db.from('profiles').select('id', { count: 'exact', head: true });
          dbLatencyMs = Date.now() - dbStart;
          if (!error) {
            dbConnected = true;
          } else {
            dbError = error.message;
          }
        } catch (err) {
          dbError = err.message;
        }
      } else {
        dbError = 'Supabase URL/Key is not configured (Running in local sandbox mode)';
      }

      // 2. AI Health check
      const geminiConfigured = !!(process.env.GEMINI_API_KEY);
      const activeAiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

      // 3. Exchange connection status count
      let activeExchangesCount = 0;
      let totalExchangesCount = 0;
      if (isConfigured && dbConnected) {
        try {
          const db = getSupabaseAdmin();
          const { data } = await db.from('connected_exchanges').select('status');
          if (data) {
            totalExchangesCount = data.length;
            activeExchangesCount = data.filter(e => e.status === 'active').length;
          }
        } catch (err) {
          logger.warn('AdminController', 'Failed to retrieve connected exchanges count', err);
        }
      }

      // 4. Memory and System metrics
      const memUsage = process.memoryUsage();
      const uptime = process.uptime();
      const loadAvg = os.loadavg();
      const freeMem = os.freemem();
      const totalMem = os.totalmem();

      // Assemble Diagnostics JSON Payload
      const diagnosticsData = {
        api: {
          status: 'healthy',
          uptimeSeconds: Math.floor(uptime),
          totalRequests: requestMetrics.totalRequests,
          errorRequests: requestMetrics.errorRequests,
          errorRate: requestMetrics.totalRequests > 0 ? ((requestMetrics.errorRequests / requestMetrics.totalRequests) * 100).toFixed(2) + '%' : '0%',
          avgLatencyMs: requestMetrics.latencyCount > 0 ? (requestMetrics.latencySum / requestMetrics.latencyCount).toFixed(2) + 'ms' : '0ms',
          statusCodes: requestMetrics.statusCodes
        },
        database: {
          connected: dbConnected,
          latencyMs: dbLatencyMs,
          error: dbError || null
        },
        ai: {
          configured: geminiConfigured,
          model: activeAiModel
        },
        exchanges: {
          total: totalExchangesCount,
          active: activeExchangesCount
        },
        jobs: JobScheduler.getStatus().map(j => ({
          name: j.name,
          intervalSeconds: j.intervalMs / 1000,
          status: 'running'
        })),
        system: {
          platform: process.platform,
          nodeVersion: process.version,
          memoryHeapUsedMB: (memUsage.heapUsed / 1024 / 1024).toFixed(2),
          memoryHeapTotalMB: (memUsage.heapTotal / 1024 / 1024).toFixed(2),
          systemMemoryFreeMB: (freeMem / 1024 / 1024).toFixed(2),
          systemMemoryTotalMB: (totalMem / 1024 / 1024).toFixed(2),
          loadAverage: loadAvg
        },
        diagnosticsLatencyMs: Date.now() - startTime
      };

      // Format response based on Client Accept header
      const acceptHeader = req.headers.accept || '';
      if (acceptHeader.includes('text/html')) {
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ravora Admin Diagnostics</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: #0d0f12;
      --card-bg: #13171f;
      --card-border: #1d2433;
      --text-color: #f1f5f9;
      --text-muted: #64748b;
      --accent: #2563eb;
      --success: #10b981;
      --warning: #f59e0b;
      --error: #ef4444;
    }
    body {
      background-color: var(--bg-color);
      color: var(--text-color);
      font-family: 'Plus Jakarta Sans', sans-serif;
      margin: 0;
      padding: 24px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 16px;
    }
    header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .badge {
      background-color: rgba(16, 185, 129, 0.15);
      color: var(--success);
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 600;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    .card {
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }
    .card h2 {
      margin-top: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 16px;
    }
    .metric {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .metric-label {
      color: var(--text-muted);
    }
    .metric-value {
      font-weight: 600;
    }
    .metric-value.ok {
      color: var(--success);
    }
    .metric-value.err {
      color: var(--error);
    }
    .metric-value.warn {
      color: var(--warning);
    }
    .job-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .job-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid var(--card-border);
      font-size: 13px;
    }
    .job-item:last-child {
      border-bottom: none;
    }
    footer {
      text-align: center;
      margin-top: 48px;
      font-size: 13px;
      color: var(--text-muted);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Ravora Systems Diagnostics Dashboard</h1>
      <span class="badge">Live</span>
    </header>

    <div class="grid">
      <!-- API Card -->
      <div class="card">
        <h2>API Health Metrics</h2>
        <div class="metric">
          <span class="metric-label">Uptime</span>
          <span class="metric-value">${Math.floor(diagnosticsData.api.uptimeSeconds / 3600)}h ${Math.floor((diagnosticsData.api.uptimeSeconds % 3600) / 60)}m</span>
        </div>
        <div class="metric">
          <span class="metric-label">Total Requests</span>
          <span class="metric-value">${diagnosticsData.api.totalRequests}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Error Rate</span>
          <span class="metric-value ${diagnosticsData.api.errorRequests > 0 ? 'warn' : 'ok'}">${diagnosticsData.api.errorRate}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Avg Latency</span>
          <span class="metric-value">${diagnosticsData.api.avgLatencyMs}</span>
        </div>
      </div>

      <!-- Database Card -->
      <div class="card">
        <h2>Database Integrity</h2>
        <div class="metric">
          <span class="metric-label">Status</span>
          <span class="metric-value ${diagnosticsData.database.connected ? 'ok' : 'err'}">${diagnosticsData.database.connected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Ping Latency</span>
          <span class="metric-value">${diagnosticsData.database.latencyMs}ms</span>
        </div>
        <div class="metric">
          <span class="metric-label">Error Info</span>
          <span class="metric-value" style="font-size:11px; max-width: 180px; text-align:right;">${diagnosticsData.database.error || 'None'}</span>
        </div>
      </div>

      <!-- AI Provider Card -->
      <div class="card">
        <h2>AI Integration Status</h2>
        <div class="metric">
          <span class="metric-label">Gemini Key Status</span>
          <span class="metric-value ${diagnosticsData.ai.configured ? 'ok' : 'err'}">${diagnosticsData.ai.configured ? 'Active' : 'Unconfigured'}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Configured Model</span>
          <span class="metric-value">${diagnosticsData.ai.model}</span>
        </div>
      </div>

      <!-- Exchange Connections Card -->
      <div class="card">
        <h2>Exchanges Status</h2>
        <div class="metric">
          <span class="metric-label">Total Connected</span>
          <span class="metric-value">${diagnosticsData.exchanges.total}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Active Exchanges</span>
          <span class="metric-value ${diagnosticsData.exchanges.active > 0 ? 'ok' : 'warn'}">${diagnosticsData.exchanges.active}</span>
        </div>
      </div>
    </div>

    <div class="grid">
      <!-- Background Jobs -->
      <div class="card" style="grid-column: span 2;">
        <h2>Running Background Workers</h2>
        <ul class="job-list">
          ${diagnosticsData.jobs.map(j => `
            <li class="job-item">
              <span class="metric-value">${j.name}</span>
              <span class="metric-label">Sync Period: ${j.intervalSeconds}s</span>
              <span class="metric-value ok">Active</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <!-- System Resources -->
      <div class="card">
        <h2>System Performance</h2>
        <div class="metric">
          <span class="metric-label">Platform</span>
          <span class="metric-value">${diagnosticsData.system.platform} (${diagnosticsData.system.nodeVersion})</span>
        </div>
        <div class="metric">
          <span class="metric-label">Node Heap Used</span>
          <span class="metric-value">${diagnosticsData.system.memoryHeapUsedMB} MB</span>
        </div>
        <div class="metric">
          <span class="metric-label">System Memory Free</span>
          <span class="metric-value">${diagnosticsData.system.systemMemoryFreeMB} MB</span>
        </div>
      </div>
    </div>

    <footer>
      Diagnostics generated in ${diagnosticsData.diagnosticsLatencyMs}ms | © Ravora Operations 2026
    </footer>
  </div>
</body>
</html>
        `;
        res.setHeader('Content-Type', 'text/html');
        return res.send(htmlContent);
      }

      return res.json({
        success: true,
        data: diagnosticsData
      });
    } catch (err) {
      next(err);
    }
  }
};
