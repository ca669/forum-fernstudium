import { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Table,
    Badge,
    Button,
    Select,
    Group,
    Text,
    Loader,
    Center,
    Stack
} from '@mantine/core';
import { IconTrash, IconUserEdit } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

interface AdminUser {
    id: number;
    username: string;
    role: 'user' | 'moderator' | 'admin';
    createdAt: string;
}

export default function Admin() {
    const { user } = useAuth();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [selectedRole, setSelectedRole] = useState<string>('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users');
            setUsers(response.data.users);
        } catch (error) {
            console.error('Fehler beim Laden der Benutzer:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId: number, username: string) => {
        if (!window.confirm(`Möchten Sie den Benutzer "${username}" wirklich löschen?`)) {
            return;
        }

        try {
            await api.delete(`/admin/users/${userId}`);
            await fetchUsers(); // Liste neu laden
        } catch (error: any) {
            alert(error.response?.data?.error || 'Fehler beim Löschen des Benutzers');
            console.error('Fehler beim Löschen:', error);
        }
    };

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRole });
            setEditingUserId(null);
            setSelectedRole('');
            await fetchUsers(); // Liste neu laden
        } catch (error: any) {
            alert(error.response?.data?.error || 'Fehler beim Ändern der Rolle');
            console.error('Fehler beim Ändern der Rolle:', error);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'red';
            case 'moderator':
                return 'blue';
            default:
                return 'gray';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin':
                return 'Admin';
            case 'mod':
                return 'Moderator';
            default:
                return 'User';
        }
    };

    // Ladeanzeige während des Ladens
    if (loading) {
        return (
            <Center h="100vh">
                <Loader size="lg" />
            </Center>
        );
    }

    // Wenn Benutzer nicht eingeloggt oder keine Rechte hat
    if (!user || user?.role === 'user') {
        return (
            <Container size="xl" py="xl">
                <Title order={1}>Zugriff verweigert</Title>
                <Text>Sie haben keine Berechtigung, auf diese Seite zuzugreifen.</Text>
            </Container>
        );
    }

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                <Title order={1}>Benutzerverwaltung</Title>

                <Text c="dimmed">Gesamt: {users.length} Benutzer</Text>

                <Table striped highlightOnHover withTableBorder>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>ID</Table.Th>
                            <Table.Th>Benutzername</Table.Th>
                            <Table.Th>Rolle</Table.Th>
                            <Table.Th>Erstellt am</Table.Th>
                            <Table.Th>Aktionen</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {users.map((u) => (
                            <Table.Tr key={u.id}>
                                <Table.Td>{u.id}</Table.Td>
                                <Table.Td>
                                    <Text fw={500}>{u.username}</Text>
                                </Table.Td>
                                <Table.Td>
                                    {editingUserId === u.id && user?.role === 'admin' ? (
                                        <Group gap="xs">
                                            <Select
                                                size="xs"
                                                value={selectedRole}
                                                onChange={(value) => setSelectedRole(value || '')}
                                                data={[
                                                    { value: 'user', label: 'User' },
                                                    { value: 'mod', label: 'Moderator' },
                                                    { value: 'admin', label: 'Admin' }
                                                ]}
                                                style={{ width: 120 }}
                                            />
                                            <Button
                                                size="xs"
                                                onClick={() => handleRoleChange(u.id, selectedRole)}
                                                disabled={!selectedRole}
                                            >
                                                Speichern
                                            </Button>
                                            <Button
                                                size="xs"
                                                variant="subtle"
                                                onClick={() => {
                                                    setEditingUserId(null);
                                                    setSelectedRole('');
                                                }}
                                            >
                                                Abbrechen
                                            </Button>
                                        </Group>
                                    ) : (
                                        <Badge color={getRoleBadgeColor(u.role)}>
                                            {getRoleLabel(u.role)}
                                        </Badge>
                                    )}
                                </Table.Td>
                                <Table.Td>
                                    {new Date(u.createdAt).toLocaleDateString('de-DE')}
                                </Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        {/* Rolle ändern nur für Admins */}
                                        {user?.role === 'admin' && editingUserId !== u.id && (
                                            <Button
                                                size="xs"
                                                variant="light"
                                                leftSection={<IconUserEdit size={16} />}
                                                onClick={() => {
                                                    setEditingUserId(u.id);
                                                    setSelectedRole(u.role);
                                                }}
                                                disabled={u.id === parseInt(user.id)}
                                            >
                                                Rolle ändern
                                            </Button>
                                        )}

                                        {/* Löschen für Admin und Moderator */}
                                        {(user?.role === 'admin' || user?.role === 'mod') && (
                                            <Button
                                                size="xs"
                                                color="red"
                                                variant="light"
                                                leftSection={<IconTrash size={16} />}
                                                onClick={() => handleDeleteUser(u.id, u.username)}
                                                disabled={u.id === parseInt(user.id)}
                                            >
                                                Löschen
                                            </Button>
                                        )}
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Stack>
        </Container>
    );
}
