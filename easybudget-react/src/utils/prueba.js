// ===== DATOS PARA PRUEBA =====
document.addEventListener('DOMContentLoaded', function () {
  const users = JSON.parse(localStorage.getItem('users'));

  if (!users || users.length === 0) {
    const demoUser = [
      {
        id: 1,
        name: 'Prueba',
        email: 'prueba@test.com',
        password: '123456',
      },
    ];

    localStorage.setItem('users', JSON.stringify(demoUser));
    console.log('Usuario de prueba creado');
  }
});
