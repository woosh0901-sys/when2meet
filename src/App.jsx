import { useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import CalendarView from './components/calendar/CalendarView';

export default function App() {
  const { user } = useAuth();
  if (!user) return <LoginForm />;
  return <MainLayout />;
}

function MainLayout() {
  return (
    <div className="h-screen flex flex-col bg-surface-900 overflow-hidden">
      <Header />
      <main className="flex-1 overflow-hidden p-3 sm:p-4">
        <CalendarView />
      </main>
    </div>
  );
}
