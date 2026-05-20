const supabase = require('./supabaseClient');

(async () => {
  // Troque 'sua_tabela' pelo nome da tabela e os campos conforme seu banco
  const { data, error } = await supabase
    .from('sua_tabela')
    .insert([{ campo1: 'valor1', campo2: 'valor2' }]);

  if (error) {
    console.error('Erro ao inserir:', error);
  } else {
    console.log('Dados inseridos:', data);
  }
})();
