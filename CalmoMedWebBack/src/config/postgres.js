//nao está sendo mais usado, mas mantido para referencia futura
const { Sequelize } = require('sequelize');
const dns = require('dns');

function lookup4(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  dns.lookup(hostname, { family: 4 }, (err, address, family) => {
    callback(err, address, family);
  });
}

const sequelize = new Sequelize('postgres', 'postgres', 'polentacomqueijo123', {
  host: 'db.xwcyarzovlpdcalbjiza.supabase.co',
  port: 5432,
  dialect: 'postgres',
  dialectModule: require('pg'),
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    lookup: lookup4 // força IPv4
  },
  logging: false
});

module.exports = sequelize;



