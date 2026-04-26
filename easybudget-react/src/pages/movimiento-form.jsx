import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { API_URL } from '../config/api';
import '../styles/movimiento-form.css';

const incomeCategories = ['Nómina', 'Pagas', 'Ahorro', 'Ayudas', 'Venta', 'Otros'];
const expenseCategories = ['Vivienda', 'Comida', 'Transporte', 'Ocio', 'Salud', 'Otros'];

function MovimientoForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const movementId = searchParams.get('id');

  const [type, setType] = useState('');
  const [concept, setConcept] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const [errors, setErrors] = useState({});

  const isEditing = Boolean(movementId);
  const availableCategories = type === 'income' ? incomeCategories : expenseCategories;

  useEffect(() => {
    if (!isEditing) return;

    async function fetchMovementToEdit() {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}/api/movements`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) return;

        const movement = data.find((item) => String(item.id) === String(movementId));

        if (!movement) return;

        setType(movement.type);
        setConcept(movement.concept);
        setCategory(movement.category);
        setAmount(String(movement.amount));
        setDate(movement.date);
        setIsRecurring(Boolean(movement.isRecurring));
      } catch (error) {
        console.error('Error cargando movimiento:', error);
      }
    }

    fetchMovementToEdit();
  }, [isEditing, movementId]);

  function validateForm() {
    const newErrors = {};

    if (!type) newErrors.type = 'Selecciona un tipo';
    if (!concept.trim()) newErrors.concept = 'Introduce un concepto';
    if (!category) newErrors.category = 'Selecciona una categoría';
    if (!amount || Number(amount) <= 0) newErrors.amount = 'Introduce un importe válido';
    if (!date) newErrors.date = 'Selecciona una fecha';

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    const token = localStorage.getItem('token');
    const recurringDay = isRecurring ? Number(date.split('-')[2]) : null;

    const movementData = {
      type,
      concept: concept.trim(),
      category,
      amount: Number(amount),
      date,
      isRecurring,
      recurringDay,
      recurringParentId: null,
      createdAutomatically: false,
    };

    try {
      const response = await fetch(isEditing ? `${API_URL}/api/movements/${movementId}` : `${API_URL}/api/movements`, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(movementData),
      });

      if (!response.ok) {
        setErrors({ general: 'No se ha podido guardar el movimiento' });
        return;
      }

      navigate('/movimientos');
    } catch (error) {
      setErrors({ general: 'No se ha podido conectar con el servidor' });
    }
  }

  return (
    <Layout>
      <header className="main-header">
        <div>
          <h1>{isEditing ? 'Editar movimiento' : 'Nuevo movimiento'}</h1>
          <p>{isEditing ? 'Modifica los datos del movimiento.' : 'Registra un ingreso o un gasto.'}</p>
        </div>
      </header>

      <section className="movement-form-page">
        <article className="card movement-form-card">
          <form onSubmit={handleSubmit} noValidate>
            {errors.general && <small className="error-message">{errors.general}</small>}

            <div className="form-group">
              <label htmlFor="type">Tipo</label>
              <select
                id="type"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setCategory('');
                  if (e.target.value !== 'expense') {
                    setIsRecurring(false);
                  }
                }}
                className={errors.type ? 'input-error' : ''}
              >
                <option value="">Selecciona una opción</option>
                <option value="income">Ingreso</option>
                <option value="expense">Gasto</option>
              </select>
              <small className="error-message">{errors.type}</small>
            </div>

            <div className="form-group">
              <label htmlFor="concept">Concepto</label>
              <input
                type="text"
                id="concept"
                placeholder="Ej. supermercado"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                className={errors.concept ? 'input-error' : ''}
              />
              <small className="error-message">{errors.concept}</small>
            </div>

            <div className="form-group">
              <label htmlFor="category">Categoría</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={errors.category ? 'input-error' : ''}
                disabled={!type}
              >
                <option value="">{type ? 'Selecciona una categoría' : 'Selecciona primero un tipo'}</option>

                {availableCategories.map((categoryOption) => (
                  <option key={categoryOption} value={categoryOption}>
                    {categoryOption}
                  </option>
                ))}
              </select>
              <small className="error-message">{errors.category}</small>
            </div>

            <div className="form-group">
              <label htmlFor="amount">Importe</label>
              <input
                type="number"
                id="amount"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={errors.amount ? 'input-error' : ''}
              />
              <small className="error-message">{errors.amount}</small>
            </div>

            <div className="form-group">
              <label htmlFor="date">Fecha</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={errors.date ? 'input-error' : ''}
              />
              <small className="error-message">{errors.date}</small>
            </div>

            {type === 'expense' && (
              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
                  Marcar como gasto recurrente
                </label>
                <small>Se añadirá automáticamente en los próximos meses.</small>
              </div>
            )}

            <button type="submit" className="btn-primary">
              {isEditing ? 'Guardar cambios' : 'Guardar movimiento'}
            </button>
          </form>
        </article>
      </section>
    </Layout>
  );
}

export default MovimientoForm;
