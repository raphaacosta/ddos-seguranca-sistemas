import { Request, Response } from 'express';
import { Usuario } from '../models/Usuario';
import { Notificacao } from '../models/Notificacao';
import logger from '../utils/logger';

export const ping = (req: Request, res: Response) => {
    res.json({ pong: true });
}

export const cadastrarUsuario = async (req: Request, res: Response) => {
    const { nome, email, senha, disciplina } = req.body;
    if (email && senha && nome && disciplina) {

        let usuarioExistente = await Usuario.findOne({ where: { email } });
        if (!usuarioExistente) {
            let novoUsuario = await Usuario.create({ email, senha, nome, disciplina });

            res.status(201);
            logger.info(`Uusário cadastrado com o ip: ${req.socket.remoteAddress} e o email: ${novoUsuario.email}`);
            return res.json({
                message: "Usuário cadastrado com sucesso.",
                novoUsuario
            });
        } else {
            logger.error(`Cadastro negado por e-mail já utilizado. e-mail utilizado: ${email}`);
            return res.status(400).json({ error: 'E-mail já existe.' });
        }
    }

    return res.status(400).json({ error: 'E-mail e/ou senha não enviados.' });
}

export const fazerLogin = async (req: Request, res: Response) => {
    if (req.body.email && req.body.senha) {
        let email: string = req.body.email;
        let senha: string = req.body.senha;

        let usuario = await Usuario.findOne({
            where: { email, senha }
        });

        if (usuario) {
            logger.info(`Login feio através do e-mail: ${email}`);
            res.json({ status: true });
            return;
        }
        logger.error("Login recusado por falta de credenciais, ou credenciais erradas");
    }

    res.json({ status: false });
}

export const listarEmails = async (req: Request, res: Response) => {
    let usuarios = await Usuario.findAll();
    let listaEmails: string[] = [];

    for (let i in usuarios) {
        listaEmails.push(usuarios[i].email);
    }

    res.json({ listaEmails });
}

export const listarTodosUsuarios = async (req: Request, res: Response) => {
    let usuarios = await Usuario.findAll();

    res.json({ usuarios });
}

export const deletarUsuario = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const user = await Usuario.findByPk(id);

        if (user) {
            const deletedUserName = user.nome; // Obtém o nome do usuário que será deletado

            user.destroy();
            await user.save(); // Salva as alterações do status

            logger.info(`Usuário ${deletedUserName} foi removido com sucesso.`);
            res.status(200).json({ message: `Usuário ${deletedUserName} foi removido com sucesso.`, status: '200' });
        } else {
            logger.error(`Usuário com ID ${id} não encontrado. Falha ao tentar removê-lo.`);
            res.status(404).json({ message: `Usuário com ID ${id} não encontrado.`, status: '404' });
        }
    } catch (error) {
        // logger.error("Erro na tentativa de remover o usuário. \n", error);
        res.status(500).json({ message: 'Ocorreu um erro ao remover o usuário.', status: '500', error });
    }
}

export const atualizarUsuario = async (req: Request, res: Response) => {
    const { id } = req.params;
    const valores = req.body;

    // Verificar se algum valor está vazio ou nulo
    const estaVazio = Object.values(valores).some((valor) => valor === null || valor === '');

    if (estaVazio) {
        logger.error("Erro ao tentar atualizar usuário, por falta de dados ou dados incompletos.");
        return res.status(400).json({ mensagem: 'Os dados enviados estão incompletos.', status: '400' });
    }

    try {
        const usuarioEncontrado = await Usuario.findOne({ where: { id } });

        if (!usuarioEncontrado) {
            logger.error("Erro ao tentar atualizar usuário, o usuário não foi encontrado.");
            return res.status(404).json({ mensagem: 'Usuário não encontrado.', status: '404' });
        }

        await Usuario.update(valores, { where: { id } });

        const usuarioAtualizado = await Usuario.findOne({ where: { id } });

        logger.info(`O usuário com o e-mail ${usuarioAtualizado?.email}, foi atualizado com sucesso!`);
        return res.status(200).json({ mensagem: 'Usuário atualizado com sucesso.', status: '200', usuarioAtualizado });
    } catch (erro) {
        console.error(erro);
        logger.error("Ocorreu um erro ao tentar atualizar o usuário.");
        return res.status(500).json({ mensagem: 'Erro ao atualizar usuário.', status: '500', erro });
    }
}

export const pegarUsuarioPeloId = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const usuario = await Usuario.findByPk(id);
        res.status(200).json({ message: `Usuário encontrado`, status: '200', usuario });
    } catch (error) {
        console.error('Erro ao buscar usuário pelo ID:', error);
        throw error;
    }
}

export const mostrarNotificacao = async (req: Request, res: Response) => {
    let notificacao = await Notificacao.findAll();

    res.json({ notificacao });
}

export const atualizarNotificacao = async (req: Request, res: Response) => {
    const { titulo, corpo, mostrar } = req.body;

    if (titulo && corpo && mostrar) {
        try {
            // Verifique se já existe uma notificação no banco de dados
            const notificacaoExistente = await Notificacao.findOne();

            if (notificacaoExistente) {
                // Atualize a notificação existente com os novos valores
                notificacaoExistente.titulo = titulo;
                notificacaoExistente.corpo = corpo;
                notificacaoExistente.mostrar = mostrar;

                await notificacaoExistente.save();

                res.status(200).json({ message: "Notificação atualizada com sucesso.", notificacao: notificacaoExistente });
            } else {
                res.status(404).json({ error: 'Notificação não encontrada.' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    } else {
        res.status(400).json({ error: 'Campos inválidos.' });
    }
}