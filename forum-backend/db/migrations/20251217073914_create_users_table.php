<?php

declare (strict_types = 1);

use Phinx\Migration\AbstractMigration;

final class CreateUsersTable extends AbstractMigration
{
    public function change(): void
    {
        // Tabelle für die Benutzer erstellen
        $users = $this->table('users');
        $users->addColumn('username', 'string', ['limit' => 255])
              ->addColumn('password', 'string', ['limit' => 255])
              ->addColumn('role', 'string', ['limit' => 50, 'default' => 'user']) // [user, mod, admin]
              ->addColumn('createdAt', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
              ->create();

        // Tabelle für die Blog-Posts erstellen
        $posts = $this->table('posts');
        $posts->addColumn('title', 'string', ['limit' => 255])
              ->addColumn('body', 'text')
              ->addColumn('userId', 'integer', ['signed' => true])
              ->addColumn('status', 'string', ['limit' => 50, 'default' => 'published'])
              ->addColumn('createdAt', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
              // Fremdschlüssel zu users. Wenn User gelöscht wird -> Post löschen (CASCADE)
              ->addForeignKey('userId', 'users', 'id', [
                  'delete'=> 'CASCADE', 
                  'update'=> 'NO_ACTION'
              ])
              ->create();

        // Tabelle für die Kommentare erstellen
        $comments = $this->table('comments');
        $comments->addColumn('text', 'text')
              ->addColumn('postId', 'integer', ['signed' => true])
              ->addColumn('userId', 'integer', ['signed' => true, 'null' => true]) // Kann null sein, falls User Gast ist
              // Beziehung zu Post
              ->addForeignKey('postId', 'posts', 'id', [
                  'delete'=> 'CASCADE', 
                  'update'=> 'NO_ACTION'
              ])
              // Beziehung zu User
              ->addForeignKey('userId', 'users', 'id', [
                  'delete'=> 'SET_NULL', // Wenn User gelöscht wird -> Kommentar bleibt, aber userId ist null
                  'update'=> 'NO_ACTION'
              ])
              ->create();
    }
}
