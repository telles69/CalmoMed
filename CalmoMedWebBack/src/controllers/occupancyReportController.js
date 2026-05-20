require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const get = async (req, res) => {
  try {
    const { data, error } = await supabase.from('occupancy_reports').select('*');
    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { data, error } = await supabase.from('occupancy_reports').insert([req.body]).select();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('occupancy_reports')
      .update(req.body)
      .eq('id', id)
      .select();
    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ message: 'Relatório não encontrado' });
    res.json(data[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('occupancy_reports')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.json({ message: 'Relatório removido' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Buscar relatórios por posto_id
const getByPosto = async (req, res) => {
  try {
    const { postoId } = req.params;
    const { data, error } = await supabase
      .from('occupancy_reports')
      .select('*')
      .eq('posto_id', postoId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obter estatísticas de lotação por período
const getOccupancyStats = async (req, res) => {
  try {
    const { period = 'hour', postoId, startDate: customStartDate, endDate: customEndDate } = req.query;
    
    let startDate, endDate;
    let groupByFormat;
    
    // SEMPRE usar o período especificado pelo usuário
    groupByFormat = period;
    
    // Se datas customizadas forem fornecidas, usar elas
    if (customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999); // Final do dia
    } else {
      // Usar período padrão
      endDate = new Date();
      startDate = new Date();
      
      switch (period) {
        case 'hour':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case 'day':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 28);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        default:
          startDate.setHours(startDate.getHours() - 24);
      }
    }

    // Query base
    let query = supabase
      .from('occupancy_reports')
      .select('people_count, created_at, posto_id')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    // Filtrar por posto se especificado
    if (postoId && postoId !== 'geral') {
      query = query.eq('posto_id', parseInt(postoId));
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    console.log(`\n📊 getOccupancyStats - Posto: ${postoId || 'geral'}, Período: ${groupByFormat}`);
    console.log(`   Registros encontrados: ${data.length}`);

    // Processar dados para agrupar por período
    const groupedData = {};
    
    data.forEach(report => {
      const date = new Date(report.created_at);
      let key;
      
      switch (groupByFormat) {
        case 'hour':
          // Chave: data + hora (ex: "2025-11-26T14")
          const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}`;
          key = hourKey;
          break;
        case 'day':
          // Chave: data completa (ex: "2025-11-26")
          const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          key = dayKey;
          break;
        case 'week':
          // Chave: ano + número da semana (ex: "2025-W47")
          const firstDay = new Date(date.getFullYear(), 0, 1);
          const days = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
          const weekNum = Math.ceil((days + firstDay.getDay() + 1) / 7);
          key = `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
          break;
        case 'month':
          // Chave: ano + mês (ex: "2025-11")
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          key = monthKey;
          break;
      }
      
      if (!groupedData[key]) {
        groupedData[key] = { total: 0, count: 0 };
      }
      
      groupedData[key].total += report.people_count;
      groupedData[key].count += 1;
    });

    // Calcular médias e ordenar por data
    const stats = Object.keys(groupedData)
      .sort()
      .map(key => {
        // Se postoId é 'geral' ou não especificado, retornar SOMA total ao invés de média
        // Isso representa o total de pessoas no sistema naquele período
        const isGeneralView = !postoId || postoId === 'geral';
        
        return {
          period: key,
          periodType: groupByFormat,
          averageOccupancy: isGeneralView 
            ? groupedData[key].total  // SOMA total para visão geral
            : Math.round(groupedData[key].total / groupedData[key].count), // MÉDIA para posto específico
          reportCount: groupedData[key].count
        };
      });

    console.log(`   Períodos processados: ${stats.length}`);
    if (stats.length > 0) {
      const isGeneralView = !postoId || postoId === 'geral';
      console.log(`   Tipo de cálculo: ${isGeneralView ? 'SOMA total' : 'MÉDIA'}`);
      console.log(`   Primeiro período:`, stats[0]);
      console.log(`   Último período:`, stats[stats.length - 1]);
    }

    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obter estatísticas gerais de todos os postos
const getGeneralStats = async (req, res) => {
  try {
    const { startDate: customStartDate, endDate: customEndDate } = req.query;
    
    // Definir intervalo de tempo
    let startDate, endDate;
    
    if (customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Padrão: últimas 24 horas
      endDate = new Date();
      startDate = new Date();
      startDate.setHours(startDate.getHours() - 24);
    }
    
    // Buscar todos os postos
    const { data: postos, error: postosError } = await supabase
      .from('postos')
      .select('id, name');
    
    if (postosError) throw postosError;
    
    const { data: reports, error: reportsError } = await supabase
      .from('occupancy_reports')
      .select('people_count, posto_id, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    
    if (reportsError) throw reportsError;

    // Agrupar por posto
    const postoStats = postos.map(posto => {
      const postoReports = reports.filter(r => r.posto_id === posto.id);
      
      if (postoReports.length === 0) {
        return {
          postoId: posto.id,
          postoName: posto.name,
          averageOccupancy: 0,
          reportCount: 0,
          maxOccupancy: 0,
          minOccupancy: 0
        };
      }

      const occupancies = postoReports.map(r => r.people_count);
      const sum = occupancies.reduce((a, b) => a + b, 0);
      
      return {
        postoId: posto.id,
        postoName: posto.name,
        averageOccupancy: Math.round(sum / occupancies.length),
        reportCount: postoReports.length,
        maxOccupancy: Math.max(...occupancies),
        minOccupancy: Math.min(...occupancies)
      };
    });

    res.status(200).json(postoStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { get, create, update, destroy, getByPosto, getOccupancyStats, getGeneralStats };
