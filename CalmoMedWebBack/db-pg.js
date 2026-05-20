const dns = require('dns');
const { Client } = require('pg');

function lookup4(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  dns.lookup(hostname, { family: 4 }, (err, address, family) => {
    callback(err, address, family);
  });
}

const client = new Client({
  host: 'db.xwcyarzovlpdcalbjiza.supabase.co',
  port: 5432,
  user: 'postgres',
  password: process.env.DB_PASSWORD || 'polentacomqueijo123',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  lookup: lookup4
});

module.exports = client;
