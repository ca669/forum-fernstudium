<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Exception\HttpNotFoundException;
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';
$corsMiddleware = require __DIR__ . '/../app/cors.mw.php';

// Datenbank Verbindung aufbauen
$dbPath = __DIR__ . '/../var/forum.sqlite3';
try {
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec("PRAGMA foreign_keys = ON");
} catch (PDOException $e) {
    die("DB connection failed: " . $e->getMessage());
}

// Globalen JWT_SECRET definieren
define('JWT_SECRET', $_ENV['JWT_SECRET'] ?? 'SECRET_KEY_DEV');

// App Instanz erstellen
$app = AppFactory::create();

$errorMiddleware = $app->addErrorMiddleware(true, true, true);
$errorMiddleware->setErrorHandler(HttpNotFoundException::class, function (Request $request) use ($app) {
    $response = $app->getResponseFactory()->createResponse();
    $response->getBody()->write(json_encode(['error' => 'Not Found', 'path' => $request->getUri()->getPath()]));
    return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
});

// Body Parsing Middleware hinzufügen, damit wir JSON-Daten geparsed werden.
$app->addBodyParsingMiddleware();

// CORS Middleware hinzufügen
$app->add($corsMiddleware);

$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});

// --- ROUTEN ---
$app->get('/', function (Request $request, Response $response) {
    $response->getBody()->write("Forum Backend is running!");
    return $response;
});

$app->get('/api/status', function (Request $request, Response $response) {
    $response->getBody()->write(json_encode(['status' => 'ok', 'server' => 'PHP Slim']));
    return $response->withHeader('Content-Type', 'application/json');
});

$authRoutes = require __DIR__ . '/../routes/auth.php';
$authRoutes($app, $pdo);

$blogRoutes = require __DIR__ . '/../routes/blog.php';
$blogRoutes($app, $pdo);

$adminRoutes = require __DIR__ . '/../routes/admin.php';
$adminRoutes($app, $pdo);

$app->run();
