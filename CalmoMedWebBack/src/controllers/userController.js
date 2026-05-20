require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const get = async (req, res) => {
  try {
    const { data, error } = await supabase.from('profiles').select('id, name, email, cpf, role, updated_at');
    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { name, email, password, cpf, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const { data, error } = await supabase.from('profiles').insert([{ name, email, password: hash, cpf, role }]).select();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, cpf, role } = req.body;
    const { data, error } = await supabase
      .from('profiles')
      .update({ name, email, cpf, role })
      .eq('id', id)
      .select();
    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json(data[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.json({ message: 'Usuário removido' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { get, create, update, destroy };
