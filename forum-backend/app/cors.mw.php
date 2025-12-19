<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;

/**
 * CORS Middleware
 * * Diese Middleware fügt jedem Response die notwendigen Header hinzu,
 * damit der Browser (Frontend auf Port 5173) mit dem Server (Port 8000) sprechen darf.
 */
return function (Request $request, RequestHandler $handler): Response {
    $response = $handler->handle($request);

    return $response
    // Erlaube Anfragen von deinem React Frontend
        ->withHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
        // Erlaube Standard-Header und Content-Type (wichtig für JSON)
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        // Erlaube gängige HTTP-Methoden
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
        // Erlaube Credentials (Cookies, Authorization headers)
        ->withHeader('Access-Control-Allow-Credentials', 'true');
};
