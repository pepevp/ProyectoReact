import { useState, useEffect } from 'react';
import { recipeService, ingredientService } from '../../services/apiServices';
import { ChefHat, X, Plus, Save } from 'lucide-react';

const RecipeList = () => {
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [availableIngredients, setAvailableIngredients] = useState([]);

    // Form State
    const [newRecipe, setNewRecipe] = useState({
        titulo: '',
        instrucciones: '',
        porciones: 1,
        ingredientes: []
    });
    // Initialize unit with a default valid value
    const [newIngredient, setNewIngredient] = useState({ nombre: '', cantidad: '', unidad: 'gramos' });

    useEffect(() => {
        loadRecipes();
        loadIngredients();
    }, []);

    const loadRecipes = async () => {
        const { data } = await recipeService.getAll();
        setRecipes(data);
    };

    const loadIngredients = async () => {
        try {
            const { data } = await ingredientService.getAll();
            setAvailableIngredients(data);
        } catch (error) {
            console.error("Error loading ingredients", error);
        }
    };

    const handleViewRecipe = async (id) => {
        try {
            const { data } = await recipeService.getById(id);
            setSelectedRecipe(data);
        } catch (error) {
            console.error("Error fetching recipe details", error);
        }
    };

    const handleAddIngredient = () => {
        if (newIngredient.nombre && newIngredient.cantidad) {
            setNewRecipe({
                ...newRecipe,
                ingredientes: [...newRecipe.ingredientes, newIngredient]
            });
            // Reset but keep the last used unit or default? Let's reset to default.
            setNewIngredient({ nombre: '', cantidad: '', unidad: 'gramos' });
        }
    };

    const handleRemoveIngredient = (index) => {
        const updated = [...newRecipe.ingredientes];
        updated.splice(index, 1);
        setNewRecipe({ ...newRecipe, ingredientes: updated });
    };

    const handleCreateRecipe = async (e) => {
        e.preventDefault();
        try {
            await recipeService.create(newRecipe);
            setShowCreateModal(false);
            setNewRecipe({ titulo: '', instrucciones: '', porciones: 1, ingredientes: [] });
            loadRecipes();
        } catch (error) {
            console.error("Error creating recipe", error);
            alert("Error al crear la receta");
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h2>Libro de Recetas</h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}
                >
                    <Plus size={20} /> Nueva Receta
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {recipes.map(recipe => (
                    <div key={recipe.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{
                            height: '150px', background: '#333', borderRadius: 'var(--radius)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '1rem'
                        }}>
                            <ChefHat size={48} color="var(--text-dim)" />
                        </div>
                        <h3>{recipe.titulo}</h3>
                        <p style={{ color: 'var(--text-dim)', margin: '0.5rem 0', fontSize: '0.9rem', flex: 1 }}>
                            {recipe.instrucciones.substring(0, 100)}...
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                            {recipe.paquete_id ? (
                                <span style={{
                                    background: 'var(--warning)', color: '#000', padding: '0.2rem 0.5rem',
                                    borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold'
                                }}>
                                    PREMIUM
                                </span>
                            ) : <span></span>}
                            <button
                                onClick={() => handleViewRecipe(recipe.id)}
                                style={{ background: 'var(--secondary-color)', color: '#000', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                Ver Detalles
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* View Details Modal */}
            {selectedRecipe && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '600px', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
                        <button
                            onClick={() => setSelectedRecipe(null)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', color: 'var(--text-light)', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>

                        <h2 style={{ marginBottom: '1rem', color: 'var(--primary-color)', paddingRight: '2rem' }}>{selectedRecipe.titulo}</h2>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '100px', height: '100px', background: '#333', borderRadius: 'var(--radius)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                <ChefHat size={32} color="var(--text-dim)" />
                            </div>
                            <div>
                                <p><strong>Porciones:</strong> {selectedRecipe.porciones}</p>
                                {selectedRecipe.paquete_id && <p style={{ color: 'var(--warning)', fontWeight: 'bold' }}>Receta Premium</p>}
                            </div>
                        </div>

                        <h3 style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Ingredientes</h3>
                        <ul style={{ marginBottom: '1.5rem', listStylePosition: 'inside' }}>
                            {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 ? (
                                selectedRecipe.ingredients.map((ing, idx) => (
                                    <li key={idx} style={{ marginBottom: '0.2rem', color: 'var(--text-light)' }}>
                                        <strong>{ing.cantidad} {ing.unidad}</strong> de {ing.nombre}
                                    </li>
                                ))
                            ) : (
                                <p style={{ color: 'var(--text-dim)' }}>No hay ingredientes listados.</p>
                            )}
                        </ul>

                        <h3 style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Instrucciones</h3>
                        <p style={{ lineHeight: '1.6', whiteSpace: 'pre-line', color: 'var(--text-light)' }}>{selectedRecipe.instrucciones}</p>
                    </div>
                </div>
            )}

            {/* Create Recipe Modal */}
            {showCreateModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                        <button
                            onClick={() => setShowCreateModal(false)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', color: 'var(--text-light)', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>

                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--secondary-color)' }}>Nueva Receta</h2>

                        <form onSubmit={handleCreateRecipe}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>Título</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={newRecipe.titulo}
                                    onChange={(e) => setNewRecipe({ ...newRecipe, titulo: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>Instrucciones</label>
                                <textarea
                                    className="input-field"
                                    style={{ height: '200px', resize: 'vertical', width: '100%' }}
                                    value={newRecipe.instrucciones}
                                    onChange={(e) => setNewRecipe({ ...newRecipe, instrucciones: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>Porciones</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={newRecipe.porciones}
                                    onChange={(e) => setNewRecipe({ ...newRecipe, porciones: parseInt(e.target.value) })}
                                    min="1"
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>Ingredientes</label>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>

                                    {/* Ingredient Dropdown */}
                                    <select
                                        className="input-field"
                                        value={newIngredient.nombre}
                                        onChange={(e) => setNewIngredient({ ...newIngredient, nombre: e.target.value })}
                                        style={{ flex: 2 }}
                                    >
                                        <option value="">Seleccionar ingrediente...</option>
                                        {availableIngredients.map(ing => (
                                            <option key={ing.id} value={ing.nombre}>{ing.nombre}</option>
                                        ))}
                                    </select>

                                    <input
                                        type="number" placeholder="Cant."
                                        className="input-field" style={{ width: '80px' }}
                                        value={newIngredient.cantidad}
                                        onChange={(e) => setNewIngredient({ ...newIngredient, cantidad: e.target.value })}
                                    />

                                    {/* Unit Dropdown */}
                                    <select
                                        className="input-field" style={{ width: '120px' }}
                                        value={newIngredient.unidad}
                                        onChange={(e) => setNewIngredient({ ...newIngredient, unidad: e.target.value })}
                                    >
                                        <option value="gramos">gramos</option>
                                        <option value="kg">kg</option>
                                        <option value="ml">ml</option>
                                        <option value="litros">litros</option>
                                        <option value="unidad">unidad</option>
                                        <option value="cucharada">cucharada</option>
                                        <option value="taza">taza</option>
                                    </select>

                                    <button type="button" onClick={handleAddIngredient} className="btn-secondary">
                                        <Plus size={20} />
                                    </button>
                                </div>

                                <ul style={{ background: 'var(--dark-bg)', padding: '1rem', borderRadius: 'var(--radius)' }}>
                                    {newRecipe.ingredientes.map((ing, idx) => (
                                        <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span>{ing.cantidad} {ing.unidad} de {ing.nombre}</span>
                                            <button type="button" onClick={() => handleRemoveIngredient(idx)} style={{ color: '#ff6b6b', background: 'transparent' }}>
                                                <X size={16} />
                                            </button>
                                        </li>
                                    ))}
                                    {newRecipe.ingredientes.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Añade ingredientes a tu receta</p>}
                                </ul>
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                <Save size={20} /> Guardar Receta
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecipeList;
