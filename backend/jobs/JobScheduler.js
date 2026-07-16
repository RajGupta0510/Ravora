/**
 * Ravora Backend V1 — Job Scheduler
 * Registers and manages recurring background tasks.
 */

import { logger } from '../utils/logger.js';

const jobs = [];
const timers = [];

export const JobScheduler = {
  /**
   * Register a recurring job.
   * @param {string} name - Job identifier
   * @param {number} intervalMs - Interval in milliseconds
   * @param {Function} handler - Async function to execute
   */
  register(name, intervalMs, handler) {
    jobs.push({ name, intervalMs, handler });
    logger.info('JobScheduler', `Registered job: ${name} (every ${intervalMs / 1000}s)`);
  },

  /**
   * Start all registered jobs.
   */
  startAll() {
    for (const job of jobs) {
      // Execute once immediately on startup to populate data caches
      (async () => {
        try {
          logger.debug('JobScheduler', `Executing initial run for job: ${job.name}`);
          await job.handler();
        } catch (err) {
          logger.error('JobScheduler', `Initial run of "${job.name}" failed`, { error: err.message });
        }
      })();

      const timer = setInterval(async () => {
        try {
          await job.handler();
        } catch (err) {
          logger.error('JobScheduler', `Job "${job.name}" failed`, { error: err.message });
        }
      }, job.intervalMs);

      timers.push({ name: job.name, timer });
    }

    logger.info('JobScheduler', `✓ Started ${jobs.length} background jobs`);
  },

  /**
   * Stop all running jobs.
   */
  stopAll() {
    timers.forEach(({ name, timer }) => {
      clearInterval(timer);
      logger.info('JobScheduler', `Stopped job: ${name}`);
    });
    timers.length = 0;
  },

  /**
   * Get status of all registered jobs.
   */
  getStatus() {
    return jobs.map(j => ({ name: j.name, intervalMs: j.intervalMs }));
  },
};
