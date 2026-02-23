const comandaData = require("../mocks/comanda_mock");

async function seedComanda(connection) {

    try{
        console.log("Iniciando seed");

        await connection.query("TRUNCATE TABLE comandas");

        for (const comanda of comandaData){
            await connection.query(
                "INSERT INTO comandas (mesa, status, itens, total) VALUES (?, ?, ?, ?)"
                , [comanda.mesa, comanda.status, JSON.stringify(comanda.itens), comanda.total]);
        }

        console.log("Seed do cardápio concluída");
    } catch (e){
        console.log("Erro ao rodar seed: ", e);
    } 
    
}

module.exports = seedComanda;