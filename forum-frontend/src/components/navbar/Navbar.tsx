import { useEffect, useState } from 'react';
import { Group, Button, Avatar, Menu } from '@mantine/core';
import { IconUser, IconLogout } from '@tabler/icons-react';
import api from '../../lib/api';
import classes from './Navbar.module.css';
import logo from './FF.png';

export function Navbar() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await api.get('/me');
            setUser(response.data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/logout');
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className={classes.header}>
            <Group h="100%" px="md" justify="space-between">
                <Group>
                    <img src={logo} alt="Forum Logo" style={{ height: '40px' }} />
                </Group>

                <Group>
                    {loading ? null : user ? (
                        <Menu shadow="md" width={200}>
                            <Menu.Target>
                                <Avatar style={{ cursor: 'pointer' }} color="blue" radius="xl">
                                    <IconUser size={20} />
                                </Avatar>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Label>{user.email || user.username}</Menu.Label>
                                <Menu.Item
                                    leftSection={<IconLogout size={14} />}
                                    onClick={handleLogout}
                                >
                                    Logout
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    ) : (
                        <>
                            <Button variant="default">Login</Button>
                            <Button>Registrieren</Button>
                        </>
                    )}
                </Group>
            </Group>
        </header>
    );
}
