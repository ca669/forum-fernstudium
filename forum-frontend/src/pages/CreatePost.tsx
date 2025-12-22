import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Title,
    TextInput,
    Textarea,
    Button,
    Group,
    Alert,
    Card,
    Stack,
    Checkbox
} from '@mantine/core';
import { IconAlertCircle, IconSend } from '@tabler/icons-react';
import api from '../lib/api';
import { StudyProgramSelect } from '../components/StudyProgramSelect/StudyProgramSelect';
import { NewPost } from '../types/Blog';

export function CreatePost() {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [shouldPublish, setShouldPublish] = useState(false);

    const [studyProgramId, setStudyProgramId] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Einfache Validierung
        if (!title.trim() || !body.trim()) {
            setError('Bitte geben Sie einen Titel und Inhalt ein.');
            return;
        }

        setLoading(true);
        setError(null);

        // Daten für das Backend vorbereiten gemäß Interface
        const payload: NewPost = {
            title,
            body,
            status: shouldPublish ? 'published' : 'draft',
            // Konvertierung: String "5" -> Number 5, oder undefined wenn null
            studyProgramId: studyProgramId ? parseInt(studyProgramId, 10) : undefined
        };

        try {
            await api.post('/posts', payload);
            navigate('/'); // Bei Erfolg zur Startseite
        } catch (err: any) {
            console.error('Fehler beim Erstellen:', err);
            setError(
                err.response?.data?.error ||
                    'Beitrag konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size="sm" py="xl">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Title order={2} mb="lg">
                    Neuen Beitrag erstellen
                </Title>

                {error && (
                    <Alert icon={<IconAlertCircle size={16} />} title="Fehler" color="red" mb="md">
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Stack gap="md">
                        <TextInput
                            label="Titel"
                            placeholder="Worum geht es?"
                            required
                            size="md"
                            value={title}
                            onChange={(e) => setTitle(e.currentTarget.value)}
                        />

                        {/* Wiederverwendung der StudyProgramSelect Komponente */}
                        <StudyProgramSelect value={studyProgramId} onChange={setStudyProgramId} />

                        <Textarea
                            label="Inhalt"
                            placeholder="Teilen Sie Ihre Gedanken..."
                            required
                            minRows={8}
                            autosize
                            size="md"
                            value={body}
                            onChange={(e) => setBody(e.currentTarget.value)}
                        />

                        <Checkbox
                            checked={shouldPublish}
                            onChange={(event) => setShouldPublish(event.currentTarget.checked)}
                            label="Der Beitrag soll direkt veröffentlicht werden"
                        />

                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={() => navigate('/')}>
                                Abbrechen
                            </Button>
                            <Button
                                type="submit"
                                loading={loading}
                                leftSection={<IconSend size={16} />}
                            >
                                Veröffentlichen
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Card>
        </Container>
    );
}
