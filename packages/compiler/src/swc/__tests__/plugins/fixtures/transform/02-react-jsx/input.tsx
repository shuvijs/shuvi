import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (id: number) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);

  useEffect(() => {
    setName(user.name);
  }, [user.name]);

  const handleSave = () => {
    onEdit?.({ ...user, name });
    setIsEditing(false);
  };

  return (
    <div className="user-card">
      {isEditing ? (
        <div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <button onClick={() => setIsEditing(true)}>Edit</button>
          <button onClick={() => onDelete?.(user.id)}>Delete</button>
        </div>
      )}
    </div>
  );
};

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ]);

  const handleEdit = (updatedUser: User) => {
    setUsers(
      users.map(user => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  const handleDelete = (id: number) => {
    setUsers(users.filter(user => user.id !== id));
  };

  return (
    <div className="user-list">
      <h2>Users</h2>
      {users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};

export default UserList;
