// Maps each role to its dashboard accent. DashboardLayout and any
// chart/badge component reads from this — single source of truth,
// so adding a 4th role later means editing one object, not every component.

export const roleTheme = {
  // Emerald
  user:      { accent: '16 185 129', accentDark: '5 150 105', accentLight: '52 211 153', hex: '#00674F', label: 'primary' },
  // Teal
  organizer: { accent: '20 184 166', accentDark: '13 148 136', accentLight: '94 234 212', hex: '#14B8A6', label: 'secondary' },
  // Cyan
  admin:     { accent: '6 182 212', accentDark: '8 145 178', accentLight: '103 232 249', hex: '#06B6D4', label: 'accent' },
};

export const getRoleTheme = (role) => roleTheme[role] || roleTheme.user;
