import { useAuth } from './contexts/AuthContext';
import { useAvailableDates } from './hooks/useAvailableDates';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import Calendar from './components/Calendar';
import Legend from './components/Legend';
import UserStatus from './components/UserStatus';

export default function App() {
  const { user, users } = useAuth();

  if (!user) {
    return <LoginForm />;
  }

  return <MainView user={user} users={users} />;
}

function MainView({ user, users }) {
  const {
    allDates,
    myDates,
    intersection,
    othersCount,
    toggleDate,
    loading,
  } = useAvailableDates(user.id);

  return (
    <div className="min-h-screen pb-8">
      <Header />

      <div className="mt-4 space-y-4 max-w-lg mx-auto">
        <Legend />
        
        <Calendar
          myDates={myDates}
          othersCount={othersCount}
          intersection={intersection}
          onToggle={toggleDate}
          loading={loading}
        />

        <UserStatus allDates={allDates} users={users} />
      </div>
    </div>
  );
}
