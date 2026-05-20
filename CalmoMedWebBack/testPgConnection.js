const { Client } = require('pg');

const client = new Client({
  host: 'db.xwcyarzovlpdcalbjiza.supabase.co',
  port: 5432,
  user: 'postgres',
  password: 'polentacomqueijo123',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => {
    console.log('Conectado ao banco de dados com pg!');
    return client.end();
  })
  .catch((err) => {
    console.error('Erro ao conectar com pg:', err);
  });
