import { connection } from "../../src/configs/Database.js";

export class VeiculoFactory {

    static async create(Modelo, Placa, Ano, Cor, Valor, IdCliente, IdMontadora) {
        const [result] = await connection.execute(
            `INSERT INTO veiculos
            (Modelo, Placa, Ano, Cor, Valor, IdCliente, IdMontadora) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [Modelo, Placa, Ano, Cor, Valor, IdCliente, IdMontadora]
        );

        return {
            Id: result.insertId,
            Modelo,
            Placa,
            Ano,
            Cor,
            Valor,
            IdCliente,
            IdMontadora
        };
    }

    static async put(Id, Modelo, Placa, Ano, Cor, Valor, IdCliente, IdMontadora) {
        const [result] = await connection.execute(
            `UPDATE veiculos SET Modelo = ?, Placa = ?, Ano = ?, Cor = ?, Valor = ?, IdCliente = ?, IdMontadora = ? WHERE Id = ?`,
            [Modelo, Placa, Ano, Cor, Valor, IdCliente, IdMontadora, Id]
        );

        return {
            affectedRows: result.affectedRows,
            Modelo,
            Placa,
            Ano,
            Cor,
            Valor,
            IdCliente,
            IdMontadora
        };
    }

    static async delete(Id) {
        const [result] = await connection.execute(
            `DELETE FROM veiculos WHERE Id = ?`,
            [Id]
        );

        return {
            affectedRows: result.affectedRows
        };
    }

    static async get() {
        const [rows] = await connection.execute(`SELECT * FROM veiculos`);

        return rows;
    }

    static async selecionar(Id) {
        const [rows] = await connection.execute(
            `SELECT * FROM veiculos WHERE Id = ?`,
            [Id]
        );

        return rows[0];
    }

}