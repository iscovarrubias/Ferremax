document.addEventListener('DOMContentLoaded', () => {
  renderizarCarrito();
  configurarPagoWebpay();
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
      const res = await fetch(`http://localhost:3000/api/productos/${prodCarrito.id}`);

      if (!res.ok) {
        console.warn(`Producto con ID ${prodCarrito.id} no encontrado`);
        continue;
      }

      const data = await res.json();

      const producto = data;
      console.log("Producto cargado:", producto);

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

function configurarPagoWebpay() {
  const botonPagar = document.getElementById('pagar-btn');
  if (!botonPagar) return;

  botonPagar.addEventListener('click', async () => {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    if (carrito.length === 0) {
      alert('El carrito está vacío o no hay monto válido para pagar.');
      return;
    }

    let monto = 0;

    for (const prod of carrito) {
      try {
        const res = await fetch(`http://localhost:3000/api/productos/${prod.id}`);
        if (!res.ok) continue;

        const data = await res.json();

        const producto = {};
        for (const key in data) {
          producto[key.toLowerCase()] = data[key];
        }

        monto += (producto.precio || 0) * (prod.cantidad || 1);
      } catch (error) {
        console.error('Error obteniendo producto para pago:', error);
      }
    }

    if (monto <= 0) {
      alert('El carrito está vacío o no hay monto válido para pagar.');
      return;
    }

    fetch('/webpay/pagar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monto,
        orden: 'ORD' + Date.now()
      })
    })
      .then(res => res.json())
      .then(data => {
        const form = document.createElement('form');
        form.action = data.url;
        form.method = 'POST';

        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'token_ws';
        input.value = data.token;

        form.appendChild(input);
        document.body.appendChild(form);
        form.submit(); // Redirige automáticamente
      })
      .catch(error => {
        console.error('Error al iniciar pago con Webpay:', error);
        alert('No se pudo iniciar el pago.');
      });
  });
}
