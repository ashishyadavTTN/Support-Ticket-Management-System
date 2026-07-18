import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';
import CustomerTicketDetail from './customer/CustomerTicketDetail';
import InternalTicketDetail from './tickets/InternalTicketDetail';

export default function TicketDetailPage() {
  const { user } = useAuth();

  if (user?.role === ROLES.CUSTOMER) {
    return <CustomerTicketDetail />;
  }

  return <InternalTicketDetail />;
}
