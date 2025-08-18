// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Create the askveda database
db = db.getSiblingDB('askveda');

// Create a user for the askveda database
db.createUser({
  user: 'askveda_user',
  pwd: 'askveda_password',
  roles: [
    {
      role: 'readWrite',
      db: 'askveda'
    }
  ]
});

// Create collections with some initial data if needed
db.createCollection('users');
db.createCollection('chats');
db.createCollection('messages');
db.createCollection('sessions');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.chats.createIndex({ "createdBy": 1 });
db.chats.createIndex({ "participants": 1 });
db.messages.createIndex({ "chatId": 1 });
db.messages.createIndex({ "timestamp": 1 });
db.sessions.createIndex({ "userId": 1 });
db.sessions.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

print('MongoDB initialization completed successfully!');
