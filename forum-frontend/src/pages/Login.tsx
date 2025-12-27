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
import { useAuth } from '../context/AuthContext';
import { IconAlertCircle } from '@tabler/icons-react';

export function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login({ username, password });
            navigate('/');
        } catch {
            setError('Login fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size="xs" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
            <Card shadow="md" padding="xl" radius="md" withBorder style={{ width: '100%' }}>
                <Title order={2} ta="center" mb="md">
                    Login
                </Title>
                <Text c="dimmed" size="sm" ta="center" mb="xl">
                    Willkommen zurück! Bitte melden Sie sich an.
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
                            placeholder="Ihr Benutzername"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            size="md"
                        />

                        <PasswordInput
                            label="Passwort"
                            placeholder="Ihr Passwort"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            size="md"
                        />

                        <Button type="submit" fullWidth size="md" loading={loading} mt="md">
                            Anmelden
                        </Button>

                        <Text c="dimmed" size="sm" ta="center" mt="md">
                            Noch kein Konto?{' '}
                            <Anchor href="/register" size="sm">
                                Jetzt registrieren
                            </Anchor>
                        </Text>
                    </Stack>
                </form>
            </Card>
        </Container>
    );
}
