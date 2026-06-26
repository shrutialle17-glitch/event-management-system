const User = require('../models/User');
const Badge = require('../models/Badge');
const notify = require('./notify');

/**
 * Checks if a user has a badge, awards it if not, and sends a notification.
 * @param {String} userId - The user's ID
 * @param {String} badgeKey - The key of the badge to award
 */
const checkAndAwardBadges = async (userId, badgeKey) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Check if user already has this badge
    const alreadyEarned = user.earnedBadges.some(b => b.badgeKey === badgeKey);
    if (alreadyEarned) return;

    // Fetch the badge definition
    const badge = await Badge.findOne({ key: badgeKey });
    if (!badge) {
      console.error(`Badge key '${badgeKey}' not found in database.`);
      return;
    }

    // Award badge
    user.earnedBadges.push({ badgeKey });
    await user.save();

    // Send in-app notification (silently, without email)
    // We only pass recipientIds and type for in-app. notify helper handles email if we specify,
    // but in notify.js we don't have an email template for 'badge-earned' and it defaults to fallback.
    // Wait, notify.js will attempt to send an email with fallback <p>message</p> if emailNewRegistrations isn't checked.
    // To prevent an email entirely, we can add a flag or ensure `badge-earned` skips email in `notify.js`.
    // Let's modify notify.js later if needed, or rely on it failing silently if no email is explicitly coded.
    // Actually, `notify` sends email to all users by default unless preference says no.
    // For badges, we specifically don't want emails. 
    await notify({
      recipientIds: [userId],
      type: 'badge-earned',
      title: `New Badge Unlocked: ${badge.icon} ${badge.label}`,
      message: `Congratulations! You've earned the '${badge.label}' badge: ${badge.description}.`,
      eventId: null,
      skipEmail: true // We'll update notify.js to support this flag
    });

    console.log(`[Badges] Awarded '${badgeKey}' to user ${userId}`);
  } catch (error) {
    console.error('[Badges] Error awarding badge:', error.message);
  }
};

module.exports = { checkAndAwardBadges };
