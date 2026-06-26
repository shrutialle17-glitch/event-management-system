const cron = require('node-cron');
const checkReminders = require('./reminderJob');
const autoCompleteEvents = require('./autoCompleteJob');

const startScheduler = () => {
  // Run reminders every 15 minutes
  cron.schedule('*/15 * * * *', () => {
    checkReminders();
  });

  // Auto-complete past events every hour
  cron.schedule('0 * * * *', () => {
    autoCompleteEvents();
  });

  // Run once immediately on startup to catch already-expired events
  autoCompleteEvents();

  console.log('[Scheduler] node-cron registered successfully. Reminder job will run every 15 minutes. AutoComplete will run every hour.');
};

module.exports = startScheduler;
