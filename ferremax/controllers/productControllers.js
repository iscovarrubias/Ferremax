const oracledb = require('oracledb');
const { getConnection } = require('../config/db');

exports.getTabla = async (req, res) => {
const nombreTabla = req.params.nombre.toUpperCase();


  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT * FROM "${nombreTabla}"`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({
      tabla: nombreTabla,
      columnas: result.metaData.map(col => col.name),
      filas: result.rows.length,
      datos: result.rows
    });
  } catch (error) {
    console.error(`❌ Error consultando la tabla ${nombreTabla}`, error);
    res.status(500).json({
      error: `No se pudo consultar la tabla "${nombreTabla}"`,
      detalles: error.message
    });
  } finally {
    if (connection) await connection.close();
  }
};

exports.getAllProductos = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT * FROM PRODUCTOS`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Error obteniendo productos', error);
    res.status(500).json({ error: 'Error obteniendo productos', detalles: error.message });
  } finally {
    if (connection) await connection.close();
  }
};


exports.getProductoById = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT * FROM PRODUCTOS WHERE ID_PRODUCTO = :id`,
      [id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json(result.rows[0]); 
  } catch (error) {
    console.error('❌ Error obteniendo producto por ID', error);
    res.status(500).json({ error: 'Error al obtener producto', detalles: error.message });
  } finally {
    if (connection) await connection.close();
  }
};

exports.createProducto = async (req, res) => {
  const { nombre, descripcion, precio, stock, categoria } = req.body;
  if (!nombre || !descripcion || precio == null || stock == null || !categoria) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  let connection;
  try {
    connection = await getConnection();
    await connection.execute(
      `INSERT INTO PRODUCTOS (NOMBRE, DESCRIPCION, PRECIO, STOCK, CATEGORIA)
       VALUES (:nombre, :descripcion, :precio, :stock, :categoria)`,
      { nombre, descripcion, precio, stock, categoria },
      { autoCommit: true }
    );

    res.status(201).json({ mensaje: 'Producto creado correctamente' });
  } catch (error) {
    console.error('❌ Error al crear producto', error);
    res.status(500).json({ error: 'No se pudo crear el producto', detalles: error.message });
  } finally {
    if (connection) await connection.close();
  }
};

exports.updateProducto = async (req, res) => {
  const id = Number(req.params.id);

  console.log("🔍 Producto Actualizado :", req.body); 
  const body = {};
  for (let key in req.body) {
    body[key.toLowerCase()] = req.body[key];
  }

  const { nombre, descripcion, precio, stock, categoria } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  if (!nombre || !descripcion || precio == null || stock == null || !categoria) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `UPDATE PRODUCTOS SET
         NOMBRE = :nombre,
         DESCRIPCION = :descripcion,
         PRECIO = :precio,
         STOCK = :stock,
         CATEGORIA = :categoria
       WHERE ID_PRODUCTO = :id`,
      { nombre, descripcion, precio, stock, categoria, id },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json({ mensaje: 'Producto actualizado correctamente' });
  } catch (error) {
    console.error('❌ Error actualizando producto', error);
    res.status(500).json({ error: 'No se pudo actualizar el producto', detalles: error.message });
  } finally {
    if (connection) await connection.close();
  }
};


exports.deleteProducto = async (req, res) => {
  const id = Number(req.params.id);
  console.log("➡️ Solicitando DELETE para ID:", id); 
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  let connection;
  try {
    console.log("Ejecutando DELETE en BD para ID:", id);
    connection = await getConnection();
    const result = await connection.execute(
      `DELETE FROM PRODUCTOS WHERE ID_PRODUCTO = :id`,
      [id],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error eliminando producto', error);
    res.status(500).json({ error: 'No se pudo eliminar el producto', detalles: error.message });
  } finally {
    if (connection) await connection.close();
  }
};
