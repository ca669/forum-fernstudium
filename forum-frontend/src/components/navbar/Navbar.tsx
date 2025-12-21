import { Group, Button, Avatar, Menu } from '@mantine/core';
import { IconUser, IconLogout } from '@tabler/icons-react';
import classes from './Navbar.module.css';
import logo from './FF.png';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Navbar() {
    const navigate = useNavigate();
    const { user, isLoading, logout } = useAuth();

    return (
        <header className={classes.header}>
            <Group h="100%" px="md" justify="space-between">
                <Group onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <img src={logo} alt="Forum Logo" style={{ height: '40px' }} />
                </Group>

                <Group>
                    {isLoading ? null : user ? (
                        <Menu shadow="md" width={200}>
                            <Menu.Target>
                                <Avatar style={{ cursor: 'pointer' }} color="blue" radius="xl">
                                    <IconUser size={20} />
                                </Avatar>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Label>{user.username}</Menu.Label>
                                <Menu.Item leftSection={<IconLogout size={14} />} onClick={logout}>
                                    Logout
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    ) : (
                        <>
                            <Button
                                variant="default"
                                component="a"
                                onClick={() => navigate('/login')}
                            >
                                Login
                            </Button>
                            <Button component="a" onClick={() => navigate('/register')}>
                                Registrieren
                            </Button>
                        </>
                    )}
                </Group>
            </Group>
        </header>
    );
}
