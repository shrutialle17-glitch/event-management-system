import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRoleTheme } from '../../utils/roleTheme';

const DashboardLayout = () => {
  const { user } = useAuth();
  
  // Determine role. If user is null, it defaults to 'user' theme, though 
  // ProtectedRoute will typically prevent rendering this without a user.
  const role = user?.role || 'user';
  const theme = getRoleTheme(role);

  return (
    <div 
      className="dashboard-layout-container flex flex-col flex-grow"
      style={{
        '--role-accent': theme.accent,
        '--role-accent-dark': theme.accentDark,
        '--role-accent-light': theme.accentLight,
        '--role-accent-hex': theme.hex,
      }}
    >
      <Outlet />
    </div>
  );
};

export default DashboardLayout;
