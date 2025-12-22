import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Title,
    Text,
    Button,
    Loader,
    Group,
    Avatar,
    Badge,
    Center,
    Stack,
    ActionIcon,
    Alert,
    Paper
} from '@mantine/core';
import {
    IconArrowLeft,
    IconArticle,
    IconAlertCircle,
    IconShare,
    IconBookmark
} from '@tabler/icons-react';
import api from '../lib/api';
import { Post } from '../types/Blog';

// Wir nutzen das gleiche Farbschema wie in der PostCard
// (Tipp: In Zukunft könnte man das in eine `src/lib/theme.ts` auslagern)
const programTheme: Record<string, { bg: string; icon: string }> = {
    Informatik: { bg: 'blue.1', icon: 'blue.6' },
    Linguistik: { bg: 'cyan.1', icon: 'cyan.6' },
    BWL: { bg: 'green.1', icon: 'green.6' },
    Psychologie: { bg: 'grape.1', icon: 'grape.6' },
    'Soziale Arbeit': { bg: 'orange.1', icon: 'orange.6' },
    Physik: { bg: 'teal.1', icon: 'teal.6' },
    default: { bg: 'gray.1', icon: 'gray.6' }
};

export function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;

            setLoading(true);
            setError(null);

            try {
                // Wir holen den einzelnen Post anhand der ID
                const response = await api.get(`/posts/${id}`);
                setPost(response.data);
            } catch (err) {
                console.error('Fehler beim Laden des Beitrags:', err);
                setError('Der Beitrag konnte nicht geladen werden.');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    if (loading) {
        return (
            <Container py="xl" h="50vh">
                <Center h="100%">
                    <Loader size="lg" />
                </Center>
            </Container>
        );
    }

    if (error || !post) {
        return (
            <Container py="xl">
                <Alert icon={<IconAlertCircle size={16} />} title="Fehler" color="red" mb="md">
                    {error || 'Beitrag nicht gefunden.'}
                </Alert>
                <Button
                    leftSection={<IconArrowLeft size={16} />}
                    variant="subtle"
                    onClick={() => navigate('/')}
                >
                    Zurück zur Übersicht
                </Button>
            </Container>
        );
    }

    // Theme ermitteln
    const theme = programTheme[post.studyProgram || ''] || programTheme['default'];
    const iconColorVar = `var(--mantine-color-${theme.icon.replace('.', '-')})`;
    const authorInitial = post.author?.charAt(0).toUpperCase() || '?';

    return (
        <Container size="md" py="xl">
            {/* Navigations-Header */}
            <Button
                variant="subtle"
                color="gray"
                mb="md"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate('/')}
            >
                Zurück
            </Button>

            <Paper shadow="sm" radius="md" withBorder style={{ overflow: 'hidden' }}>
                {/* 1. Großer Header-Bereich mit Themenfarbe */}
                <div
                    style={{
                        backgroundColor: `var(--mantine-color-${theme.bg.replace('.', '-')})`,
                        height: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <IconArticle size={80} stroke={1} color={iconColorVar} />
                </div>

                <Stack p={{ base: 'md', md: 'xl' }} gap="lg">
                    {/* 2. Meta-Informationen */}
                    <Group justify="space-between" align="start">
                        <Group>
                            <Avatar color="blue" radius="xl" size="md">
                                {authorInitial}
                            </Avatar>
                            <div>
                                <Text size="sm" fw={500}>
                                    {post.author}
                                </Text>
                                <Text size="xs" c="dimmed">
                                    Veröffentlicht am{' '}
                                    {new Date(post.createdAt || Date.now()).toLocaleDateString(
                                        'de-DE'
                                    )}
                                </Text>
                            </div>
                        </Group>

                        <Group>
                            <ActionIcon variant="light" color="gray" size="lg" radius="md">
                                <IconBookmark size={20} stroke={1.5} />
                            </ActionIcon>
                            <ActionIcon variant="light" color="gray" size="lg" radius="md">
                                <IconShare size={20} stroke={1.5} />
                            </ActionIcon>
                            <Badge color={theme.icon.split('.')[0]} size="lg" variant="light">
                                {post.studyProgram || 'Allgemein'}
                            </Badge>
                        </Group>
                    </Group>

                    {/* 3. Titel und Inhalt */}
                    <div>
                        <Title order={1} mb="md" style={{ lineHeight: 1.3 }}>
                            {post.title}
                        </Title>

                        {/* whiteSpace: 'pre-wrap' sorgt dafür, dass Zeilenumbrüche 
                           aus der Datenbank erhalten bleiben 
                        */}
                        <Text size="lg" style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {post.body}
                        </Text>
                    </div>
                </Stack>
            </Paper>
        </Container>
    );
}
