import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';
import NewTicketPage from './NewTicketPage';

export default function CreateTicketPage() {
  const { user } = useAuth();

  if (user?.role === ROLES.CUSTOMER) {
    return <Navigate to="/customer/dashboard?create=true" replace />;
  }

  return <NewTicketPage />;
}
