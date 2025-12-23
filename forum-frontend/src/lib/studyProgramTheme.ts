/**
 * Themenfarben für verschiedene Studiengänge
 * Wird verwendet für visuelle Unterscheidung von Posts nach Studiengang
 */

export interface StudyProgramTheme {
    bg: string;
    icon: string;
}

export const studyProgramThemes: Record<string, StudyProgramTheme> = {
    Informatik: { bg: 'blue.1', icon: 'blue.6' },
    Linguistik: { bg: 'cyan.1', icon: 'cyan.6' },
    BWL: { bg: 'green.1', icon: 'green.6' },
    Psychologie: { bg: 'grape.1', icon: 'grape.6' },
    'Soziale Arbeit': { bg: 'orange.1', icon: 'orange.6' },
    Wirtschaftsingenieurwesen: { bg: 'teal.1', icon: 'teal.6' },
    Physik: { bg: 'teal.1', icon: 'teal.6' },
    default: { bg: 'gray.1', icon: 'gray.6' }
};

/**
 * Gibt das Theme für einen Studiengang zurück
 * Falls der Studiengang nicht gefunden wird, wird das Default-Theme zurückgegeben
 */
export function getStudyProgramTheme(studyProgram?: string | null): StudyProgramTheme {
    if (!studyProgram) {
        return studyProgramThemes.default;
    }
    return studyProgramThemes[studyProgram] || studyProgramThemes.default;
}

/**
 * Konvertiert Mantine-Farbnotation (z.B. 'blue.6') in CSS-Variable (z.B. 'var(--mantine-color-blue-6)')
 */
export function getMantineColorVar(color: string): string {
    return `var(--mantine-color-${color.replace('.', '-')})`;
}
