import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';
import AdminRepTicketList from './tickets/AdminRepTicketList';
import CustomerPortal from './customer/CustomerPortal';

export default function TicketListPage() {
  const { user } = useAuth();

  if (user?.role === ROLES.ADMIN || user?.role === ROLES.REPRESENTATIVE) {
    return <AdminRepTicketList />;
  }

  return <CustomerPortal />;
}
