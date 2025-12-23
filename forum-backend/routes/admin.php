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

    // --- ALLE USER ABFRAGEN ---
    $app->get('/api/admin/users', function (Request $request, Response $response) use ($fpdo) {
        $cookies = $request->getCookieParams();
        $token   = $cookies['auth_token'] ?? null;

        if (! $token) {
            $response->getBody()->write(json_encode(['error' => 'Unautorisiert']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        // Token validieren
        $decoded = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
        $userId  = $decoded->sub;

        // User anhand der ID aus dem Cookie abrufen
        $user = $fpdo->from('users')
            ->where('id', $userId)
            ->select(['role'])
            ->fetch();

        if (! $user || $user['role'] === 'user') {
            $response->getBody()->write(json_encode(['error' => 'Zugriff verweigert']));
            return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        }

        $users = $fpdo->from('users')
            ->select('id, username, role, createdAt')
            ->fetchAll();

        $response->getBody()->write(json_encode(['users' => $users]));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // --- ROLLE ÄNDERN ---
    $app->put('/api/admin/users/{id}/role', function (Request $request, Response $response, array $args) use ($fpdo) {
        $cookies = $request->getCookieParams();
        $token   = $cookies['auth_token'] ?? null;

        if (! $token) {
            $response->getBody()->write(json_encode(['error' => 'Unautorisiert']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        // Token validieren
        $decoded = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
        $userId  = $decoded->sub;

        // User anhand der ID aus dem Cookie abrufen
        $user = $fpdo->from('users')
            ->where('id', $userId)
            ->select(['role'])
            ->fetch();

        if (! $user || $user['role'] !== 'admin') {
            $response->getBody()->write(json_encode(['error' => 'Zugriff verweigert']));
            return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        }

        $targetUserId = (int) $args['id'];
        $data         = $request->getParsedBody();
        $newRole      = $data['role'] ?? null;

        if (! in_array($newRole, ['user', 'mod', 'admin'])) {
            $response->getBody()->write(json_encode(['error' => 'Ungültige Rolle']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        // Sicherstellen, dass der Ziel-User existiert
        $targetUser = $fpdo->from('users')
            ->where('id', $targetUserId)
            ->select(['id'])
            ->fetch();

        if (! $targetUser) {
            $response->getBody()->write(json_encode(['error' => 'Benutzer nicht gefunden']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        try {
            // Rolle aktualisieren
            $fpdo->update('users')
                ->set(['role' => $newRole])
                ->where('id', $targetUserId)
                ->execute();

            $response->getBody()->write(json_encode(['message' => 'Rolle erfolgreich aktualisiert']));
            return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
        } catch (Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Datenbankfehler: ' . $e->getMessage()]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    });

    // --- USER LÖSCHEN ---
    $app->delete('/api/admin/users/{id}', function (Request $request, Response $response, array $args) use ($fpdo) {
        $cookies = $request->getCookieParams();
        $token   = $cookies['auth_token'] ?? null;

        if (! $token) {
            $response->getBody()->write(json_encode(['error' => 'Unautorisiert']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        // Token validieren
        $decoded = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
        $userId  = $decoded->sub;

        // User anhand der ID aus dem Cookie abrufen
        $user = $fpdo->from('users')
            ->where('id', $userId)
            ->select(['role'])
            ->fetch();

        // Nur Admin und Moderator dürfen löschen
        if (! $user || $user['role'] === 'user') {
            $response->getBody()->write(json_encode(['error' => 'Zugriff verweigert']));
            return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        }

        $targetUserId = (int) $args['id'];

        // Verhindern, dass man sich selbst löscht
        if ($targetUserId === (int) $userId) {
            $response->getBody()->write(json_encode(['error' => 'Sie können sich nicht selbst löschen']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        try {
            // Sicherstellen, dass der Ziel-User existiert
            $targetUser = $fpdo->from('users')
                ->where('id', $targetUserId)
                ->select(['id'])
                ->fetch();

            if (! $targetUser) {
                $response->getBody()->write(json_encode(['error' => 'Benutzer nicht gefunden']));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }

            // User löschen
            $fpdo->deleteFrom('users')
                ->where('id', $targetUserId)
                ->execute();

            $response->getBody()->write(json_encode(['message' => 'Benutzer erfolgreich gelöscht']));
            return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
        } catch (Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Datenbankfehler: ' . $e->getMessage()]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    });
};
