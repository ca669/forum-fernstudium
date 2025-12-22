<?php

declare (strict_types = 1);

use Phinx\Migration\AbstractMigration;

final class NewTableStudyPrograms extends AbstractMigration
{
    public function change(): void
    {
        // Neue Tabelle für Studiengänge erstellen
        $studyTable = $this->table('studyPrograms');
        $studyTable->addColumn('name', 'string', ['limit' => 100, 'null' => false])
            ->create();

        // 2. Standard-Werte einfügen (Seeding innerhalb der Migration)
        if ($this->isMigratingUp()) {
            $rows = [
                ['name' => 'Informatik'],
                ['name' => 'Linguistik'],
                ['name' => 'BWL'],
                ['name' => 'Psychologie'],
                ['name' => 'Soziale Arbeit'],
                ['name' => 'Physik'],
            ];
            $this->table('studyPrograms')->insert($rows)->save();
        }

        // Neue column in 'posts' Tabelle hinzufügen
        $postsTable = $this->table('posts');
        $postsTable->addColumn('studyProgramId', 'integer', [
            'null'   => true,
            'signed' => false,
            'after'  => 'content',
        ]);

        // Fremdschlüssel-Beziehung hinzufügen
        $postsTable->addForeignKey('studyProgramId', 'studyPrograms', 'id', [
            'delete'     => 'SET_NULL',
            'update'     => 'CASCADE',
            'constraint' => 'fk_posts_study_program',
        ]);

        $postsTable->update();
    }
}
