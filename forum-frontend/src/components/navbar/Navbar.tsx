import { Group, Button, Avatar, Menu } from '@mantine/core';
import { IconUser, IconLogout, IconLibrary, IconSettings } from '@tabler/icons-react';
import classes from './Navbar.module.css';
import logo from './FF.png';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export function Navbar() {
    const { user, isLoading, logout } = useAuth();

    const navigate = useNavigate();

    const onLogoutClick = async () => {
        await logout();
        navigate('/');
    };

    return (
        <header className={classes.header}>
            <Group h="100%" px="md" justify="space-between">
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <Group style={{ cursor: 'pointer' }}>
                        <img src={logo} alt="Forum Logo" style={{ height: '40px' }} />
                    </Group>
                </Link>

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
                                <Menu.Item
                                    leftSection={<IconLibrary size={14} />}
                                    component={Link}
                                    to="/my-posts"
                                >
                                    Meine Beiträge
                                </Menu.Item>
                                {(user.role === 'admin' || user.role === 'mod') && (
                                    <Menu.Item
                                        leftSection={<IconSettings size={14} />}
                                        component={Link}
                                        to="/admin"
                                    >
                                        Admin Bereich
                                    </Menu.Item>
                                )}
                                <Menu.Item
                                    color="red"
                                    leftSection={<IconLogout size={14} />}
                                    onClick={onLogoutClick}
                                >
                                    Logout
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    ) : (
                        <>
                            <Button variant="default" component={Link} to="/login">
                                Login
                            </Button>
                            <Button component={Link} to="/register">
                                Registrieren
                            </Button>
                        </>
                    )}
                </Group>
            </Group>
        </header>
    );
}
