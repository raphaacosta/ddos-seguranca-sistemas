import express, { Request, Response, ErrorRequestHandler } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import apiRoutes from './routes/routes';
import { rateLimit } from 'express-rate-limit';

dotenv.config();

const server = express();
const limit = rateLimit({
    windowMs: 15 * 60 * 1000, // limita em 15 minutos
    max: 100, // limite de requisições que um mesmo IP pode fazer dentro do tempo estipulado (windowMS)
    message: 'Limite de requisições atingido, aguarde alguns minutos antes de tentar novamente!', // resposta enviada quando o limite for atingido
    standardHeaders: 'draft-7', // habilita o header de rateLimit
    headers: true,
});

server.use(cors());

server.use(express.static(path.join(__dirname, '../public')));

// aplica a limitação de requisições ao server
server.use(limit);

//AQUI EU DIGO O FORMATO QUE EU QUERO A REQUISIÇÃO
//server.use(express.urlencoded({ extended: true })); // USANDO URL ENCODED
server.use(express.json()); //USANDO JSON

server.get('/ping', (req: Request, res: Response) => res.json({ pong: true }));

server.use(apiRoutes);

server.use((req: Request, res: Response) => {
    res.status(404);
    res.json({ error: 'Endpoint não encontrado.' });
});

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    res.status(400); // Bad Request
    console.log(err);
    res.json({ error: 'Ocorreu algum erro.' });
}
server.use(errorHandler);

server.listen(process.env.PORT);