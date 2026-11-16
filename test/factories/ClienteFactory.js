import { connection } from '../../src/configs/Database.js';

export class ClienteFactory {
    static async create(Nome, CPF, CEP, Logradouro, Bairro, Cidade, UF, Numero, Complemento){
        const [result] = await connection.execute(
            `INSERT INTO clientes (Nome, CPF, CEP, Logradouro, Bairro, Cidade, UF, Numero, Complemento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [ Nome, CPF, CEP, Logradouro, Bairro, Cidade, UF, Numero, Complemento ]

        )

        return {
            id: result.insertId,
            Nome,
            CPF,
            CEP,
            Logradouro,
            Bairro,
            Cidade,
            UF,
            Numero,
            Complemento
        };
    }

         static async put(Id, Nome, CPF, CEP, Logradouro, Bairro, Cidade, UF, Numero, Complemento){
         const [result] = await connection.execute(
            `UPDATE clientes SET Nome = ?, CPF = ?, CEP = ?, Logradouro = ?, Bairro = ?, Cidade = ?, UF = ?, Numero = ?, Complemento = ? WHERE Id = ?;`,
            [Nome, CPF, CEP, Logradouro, Bairro, Cidade, UF, Numero, Complemento, Id]
         )

         return {
            affectedRows: result.affectedRows,
            Nome,
            CPF,
            CEP,
            Logradouro,
            Bairro,
            Cidade,
            UF,
            Numero,
            Complemento
        };
    }

    static async delete(Id){
         const [result] = await connection.execute(
            `DELETE FROM clientes WHERE Id = ?`,
            [Id]
         )

         return {
            affectedRows: result.affectedRows,
        };
    }

    static async get() {
    const [rows] = await connection.execute(
        `SELECT * FROM clientes`
    );

    return rows;
}

};