import { useState, useEffect } from 'react';
import { mealPlanService, recipeService } from '../../services/apiServices';
import { Plus, X } from 'lucide-react';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MEAL_TYPES = ['desayuno', 'almuerzo', 'cena', 'snack'];

const WeeklyCalendar = () => {
    const [plan, setPlan] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    // Get dates for the current week starting Monday
    const getWeekDates = () => {
        const today = new Date();
        const day = today.getDay(); // 0 (Sun) - 6 (Sat)
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday

        const monday = new Date(today.setDate(diff));

        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            // Format as YYYY-MM-DD using local time
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        });
    };

    const weekDates = getWeekDates();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const start = weekDates[0];
        const end = weekDates[6];
        const [planData, recipesData] = await Promise.all([
            mealPlanService.getWeekly(start, end),
            recipeService.getAll()
        ]);
        setPlan(planData.data);
        setRecipes(recipesData.data);
    };

    const handleAddMeal = async (recipeId) => {
        if (!selectedSlot) return;
        await mealPlanService.addMeal({
            recipeId,
            date: selectedSlot.date,
            mealType: selectedSlot.type
        });
        setShowModal(false);
        loadData();
    };

    const handleRemoveMeal = async (id) => {
        // Removed confirmation dialog as requested
        await mealPlanService.removeMeal(id);
        loadData();
    };

    const getMealForSlot = (date, type) => {
        return plan.find(p => {
            // Fix timezone issue: Treat the date string from DB as local YYYY-MM-DD
            const d = new Date(p.fecha);
            const localISODate = d.toLocaleDateString('sv-SE'); // YYYY-MM-DD format
            return localISODate === date && p.tipo_comida === type;
        });
    };

    return (
        <div>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Planificador Semanal</h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gridTemplateRows: 'auto repeat(4, 1fr)',
                gridAutoFlow: 'column',
                gap: '1rem',
                overflowX: 'auto',
                paddingBottom: '1rem'
            }}>
                {DAYS.map((day, index) => (
                    <div key={day} style={{ display: 'contents' }}>
                        {/* Header Row */}
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ color: 'var(--secondary-color)' }}>{day}</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{weekDates[index].slice(5)}</span>
                        </div>

                        {/* Meal Rows */}
                        {MEAL_TYPES.map(type => {
                            const meal = getMealForSlot(weekDates[index], type);
                            return (
                                <div key={type} className="card" style={{ padding: '0.5rem', minHeight: '120px', display: 'flex', flexDirection: 'column' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'capitalize', marginBottom: '0.5rem' }}>{type}</p>
                                    {meal ? (
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{meal.titulo}</p>
                                            <button
                                                onClick={() => handleRemoveMeal(meal.id)}
                                                style={{
                                                    color: '#ff6b6b', fontSize: '0.8rem', marginTop: 'auto',
                                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '0.2rem', alignSelf: 'flex-start'
                                                }}
                                            >
                                                <X size={14} /> Eliminar
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setSelectedSlot({ date: weekDates[index], type }); setShowModal(true); }}
                                            style={{ flex: 1, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Plus size={20} color="var(--text-dim)" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="card" style={{ width: '400px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3>Seleccionar Receta</h3>
                            <button onClick={() => setShowModal(false)}><X /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {recipes.map(recipe => (
                                <button
                                    key={recipe.id}
                                    onClick={() => handleAddMeal(recipe.id)}
                                    style={{
                                        textAlign: 'left', padding: '1rem', background: 'var(--dark-bg)',
                                        borderRadius: 'var(--radius)', color: 'var(--text-light)'
                                    }}
                                >
                                    {recipe.titulo}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeeklyCalendar;
