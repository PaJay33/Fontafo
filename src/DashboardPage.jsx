import React from 'react'

import AdminDashboard from './AdminDashboard';
import MemberDashboard from './MemberDashboard';

// Dashboard selon le rôle
const DashboardPage = ({ user, token, setCurrentPage }) => {
  if (user.role === 'Admin') {
    return <AdminDashboard user={user} setCurrentPage={setCurrentPage} />;
  }
  return <MemberDashboard user={user} setCurrentPage={setCurrentPage} />;
};

export default DashboardPage
