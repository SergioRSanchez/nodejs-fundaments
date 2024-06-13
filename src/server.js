import http from 'node:http';

import { json } from './middlewares/json.js';
import { routes } from './routes.js';
import { extractQueryParams } from './utils/extract-query-params.js';

// Query Params: parâmetros nomeados enviados no endereço da requisição, NÃO OBRIGATÓRIOS
// utilizado para URL stateful, filtros, paginação
// Exemplo: http://localhost:3333/users?userId=1&name=Sergio

// Route Params: parâmetros não nomeados
// utilizado para identificar recursos
// Exemplo: http://localhost:3333/users/1

// Request Body: corpo da requisição, envio de informações de um formulário
// utilizado para criar ou alterar recursos, e passam pelo protocolo https que são mais seguros
// Exemplo: http://localhost:3333/users

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  await json(req, res);

  const route = routes.find(route => {
    return route.method === method && route.path.test(url);
  });

  if (route) {
    const routeParams = req.url.match(route.path);

    const { query, ...params } = routeParams.groups

    req.params = params;
    req.query = query ? extractQueryParams(query) : {};

    return route.handler(req, res);
  }

  return res.writeHead(404).end('Not Found!');

});

server.listen(3333);