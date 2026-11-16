import app from '../src/app.js';
import request from 'supertest';
import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearDatabase } from './utils/clearDatabase.js';
import { MontadoraFactory } from './factories/MontadoraFactory.js';
import { ClienteFactory } from './factories/ClienteFactory.js';
import { VeiculoFactory } from './factories/VeiculoFactory.js';

// O ViaCEP é uma API externa: nos testes ela é sempre mockada.
vi.mock('axios');

// Resposta padrão do ViaCEP para o CEP 13185-880
const respostaViaCep = {
    data: {
        cep: '13185-880',
        logradouro: 'Rua das Flores',
        bairro: 'Centro',
        localidade: 'Hortolândia',
        uf: 'SP'
    }
};

// Procura a mensagem de erro em qualquer lugar do corpo da resposta
// (message, error, data...), sem depender do nome exato da propriedade.
const corpoComo = (response) => JSON.stringify(response.body);

//--------------------------------------- MONTADORA (CT-001 a CT-012) -------------------------------

describe('API de montadoras', () => {

    beforeEach(async () => {
        await MontadoraFactory.create('Toyota', 'Japão');
        await MontadoraFactory.create('Honda', 'Japão');
        await MontadoraFactory.create('Ford', 'USA');

        vi.clearAllMocks();
    });

    afterEach(async () => {
        await clearDatabase();
        vi.clearAllMocks();
    });

    // ---------- POST ----------

    it('CT-001 - deve criar uma montadora com dados válidos.', async () => {
        const response = await request(app).post('/montadoras').send({
            nome: 'Ferrari',
            pais: 'Itália'
        });

        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('insertId');
    });

    it('CT-002 - não deve criar montadora com nome vazio.', async () => {
        const response = await request(app).post('/montadoras').send({
            nome: '',
            pais: 'Itália'
        });

        expect(response.status).toBe(500);
        expect(corpoComo(response)).toContain('Nome inválido');
    });

    it('CT-003 - não deve criar montadora com nome com menos de 3 caracteres.', async () => {
        const response = await request(app).post('/montadoras').send({
            nome: 'AB',
            pais: 'Itália'
        });

        expect(response.status).toBe(500);
        expect(corpoComo(response)).toContain('Nome inválido');
    });

    it('CT-004 - não deve criar montadora com nome com mais de 60 caracteres.', async () => {
        const response = await request(app).post('/montadoras').send({
            nome: 'A'.repeat(61),
            pais: 'Itália'
        });

        expect(response.status).toBe(500);
        expect(corpoComo(response)).toContain('Nome inválido');
    });

    it('CT-005 - não deve criar montadora com país vazio.', async () => {
        const response = await request(app).post('/montadoras').send({
            nome: 'Ferrari',
            pais: ''
        });

        expect(response.status).toBe(500);
        expect(corpoComo(response)).toContain('País inválido');
    });

    it('CT-006 - não deve criar montadora com país com menos de 2 caracteres.', async () => {
        const response = await request(app).post('/montadoras').send({
            nome: 'Ferrari',
            pais: 'A'
        });

        expect(response.status).toBe(500);
        expect(corpoComo(response)).toContain('País inválido');
    });

    // ---------- GET ----------

    it('CT-007 - deve listar as montadoras ordenadas por nome.', async () => {
        const response = await request(app).get('/montadoras');

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBeGreaterThan(0);

        const nomes = response.body.data.map(m => m.Nome ?? m.nome);
        const ordenados = [...nomes].sort((a, b) => a.localeCompare(b));
        expect(nomes).toEqual(ordenados);
    });

    it('deve buscar uma montadora por id.', async () => {
        const montadora = await MontadoraFactory.create('BMW', 'Alemanha');

        const response = await request(app).get('/montadoras?id=' + montadora.Id);

        expect(response.status).toBe(200);
    });

    // ---------- PUT ----------

    it('CT-008 - deve atualizar uma montadora existente.', async () => {
        const montadora = await MontadoraFactory.create('Ferrari', 'Itália');

        const response = await request(app)
            .put('/montadoras?id=' + montadora.Id)
            .send({
                nome: 'Ferrari SA',
                pais: 'Itália'
            });

        expect(response.status).toBe(200);

        const atualizada = await MontadoraFactory.getById(montadora.Id);
        expect(atualizada.Nome).toBe('Ferrari SA');
    });

    it('CT-009 - não deve atualizar uma montadora inexistente.', async () => {
        const response = await request(app)
            .put('/montadoras?id=999999')
            .send({
                nome: 'Ferrari SA',
                pais: 'Itália'
            });

        expect(response.status).toBe(404);
        expect(corpoComo(response)).toContain('Montadora não encontrada');
    });

    // ---------- DELETE ----------

    it('CT-010 - deve excluir uma montadora existente sem veículos vinculados.', async () => {
        const montadora = await MontadoraFactory.create('Fiat', 'Itália');

        const response = await request(app).delete('/montadoras/' + montadora.Id);

        expect(response.status).toBe(200);
        expect(await MontadoraFactory.getById(montadora.Id)).toBeUndefined();
    });

    it('CT-011 - não deve excluir uma montadora inexistente.', async () => {
        const response = await request(app).delete('/montadoras/999999');

        expect(response.status).toBe(404);
        expect(corpoComo(response)).toContain('Montadora não encontrada');
    });

    it('CT-012 - não deve excluir uma montadora com veículo vinculado (FK RESTRICT).', async () => {
        const montadora = await MontadoraFactory.create('Volkswagen', 'Alemanha');
        const cliente = await ClienteFactory.create(
            'João da Silva', '12345678901', '13185880',
            'Rua das Flores', 'Centro', 'Hortolândia', 'SP', '100', 'Casa'
        );
        await VeiculoFactory.create(
            'Gol', 'ABC1D23', 2020, 'Preto', 45000, cliente.id, montadora.Id
        );

        const response = await request(app).delete('/montadoras/' + montadora.Id);

        expect(response.status).toBe(500);

        // A montadora continua no banco
        expect(await MontadoraFactory.getById(montadora.Id)).toBeDefined();
    });

});

//--------------------------------------- CLIENTE (CT-013 a CT-021) ---------------------------------

describe('API de clientes', () => {

    // Corpo válido; cada teste sobrescreve apenas o campo que quer validar
    const clienteValido = {
        nome: 'Maria Souza',
        cpf: '12345678901',
        cep: '13185880',
        numero: '250',
        complemento: 'Apto 12'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        axios.get.mockResolvedValue(respostaViaCep);
    });

    afterEach(async () => {
        await clearDatabase();
        vi.clearAllMocks();
    });

    it('CT-013 - deve criar um cliente com dados válidos e preencher o endereço pelo CEP.', async () => {
        const response = await request(app).post('/clientes').send(clienteValido);

        expect(response.status).toBe(201);
        expect(axios.get).toHaveBeenCalledTimes(1);

        const clientes = await ClienteFactory.get();
        expect(clientes).toHaveLength(1);
        expect(clientes[0].Nome).toBe('Maria Souza');
        expect(clientes[0].Logradouro).toBe('Rua das Flores');
        expect(clientes[0].Bairro).toBe('Centro');
        expect(clientes[0].Cidade).toBe('Hortolândia');
        expect(clientes[0].UF).toBe('SP');
    });

    it('CT-014 - deve limpar a máscara do CPF antes de cadastrar.', async () => {
        const response = await request(app).post('/clientes').send({
            ...clienteValido,
            cpf: '123.456.789-01'
        });

        expect(response.status).toBe(201);

        const clientes = await ClienteFactory.get();
        expect(clientes[0].CPF).toBe('12345678901');
    });

    it('CT-015 - deve limpar a máscara do CEP e consultá-lo corretamente.', async () => {
        const response = await request(app).post('/clientes').send({
            ...clienteValido,
            cep: '13185-880'
        });

        expect(response.status).toBe(201);

        // A consulta ao ViaCEP deve usar o CEP somente com números
        const urlChamada = axios.get.mock.calls[0][0];
        expect(urlChamada).toContain('13185880');
        expect(urlChamada).not.toContain('13185-880');

        const clientes = await ClienteFactory.get();
        expect(clientes[0].CEP).toBe('13185880');
    });

    it.each([
        ['menos de 8 dígitos', '1318588'],
        ['mais de 8 dígitos', '131858800']
    ])('CT-016 - não deve criar cliente com CEP com %s.', async (_descricao, cep) => {
        const response = await request(app).post('/clientes').send({
            ...clienteValido,
            cep
        });

        expect(response.status).toBe(500);
        expect(corpoComo(response)).toContain('CEP inválido');
        expect(axios.get).not.toHaveBeenCalled();
        expect(await ClienteFactory.get()).toHaveLength(0);
    });

    it('CT-017 - não deve criar cliente com CEP inexistente no ViaCEP.', async () => {
        // O ViaCEP responde 200 com { erro: true } quando o CEP não existe
        axios.get.mockResolvedValue({ data: { erro: true } });

        const response = await request(app).post('/clientes').send({
            ...clienteValido,
            cep: '99999999'
        });

        expect(response.status).toBe(500);
        expect(corpoComo(response)).toContain('CEP não encontrado');
        expect(await ClienteFactory.get()).toHaveLength(0);
    });

    it('CT-018 - não deve criar cliente com nome vazio.', async () => {
        const response = await request(app).post('/clientes').send({
            ...clienteValido,
            nome: ''
        });

        expect(response.status).toBe(500);
        expect(corpoComo(response)).toContain('Nome inválido');
    });

    it.each([
        ['1 caractere', 'A'],
        ['2 caracteres', 'AB']
    ])('CT-019 - não deve criar cliente com nome de %s.', async (_descricao, nome) => {
        const response = await request(app).post('/clientes').send({
            ...clienteValido,
            nome
        });

        expect(response.status).toBe(500);
        expect(corpoComo(response)).toContain('Nome inválido');
    });

    it('CT-020 - não deve criar cliente com nome com mais de 100 caracteres.', async () => {
        const response = await request(app).post('/clientes').send({
            ...clienteValido,
            nome: 'A'.repeat(101)
        });

        expect(response.status).toBe(500);
        expect(corpoComo(response)).toContain('Nome inválido');
    });

    it('CT-021 - não deve criar cliente com CPF vazio.', async () => {
        const response = await request(app).post('/clientes').send({
            ...clienteValido,
            cpf: ''
        });

        expect(response.status).toBe(500);
        expect(corpoComo(response)).toContain('CPF inválido');
    });

});
