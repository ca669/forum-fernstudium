<?php
use Envms\FluentPDO\Query;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

return function ($app, $pdo) {
    // Wir erstellen die Query-Builder Instanz einmalig hier
    // Sie nutzt die existierende PDO-Verbindung
    $fpdo = new Query($pdo);

    // --- STUDIENPROGRAMME ERHALTEN ---
    $app->get('/api/study-programs', function ($request, $response) use ($fpdo) {
        $programs = $fpdo->from('studyPrograms')
            ->select(['id', 'name'])
            ->orderBy('name ASC')
            ->fetchAll();

        $response->getBody()->write(json_encode($programs));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // --- ALLE VERÖFFENTLICHTE BLOG POSTS ERHALTEN ---
    $app->get('/api/posts', function ($request, $response) use ($fpdo) {
        $posts = $fpdo->from('posts AS post')
            ->innerJoin('users AS user ON post.userId = user.id')
            ->leftJoin('studyPrograms AS sp ON post.studyProgramId = sp.id')
            ->select(['post.id AS id', 'post.title', 'post.body', 'user.username AS author', 'post.status', 'sp.name AS studyProgram', 'post.createdAt'])
            ->orderBy('post.createdAt DESC')
            ->where('post.status', 'published')
            ->fetchAll();

        $response->getBody()->write(json_encode($posts));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // --- EINZELNEN BLOG POST ERHALTEN ---
    $app->get('/api/posts/{id}', function ($request, $response, $args) use ($fpdo) {
        $postId = (int) $args['id'];

        $post = $fpdo->from('posts AS post')
            ->innerJoin('users AS user ON post.userId = user.id')
            ->leftJoin('studyPrograms AS sp ON post.studyProgramId = sp.id')
            ->select(['post.id AS id', 'post.title', 'post.body', 'user.username AS author', 'sp.name AS studyProgram', 'post.status', 'post.createdAt'])
            ->where('post.id', $postId)
            ->fetch();

        if (! $post) {
            $response->getBody()->write(json_encode(['error' => 'Post nicht gefunden']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $comments = $fpdo->from('comments AS c')
            ->leftJoin('users AS u ON c.userId = u.id')
            ->select(['c.id AS id', 'c.text', 'u.username AS author', 'c.createdAt'])
            ->where('c.postId', $postId)
            ->orderBy('c.createdAt ASC')
            ->fetchAll();

        $post['comments'] = $comments;

        $response->getBody()->write(json_encode($post));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // --- USER BLOG POSTS ERHALTEN ---
    $app->get('/api/user/posts', function ($request, $response) use ($fpdo) {
        $cookies = $request->getCookieParams();
        $token   = $cookies['auth_token'] ?? null;

        if (! $token) {
            $response->getBody()->write(json_encode(['error' => 'Unautorisiert']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        // Token validieren
        $decoded = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
        $userId  = $decoded->sub;

        $posts = $fpdo->from('posts AS post')
            ->innerJoin('users AS user ON post.userId = user.id')
            ->leftJoin('studyPrograms AS sp ON post.studyProgramId = sp.id')
            ->select(['post.id AS id', 'post.title', 'post.body', 'user.username AS author', 'sp.name AS studyProgram', 'post.status', 'post.createdAt'])
            ->orderBy('post.createdAt DESC')
            ->where('post.userId', $userId)
            ->fetchAll();

        $response->getBody()->write(json_encode($posts));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // --- NEUEN BLOG POST ERSTELLEN ---
    $app->post('/api/posts', function ($request, $response) use ($fpdo) {
        $data    = json_decode($request->getBody());
        $cookies = $request->getCookieParams();
        $token   = $cookies['auth_token'] ?? null;

        if (! $token) {
            $response->getBody()->write(json_encode(['error' => 'Unautorisiert']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        // Token validieren
        $decoded = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
        $userId  = $decoded->sub;

        // Validierung
        if (empty($data->title) || empty($data->body)) {
            $response->getBody()->write(json_encode(['error' => 'Bitte Titel, Inhalt und Benutzer-ID angeben']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $values = [
            'title'          => $data->title,
            'body'           => $data->body,
            'userId'         => $userId,
            'studyProgramId' => $data->studyProgramId ?? null,
            'status'         => $data->status ?? 'draft',
            'createdAt'      => date('Y-m-d H:i:s'),
        ];

        try {
            // Post in der DB anlegen
            $fpdo->insertInto('posts', $values)->execute();

            $response->getBody()->write(json_encode(['message' => 'Post erfolgreich erstellt']));
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
        } catch (Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Datenbankfehler: ' . $e->getMessage()]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    });

    // --- BLOG POST VERÖFFENTLICHEN ---
    $app->put('/api/posts/{id}/publish', function ($request, $response, $args) use ($fpdo) {
        $postId  = (int) $args['id'];
        $cookies = $request->getCookieParams();
        $token   = $cookies['auth_token'] ?? null;

        if (! $token) {
            $response->getBody()->write(json_encode(['error' => 'Unautorisiert']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        // Token validieren
        $decoded = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
        $userId  = $decoded->sub;

        try {
            // Post in der DB veröffentlichen
            $fpdo->update('posts')
                ->set(['status' => 'published'])
                ->where('id', $postId)
                ->where('userId', $userId)
                ->execute();

            $response->getBody()->write(json_encode(['message' => 'Post erfolgreich veröffentlicht']));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Datenbankfehler: ' . $e->getMessage()]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    });

    // --- KOMMENTAR HINZUFÜGEN ---
    $app->post('/api/posts/{id}/comments', function ($request, $response, $args) use ($fpdo) {
        $postId  = (int) $args['id'];
        $data    = json_decode($request->getBody());
        $cookies = $request->getCookieParams();
        $token   = $cookies['auth_token'] ?? null;

        $userId = null;
        if ($token) {
            // Token validieren
            $decoded = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
            $userId  = $decoded->sub;
        }

        // Validierung
        if (empty($data->text)) {
            $response->getBody()->write(json_encode(['error' => 'Bitte Kommentartext angeben']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $values = [
            'text'      => $data->text,
            'postId'    => $postId,
            'userId'    => $userId,
            'createdAt' => date('Y-m-d H:i:s'),
        ];
        try {
            // Kommentar in der DB anlegen
            $fpdo->insertInto('comments', $values)->execute();

            $response->getBody()->write(json_encode(['message' => 'Kommentar erfolgreich hinzugefügt']));
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
        } catch (Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Datenbankfehler: ' . $e->getMessage()]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    });

    // --- BLOG POST LÖSCHEN ---
    $app->delete('/api/posts/{id}', function ($request, $response, $args) use ($fpdo) {
        $postId  = (int) $args['id'];
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

        // Post, der gelöscht werden soll, abrufen
        $existingPost = $fpdo->from('posts')
            ->where('id', $postId)
            ->select('id')
            ->fetch();

        if (! $existingPost) {
            $response->getBody()->write(json_encode(['error' => 'Post nicht gefunden']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        if ($user->role === 'user' && $existingPost->id !== $postId) {
            $response->getBody()->write(json_encode(['error' => 'Keine Berechtigung zum Löschen dieses Posts']));
            return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        }

        try {
            // Post löschen
            $fpdo->deleteFrom('posts')
                ->where('id', $postId)
                ->execute();

            $response->getBody()->write(json_encode(['message' => 'Post erfolgreich gelöscht']));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Datenbankfehler: ' . $e->getMessage()]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    });

    // --- KOMMENTAR LÖSCHEN ---
    $app->delete('/api/comments/{id}', function ($request, $response, $args) use ($fpdo) {
        $commentId = (int) $args['id'];
        $cookies   = $request->getCookieParams();
        $token     = $cookies['auth_token'] ?? null;

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

        // Kommentar, der gelöscht werden soll, abrufen
        $existingComment = $fpdo->from('comments')
            ->where('id', $commentId)
            ->select('userId')
            ->fetch();

        if (! $existingComment) {
            $response->getBody()->write(json_encode(['error' => 'Kommentar nicht gefunden']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        if ($user->role === 'user' && $existingComment->userId !== $userId) {
            $response->getBody()->write(json_encode(['error' => 'Keine Berechtigung zum Löschen dieses Kommentars']));
            return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        }

        try {
            // Kommentar löschen
            $fpdo->deleteFrom('comments')
                ->where('id', $commentId)
                ->execute();

            $response->getBody()->write(json_encode(['message' => 'Kommentar erfolgreich gelöscht']));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Datenbankfehler: ' . $e->getMessage()]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    });
};
