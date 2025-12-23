import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
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
    Paper,
    Divider,
    Textarea,
    Card,
    Tooltip
} from '@mantine/core';
import {
    IconArrowLeft,
    IconArticle,
    IconAlertCircle,
    IconMessage,
    IconSend,
    IconTrash
} from '@tabler/icons-react';
import api from '../lib/api';
import { NewComment, PostDetailed } from '../types/Blog';
import { isAxiosError } from 'axios';
import { studyProgramThemes } from '../lib/studyProgramTheme';
import { useAuth } from '../context/AuthContext';

export function PostDetail() {
    const { id } = useParams();
    const { user } = useAuth();

    const [post, setPost] = useState<PostDetailed | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [commentBody, setCommentBody] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    const [searchParams] = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || '/';

    useEffect(() => {
        const controller = new AbortController();

        const fetchPost = async () => {
            if (!id) return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await api.get(`/posts/${id}`, {
                    signal: controller.signal
                });
                setPost(response.data);
            } catch (err) {
                if (isAxiosError(err) && err.name === 'CanceledError') {
                    return;
                }
                console.error('Fehler beim Laden des Beitrags:', err);
                setError('Der Beitrag konnte nicht geladen werden.');
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        fetchPost();

        return () => {
            controller.abort();
        };
    }, [id]);

    const onCommentSubmit = async () => {
        if (!commentBody.trim() || !id) {
            return;
        }

        setSubmittingComment(true);
        try {
            const body: NewComment = { text: commentBody };

            await api.post(`/posts/${id}/comments`, body);
            // Post neu laden um den neuen Kommentar anzuzeigen
            const response = await api.get(`/posts/${id}`);
            setPost(response.data);

            // Formular zurücksetzen
            setCommentBody('');
        } catch (err) {
            console.error('Fehler beim Senden des Kommentars:', err);
            // Hier könnte man noch einen Toast/Notification anzeigen
        } finally {
            setSubmittingComment(false);
        }
    };

    const onDeleteComment = async (commentId: number) => {
        if (!id) {
            return;
        }

        if (!window.confirm(`Möchten Sie den Kommentar wirklich löschen?`)) {
            return;
        }

        try {
            await api.delete(`/comments/${commentId}`);
            const response = await api.get(`/posts/${id}`);
            setPost(response.data);
        } catch (err) {
            console.error('Fehler beim Löschen des Kommentars:', err);
        }
    };

    if (isLoading) {
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
                <Button leftSection={<IconArrowLeft size={16} />} component={Link} to="/">
                    Zurück zur Übersicht
                </Button>
            </Container>
        );
    }

    // Theme ermitteln
    const theme = studyProgramThemes[post.studyProgram || ''] || studyProgramThemes['default'];
    const iconColorVar = `var(--mantine-color-${theme.icon.replace('.', '-')})`;
    const authorInitial = post.author?.charAt(0).toUpperCase() || '?';

    // Datum normalisieren (nutzt createdAt vom Interface oder created_at als Fallback)
    const postDate = post.createdAt || post.createdAt || Date.now();

    return (
        <Container size="md" py="xl">
            {/* Navigations-Header */}
            <Button
                variant="subtle"
                color="gray"
                mb="md"
                leftSection={<IconArrowLeft size={16} />}
                component={Link}
                to={returnUrl}
            >
                Zurück
            </Button>

            <Stack gap="xl">
                {/* Artikel Ansicht */}
                <Paper shadow="sm" radius="md" withBorder style={{ overflow: 'hidden' }}>
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
                                        {new Date(postDate).toLocaleDateString('de-DE')}
                                    </Text>
                                </div>
                            </Group>

                            <Group>
                                <Badge color={theme.icon.split('.')[0]} size="lg" variant="light">
                                    {post.studyProgram || 'Allgemein'}
                                </Badge>
                            </Group>
                        </Group>

                        <div>
                            <Title order={1} mb="md" style={{ lineHeight: 1.3 }}>
                                {post.title}
                            </Title>
                            <Text size="lg" style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                {post.body}
                            </Text>
                        </div>
                    </Stack>
                </Paper>

                {/* Kommentarsektion */}
                <Stack gap="md">
                    <Group>
                        <IconMessage size={24} />
                        <Title order={3}>Kommentare ({post.comments?.length || 0})</Title>
                    </Group>

                    <Divider />

                    {/* Liste der Kommentare */}
                    {post.comments && post.comments.length > 0 ? (
                        <Stack gap="md">
                            {post.comments.map((comment) => (
                                <Card
                                    key={comment.id}
                                    withBorder
                                    radius="md"
                                    padding="md"
                                    bg="gray.0"
                                >
                                    <Group mb="xs">
                                        <Avatar size="sm" radius="xl" color="blue">
                                            {comment.author?.charAt(0).toUpperCase() || '?'}
                                        </Avatar>
                                        <div>
                                            <Text size="sm" fw={500}>
                                                {comment.author}
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                {new Date(comment.createdAt).toLocaleDateString(
                                                    'de-DE'
                                                )}
                                            </Text>
                                        </div>
                                        {user &&
                                            (user.role !== 'user' ||
                                                user.username === comment.author) && (
                                                <Tooltip label="Löschen">
                                                    <ActionIcon
                                                        ml="auto"
                                                        size="sm"
                                                        variant="transparent"
                                                        color="red"
                                                        onClick={() => onDeleteComment(comment.id)}
                                                    >
                                                        <IconTrash size={16} stroke={1.5} />
                                                    </ActionIcon>
                                                </Tooltip>
                                            )}
                                    </Group>
                                    <Text size="sm">{comment.text}</Text>
                                </Card>
                            ))}
                        </Stack>
                    ) : (
                        <Text c="dimmed" fs="italic">
                            Noch keine Kommentare vorhanden.
                        </Text>
                    )}

                    {/* Neuer Kommentar Formular (auch für Gäste) */}
                    <Paper withBorder radius="md" p="md" mt="md">
                        <Title order={4} mb="md">
                            Kommentar schreiben
                        </Title>
                        <Stack gap="sm">
                            <Textarea
                                placeholder="Was denkst du darüber?"
                                minRows={3}
                                value={commentBody}
                                onChange={(e) => setCommentBody(e.currentTarget.value)}
                            />
                            <Group justify="flex-end">
                                <Button
                                    onClick={onCommentSubmit}
                                    loading={submittingComment}
                                    disabled={!commentBody.trim()}
                                    leftSection={<IconSend size={16} />}
                                >
                                    Senden
                                </Button>
                            </Group>
                        </Stack>
                    </Paper>
                </Stack>
            </Stack>
        </Container>
    );
}
