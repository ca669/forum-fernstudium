<?php
use Envms\FluentPDO\Query;

return function ($app, $pdo) {
    // Wir erstellen die Query-Builder Instanz einmalig hier
    // Sie nutzt die existierende PDO-Verbindung
    $fpdo = new Query($pdo);

    $app->get('/api/posts', function ($request, $response) use ($fpdo) {
        $posts = $fpdo->from('posts AS post')
            ->innerJoin('users AS user ON post.userId = user.id')
            ->select(['post.id AS id', 'post.title', 'post.body', 'user.username AS author', 'post.createdAt'])
            ->orderBy('post.createdAt DESC')
            ->fetchAll();

        $response->getBody()->write(json_encode($posts));
        return $response->withHeader('Content-Type', 'application/json');
    });

};
