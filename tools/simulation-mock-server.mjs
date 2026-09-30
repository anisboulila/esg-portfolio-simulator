import { createServer } from 'node:http';

const port = Number(process.env.SIMULATION_MOCK_PORT ?? 3001);
const mockSimulationId = 'mock-simulation-001';
const simulationResults = new Map();
const portfolios = [
  {
    id: 'p1',
    name: 'Portfolio Europe',
    description: 'Diversified investments across European markets.',
    assetCount: 24,
    currentValue: 1250000,
  },
  {
    id: 'p2',
    name: 'Portfolio Green',
    description: 'Investments focused on renewable energy and sustainability.',
    assetCount: 18,
    currentValue: 875000,
  },
  {
    id: 'p3',
    name: 'Portfolio Sustainable',
    description: 'Long-term investments screened for ESG performance.',
    assetCount: 31,
    currentValue: 1630000,
  },
];

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
  }
  return JSON.parse(body);
}

function hasSimulationRequestShape(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.portfolioId === 'string' &&
    typeof value.carbonEmission === 'number' &&
    typeof value.greenInvestmentPercentage === 'number' &&
    typeof value.socialScore === 'number' &&
    typeof value.governanceScore === 'number'
  );
}

const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    });
    response.end();
    return;
  }

  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;

  if (request.method === 'GET' && pathname === '/api/v1/portfolios') {
    sendJson(response, 200, portfolios);
    return;
  }

  const portfolioMatch = pathname.match(/^\/api\/v1\/portfolios\/([^/]+)$/);
  if (request.method === 'GET' && portfolioMatch) {
    const portfolio = portfolios.find(
      ({ id }) => id === decodeURIComponent(portfolioMatch[1]),
    );
    if (!portfolio) {
      sendJson(response, 404, { message: 'Portfolio introuvable.' });
      return;
    }

    sendJson(response, 200, portfolio);
    return;
  }

  if (request.method === 'POST' && pathname === '/api/v1/esg/simulations') {
    let payload;
    try {
      payload = await readJson(request);
    } catch {
      sendJson(response, 400, { message: 'Corps JSON invalide.' });
      return;
    }

    const portfolio = portfolios.find(({ id }) => id === payload.portfolioId);
    if (!portfolio) {
      sendJson(response, 404, { message: 'Portfolio introuvable.' });
      return;
    }

    if (!hasSimulationRequestShape(payload)) {
      sendJson(response, 400, { message: 'Le contrat SimulationRequest est invalide.' });
      return;
    }

    // Ce résultat est une fixture HTTP déterministe, pas un calcul ESG : les scores
    // représentent une réponse backend d'exemple et sont conservés telle quelle au GET.
    const result = {
      id: mockSimulationId,
      portfolio,
      environmentalScore: 72,
      socialScore: 81,
      governanceScore: 76,
      globalScore: 76.3,
      greenInvestmentPercentage: payload.greenInvestmentPercentage,
    };

    simulationResults.set(result.id, result);
    sendJson(response, 201, result);
    return;
  }

  const resultMatch = pathname.match(/^\/api\/v1\/esg\/simulations\/([^/]+)$/);
  if (request.method === 'GET' && resultMatch) {
    const result = simulationResults.get(decodeURIComponent(resultMatch[1]));
    if (!result) {
      sendJson(response, 404, { message: 'Simulation introuvable.' });
      return;
    }

    sendJson(response, 200, result);
    return;
  }

  sendJson(response, 404, { message: 'Ressource introuvable.' });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Mock ESG API disponible sur http://127.0.0.1:${port}`);
});