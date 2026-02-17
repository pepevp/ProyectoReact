import { useState, useEffect } from 'react';
import { shoppingListService } from '../../services/apiServices';
import { Check, RefreshCw, Trash2 } from 'lucide-react';

const ShoppingListView = () => {
    const [list, setList] = useState([]);

    useEffect(() => {
        loadList();
    }, []);

    const loadList = async () => {
        const { data } = await shoppingListService.get();
        setList(data);
    };

    const generateList = async () => {
        const today = new Date();
        const day = today.getDay(); // 0 (Sun) - 6 (Sat)
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday

        const monday = new Date(today.setDate(diff));
        const start = monday.toISOString().split('T')[0];

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        const end = sunday.toISOString().split('T')[0];

        await shoppingListService.generate({ startDate: start, endDate: end });
        loadList();
    };

    const toggleItem = async (id, currentStatus) => {
        // Optimistic update
        setList(list.map(item => item.id === id ? { ...item, comprado: !currentStatus } : item));
        await shoppingListService.toggle(id, !currentStatus);
    };

    const deleteItem = async (id) => {
        setList(list.filter(item => item.id !== id));
        await shoppingListService.delete(id);
    };

    return (
        <div style={{ maxWidth: '95%', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ marginBottom: '1rem' }}>Lista de la Compra</h2>
                <button onClick={generateList} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RefreshCw size={16} /> Generar para la Semana
                </button>
            </div>

            <div className="card">
                {list.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>La lista está vacía. ¡Genera una basada en tu plan de comidas!</p>
                ) : (
                    <ul style={{ listStyle: 'none' }}>
                        {list.map(item => (
                            <li key={item.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '1rem', borderBottom: '1px solid var(--border-color)',
                                opacity: item.comprado ? 0.5 : 1,
                                textDecoration: item.comprado ? 'line-through' : 'none'
                            }}>
                                <div>
                                    <span style={{ fontWeight: 'bold' }}>{item.nombre}</span>
                                    <span style={{ marginLeft: '1rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                                        {item.cantidad_total} {item.unidad}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={() => toggleItem(item.id, item.comprado)}
                                        style={{
                                            background: item.comprado ? 'var(--success)' : 'var(--card-bg)',
                                            border: '1px solid var(--border-color)',
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                        title={item.comprado ? "Desmarcar" : "Marcar como comprado"}
                                    >
                                        {item.comprado && <Check size={18} color="white" />}
                                    </button>
                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        style={{ color: '#ff6b6b', background: 'transparent' }}
                                        title="Eliminar de la lista"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {list.length > 0 && (
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <button
                        onClick={async () => {
                            if (window.confirm('¿Estás seguro de que quieres borrar toda la lista?')) {
                                await shoppingListService.clear();
                                loadList();
                            }
                        }}
                        style={{
                            background: 'transparent', border: '1px solid #ff6b6b', color: '#ff6b6b',
                            padding: '0.5rem 1rem', borderRadius: 'var(--radius)', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        <Trash2 size={16} /> Limpiar Lista
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShoppingListView;
