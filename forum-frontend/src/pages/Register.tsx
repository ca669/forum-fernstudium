import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Card,
    Title,
    TextInput,
    PasswordInput,
    Button,
    Text,
    Anchor,
    Alert,
    Stack
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import api from '../lib/api';

export function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Validierung: Passwörter vergleichen
        if (password !== confirmPassword) {
            setError('Die Passwörter stimmen nicht überein.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 2. Registrierung durchführen
            await api.post('/register', {
                username,
                password
            });

            // 3. Bei Erfolg zum Login weiterleiten
            navigate('/login');
        } catch (err: any) {
            setError(
                err.response?.data?.error ||
                    'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size="xs" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
            <Card shadow="md" padding="xl" radius="md" withBorder style={{ width: '100%' }}>
                <Title order={2} ta="center" mb="md">
                    Registrierung
                </Title>
                <Text c="dimmed" size="sm" ta="center" mb="xl">
                    Erstellen Sie ein neues Konto, um dem Forum beizutreten.
                </Text>

                <form onSubmit={handleSubmit}>
                    <Stack gap="md">
                        {error && (
                            <Alert icon={<IconAlertCircle size={16} />} color="red">
                                {error}
                            </Alert>
                        )}

                        <TextInput
                            label="Benutzername"
                            placeholder="Wählen Sie einen Benutzernamen"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            size="md"
                        />

                        <PasswordInput
                            label="Passwort"
                            placeholder="Wählen Sie ein Passwort"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            size="md"
                        />

                        <PasswordInput
                            label="Passwort bestätigen"
                            placeholder="Passwort erneut eingeben"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            size="md"
                            error={
                                password !== confirmPassword && confirmPassword.length > 0
                                    ? 'Passwörter stimmen nicht überein'
                                    : null
                            }
                        />

                        <Button type="submit" fullWidth size="md" loading={loading} mt="md">
                            Registrieren
                        </Button>

                        <Text c="dimmed" size="sm" ta="center" mt="md">
                            Bereits ein Konto?{' '}
                            <Anchor href="/login" size="sm">
                                Jetzt anmelden
                            </Anchor>
                        </Text>
                    </Stack>
                </form>
            </Card>
        </Container>
    );
}
