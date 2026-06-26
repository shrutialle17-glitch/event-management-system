const Event = require('../models/Event');
const Registration = require('../models/Registration');
const notify = require('../utils/notify');

const checkReminders = async () => {
  console.log('[ReminderJob] Checking for upcoming events...');

  try {
    const now = new Date();
    
    // 1 Day Window: Events happening between 24h and 24h 15m from now
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowEnd = new Date(tomorrow.getTime() + 15 * 60 * 1000); // 15 min buffer matching cron

    // 1 Hour Window: Events happening between 1h and 1h 15m from now
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    const nextHourEnd = new Date(nextHour.getTime() + 15 * 60 * 1000);

    // --- 1 DAY REMINDERS ---
    const oneDayEvents = await Event.find({
      status: 'published',
      date: { $gte: tomorrow, $lt: tomorrowEnd },
      reminder1DaySent: false,
    });

    for (const event of oneDayEvents) {
      const registrations = await Registration.find({ event: event._id, status: 'registered' });
      const recipientIds = registrations.map(reg => reg.user);

      if (recipientIds.length > 0) {
        await notify({
          recipientIds,
          type: 'reminder-1day',
          title: `Reminder: ${event.title} is Tomorrow!`,
          message: `${event.title} is happening tomorrow at ${event.venue}. Don't forget your ticket!`,
          eventId: event._id,
          event: event,
        });
      }

      event.reminder1DaySent = true;
      await event.save();
      console.log(`[ReminderJob] 1-day reminder sent for event: ${event.title}`);
    }

    // --- 1 HOUR REMINDERS ---
    // Note: event.date is a Date object. If time is stored as a string (e.g. "14:00"), 
    // we would ideally parse the exact date+time. However, for this MVP, we assume event.date 
    // holds the exact JS Date of the event start, or we rely on the 1-hour cron logic hitting the date field.
    // If date only holds the day (00:00:00), a 1-hour reminder might be less accurate unless time is merged.
    // Let's assume date holds the full datetime or we do a best-effort check.
    const oneHourEvents = await Event.find({
      status: 'published',
      date: { $gte: nextHour, $lt: nextHourEnd },
      reminder1HourSent: false,
    });

    for (const event of oneHourEvents) {
      const registrations = await Registration.find({ event: event._id, status: 'registered' });
      const recipientIds = registrations.map(reg => reg.user);

      if (recipientIds.length > 0) {
        await notify({
          recipientIds,
          type: 'reminder-1hour',
          title: `Reminder: ${event.title} starts in 1 Hour!`,
          message: `${event.title} starts in exactly one hour. Get ready!`,
          eventId: event._id,
          event: event,
        });
      }

      event.reminder1HourSent = true;
      await event.save();
      console.log(`[ReminderJob] 1-hour reminder sent for event: ${event.title}`);
    }

  } catch (error) {
    console.error('[ReminderJob] Error running reminder job:', error.message);
  }
};

module.exports = checkReminders;
