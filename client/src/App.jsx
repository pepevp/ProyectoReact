import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/layout/Layout';
import WeeklyCalendar from './components/features/WeeklyCalendar';
import RecipeList from './components/features/RecipeList';
import ShoppingListView from './components/features/ShoppingListView';
import { useAuth } from './context/AuthContext';
import './styles/global.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={
          <ProtectedRoute>
            <WeeklyCalendar />
          </ProtectedRoute>
        } />
        <Route path="/recipes" element={
          <ProtectedRoute>
            <RecipeList />
          </ProtectedRoute>
        } />
        <Route path="/shopping-list" element={
          <ProtectedRoute>
            <ShoppingListView />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

export default App;
