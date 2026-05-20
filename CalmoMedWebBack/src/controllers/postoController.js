require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const get = async (req, res) => {
  try {
    // Buscar todos os postos
    const { data: postos, error } = await supabase.from('postos').select('*');
    if (error) throw error;

    // Para cada posto, buscar o relatório de ocupação mais recente
    const postosComOcupacao = await Promise.all(
      postos.map(async (posto) => {
        const { data: reports } = await supabase
          .from('occupancy_reports')
          .select('*')
          .eq('posto_id', posto.id)
          .order('created_at', { ascending: false })
          .limit(1);

        // Calcular informações de ocupação agregadas
        let crowding_info = null;
        if (reports && reports.length > 0) {
          const latestReport = reports[0];
          crowding_info = {
            reportedQueue: latestReport.people_count || 0,
            occupancyPercentage: Math.min(100, Math.round((latestReport.people_count / 50) * 100)),
            lastUpdate: latestReport.created_at,
            distance_to_posto: latestReport.distance_to_posto
          };
        }

        // Garantir que contact seja string
        let contact = posto.contact;
        if (typeof contact === 'object') {
          if (Array.isArray(contact)) {
            contact = contact[0] || '';
          } else if (contact?.phone) {
            contact = contact.phone;
          } else {
            contact = '';
          }
        }

        return {
          ...posto,
          contact,
          crowding_info
        };
      })
    );

    res.status(200).json(postosComOcupacao);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    console.log('========================================')
    console.log('📏 REQUISIÇÃO RECEBIDA - CRIAR POSTO');
    console.log('========================================')
    console.log('Body recebido:', JSON.stringify(req.body, null, 2));
    console.log('========================================')
    
    // Garantir que contact seja sempre string
    const postoData = {
      ...req.body,
      contact: Array.isArray(req.body.contact) 
        ? req.body.contact[0] 
        : req.body.contact
    };
    
    const { data, error } = await supabase.from('postos').insert([postoData]).select();
    
    if (error) {
      console.error('❌ ERRO DO SUPABASE:', error);
      throw error;
    }
    
    console.log('✅ POSTO CRIADO COM SUCESSO:', data);
    console.log('========================================\n');
    
    res.status(201).json(data);
  } catch (err) {
    console.error('❌ ERRO NO CATCH:', err.message);
    console.error('Stack trace:', err.stack);
    console.log('========================================\n');
    res.status(400).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    console.log('========================================')
    console.log('📝 REQUISIÇÃO RECEBIDA - ATUALIZAR POSTO');
    console.log('ID:', req.params.id);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('========================================')
    
    const { id } = req.params;
    
    // Garantir que contact seja sempre string
    const postoData = {
      ...req.body,
      contact: Array.isArray(req.body.contact) 
        ? req.body.contact[0] 
        : req.body.contact
    };
    
    const { data, error } = await supabase
      .from('postos')
      .update(postoData)
      .eq('id', id)
      .select();
      
    if (error) {
      console.error('❌ ERRO DO SUPABASE:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('❌ Posto não encontrado');
      return res.status(404).json({ message: 'Posto não encontrado' });
    }
    
    console.log('✅ POSTO ATUALIZADO COM SUCESSO:', data);
    console.log('========================================\n');
    
    res.json(data[0]);
  } catch (err) {
    console.error('❌ ERRO NO CATCH:', err.message);
    console.log('========================================\n');
    res.status(400).json({ message: err.message });
  }
};

const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('postos')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.json({ message: 'Posto removido' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { get, create, update, destroy };
