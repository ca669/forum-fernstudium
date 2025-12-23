import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Container, Title, Text, Loader, Alert, Button, SimpleGrid, Box } from '@mantine/core';
import { PostCard } from '../components/PostCard/PostCard';
import { IconAlertCircle, IconPlus } from '@tabler/icons-react';
import { Post } from '../types/Blog';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export function MyPosts() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);

    const { user } = useAuth();

    const fetchPosts = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.get('/user/posts');
            setPosts(response.data);
        } catch (err) {
            console.error('Fehler beim Laden der Beiträge:', err);
            setError('Beiträge konnten nicht geladen werden. Bitte versuche es später erneut.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [user]);

    if (isLoading) {
        return (
            <Container py="xl" style={{ display: 'flex', justifyContent: 'center' }}>
                <Loader size="lg" />
            </Container>
        );
    }

    if (error) {
        return (
            <Container py="xl">
                <Alert icon={<IconAlertCircle size={16} />} title="Fehler" color="red">
                    {error}
                    <Button variant="outline" color="red" size="xs" mt="md" onClick={fetchPosts}>
                        Erneut versuchen
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container py="xl">
            <Box pos="relative" mb={40}>
                <Title order={2} ta="center">
                    Meine Beiträge
                </Title>

                {user && (
                    <Box style={{ position: 'absolute', right: 0, top: 0 }}>
                        <Button
                            leftSection={<IconPlus size={16} />}
                            component={Link}
                            to="/create-post?returnUrl=/my-posts"
                        >
                            Neuer Beitrag
                        </Button>
                    </Box>
                )}
            </Box>

            {posts.length === 0 ? (
                <Text c="dimmed" ta="center">
                    Keine Beiträge gefunden.
                </Text>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                    {posts.map((post) => (
                        <PostCard
                            post={post}
                            isMyPostView={true}
                            key={post.id}
                            onUpdate={fetchPosts}
                        />
                    ))}
                </SimpleGrid>
            )}
        </Container>
    );
}
