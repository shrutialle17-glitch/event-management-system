const registrationEmailTemplate = (user, event, ticketId) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Event Registration Confirmation</h2>
      <p>Hi ${user.name},</p>
      <p>You have successfully registered for <strong>${event.title}</strong>.</p>
      <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${event.time}</p>
      <p><strong>Venue:</strong> ${event.venue}</p>
      <p><strong>Ticket ID:</strong> ${ticketId}</p>
      <br />
      <p>Your check-in QR code is attached to this email. Please present it at the venue.</p>
      <p>Thanks,</p>
      <p>Event Management Team</p>
    </div>
  `;
};

const attendanceEmailTemplate = (user, event) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Check-in Confirmed</h2>
      <p>Hi ${user.name},</p>
      <p>You have successfully checked in to <strong>${event.title}</strong>.</p>
      <p>We hope you enjoy the event!</p>
      <p>Thanks,</p>
      <p>Event Management Team</p>
    </div>
  `;
};

const eventUpdatedTemplate = (user, event) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Event Updated: ${event.title}</h2>
      <p>Hi ${user.name},</p>
      <p>The organizer has updated the details for <strong>${event.title}</strong>.</p>
      <p>Please check the event page for the latest information on date, time, or venue.</p>
      <p>Thanks,</p>
      <p>Event Management Team</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888;">You are receiving this because you registered for this event. <a href="#">Unsubscribe</a></p>
    </div>
  `;
};

const eventCancelledTemplate = (user, event) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Event Cancelled: ${event.title}</h2>
      <p>Hi ${user.name},</p>
      <p>We're sorry to inform you that <strong>${event.title}</strong> has been cancelled by the organizer.</p>
      <p>If you have any questions, please contact the organizer.</p>
      <p>Thanks,</p>
      <p>Event Management Team</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888;">You are receiving this because you registered for this event. <a href="#">Unsubscribe</a></p>
    </div>
  `;
};

const reminder1DayTemplate = (user, event) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Reminder: ${event.title} is Tomorrow!</h2>
      <p>Hi ${user.name},</p>
      <p>Just a quick reminder that <strong>${event.title}</strong> is happening tomorrow.</p>
      <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${event.time}</p>
      <p><strong>Venue:</strong> ${event.venue}</p>
      <p>Don't forget your ticket QR code!</p>
      <p>See you there,</p>
      <p>Event Management Team</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888;">You are receiving this because you registered for this event. <a href="#">Unsubscribe</a></p>
    </div>
  `;
};

const reminder1HourTemplate = (user, event) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Reminder: ${event.title} starts in 1 Hour!</h2>
      <p>Hi ${user.name},</p>
      <p>Get ready! <strong>${event.title}</strong> is starting in just one hour at ${event.venue}.</p>
      <p>Please have your QR code ready for check-in.</p>
      <p>See you soon,</p>
      <p>Event Management Team</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888;">You are receiving this because you registered for this event. <a href="#">Unsubscribe</a></p>
    </div>
  `;
};

const newRegistrationOrganizerTemplate = (event, registrant, organizer) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>New registration for ${event.title}</h2>
      <p>Hi ${organizer.name},</p>
      <p><strong>${registrant.name}</strong> (${registrant.email}) has just registered for your event.</p>
      <p>Current Registrations: ${event.registeredCount} / ${event.capacity}</p>
      <br />
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/organizer/events/${event._id}/registrations" style="background-color: #10B981; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Manage Registrations</a>
      <p>Thanks,</p>
      <p>Event Management Team</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888;">You are receiving this because you are the organizer of this event. You can turn these emails off in your profile settings.</p>
    </div>
  `;
};

const passwordResetTemplate = (user, resetUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Password Reset Request</h2>
      <p>Hi ${user.name},</p>
      <p>You requested a password reset. Please click the button below to choose a new password. This link is valid for 15 minutes.</p>
      <br />
      <a href="${resetUrl}" style="background-color: #10B981; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <br /><br />
      <p>If you did not request this, please ignore this email.</p>
      <p>Thanks,</p>
      <p>Event Management Team</p>
    </div>
  `;
};

const waitlistTemplate = (user, event, position) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>You're on the waitlist for ${event.title}!</h2>
      <p>Hi ${user.name},</p>
      <p>This event is currently full, but you've been added to the waitlist at <strong>Position #${position}</strong>.</p>
      <p>If a spot opens up, we will automatically secure your ticket and email you your QR code.</p>
      <br />
      <p>Thanks,</p>
      <p>Event Management Team</p>
    </div>
  `;
};

module.exports = {
  registrationEmailTemplate,
  attendanceEmailTemplate,
  eventUpdatedTemplate,
  eventCancelledTemplate,
  reminder1DayTemplate,
  reminder1HourTemplate,
  newRegistrationOrganizerTemplate,
  passwordResetTemplate,
  waitlistTemplate,
};
