import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { API_URL } from '../config/api';
import '../styles/perfil.css';

function Perfil() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSave(e) {
    e.preventDefault();

    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'No se ha podido actualizar el perfil');
        return;
      }

      localStorage.setItem('currentUser', JSON.stringify(data));

      setMessage('Perfil actualizado correctamente');
    } catch (error) {
      setError('No se ha podido conectar con el servidor');
    }
  }

  function handleLogout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    navigate('/login');
  }

  async function handleDeleteAccount() {
    const confirmDelete = confirm('¿Seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer.');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/users/me`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setError('No se ha podido eliminar la cuenta');
        return;
      }

      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');

      navigate('/login');
    } catch (error) {
      setError('No se ha podido conectar con el servidor');
    }
  }

  return (
    <Layout>
      <header className="main-header">
        <div>
          <h1>Perfil</h1>
          <p>Gestiona tus datos de usuario y preferencias básicas.</p>
        </div>
      </header>

      <section className="profile-grid">
        <article className="card profile-card">
          <div className="card-header">
            <div>
              <h2>Datos personales</h2>
              <p>Actualiza la información asociada a tu cuenta.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            {message && <small className="success-message">{message}</small>}
            {error && <small className="error-message">{error}</small>}

            <button type="submit" className="btn-primary">
              Guardar cambios
            </button>
          </form>
        </article>

        <article className="card profile-card">
          <div className="card-header">
            <div>
              <h2>Preferencias</h2>
              <p>Configuración visual y de uso.</p>
            </div>
          </div>

          <div className="setting-item">
            <div>
              <strong>Alertas internas</strong>
              <p>Mostrar avisos en dashboard y sección de alertas.</p>
            </div>
            <span>Activas</span>
          </div>

          <div className="setting-item">
            <div>
              <strong>Modo de análisis</strong>
              <p>Control mensual de presupuesto.</p>
            </div>
            <span>Mensual</span>
          </div>
        </article>
      </section>

      <section className="card security-card">
        <div className="card-header">
          <div>
            <h2>Seguridad y cuenta</h2>
            <p>Opciones relacionadas con la sesión y los datos almacenados.</p>
          </div>
        </div>

        <div className="security-actions">
          <button type="button" className="btn-secondary" onClick={handleLogout}>
            Cerrar sesión
          </button>

          <button type="button" className="btn-danger" onClick={handleDeleteAccount}>
            Eliminar cuenta
          </button>
        </div>
      </section>
    </Layout>
  );
}

export default Perfil;
