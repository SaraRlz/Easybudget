import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { API_URL } from '../config/api';
import '../styles/compra.css';

function Compra() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const token = localStorage.getItem('token');

  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [products, setProducts] = useState([]);
  const [movementId, setMovementId] = useState(null);

  const total = products.reduce((sum, product) => sum + Number(product.price), 0);

  useEffect(() => {
    loadMovement();
  }, [date]);

  async function loadMovement() {
    try {
      const response = await fetch(`${API_URL}/api/movements`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) return;

      const movement = data.find((m) => m.isShoppingMovement && m.date === date && m.userId === currentUser.id);

      if (!movement) {
        setProducts([]);
        setMovementId(null);
        return;
      }

      setProducts(movement.products || []);
      setMovementId(movement.id);
    } catch (error) {
      console.error('Error cargando compra:', error);
    }
  }

  function formatDateSpanish(date) {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleString('es-ES', { month: 'long' });

    return `Compra del ${day} de ${month}`;
  }

  async function syncMovement(updatedProducts) {
    const concept = formatDateSpanish(date);

    if (updatedProducts.length === 0 && movementId) {
      await fetch(`${API_URL}/api/movements/${movementId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMovementId(null);
      setProducts([]);
      return;
    }

    const movementData = {
      type: 'expense',
      concept,
      category: 'Comida',
      amount: updatedProducts.reduce((sum, p) => sum + Number(p.price), 0),
      date,
      isRecurring: false,
      recurringDay: null,
      recurringParentId: null,
      createdAutomatically: true,
      isShoppingMovement: true,
      products: updatedProducts,
    };

    try {
      const response = await fetch(movementId ? `${API_URL}/api/movements/${movementId}` : `${API_URL}/api/movements`, {
        method: movementId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(movementData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert('Error sincronizando compra');
        return;
      }

      setMovementId(data.id || movementId);
      setProducts(updatedProducts);
    } catch (error) {
      console.error(error);
      alert('Error conectando con el servidor');
    }
  }

  function handleAddProduct(e) {
    e.preventDefault();

    if (!productName.trim() || !productPrice || Number(productPrice) <= 0) {
      alert('Introduce un producto y un precio válido');
      return;
    }

    const newProduct = {
      id: crypto.randomUUID(),
      name: productName.trim(),
      price: Number(productPrice),
    };

    const updatedProducts = [...products, newProduct];

    syncMovement(updatedProducts);

    setProductName('');
    setProductPrice('');
  }

  function handleDeleteProduct(productId) {
    const updatedProducts = products.filter((p) => p.id !== productId);
    syncMovement(updatedProducts);
  }

  return (
    <Layout>
      <header className="main-header">
        <div>
          <h1>Compra</h1>
          <p>Añade productos y genera automáticamente un gasto.</p>
        </div>
      </header>

      <section className="shopping-summary">
        <article className="card summary-card">
          <span>Total compra</span>
          <h3>{total.toFixed(2)} €</h3>
          <p>Se sincroniza con movimientos</p>
        </article>

        <article className="card summary-card">
          <span>Productos</span>
          <h3>{products.length}</h3>
          <p>Artículos añadidos</p>
        </article>
      </section>

      <section className="shopping-grid">
        <article className="card shopping-form-card">
          <div className="card-header">
            <h2>Nueva compra</h2>
          </div>

          <form onSubmit={handleAddProduct}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <input
              type="text"
              placeholder="Producto"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Precio"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
            />

            <button type="submit">Añadir</button>
          </form>
        </article>

        <article className="card shopping-list-card">
          <h2>Compra del día</h2>

          {products.length === 0 ? (
            <p>No hay productos</p>
          ) : (
            <div>
              {products.map((p) => (
                <div key={p.id}>
                  <strong>{p.name}</strong>
                  <span>{p.price.toFixed(2)} €</span>
                  <button onClick={() => handleDeleteProduct(p.id)}>Eliminar</button>
                </div>
              ))}

              <strong>Total: {total.toFixed(2)} €</strong>
            </div>
          )}
        </article>
      </section>
    </Layout>
  );
}

export default Compra;
