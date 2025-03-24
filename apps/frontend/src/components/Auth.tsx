import { useState } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { login, register } from '../services/auth.service';
import { Input, Button, VStack, Text, Box, Heading } from '@chakra-ui/react';

export function Auth() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setTokens = useAuthStore((state) => state.setTokens);

  const handleLogin = async () => {
    try {
      const { access_token, refresh_token } = await login(username, password);
      await setTokens(access_token, refresh_token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleRegister = async () => {
    try {
      const { access_token, refresh_token } = await register(
        username,
        email,
        password,
      );
      await setTokens(access_token, refresh_token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Box
      w="400px"
      p={6}
      bg="gray.800"
      borderRadius="md"
      boxShadow="md"
      color="white"
    >
      <VStack spaceY={4}>
        <Heading size="lg">Welcome to Snooze</Heading>
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          bg="gray.700"
          color="white"
          _placeholder={{ color: 'gray.400' }}
        />
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!!username && !email}
          bg="gray.700"
          color="white"
          _placeholder={{ color: 'gray.400' }}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          bg="gray.700"
          color="white"
          _placeholder={{ color: 'gray.400' }}
        />
        {error && <Text color="red.400">{error}</Text>}
        <Button onClick={handleLogin} colorScheme="blue" w="100%">
          Login
        </Button>
        <Button onClick={handleRegister} colorScheme="green" w="100%">
          Register
        </Button>
      </VStack>
    </Box>
  );
}
