import { Post } from '../../types/Blog';
import {
    Card,
    Text,
    Badge,
    Button,
    Group,
    Avatar,
    ActionIcon,
    Center,
    Tooltip
} from '@mantine/core';
import { IconCopy, IconArticle, IconCheck, IconTrash, IconUpload } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { getStudyProgramTheme, getMantineColorVar } from '../../lib/studyProgramTheme';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

export function PostCard({
    post,
    isMyPostView,
    onUpdate
}: {
    post: Post;
    isMyPostView?: boolean;
    onUpdate?: () => void;
}) {
    const [copiedSuccessfully, setCopiedSuccessfully] = useState(false);

    const { user } = useAuth();

    // Initiale für Avatar generieren
    const authorInitial = post.author?.charAt(0).toUpperCase() || '?';

    // Farbe basierend auf dem Studiengang auswählen
    const theme = getStudyProgramTheme(post.studyProgram);

    // Farbe für das Icon
    const iconColorVar = getMantineColorVar(theme.icon);

    const copyToClipboard = () => {
        const postUrl = `${window.location.origin}/posts/${post.id}`;
        navigator.clipboard.writeText(postUrl);
        setCopiedSuccessfully(true);
        setTimeout(() => setCopiedSuccessfully(false), 2000);
    };

    const onPublishClick = async () => {
        try {
            await api.put(`/posts/${post.id}/publish`);
            // Nach erfolgreicher Veröffentlichung: Parent benachrichtigen
            onUpdate?.();
        } catch (err) {
            console.error('Fehler beim Veröffentlichen des Beitrags:', err);
        }
    };

    const onDeletePost = async () => {
        if (!window.confirm(`Möchten Sie den Beitrag "${post.title}" wirklich löschen?`)) {
            return;
        }

        try {
            await api.delete(`/posts/${post.id}`);
            // Nach erfolgreichem Löschen: Parent benachrichtigen
            onUpdate?.();
        } catch (err) {
            console.error('Fehler beim Löschen des Beitrags:', err);
        }
    };

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            {/* 1. Dynamischer Hintergrund */}
            <Card.Section bg={theme.bg} h={160}>
                <Center h="100%">
                    {/* 2. Dynamische Icon-Farbe */}
                    <IconArticle size={48} stroke={1.5} color={iconColorVar} />
                </Center>
                {/* Status Badge */}
                {post.status === 'draft' && (
                    <Badge color="red" variant="light" pos="absolute" top={10} right={10}>
                        Entwurf
                    </Badge>
                )}
            </Card.Section>

            {/* Meta Header: Autor und Kategorie/Datum */}
            <Group justify="space-between" mt="md" mb="xs">
                <Group gap="xs">
                    <Avatar color="gray" radius="xl" size="sm">
                        {authorInitial}
                    </Avatar>
                    <Text size="sm" fw={500} c="dimmed">
                        {post.author}
                    </Text>
                </Group>

                {/* Badge Farbe könnte man auch dynamisch machen, hier grau für Kontrast */}
                <Badge color={theme.icon.split('.')[0]} variant="light">
                    {post.studyProgram || 'Allgemein'}
                </Badge>
            </Group>

            {/* Titel prominent hervorheben */}
            <Text fw={700} size="lg" mt="xs" mb="xs" style={{ lineHeight: 1.2 }}>
                {post.title}
            </Text>

            {/* Inhalt mit CSS Line-Clamp statt substring */}
            <Text size="sm" c="dimmed" lineClamp={3} mb="md">
                {post.body}
            </Text>

            {/* Footer Aktionen */}
            <Group gap="xs" mt="auto">
                <Button
                    color="blue"
                    radius="md"
                    variant="light"
                    style={{ flex: 1 }}
                    component={Link}
                    to={`/posts/${post.id}?returnUrl=${isMyPostView ? '/my-posts' : '/'}`}
                >
                    Lesen
                </Button>
                <Tooltip label="Kopieren">
                    <ActionIcon variant="default" radius="md" size={36} onClick={copyToClipboard}>
                        {copiedSuccessfully ? (
                            <IconCheck size={18} stroke={1.5} color="green" />
                        ) : (
                            <IconCopy size={18} stroke={1.5} />
                        )}
                    </ActionIcon>
                </Tooltip>
                {post.status === 'draft' && (
                    <Tooltip label="Veröffentlichen">
                        <ActionIcon
                            variant="default"
                            radius="md"
                            size={36}
                            onClick={onPublishClick}
                        >
                            <IconUpload size={18} stroke={1.5} />
                        </ActionIcon>
                    </Tooltip>
                )}
                {user && (user?.role !== 'user' || isMyPostView) && (
                    <Tooltip label="Löschen">
                        <ActionIcon
                            radius="md"
                            variant="filled"
                            color="red"
                            size={36}
                            onClick={onDeletePost}
                        >
                            <IconTrash size={18} stroke={1.5} />
                        </ActionIcon>
                    </Tooltip>
                )}
            </Group>
        </Card>
    );
}
