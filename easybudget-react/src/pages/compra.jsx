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
    async function loadMovement() {
      try {
        const response = await fetch(`${API_URL}/api/movements`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) return;

        const movement = data.find((m) => m.isShoppingMovement && m.date === date);

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

    loadMovement();
  }, [date, token]);

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

      setProducts([]);
      setMovementId(null);
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
      isShoppingMovement: true,
      createdAutomatically: true,
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
        alert(data.message || 'Error sincronizando compra');
        return;
      }

      setMovementId(data.id);
      setProducts(data.products || updatedProducts);
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

    syncMovement([...products, newProduct]);

    setProductName('');
    setProductPrice('');
  }

  function handleDeleteProduct(productId) {
    const updatedProducts = products.filter((product) => product.id !== productId);
    syncMovement(updatedProducts);
  }

  return (
    <Layout>
      <header className="main-header">
        <div>
          <h1>Compra</h1>
          <p>Añade productos de la compra y genera automáticamente un movimiento de comida.</p>
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
            <div>
              <h2>Nueva compra</h2>
              <p>Selecciona el día y añade productos.</p>
            </div>
          </div>

          <form className="shopping-form" onSubmit={handleAddProduct}>
            <div className="form-group">
              <label htmlFor="date">Fecha de compra</label>
              <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="productName">Producto</label>
              <input
                id="productName"
                type="text"
                placeholder="Ej. leche"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="productPrice">Precio</label>
              <input
                id="productPrice"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary">
              Añadir producto
            </button>
          </form>
        </article>

        <article className="card shopping-list-card">
          <div className="card-header">
            <div>
              <h2>Compra día {new Date(date).getDate()}</h2>
              <p>Detalle de productos añadidos.</p>
            </div>
          </div>

          {products.length === 0 ? (
            <p>No hay productos añadidos para esta fecha.</p>
          ) : (
            <div className="shopping-products">
              {products.map((product) => (
                <div className="shopping-product" key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <span>Producto de compra</span>
                  </div>

                  <div className="shopping-product-actions">
                    <strong>{Number(product.price).toFixed(2)} €</strong>
                    <button type="button" className="btn-delete" onClick={() => handleDeleteProduct(product.id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}

              <div className="shopping-total">
                <span>Total</span>
                <strong>{total.toFixed(2)} €</strong>
              </div>
            </div>
          )}
        </article>
      </section>
    </Layout>
  );
}

export default Compra;
