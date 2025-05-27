async function registrarUsuario(event) {
  event.preventDefault();

  const nombre = document.getElementById('nombre').value.trim();
  const apellido = document.getElementById('apellido').value.trim();
  const correo = document.getElementById('correo').value.trim();
  const contrasena = document.getElementById('contrasena').value;


  if (!nombre || !apellido || !correo || !contrasena) {
    alert('Todos los campos son obligatorios');
    return;
  }

  const nombreCompleto = `${nombre} ${apellido}`;

  const data = {
    nombre: nombreCompleto,
    correo,
    contrasena
  };

  console.log('Body que se enviará:', data);

  try {
    const response = await fetch('http://localhost:3000/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      alert('Error: ' + (result.error || 'Error desconocido'));
      return;
    }

    alert('Usuario registrado correctamente');

  } catch (error) {
    alert('Error al registrar: ' + error.message);
  }
}

async function iniciarSesion(event) {
  event.preventDefault();

  const correo = document.getElementById('correo').value.trim();
  const contrasena = document.getElementById('contrasena').value;

  if (!correo || !contrasena) {
    alert('Por favor ingresa correo y contraseña');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena })
    });

    const result = await response.json();

    console.log('Respuesta completa del backend:', result);

    if (!response.ok) {
      alert('Error: ' + (result.error || 'Credenciales incorrectas'));
      return;
    }

    localStorage.setItem('usuarioLogueado', result.nombre || correo);

    alert('¡Login exitoso!');
      if (correo.toLowerCase().endsWith('@ferremax.cl')) {
        window.location.href = 'productos.html';
      } else {
        window.location.href = 'index.html'; 
      }


  } catch (error) {
    alert('Error al conectar con el servidor: ' + error.message);
  }
}
