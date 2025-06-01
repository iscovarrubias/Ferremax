const oracledb = require('oracledb');
const { getConnection } = require('../config/db');


exports.getAllUsuarios = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT NOMBRE, CONTRASEÑA, CORREO, ROL, FECHA_CREACION FROM USUARIOS`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({
      usuarios: result.rows
    });
  } catch (error) {
    console.error('❌ Error al obtener usuarios', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  } finally {
    if (connection) await connection.close();
  }
};


// Registrar usuario
exports.createUsuario = async (req, res) => {
  console.log('Datos recibidos en backend:', req.body);

  const { nombre, correo, contrasena } = req.body;

  if (!nombre || !correo || !contrasena || nombre.trim() === '' || correo.trim() === '' || contrasena.trim() === '') {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  
  const esEmpleado = correo.trim().toLowerCase().endsWith('@ferremax.cl');
  const rol = esEmpleado ? 'empleado' : 'cliente';  

  let connection;
  try {
    connection = await getConnection();

    const exists = await connection.execute(
      `SELECT 1 FROM USUARIOS WHERE CORREO = :correo`,
      [correo],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (exists.rows.length > 0) {
      return res.status(409).json({ error: 'El usuario ya existe' });
    }

    // Insertar el usuario
    await connection.execute(
      `INSERT INTO USUARIOS (NOMBRE, CORREO, CONTRASEÑA, ROL, FECHA_CREACION)
       VALUES (:nombre, :correo, :contrasena, :rol, SYSTIMESTAMP)`,
      { nombre, correo, contrasena, rol },
      { autoCommit: true }
    );

    res.status(201).json({ mensaje: 'Usuario registrado correctamente', rol });

  } catch (error) {
    console.error('❌ Error al registrar usuario', error);
    res.status(500).json({ error: 'Error al registrar usuario', detalles: error.message });
  } finally {
    if (connection) await connection.close();
  }
};

// Iniciar sesión
exports.loginUsuario = async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT * FROM USUARIOS WHERE CORREO = :correo`,
      [correo],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = result.rows[0];

    if (usuario.CONTRASEÑA !== contrasena) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    res.status(200).json({ mensaje: 'Login exitoso', usuario });

  } catch (error) {
    console.error('❌ Error al iniciar sesión', error);
    res.status(500).json({ error: 'Error al iniciar sesión', detalles: error.message });
  } finally {
    if (connection) await connection.close();
  }
};