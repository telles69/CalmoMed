require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seedOccupancyReports() {
  console.log('\n=== POPULANDO TABELA occupancy_reports ===\n');

  try {
    // Buscar todos os postos
    const { data: postos, error: postosError } = await supabase
      .from('postos')
      .select('id, name, latitude, longitude');

    if (postosError) {
      console.error('Erro ao buscar postos:', postosError);
      return;
    }

    console.log(`Encontrados ${postos.length} postos\n`);

    // Buscar perfis de usuários para usar como autores dos relatórios
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id');

    if (profilesError) {
      console.error('Erro ao buscar perfis:', profilesError);
      return;
    }

    console.log(`Encontrados ${profiles.length} perfis de usuários\n`);

    // Gerar relatórios para cada posto
    const reports = [];
    
    for (const posto of postos) {
      // Gerar 3-5 relatórios por posto com datas diferentes
      const numReports = Math.floor(Math.random() * 3) + 3; // 3 a 5 relatórios
      
      for (let i = 0; i < numReports; i++) {
        // Selecionar usuário aleatório
        const randomProfile = profiles[Math.floor(Math.random() * profiles.length)];
        
        // Gerar número aleatório de pessoas (0-80)
        const peopleCount = Math.floor(Math.random() * 80);
        
        // Gerar timestamp aleatório nos últimos 7 dias
        const daysAgo = Math.floor(Math.random() * 7);
        const hoursAgo = Math.floor(Math.random() * 24);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        date.setHours(date.getHours() - hoursAgo);
        
        // Gerar localização próxima ao posto (variação de ~0.01 graus, aproximadamente 1km)
        const latVariation = (Math.random() - 0.5) * 0.02;
        const lngVariation = (Math.random() - 0.5) * 0.02;
        
        const userLocation = {
          type: 'Point',
          coordinates: [
            parseFloat(posto.longitude) + lngVariation,
            parseFloat(posto.latitude) + latVariation
          ]
        };
        
        // Calcular distância aproximada (em metros)
        const distance = Math.sqrt(
          Math.pow(latVariation * 111000, 2) + 
          Math.pow(lngVariation * 111000, 2)
        );

        reports.push({
          posto_id: posto.id,
          user_id: randomProfile.id,
          people_count: peopleCount,
          user_location: userLocation,
          distance_to_posto: Math.round(distance),
          created_at: date.toISOString()
        });
      }
    }

    console.log(`Gerando ${reports.length} relatórios de ocupação...\n`);

    // Inserir relatórios em lotes de 50
    const batchSize = 50;
    for (let i = 0; i < reports.length; i += batchSize) {
      const batch = reports.slice(i, i + batchSize);
      const { error } = await supabase
        .from('occupancy_reports')
        .insert(batch);

      if (error) {
        console.error(`Erro ao inserir lote ${i / batchSize + 1}:`, error);
      } else {
        console.log(`Lote ${i / batchSize + 1} inserido com sucesso (${batch.length} registros)`);
      }
    }

    console.log('\n=== POPULAÇÃO CONCLUÍDA ===\n');
    console.log(`Total de relatórios criados: ${reports.length}`);
    console.log('Postos com relatórios:');
    
    for (const posto of postos) {
      const postoReports = reports.filter(r => r.posto_id === posto.id);
      console.log(`  - ${posto.name}: ${postoReports.length} relatórios`);
    }

  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar script
seedOccupancyReports()
  .then(() => {
    console.log('\nScript finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
