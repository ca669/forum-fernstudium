<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Firebase\JWT\JWT;
use Envms\FluentPDO\Query;

return function ($app, $pdo) {

    // Wir erstellen die Query-Builder Instanz einmalig hier
    // Sie nutzt die existierende PDO-Verbindung
    $fpdo = new Query($pdo);

    // --- REGISTRIERUNG ---
    $app->post('/api/register', function (Request $request, Response $response) use ($fpdo) {
        $data = json_decode($request->getBody());

        // 1. Validierung
        if (empty($data->username) || empty($data->password)) {
            $response->getBody()->write(json_encode(['error' => 'Bitte Benutzername und Passwort angeben']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        // 2. Prüfen, ob Username schon existiert
        // Statt SQL: SELECT id FROM users WHERE username = ?
        $userExists = $fpdo->from('users')
                           ->where('username', $data->username)
                           ->select('id')
                           ->fetch(); // Gibt false zurück, wenn nicht gefunden

        if ($userExists) {
            $response->getBody()->write(json_encode(['error' => 'Benutzername bereits vergeben']));
            return $response->withStatus(409)->withHeader('Content-Type', 'application/json');
        }

        // 3. User anlegen
        $hash = password_hash($data->password, PASSWORD_DEFAULT);
        
        try {
            $values = [
                'username' => $data->username,
                'password' => $hash,
                'role'     => 'user'
            ];

            // Statt SQL: INSERT INTO users ...
            $fpdo->insertInto('users', $values)->execute();
            
            $response->getBody()->write(json_encode(['message' => 'Registrierung erfolgreich']));
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
        } catch (Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Datenbankfehler: ' . $e->getMessage()]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    });

    // --- LOGIN ---
    $app->post('/api/login', function (Request $request, Response $response) use ($fpdo) {
        $data = json_decode($request->getBody());
        $username = $data->username ?? '';
        $password = $data->password ?? '';

        // 1. User suchen via Username
        // Statt SQL: SELECT * FROM users WHERE username = ?
        $user = $fpdo->from('users')
                     ->where('username', $username)
                     ->fetch();

        // 2. Passwort prüfen
        if (!$user || !password_verify($password, $user['password'])) {
            $response->getBody()->write(json_encode(['error' => 'Ungültige Zugangsdaten']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        // 3. JWT Token bauen
        $secretKey = $_ENV['JWT_SECRET'] ?? 'default_secret_dev_only';
        
        $payload = [
            'iss' => 'http://localhost',
            'sub' => $user['id'],
            'role' => $user['role'],
            'iat' => time(),
            'exp' => time() + 3600 * 24
        ];

        $jwt = JWT::encode($payload, $secretKey, 'HS256');

        $response->getBody()->write(json_encode([
            'token' => $jwt,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role']
            ]
        ]));

        return $response->withHeader('Content-Type', 'application/json');
    });

};