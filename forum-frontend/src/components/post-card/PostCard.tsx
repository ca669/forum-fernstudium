import { Post } from '../../types/Blog';
import { Card, Text, Badge, Button, Group, Avatar, ActionIcon, Center } from '@mantine/core';
import { IconBookmark, IconShare, IconArticle } from '@tabler/icons-react';

export function PostCard({ post }: { post: Post }) {
    // Initiale für Avatar generieren
    const authorInitial = post.author?.charAt(0).toUpperCase() || '?';

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section bg="blue.0" h={160}>
                <Center h="100%">
                    <IconArticle size={48} stroke={1.5} color="var(--mantine-color-blue-5)" />
                </Center>
            </Card.Section>

            {/* Meta Header: Autor und Kategorie/Datum */}
            <Group justify="space-between" mt="md" mb="xs">
                <Group gap="xs">
                    <Avatar color="blue" radius="xl" size="sm">
                        {authorInitial}
                    </Avatar>
                    <Text size="sm" fw={500} c="dimmed">
                        {post.author}
                    </Text>
                </Group>
                <Badge color="gray" variant="light">
                    Article
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
            <Group gap="xs">
                <Button color="blue" radius="md" style={{ flex: 1 }}>
                    Read more
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
