import { useState } from 'react';
import api from './lib/api';
import { Button, Container, Title, Text, Card, Group, Code, PasswordInput } from '@mantine/core';

function App() {
    const [status, setStatus] = useState('Nicht geprüft');
    const [loading, setLoading] = useState(false);

    const checkBackend = async () => {
        setLoading(true);
        setStatus('Prüfe Verbindung...');

        try {
            const response = await api.get('/status');
            setStatus(`Erfolg: ${response.data.server} ist erreichbar!`);
        } catch (error) {
            console.error(error);
            setStatus('Fehler: Backend nicht erreichbar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size="sm" mt="xl">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Title order={2} mb="md">
                    Forum Frontend
                </Title>
                <Text c="dimmed" mb="lg">
                    Dies ist ein Test mit React, Vite und Mantine UI.
                </Text>

                <PasswordInput
                    label="Input label"
                    description="Input description"
                    placeholder="Input placeholder"
                />

                <Group justify="center" mb="md">
                    <Button onClick={checkBackend} loading={loading} fullWidth>
                        Backend Status prüfen
                    </Button>
                </Group>

                {status !== 'Nicht geprüft' && (
                    <Code block color={status.startsWith('Fehler') ? 'red' : 'green'}>
                        {status}
                    </Code>
                )}
            </Card>
        </Container>
    );
}

export default App;
