import { Post } from '../../types/Blog';
import { Card, Text, Badge, Button, Group, Avatar, ActionIcon, Center } from '@mantine/core';
import { IconBookmark, IconShare, IconArticle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

// Themenfarben für verschiedene Studiengänge
const programTheme: Record<string, { bg: string; icon: string }> = {
    Informatik: { bg: 'blue.1', icon: 'blue.6' },
    Linguistik: { bg: 'cyan.1', icon: 'cyan.6' },
    BWL: { bg: 'green.1', icon: 'green.6' },
    Psychologie: { bg: 'grape.1', icon: 'grape.6' },
    'Soziale Arbeit': { bg: 'orange.1', icon: 'orange.6' },
    Physik: { bg: 'teal.1', icon: 'teal.6' },
    default: { bg: 'gray.1', icon: 'gray.6' }
};

export function PostCard({ post }: { post: Post }) {
    const navigate = useNavigate();

    // Initiale für Avatar generieren
    const authorInitial = post.author?.charAt(0).toUpperCase() || '?';

    // Farbe basierend auf dem Studiengang auswählen, ansonsten Standardfarbe
    const theme = programTheme[post.studyProgram || ''] || programTheme['default'];

    // Farbe für das Icon
    const iconColorVar = `var(--mantine-color-${theme.icon.replace('.', '-')})`;

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            {/* 1. Dynamischer Hintergrund */}
            <Card.Section bg={theme.bg} h={160}>
                <Center h="100%">
                    {/* 2. Dynamische Icon-Farbe */}
                    <IconArticle size={48} stroke={1.5} color={iconColorVar} />
                </Center>
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
                    onClick={() => navigate(`/posts/${post.id}`)}
                >
                    Weiterlesen
                </Button>
                <ActionIcon variant="default" radius="md" size={36}>
                    <IconBookmark size={18} stroke={1.5} />
                </ActionIcon>
                <ActionIcon variant="default" radius="md" size={36}>
                    <IconShare size={18} stroke={1.5} />
                </ActionIcon>
            </Group>
        </Card>
    );
}
