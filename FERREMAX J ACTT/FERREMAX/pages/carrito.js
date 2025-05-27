document.addEventListener('DOMContentLoaded', () => {
  renderizarCarrito();
});

async function renderizarCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const contenedor = document.getElementById('carrito');
  const total = document.getElementById('total');
  contenedor.innerHTML = '';
  total.textContent = '';

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p>El carrito está vacío.</p>";
    return;
  }

  let suma = 0;

  for (const prodCarrito of carrito) {
  try {
    const res = await fetch(`http://localhost:3000/api/productos/id/${prodCarrito.id}`);

    if (!res.ok) {
      console.warn(`Producto con ID ${prodCarrito.id} no encontrado`);
      continue;
    }

    const data = await res.json();

    const producto = data; // directamente
    console.log("Producto cargado:", producto);

    // Convertir propiedades a minúsculas
    const prod = {};
    for (const key in producto) {
      prod[key.toLowerCase()] = producto[key];
    }

    if (!prod.id_producto) continue;

    const subtotal = prod.precio * prodCarrito.cantidad;
    suma += subtotal;

    const div = document.createElement('div');
    div.className = 'producto';

    div.innerHTML = `
      <h3>${prod.nombre}</h3>
      <p>Descripción: ${prod.descripcion}</p>
      <p>Precio unitario: $${prod.precio}</p>
      <p>Cantidad: ${prodCarrito.cantidad}</p>
      <p>Subtotal: $${subtotal}</p>
      <button onclick="eliminarProducto(${prod.id_producto})">Eliminar uno</button>
    `;

    contenedor.appendChild(div);
  } catch (error) {
    console.error('Error cargando producto', error);
  }
}

  total.textContent = `Total: $${suma}`;
}

function eliminarProducto(id) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const index = carrito.findIndex(p => p.id === id);
  if (index !== -1) {
    if (carrito[index].cantidad > 1) {
      carrito[index].cantidad--;
    } else {
      carrito.splice(index, 1);
    }
  }
  localStorage.setItem('carrito', JSON.stringify(carrito));
  renderizarCarrito();
}

function vaciarCarrito() {
  localStorage.removeItem('carrito');
  renderizarCarrito();
}
