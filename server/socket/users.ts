interface User {
    socketId: string;
    username: string;
    namespace: 'login' | 'game';
    connectedAt: number;
}

const users = new Map<string, User>();

const socketToUsername = new Map<string, string>();

export const addUser = (socketId: string, username: string, namespace: 'login' | 'game'): void => {
    const key = username.toLowerCase();
    const existingUser = users.get(key);
    if (existingUser) {
        socketToUsername.delete(existingUser.socketId);
    }

    const user: User = {
        socketId,
        username,
        namespace,
        connectedAt: Date.now()
    };

    users.set(key, user);
    socketToUsername.set(socketId, key);
};

export const removeUserBySocketId = (socketId: string): User | undefined => {
    const usernameKey = socketToUsername.get(socketId);
    if (!usernameKey) return undefined;

    const user = users.get(usernameKey);
    if (user && user.socketId === socketId) {
        users.delete(usernameKey);
        socketToUsername.delete(socketId);
        return user;
    }
    return undefined;
};

export const isUsernameTaken = (username: string): boolean => {
    return users.has(username.toLowerCase());
};

export const getUserByUsername = (username: string): User | undefined => {
    return users.get(username.toLowerCase());
};

export const getUserBySocketId = (socketId: string): User | undefined => {
    const usernameKey = socketToUsername.get(socketId);
    if (!usernameKey) return undefined;
    return users.get(usernameKey);
};

export const getAllUsers = (): User[] => {
    return Array.from(users.values());
};

export const updateUserNamespace = (username: string, namespace: 'login' | 'game', newSocketId: string): void => {
    const key = username.toLowerCase();
    const user = users.get(key);
    if (user) {
        socketToUsername.delete(user.socketId);
        socketToUsername.set(newSocketId, key);

        user.namespace = namespace;
        user.socketId = newSocketId;
    }
};
