import { useEffect, useState } from 'react';
import { Select, Loader } from '@mantine/core';
import api from '../../lib/api';
import { StudyProgram } from '../../types/Blog';

interface StudyProgramSelectProps {
    value: string | null;
    onChange: (value: string | null) => void;
    error?: React.ReactNode;
}

export function StudyProgramSelect({ value, onChange, error }: StudyProgramSelectProps) {
    const [programs, setPrograms] = useState<StudyProgram[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const response = await api.get('/study-programs');
                setPrograms(response.data);
            } catch (err) {
                console.error('Fehler beim Laden der Studiengänge', err);
                setFetchError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPrograms();
    }, []);

    // Transformation für Mantine Select (value muss string sein)
    const selectData = programs.map((p) => ({
        value: p.id.toString(), // ID als Value senden
        label: p.name // Name anzeigen
    }));

    return (
        <Select
            label="Studiengang"
            placeholder={loading ? 'Lade Studiengänge...' : 'Wählen Sie Ihren Studiengang'}
            data={selectData}
            value={value}
            onChange={onChange}
            searchable
            clearable
            size="md"
            error={error || (fetchError ? 'Studiengänge konnten nicht geladen werden' : null)}
            rightSection={loading ? <Loader size="xs" /> : null}
            disabled={loading || fetchError}
        />
    );
}
