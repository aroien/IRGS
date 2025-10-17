// src/components/ProtectedAdmin.jsx - UPDATED
import { useEffect, useState } from 'react';
import { useSecurity } from './shared/SecurityWrapper';
import { ModernLoading } from './shared/ModernUI';
import { useNavigate } from 'react-router-dom';

export default function ProtectedAdmin({ children }) {
  const { userRole, loading, hasPermission } = useSecurity();
  const navigate = useNavigate();
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!userRole || !hasPermission('VIEW_DASHBOARD')) {
        navigate('/admin-login');
      }
      setAccessChecked(true);
    }
  }, [loading, userRole, hasPermission, navigate]);

  if (loading || !accessChecked) {
    return <ModernLoading />;
  }

  if (!userRole || !hasPermission('VIEW_DASHBOARD')) {
    return null; // Navigation will handle redirect
  }

  return children;
}