const { Sequelize } = require('sequelize');
const dns = require('dns');

try {
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
    console.log('DNS order set to ipv4first');
  } else {
    console.log('dns.setDefaultResultOrder not available on this Node version');
  }
} catch (err) {
  console.warn('Could not set DNS order:', err.message);
}

const sequelize = new Sequelize('postgres://postgres:polentacomqueijo123@db.xwcyarzovlpdcalbjiza.supabase.co:5432/postgres', {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false,
  pool: { max: 5, min: 0, idle: 10000 }
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco bem-sucedida (IPv4 forced).');
    await sequelize.close();
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
})();
