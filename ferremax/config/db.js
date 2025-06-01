const oracledb = require('oracledb');
oracledb.fetchAsString = [ oracledb.CLOB ]; 
require('dotenv').config();
const path = require('path');

if (process.platform === 'win32' && process.env.ORACLE_CLIENT_PATH) {
  try {
    oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_PATH });
    console.log('✅ Oracle Client inicializado correctamente');
  } catch (err) {
    console.error('❌ Error al iniciar Oracle Client:', err);
    process.exit(1);
  }
}

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
process.env.TNS_ADMIN = path.resolve(__dirname, process.env.WALLET_PATH);

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_ALIAS,
};

async function getConnection() {
  try {
    console.log('🌐 Intentando conectar a Oracle...');
    const conn = await oracledb.getConnection(dbConfig);
    console.log('✅ Conexión a Oracle establecida con wallet');
    return conn;
  } catch (err) {
    console.error('❌ Error en la conexión Oracle TLS:', err);
    throw err;
  }
}

module.exports = { getConnection };
