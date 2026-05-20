const client = require('./db-pg');

(async () => {
  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log('Conectado! Resultado:', res.rows);
  } catch (err) {
    console.error('Erro ao conectar com pg:', err);
  } finally {
    await client.end();
  }
})();
