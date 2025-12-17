<?php

declare (strict_types = 1);

use Phinx\Seed\AbstractSeed;

class AdminSeeder extends AbstractSeed
{
    public function run(): void
    {
        $username = 'admin';

        // Da der Seeder bei jedem Container-Start laufen kann, prüfen wir, ob der Admin schon existiert
        $exists = $this->fetchRow("SELECT id FROM users WHERE username = '$username'");

        if ($exists) {
            // Admin existiert bereits -> Abbrechen, um Duplikate zu vermeiden
            return;
        }

        $password     = 'admin123';
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        $data = [
            [
                'username'  => $username,
                'password'  => $passwordHash,
                'role'      => 'admin',
                'createdAt' => date('Y-m-d H:i:s'),
            ],
        ];

        $users = $this->table('users');
        $users->insert($data)->saveData();
    }
}
