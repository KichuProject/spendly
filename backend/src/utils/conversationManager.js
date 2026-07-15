/**
 * Conversation Manager
 * Stores conversational context in memory.
 * Future enhancement: Use Redis for persistent and distributed storage.
 */

const { v4: uuidv4 } = require('uuid');

// In-memory store: { conversationId: { conversationId, userId, messages: [], pendingTransactions: [], createdAt, updatedAt } }
const memoryStore = new Map();

/**
 * Creates or retrieves a conversation
 */
const getOrCreateConversation = (userId, existingConversationId = null) => {
  let id = existingConversationId;

  if (id && memoryStore.has(id)) {
    const conv = memoryStore.get(id);
    // Security check: ensure the conversation belongs to the user
    if (conv.userId === userId) {
      return conv;
    }
  }

  // Generate new conversation
  if (!id || !memoryStore.has(id)) {
    id = uuidv4();
  }

  const newConv = {
    conversationId: id,
    userId,
    messages: [],
    pendingTransactions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  memoryStore.set(id, newConv);
  return newConv;
};

/**
 * Retrieves a conversation (returns null if not found)
 */
const getConversation = (id, userId) => {
  if (memoryStore.has(id)) {
    const conv = memoryStore.get(id);
    if (conv.userId === userId) {
      return conv;
    }
  }
  return null;
};

/**
 * Updates a conversation
 */
const updateConversation = (id, userId, updates) => {
  const conv = getConversation(id, userId);
  if (conv) {
    const updated = {
      ...conv,
      ...updates,
      updatedAt: new Date(),
    };
    memoryStore.set(id, updated);
    return updated;
  }
  return null;
};

/**
 * Appends a message to the conversation history
 */
const addMessage = (id, userId, role, content) => {
  const conv = getConversation(id, userId);
  if (conv) {
    conv.messages.push({ role, content });
    conv.updatedAt = new Date();
    memoryStore.set(id, conv);
    return conv;
  }
  return null;
};

/**
 * Deletes a conversation
 */
const deleteConversation = (id, userId) => {
  const conv = getConversation(id, userId);
  if (conv) {
    memoryStore.delete(id);
    return true;
  }
  return false;
};

module.exports = {
  getOrCreateConversation,
  getConversation,
  updateConversation,
  addMessage,
  deleteConversation,
};
