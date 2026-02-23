const cardapioData = require("../mocks/cardapio_mock");

async function seedCardapio(connection) {

    try{
        console.log("Iniciando seed");

        await connection.query("TRUNCATE TABLE cardapio");
        

        
        for (const item of cardapioData){
            await connection.query(
                "INSERT INTO cardapio (nome, preco, descricao) VALUES (?, ?, ?)"
                , [item.nome, item.preco, item.descricao]);
        }

        console.log("Seed do cardápio concluída");
    } catch (e){
        console.log("Erro ao rodar seed: ", e);
    }
    
}

module.exports = seedCardapio;