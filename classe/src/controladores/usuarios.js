const knex = require('../conexao');
const bcrypt = require('bcrypt');

const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha, nome_loja } = req.body;

    if (!nome) {
        return res.status(404).json("O campo nome é obrigatório");
    }

    if (!email) {
        return res.status(404).json("O campo email é obrigatório");
    }

    if (!senha) {
        return res.status(404).json("O campo senha é obrigatório");
    }

    if (!nome_loja) {
        return res.status(404).json("O campo nome_loja é obrigatório");
    }

    try {
        const quantidadeUsuarios = await knex('usuarios').where('email', '=', email).returning('*').debug();

        if (quantidadeUsuarios.length !== 0) {
            return res.status(400).json("O email já existe");
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const usuario = await knex('usuarios')
            .insert(
                {
                    nome,
                    email,
                    senha: senhaCriptografada,
                    nome_loja
                })
            .returning('*')
            .debug();

        if (usuario.length !== 1) {
            return res.status(400).json("O usuário não foi cadastrado.");
        }

        return res.status(201).json(usuario[0]);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const obterPerfil = async (req, res) => {
    return res.status(200).json(req.usuario);
}

const atualizarPerfil = async (req, res) => {
    const { nome, email, senha, nome_loja } = req.body;

    if (!nome && !email && !senha && !nome_loja) {
        return res.status(404).json('É obrigatório informar ao menos um campo para atualização');
    }

    try {
        if (email) {
            if (email !== req.usuario.email) {
                const quantidadeUsuarios = await knex('usuarios').where('email', '=', email).returning('*').debug();

                if (quantidadeUsuarios.length > 0) {
                    return res.status(400).json("O email já existe");
                }
            }
        }

        const novaSenha = senha && await bcrypt.hash(senha, 10);

        const usuarioAtualizado = await knex('usuarios')
            .update(
                {
                    nome,
                    email,
                    senha: novaSenha,
                    nome_loja
                })
            .where('id', '=', req.usuario.id)
            .returning('*')
            .debug();

        if (usuarioAtualizado.length === 0) {
            return res.status(400).json("O usuario não foi atualizado");
        }
        return res.status(200).json(usuarioAtualizado[0]);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {
    cadastrarUsuario,
    obterPerfil,
    atualizarPerfil
}