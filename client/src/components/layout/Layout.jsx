import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Calendar, ShoppingCart, LogOut, ChefHat } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <nav style={{
                background: 'var(--card-bg)',
                padding: '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: 'var(--shadow)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <ChefHat color="var(--primary-color)" size={32} />
                    <h1 style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>MealPlanner Pro</h1>
                </div>

                {user && (
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <Link to="/" style={{ color: 'var(--text-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={20} /> Plan
                        </Link>
                        <Link to="/recipes" style={{ color: 'var(--text-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ChefHat size={20} /> Recetas
                        </Link>
                        <Link to="/shopping-list" style={{ color: 'var(--text-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ShoppingCart size={20} /> Lista
                        </Link>
                        <button onClick={handleLogout} style={{ background: 'transparent', color: 'var(--text-dim)' }} title="Cerrar Sesión">
                            <LogOut size={20} />
                        </button>
                    </div>
                )}
            </nav>

            <main className="container" style={{ flex: 1, marginTop: '2rem' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
