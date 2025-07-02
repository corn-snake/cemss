// Modifica la función del formulario de login para aceptar cualquier dato
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Obtener valores del formulario (aunque no los validaremos)
    const username = document.getElementById('username').value || 'Usuario';
    const password = document.getElementById('password').value;
    
    // Guardar el nombre del usuario en localStorage para mostrarlo en la pantalla de bienvenida
    localStorage.setItem('studentName', username);
    
    // Redirigir a la pantalla del alumno
    window.location.href = 'alumno.html';
    
    // Opcional: Mostrar mensaje de bienvenida en consola
    console.log(`Bienvenido ${username}, redirigiendo al panel...`);
  });
  
  // Función para simular logout (ya existente)
  document.getElementById('logout-btn')?.addEventListener('click', function() {
    if(confirm('¿Estás seguro que deseas cerrar tu sesión?')) {
      localStorage.removeItem('studentName');
      window.location.href = 'index.html';
    }
  });
// Función para cerrar sesión
document.getElementById('logout-btn').addEventListener('click', function() {
    if(confirm('¿Estás seguro que deseas cerrar tu sesión?')) {
      // Aquí iría la lógica para cerrar sesión
      // Por ejemplo:
      // localStorage.removeItem('userToken');
      // window.location.href = 'index.html';
      alert('Sesión cerrada con éxito');
      window.location.href = 'index.html';
    }
  });
  
  // Simulación de datos del alumno (en un caso real esto vendría de una API)
  document.addEventListener('DOMContentLoaded', function() {
    // Obtener el nombre del alumno (simulado)
    const studentName = localStorage.getItem('studentName') || 'Juan Pérez';
    document.getElementById('student-name').textContent = studentName;
    
    // Eventos para las opciones de calificaciones
    document.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        const option = this.textContent;
        alert(`Mostrando: ${option}`);
        // Aquí iría la lógica para mostrar las calificaciones correspondientes
      });
    });
    
    // Eventos para los botones de actividades
    document.querySelectorAll('.actividad-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const actividad = this.closest('.actividad-card').querySelector('h3').textContent;
        alert(`Acción para: ${actividad}`);
        // Aquí iría la lógica para cada acción
      });
    });
  });