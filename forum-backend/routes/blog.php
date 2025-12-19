<?php
use Envms\FluentPDO\Query;

return function ($app, $pdo) {
    // Wir erstellen die Query-Builder Instanz einmalig hier
    // Sie nutzt die existierende PDO-Verbindung
    $fpdo = new Query($pdo);

    $app->get('/api/posts', function ($request, $response) use ($fpdo) {
        $posts = $fpdo->from('posts')
            ->innerJoin('users ON posts.authorId = users.id')
            ->select(['id', 'title', 'body', 'author', 'createdAt'])
            ->orderBy('createdAt DESC')
            ->fetchAll();

        $response->getBody()->write(json_encode($posts));
        return $response->withHeader('Content-Type', 'application/json');
    });

};
