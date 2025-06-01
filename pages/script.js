const apiURL = 'http://localhost:3000/api/productos';
const contenedor = document.getElementById('productos-container');
const form = document.getElementById('formProducto');
const mensajeDiv = document.getElementById('mensaje');


function mostrarProductos(productos) {
  contenedor.innerHTML = '';

  productos.forEach(prod => {
    const productoDiv = document.createElement('div');
    productoDiv.className = 'producto';
    productoDiv.innerHTML = `
      <div class="contenido">
        <h2>${prod.nombre}</h2>
        <p>Descripción: ${prod.descripcion}</p>
        <p>Precio: $${prod.precio}</p>
        <p>Stock: ${prod.stock}</p>
        <p>Categoría: ${prod.categoria}</p>
        <button>Comprar</button>
      </div>
    `;
    contenedor.appendChild(productoDiv);
  });
}

function cargarProductos() {
  fetch(apiURL)
    .then(res => res.ok ? res.json() : Promise.reject('Error al obtener productos'))
    .then(data => {
      console.log("Respuesta completa del GET:", data);

      const productos = data.map(prod => {
        const prodMin = {};
        for (let clave in prod) {
          prodMin[clave.toLowerCase()] = prod[clave];
        }
        return prodMin;
      });

      console.log("Productos transformados:", productos);
      mostrarProductos(productos);  
    })
    .catch(err => {
      console.error(err);
      contenedor.innerHTML = `<p>Error cargando productos.</p>`;
    });
}

// Cargar productos al iniciar
cargarProductos();

// Manejar formulario de agregar producto
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const producto = {
      nombre: formData.get('nombre'),
      descripcion: formData.get('descripcion'),
      precio: parseFloat(formData.get('precio')),
      stock: parseInt(formData.get('stock')),
      categoria: formData.get('categoria')
    };

    console.log("Producto a enviar:", producto);

    try {
      const res = await fetch(apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producto)
      });

      const data = await res.json();

      if (res.ok) {
        mensajeDiv.textContent = '✅ Producto agregado correctamente';
        mensajeDiv.style.color = 'green';
        form.reset();
        cargarProductos();
      } else {
        mensajeDiv.textContent = `❌ Error: ${data.error || 'No se pudo agregar el producto'}`;
        mensajeDiv.style.color = 'red';
      }
    } catch (error) {
      mensajeDiv.textContent = '⚠️ Error de conexión con el servidor';
      mensajeDiv.style.color = 'red';
      console.error(error);
    }
  });


}
