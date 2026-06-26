const Notification = require('../models/Notification');
const User = require('../models/User');
const sendEmail = require('./sendEmail');
const emailTemplates = require('./emailTemplates');

/**
 * Centralized Notification Dispatcher (In-App + Email)
 * 
 * @param {Object} params
 * @param {Array<String>} params.recipientIds - Array of User ObjectIds
 * @param {String} params.type - Enum matching Notification schema types
 * @param {String} params.title - Title of the notification
 * @param {String} params.message - Body text
 * @param {String} params.eventId - Related Event ObjectId
 * @param {Object} params.event - Event object for email templates
 * @param {String} params.ticketId - Optional, for registration confirmation
 * @param {Array<Object>} params.attachments - Optional email attachments
 */
const notify = async ({
  recipientIds,
  type,
  title,
  message,
  eventId,
  event,
  ticketId,
  attachments,
  emailTemplateData,
  skipEmail,
}) => {
  try {
    // 1. Fetch recipient emails and preferences
    const users = await User.find({ _id: { $in: recipientIds } }).select('name email notificationPreferences');
    
    // 2. Prepare In-App Notifications
    const inAppDocs = users.map(user => ({
      recipient: user._id,
      type,
      title,
      message,
      event: eventId || null,
    }));

    // Insert In-App notifications
    const inAppPromise = Notification.insertMany(inAppDocs);

    // 3. Prepare Emails
    const emailPromises = [];
    
    if (!skipEmail) {
      users.forEach(user => {
      // Check preferences
      if (type === 'new-registration-organizer' && user.notificationPreferences?.emailNewRegistrations === false) {
        return; // Skip sending email
      }

      let html = '';
      
      switch (type) {
        case 'registration-confirmation':
          html = emailTemplates.registrationEmailTemplate(user, event, ticketId);
          break;
        case 'new-registration-organizer':
          html = emailTemplates.newRegistrationOrganizerTemplate(
            emailTemplateData.event, 
            emailTemplateData.registrant, 
            user
          );
          break;
        case 'attendance-confirmed':
          html = emailTemplates.attendanceEmailTemplate(user, event);
          break;
        case 'event-updated':
          html = emailTemplates.eventUpdatedTemplate(user, event);
          break;
        case 'event-cancelled':
          html = emailTemplates.eventCancelledTemplate(user, event);
          break;
        case 'reminder-1day':
          html = emailTemplates.reminder1DayTemplate(user, event);
          break;
        case 'reminder-1hour':
          html = emailTemplates.reminder1HourTemplate(user, event);
          break;
        default:
          html = `<p>${message}</p>`; // Fallback
      }

      const emailPromise = sendEmail({
        email: user.email,
        subject: title,
        html,
        attachments,
      }).catch(err => {
        // Log individual email failures without failing the batch
        console.error(`Failed to send email to ${user.email}:`, err.message);
      });
      
      emailPromises.push(emailPromise);
      });
    }

    // Run both channels in parallel
    await Promise.allSettled([inAppPromise, ...emailPromises]);
    
  } catch (error) {
    console.error('Error in notify helper:', error);
  }
};

module.exports = notify;
