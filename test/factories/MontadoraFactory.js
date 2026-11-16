import { connection } from "../../src/configs/Database.js";

export class MontadoraFactory {

    static async create(Nome, Pais) {
        const [result] = await connection.execute(
            `INSERT INTO montadoras (Nome, Pais) VALUES (?, ?);`,
            [Nome, Pais]
        );

        return {
            Id: result.insertId,
            Nome,
            Pais
        };
    }

    static async put(Id, Nome, Pais) {
        const [result] = await connection.execute(
            `UPDATE montadoras SET Nome = ?, Pais = ? WHERE Id = ?;`,
            [Nome, Pais, Id]
        );

        return {
            affectedRows: result.affectedRows,
            Nome,
            Pais
        };
    }

    static async delete(Id) {
        const [result] = await connection.execute(
            `DELETE FROM montadoras WHERE Id = ?;`,
            [Id]
        );

        return {
            affectedRows: result.affectedRows
        };
    }

    static async get() {
        const [rows] = await connection.execute(
            `SELECT * FROM montadoras;`
        );

        return rows;
    }

    static async getById(Id) {
        const [rows] = await connection.execute(
            `SELECT * FROM montadoras WHERE Id = ?;`,
            [Id]
        );

        return rows[0];
    }
}