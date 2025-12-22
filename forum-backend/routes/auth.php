<?php
use Envms\FluentPDO\Query;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

return function ($app, $pdo) {
    // Wir erstellen die Query-Builder Instanz einmalig hier
    // Sie nutzt die existierende PDO-Verbindung
    $fpdo = new Query($pdo);

    // --- REGISTRIERUNG ---
    $app->post('/api/register', function (Request $request, Response $response) use ($fpdo) {
        $data = json_decode($request->getBody());

        // Validierung
        if (empty($data->username) || empty($data->password)) {
            $response->getBody()->write(json_encode(['error' => 'Bitte Benutzername und Passwort angeben']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        // Prüfen, ob Username schon existiert
        $userExists = $fpdo->from('users')
            ->where('username', $data->username)
            ->select('id')
            ->fetch();

        if ($userExists) {
            $response->getBody()->write(json_encode(['error' => 'Benutzername bereits vergeben']));
            return $response->withStatus(409)->withHeader('Content-Type', 'application/json');
        }

        // Passwort hashen
        $hash = password_hash($data->password, PASSWORD_DEFAULT);

        try {
            $values = [
                'username' => $data->username,
                'password' => $hash,
                'role'     => 'user',
            ];

            // User in der DB anlegen
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
        $data     = json_decode($request->getBody());
        $username = $data->username ?? '';
        $password = $data->password ?? '';

        // User suchen via Username
        $user = $fpdo->from('users')
            ->where('username', $username)
            ->fetch();

        // Passwort prüfen
        if (! $user || ! password_verify($password, $user['password'])) {
            $response->getBody()->write(json_encode(['error' => 'Ungültige Zugangsdaten']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        // JWT Token erstellen
        $payload = [
            'iss'  => 'http://localhost',
            'sub'  => $user['id'],
            'role' => $user['role'],
            'iat'  => time(),
            'exp'  => time() + 3600 * 24,
        ];

        $jwt = JWT::encode($payload, JWT_SECRET, 'HS256');

        // Cookie setzen (Sicherheits-Upgrade)
        // HttpOnly: JS kann nicht zugreifen (Schutz vor XSS)
        // Secure: Nur über HTTPS senden
        // SameSite: Strict (Schutz vor CSRF)
        $cookieValue = sprintf(
            "auth_token=%s; Path=/; HttpOnly; SameSite=Strict; Max-Age=%d",
            $jwt,
            3600 * 24
        );

        $response->getBody()->write(json_encode([
            'token' => $jwt,
            'user'  => [
                'id'       => $user['id'],
                'username' => $user['username'],
                'role'     => $user['role'],
            ],
        ]));

        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withHeader('Set-Cookie', $cookieValue);
    });

    // --- CHECK AUTH STATUS ---
    $app->get('/api/me', function (Request $request, Response $response) use ($fpdo) {
        $cookies = $request->getCookieParams();
        $token   = $cookies['auth_token'] ?? null;

        if (! $token) {
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        try {
            // Debug: Log JWT_SECRET
            error_log('JWT_SECRET: ' . JWT_SECRET);

            // Token validieren
            $decoded = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));

            // User aus der DB holen
            $user = $fpdo->from('users')->where('id', $decoded->sub)->select('id, username, role')->fetch();

            if (! $user) {
                throw new Exception("User nicht gefunden");
            }

            $response->getBody()->write(json_encode(['user' => $user]));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (Exception $e) {
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }
    });

    // --- LOGOUT ---
    $app->post('/api/logout', function (Request $request, Response $response) {
        // Cookie überschreiben mit abgelaufener Zeit
        $cookieValue = "auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";

        $response->getBody()->write(json_encode(['message' => 'Logout erfolgreich']));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withHeader('Set-Cookie', $cookieValue);
    });

};
