const Event = require('../models/Event');

/**
 * Auto-marks published or pending-approval events as 'completed'
 * when their date has passed. Runs on a schedule via scheduler.js.
 */
const autoCompleteEvents = async () => {
  try {
    const result = await Event.updateMany(
      {
        status: { $in: ['published', 'pending-approval'] },
        date: { $lt: new Date() },
      },
      { $set: { status: 'completed' } }
    );

    if (result.modifiedCount > 0) {
      console.log(`[AutoComplete] Marked ${result.modifiedCount} event(s) as completed.`);
    }
  } catch (err) {
    console.error('[AutoComplete] Error marking events as completed:', err.message);
  }
};

module.exports = autoCompleteEvents;
