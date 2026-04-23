const pool = require("./services/database");
const seedCardapio = require("./database/seeds/seed_cardapio");
const seedComanda = require("./database/seeds/seed_comanda");

async function runSeeders() {
  const connection = await pool.getConnection();

  try {
    console.log("\n🌱 INICIANDO PROCESSO DE SEEDING");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("🔄 Iniciando transação SQL (BEGIN)...\n");
    await connection.query("BEGIN");

    await seedCardapio(connection);
    await seedComanda(connection);

    console.log("✅ Fazendo COMMIT...\n");
    await connection.query("COMMIT");

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 SEEDING CONCLUÍDO COM SUCESSO!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error) {
    console.error("\n❌ ERRO DURANTE O SEEDING!");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error(`Mensagem: ${error.message}`);

    if (error.code) {
      console.error(`Código MySQL: ${error.code}`);
    }

    console.error("\n🔙 Fazendo ROLLBACK da transação...");
    console.error("   (Todos os dados inseridos serão REVERTIDOS)\n");

    await connection.query("ROLLBACK");
  } finally {
    connection.release();
    console.log("👋 Conexão com o banco encerrada.\n");

    await pool.end();
    process.exit(0);
  }
}

runSeeders();