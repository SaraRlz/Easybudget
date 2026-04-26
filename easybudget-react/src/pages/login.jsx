import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
import '../styles/login.css';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    setEmailError('');
    setPasswordError('');

    let valid = true;

    if (!email.trim()) {
      setEmailError('Introduce tu correo electrónico');
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError('Introduce tu contraseña');
      valid = false;
    }

    if (!valid) return;

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(data.message || 'Correo o contraseña incorrectos');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));

      navigate('/dashboard');
    } catch (error) {
      setPasswordError('No se ha podido conectar con el servidor');
    }
  }

  return (
    <main className="auth-container">
      <section className="auth-info">
        <h1>Gestiona tus finanzas de forma inteligente</h1>
        <p>Controla tus gastos, define presupuestos y recibe recomendaciones para mejorar tu situación financiera.</p>
      </section>

      <section className="auth-form">
        <div className="form-card">
          <h2>Iniciar sesión</h2>
          <p>Accede a tu cuenta para continuar</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                placeholder="ejemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={emailError ? 'input-error' : ''}
              />
              <small className="error-message">{emailError}</small>
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={passwordError ? 'input-error' : ''}
              />
              <small className="error-message">{passwordError}</small>
            </div>

            <button type="submit" className="btn-primary">
              Entrar
            </button>
          </form>

          <div className="form-footer">
            <p>¿No tienes cuenta?</p>
            <Link to="/register">Crear cuenta</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;
