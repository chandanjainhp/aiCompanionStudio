// Chat Memory System - Practical Test Suite
// Location: /server/src/test/chat-memory.test.js
// Run with: npm test -- chat-memory.test.js

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../config/database.js';
import * as chatService from '../services/chat.service.js';

describe('Chat Memory System', () => {
  let testUserId, testProjectId, testConversationId;

  beforeAll(async () => {
    // Setup: Create test user, project, and conversation
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        password: 'HashedPassword123!',
        isVerified: true,
      },
    });
    testUserId = user.id;

    const project = await prisma.project.create({
      data: {
        userId: testUserId,
        name: 'Test Project',
        description: 'Testing chat memory',
        model: 'gpt-3.5-turbo',
      },
    });
    testProjectId = project.id;

    const conversation = await prisma.conversation.create({
      data: {
        projectId: testProjectId,
        userId: testUserId,
        title: 'Test Conversation',
      },
    });
    testConversationId = conversation.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.conversation.deleteMany({
      where: { id: testConversationId },
    });
    await prisma.project.deleteMany({
      where: { id: testProjectId },
    });
    await prisma.user.deleteMany({
      where: { id: testUserId },
    });
  });

  describe('Test 1: Message Storage', () => {
    it('Should save user message to database', async () => {
      const content = 'Hello, this is a test message';

      const message = await chatService.saveMessage(
        testConversationId,
        'user',
        content
      );

      expect(message).toBeDefined();
      expect(message.id).toBeDefined();
      expect(message.conversationId).toBe(testConversationId);
      expect(message.role).toBe('user');
      expect(message.content).toBe(content);
      expect(message.createdAt).toBeDefined();
    });

    it('Should save assistant message to database', async () => {
      const content = 'This is an AI response';

      const message = await chatService.saveMessage(
        testConversationId,
        'assistant',
        content,
        100,
        'gpt-3.5-turbo'
      );

      expect(message).toBeDefined();
      expect(message.id).toBeDefined();
      expect(message.role).toBe('assistant');
      expect(message.content).toBe(content);
      expect(message.model).toBe('gpt-3.5-turbo');
    });
  });

  describe('Test 2: Message Retrieval', () => {
    it('Should retrieve conversation history in correct order', async () => {
      // Add multiple messages
      await chatService.saveMessage(testConversationId, 'user', 'Message 1');
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      await chatService.saveMessage(testConversationId, 'assistant', 'Response 1');
      await new Promise(resolve => setTimeout(resolve, 10));
      await chatService.saveMessage(testConversationId, 'user', 'Message 2');

      const history = await chatService.getConversationHistory(
        testConversationId,
        10
      );

      expect(history.length).toBeGreaterThan(0);
      expect(history[0].role).toBe('user');

      // Verify chronological order
      for (let i = 1; i < history.length; i++) {
        const prevTime = new Date(history[i - 1].createdAt).getTime();
        const currTime = new Date(history[i].createdAt).getTime();
        expect(currTime).toBeGreaterThanOrEqual(prevTime);
      }
    });

    it('Should not return duplicate messages', async () => {
      const history = await chatService.getConversationHistory(
        testConversationId,
        10
      );

      const messageIds = new Set(history.map(m => m.id));
      expect(messageIds.size).toBe(history.length);
    });
  });

  describe('Test 3: Conversation Isolation', () => {
    it('Should verify user owns the conversation', async () => {
      const conversation = await prisma.conversation.findUnique({
        where: { id: testConversationId },
      });

      expect(conversation.userId).toBe(testUserId);
      expect(conversation.projectId).toBe(testProjectId);
    });

    it('Should not retrieve deleted conversations', async () => {
      const tempConv = await prisma.conversation.create({
        data: {
          projectId: testProjectId,
          userId: testUserId,
          title: 'Temp Conversation',
          deletedAt: new Date(),
        },
      });

      const fetchedConv = await prisma.conversation.findFirst({
        where: {
          id: tempConv.id,
          deletedAt: null,
        },
      });

      expect(fetchedConv).toBeNull();

      // Cleanup
      await prisma.conversation.delete({
        where: { id: tempConv.id },
      });
    });
  });

  describe('Test 4: Timestamp Validation', () => {
    it('Should maintain createdAt on message', async () => {
      const beforeTime = new Date();

      const message = await chatService.saveMessage(
        testConversationId,
        'user',
        'Timestamp test'
      );

      const afterTime = new Date();

      const createdTime = new Date(message.createdAt);
      expect(createdTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(createdTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('Should update conversation updatedAt on new message', async () => {
      const convBefore = await prisma.conversation.findUnique({
        where: { id: testConversationId },
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      await chatService.saveMessage(
        testConversationId,
        'user',
        'Timestamp update test'
      );

      const convAfter = await prisma.conversation.findUnique({
        where: { id: testConversationId },
      });

      expect(new Date(convAfter.updatedAt).getTime()).toBeGreaterThan(
        new Date(convBefore.updatedAt).getTime()
      );
    });
  });

  describe('Test 5: Input Validation', () => {
    it('Should reject empty message', async () => {
      try {
        await chatService.saveMessage(testConversationId, 'user', '');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toContain('cannot be empty');
      }
    });

    it('Should reject message exceeding max length', async () => {
      const longMessage = 'a'.repeat(10001);

      try {
        await chatService.saveMessage(testConversationId, 'user', longMessage);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toContain('must be less than 10000');
      }
    });

    it('Should accept message at max length', async () => {
      const maxMessage = 'a'.repeat(10000);

      const message = await chatService.saveMessage(
        testConversationId,
        'user',
        maxMessage
      );

      expect(message.content.length).toBe(10000);
    });
  });

  describe('Test 6: Conversation Search & Filter', () => {
    it('Should retrieve all conversations for project', async () => {
      const result = await chatService.getProjectConversations(
        testProjectId,
        testUserId,
        1,
        50
      );

      expect(Array.isArray(result.conversations)).toBe(true);
      expect(result.total).toBeGreaterThan(0);
      expect(result.conversations[0].projectId).toBe(testProjectId);
    });

    it('Should sort conversations by updated date', async () => {
      const result = await chatService.getProjectConversations(
        testProjectId,
        testUserId,
        1,
        50,
        'updated_at',
        'desc'
      );

      const conversations = result.conversations;
      for (let i = 1; i < conversations.length; i++) {
        const prevTime = new Date(conversations[i - 1].updatedAt).getTime();
        const currTime = new Date(conversations[i].updatedAt).getTime();
        expect(prevTime).toBeGreaterThanOrEqual(currTime);
      }
    });
  });

  describe('Test 7: Message Role Validation', () => {
    it('Should support user role', async () => {
      const message = await chatService.saveMessage(
        testConversationId,
        'user',
        'User message test'
      );
      expect(message.role).toBe('user');
    });

    it('Should support assistant role', async () => {
      const message = await chatService.saveMessage(
        testConversationId,
        'assistant',
        'Assistant message test'
      );
      expect(message.role).toBe('assistant');
    });

    it('Should support system role', async () => {
      const message = await chatService.saveMessage(
        testConversationId,
        'system',
        'System message test'
      );
      expect(message.role).toBe('system');
    });
  });

  describe('Test 8: Pagination', () => {
    it('Should paginate conversations correctly', async () => {
      const page1 = await chatService.getProjectConversations(
        testProjectId,
        testUserId,
        1,
        2
      );

      const page2 = await chatService.getProjectConversations(
        testProjectId,
        testUserId,
        2,
        2
      );

      expect(page1.conversations).not.toEqual(page2.conversations);
    });

    it('Should limit conversations per page', async () => {
      const result = await chatService.getProjectConversations(
        testProjectId,
        testUserId,
        1,
        5 // limit
      );

      expect(result.conversations.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Test 9: Soft Delete', () => {
    it('Should not retrieve soft-deleted conversations', async () => {
      const tempConv = await prisma.conversation.create({
        data: {
          projectId: testProjectId,
          userId: testUserId,
          title: 'Temp Conv for Delete Test',
          deletedAt: new Date(),
        },
      });

      const result = await chatService.getProjectConversations(
        testProjectId,
        testUserId
      );

      const found = result.conversations.find(c => c.id === tempConv.id);
      expect(found).toBeUndefined();

      // Cleanup
      await prisma.conversation.delete({
        where: { id: tempConv.id },
      });
    });
  });

  describe('Test 10: Security - User Isolation', () => {
    it('Should prevent unauthorized access to conversation', async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: `other-${Date.now()}@example.com`,
          name: 'Other User',
          password: 'HashedPassword123!',
          isVerified: true,
        },
      });

      try {
        // Try to access conversation with different user
        await chatService.getProjectConversations(
          testProjectId,
          otherUser.id // Different user ID
        );
        expect.fail('Should have thrown ForbiddenError');
      } catch (error) {
        expect(error.message).toContain('does not own');
      }

      // Cleanup
      await prisma.user.delete({
        where: { id: otherUser.id },
      });
    });
  });
});

export default {
  test_summary: `
  ✅ Chat Memory System Tests

  Test Suite: 10 categories
  - Message Storage (2 tests)
  - Message Retrieval (2 tests)
  - Conversation Isolation (2 tests)
  - Timestamp Validation (2 tests)
  - Input Validation (3 tests)
  - Conversation Search (2 tests)
  - Message Role Validation (3 tests)
  - Pagination (2 tests)
  - Soft Delete (1 test)
  - Security (1 test)

  Total: 20 test cases

  Run with: npm test -- chat-memory.test.js
  `,
};
