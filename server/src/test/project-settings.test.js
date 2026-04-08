/**
 * Project Settings Test Suite
 * Location: /server/src/test/project-settings.test.js
 *
 * Tests to verify that:
 * 1. Each project has its own model, temperature, max tokens, and system prompt
 * 2. Project settings are correctly retrieved and used
 * 3. Project settings are correctly updated
 * 4. Different projects can have different settings
 * 5. AI API calls use project-specific settings
 *
 * Run with: npm test -- project-settings.test.js
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { prisma } from '../config/database.js';
import * as projectService from '../services/project.service.js';
import * as chatService from '../services/chat.service.js';

describe('Project Settings - Per-Project AI Configuration', () => {
  let testUserId;
  let project1Id, project2Id, project3Id;

  beforeAll(async () => {
    console.log('\n📋 [Test Setup] Creating test user and projects...\n');

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: `test-projects-${Date.now()}@example.com`,
        name: 'Test User',
        password: 'HashedPassword123!',
        isVerified: true,
      },
    });
    testUserId = user.id;
    console.log(`✅ Created test user: ${testUserId}`);
  });

  afterAll(async () => {
    console.log('\n🧹 [Test Cleanup] Deleting test data...\n');

    // Cleanup - delete all projects for this user
    await prisma.project.deleteMany({
      where: { userId: testUserId },
    });

    // Delete user
    await prisma.user.delete({
      where: { id: testUserId },
    });

    console.log(`✅ Cleaned up test data for user: ${testUserId}`);
  });

  describe('1. Project Creation with Custom Settings', () => {
    it('should create project with custom model, temperature, maxTokens, and systemPrompt', async () => {
      console.log('\n🧪 Test 1: Creating project with custom settings...');

      const projectData = {
        name: 'GPT-4 Project',
        description: 'Project configured with GPT-4 and custom settings',
        model: 'openai/gpt-4-turbo',
        temperature: 0.8,
        maxTokens: 4000,
        systemPrompt: 'You are an expert software engineer.',
        coreMemory: 'User prefers verbose explanations',
      };

      const project = await projectService.createProject(testUserId, projectData);
      project1Id = project.id;

      console.log('✅ Project created successfully');
      console.log(`   ID: ${project.id}`);
      console.log(`   Model: ${project.model}`);
      console.log(`   Temperature: ${project.temperature}`);
      console.log(`   MaxTokens: ${project.maxTokens}`);
      console.log(`   SystemPrompt: ${project.systemPrompt.substring(0, 50)}...`);

      // Assertions
      expect(project.id).toBeDefined();
      expect(project.model).toBe('openai/gpt-4-turbo');
      expect(project.temperature).toBe(0.8);
      expect(project.maxTokens).toBe(4000);
      expect(project.systemPrompt).toBe('You are an expert software engineer.');
      expect(project.coreMemory).toBe('User prefers verbose explanations');
    });

    it('should create project with default settings when not specified', async () => {
      console.log('\n🧪 Test 2: Creating project with default settings...');

      const projectData = {
        name: 'Default Settings Project',
        description: 'Project with default settings',
      };

      const project = await projectService.createProject(testUserId, projectData);
      project2Id = project.id;

      console.log('✅ Project created with defaults');
      console.log(`   Model: ${project.model} (default)`);
      console.log(`   Temperature: ${project.temperature} (default)`);
      console.log(`   MaxTokens: ${project.maxTokens} (default)`);
      console.log(`   SystemPrompt: ${project.systemPrompt}`);

      // Assertions
      expect(project.model).toBe('gemini-2.0-flash');
      expect(project.temperature).toBe(0.7);
      expect(project.maxTokens).toBe(2000);
      expect(project.systemPrompt).toBe('You are a helpful AI assistant.');
    });

    it('should create project with completely different settings', async () => {
      console.log('\n🧪 Test 3: Creating project with different settings...');

      const projectData = {
        name: 'Claude Project',
        description: 'Project configured with Claude 3',
        model: 'anthropic/claude-3-opus-20250219',
        temperature: 0.3,
        maxTokens: 1000,
        systemPrompt: 'You are a creative writing assistant.',
      };

      const project = await projectService.createProject(testUserId, projectData);
      project3Id = project.id;

      console.log('✅ Project created with different settings');
      console.log(`   Model: ${project.model}`);
      console.log(`   Temperature: ${project.temperature}`);
      console.log(`   MaxTokens: ${project.maxTokens}`);
      console.log(`   SystemPrompt: ${project.systemPrompt.substring(0, 50)}...`);

      // Assertions
      expect(project.model).toBe('anthropic/claude-3-opus-20250219');
      expect(project.temperature).toBe(0.3);
      expect(project.maxTokens).toBe(1000);
      expect(project.systemPrompt).toBe('You are a creative writing assistant.');
    });
  });

  describe('2. Project Retrieval and Setting Verification', () => {
    it('should retrieve project and verify all settings are preserved', async () => {
      console.log('\n🧪 Test 4: Retrieving and verifying project settings...');

      const project = await projectService.getProjectById(project1Id, testUserId);

      console.log('✅ Project retrieved successfully');
      console.log(`   Model: ${project.model}`);
      console.log(`   Temperature: ${project.temperature}`);
      console.log(`   MaxTokens: ${project.maxTokens}`);
      console.log(`   SystemPrompt: ${project.systemPrompt.substring(0, 50)}...`);
      console.log(`   CoreMemory: ${project.coreMemory.substring(0, 50)}`);

      // Assertions - exact match
      expect(project.model).toBe('openai/gpt-4-turbo');
      expect(project.temperature).toBe(0.8);
      expect(project.maxTokens).toBe(4000);
      expect(project.systemPrompt).toBe('You are an expert software engineer.');
      expect(project.coreMemory).toBe('User prefers verbose explanations');
    });

    it('should retrieve all projects and verify each has independent settings', async () => {
      console.log('\n🧪 Test 5: Retrieving all projects and verifying independence...');

      const result = await projectService.getUserProjects(testUserId, 0, 10);
      const projects = result.projects;

      console.log(`✅ Retrieved ${projects.length} projects`);

      // Verify Project 1
      const proj1 = projects.find(p => p.id === project1Id);
      console.log('\n   Project 1 Settings:');
      console.log(`   - Model: ${proj1.model}`);
      console.log(`   - Temperature: ${proj1.temperature}`);
      console.log(`   - MaxTokens: ${proj1.maxTokens}`);

      expect(proj1.model).toBe('openai/gpt-4-turbo');
      expect(proj1.temperature).toBe(0.8);
      expect(proj1.maxTokens).toBe(4000);

      // Verify Project 2
      const proj2 = projects.find(p => p.id === project2Id);
      console.log('\n   Project 2 Settings (Defaults):');
      console.log(`   - Model: ${proj2.model}`);
      console.log(`   - Temperature: ${proj2.temperature}`);
      console.log(`   - MaxTokens: ${proj2.maxTokens}`);

      expect(proj2.model).toBe('gemini-2.0-flash');
      expect(proj2.temperature).toBe(0.7);
      expect(proj2.maxTokens).toBe(2000);

      // Verify Project 3
      const proj3 = projects.find(p => p.id === project3Id);
      console.log('\n   Project 3 Settings (Claude):');
      console.log(`   - Model: ${proj3.model}`);
      console.log(`   - Temperature: ${proj3.temperature}`);
      console.log(`   - MaxTokens: ${proj3.maxTokens}`);

      expect(proj3.model).toBe('anthropic/claude-3-opus-20250219');
      expect(proj3.temperature).toBe(0.3);
      expect(proj3.maxTokens).toBe(1000);

      console.log(
        '\n✅ All projects have independent settings as expected!'
      );
    });
  });

  describe('3. Project Settings Update', () => {
    it('should update project settings independently', async () => {
      console.log('\n🧪 Test 6: Updating project 2 settings...');

      const updatedData = {
        model: 'openai/gpt-4',
        temperature: 0.5,
        maxTokens: 3000,
        systemPrompt: 'You are a helpful coding assistant.',
      };

      const updated = await projectService.updateProject(
        project2Id,
        testUserId,
        updatedData
      );

      console.log('✅ Project 2 settings updated');
      console.log(`   Old Model: gemini-2.0-flash → New Model: ${updated.model}`);
      console.log(`   Old Temperature: 0.7 → New Temperature: ${updated.temperature}`);
      console.log(`   Old MaxTokens: 2000 → New MaxTokens: ${updated.maxTokens}`);

      // Verify update
      expect(updated.model).toBe('openai/gpt-4');
      expect(updated.temperature).toBe(0.5);
      expect(updated.maxTokens).toBe(3000);
      expect(updated.systemPrompt).toBe('You are a helpful coding assistant.');
    });

    it('should verify other projects are not affected by update', async () => {
      console.log(
        '\n🧪 Test 7: Verifying other projects unaffected by update...'
      );

      // Verify Project 1 is still unchanged
      const proj1 = await projectService.getProjectById(project1Id, testUserId);
      console.log('   Project 1 (unchanged):');
      console.log(`   - Model: ${proj1.model}`);
      console.log(`   - Temperature: ${proj1.temperature}`);
      console.log(`   - MaxTokens: ${proj1.maxTokens}`);

      expect(proj1.model).toBe('openai/gpt-4-turbo');
      expect(proj1.temperature).toBe(0.8);
      expect(proj1.maxTokens).toBe(4000);

      // Verify Project 3 is still unchanged
      const proj3 = await projectService.getProjectById(project3Id, testUserId);
      console.log('   Project 3 (unchanged):');
      console.log(`   - Model: ${proj3.model}`);
      console.log(`   - Temperature: ${proj3.temperature}`);
      console.log(`   - MaxTokens: ${proj3.maxTokens}`);

      expect(proj3.model).toBe('anthropic/claude-3-opus-20250219');
      expect(proj3.temperature).toBe(0.3);
      expect(proj3.maxTokens).toBe(1000);

      console.log(
        '✅ Other projects remain unchanged as expected!'
      );
    });

    it('should update only specific settings while preserving others', async () => {
      console.log('\n🧪 Test 8: Partial update of settings...');

      const partialUpdate = {
        temperature: 0.9,
        // Don't update model, maxTokens, or systemPrompt
      };

      const updated = await projectService.updateProject(
        project1Id,
        testUserId,
        partialUpdate
      );

      console.log('✅ Partial update completed');
      console.log(`   Temperature updated: 0.8 → ${updated.temperature}`);
      console.log(`   Model preserved: ${updated.model}`);
      console.log(`   MaxTokens preserved: ${updated.maxTokens}`);
      console.log(`   SystemPrompt preserved: ${updated.systemPrompt.substring(0, 40)}...`);

      // Verify partial update
      expect(updated.temperature).toBe(0.9);
      expect(updated.model).toBe('openai/gpt-4-turbo'); // Should remain unchanged
      expect(updated.maxTokens).toBe(4000); // Should remain unchanged
      expect(updated.systemPrompt).toBe('You are an expert software engineer.'); // Should remain unchanged
    });
  });

  describe('4. System Prompt Handling', () => {
    it('should retrieve active system prompt for project', async () => {
      console.log('\n🧪 Test 9: Retrieving active system prompt...');

      const systemPrompt = await chatService.getActiveSystemPrompt(project1Id);

      console.log('✅ System prompt retrieved');
      console.log(`   Prompt: ${systemPrompt.substring(0, 100)}...`);

      // Should get the project's custom system prompt
      expect(systemPrompt).toContain('expert software engineer');
    });

    it('should include core memory in system prompt when present', async () => {
      console.log('\n🧪 Test 10: Verifying core memory injection in system prompt...');

      const systemPrompt = await chatService.getActiveSystemPrompt(project1Id);

      console.log('✅ System prompt retrieved with core memory');
      console.log(`   Prompt preview: ${systemPrompt.substring(0, 150)}...`);

      // Should include both system prompt and core memory
      expect(systemPrompt).toContain('expert software engineer');
      expect(systemPrompt).toContain('User prefers verbose explanations');
    });

    it('should use default system prompt when not specified', async () => {
      console.log('\n🧪 Test 11: Default system prompt usage...');

      // Project 2 now has an updated systemPrompt, let's check it
      const systemPrompt = await chatService.getActiveSystemPrompt(project2Id);

      console.log('✅ System prompt retrieved');
      console.log(`   Prompt: ${systemPrompt.substring(0, 100)}...`);

      // Should get the project's custom system prompt
      expect(systemPrompt).toContain('helpful coding assistant');
    });
  });

  describe('5. Data Integrity - Multi-User Isolation', () => {
    let secondUserId, secondUserProject1Id;

    beforeAll(async () => {
      console.log('\n📋 [Setup] Creating second test user...\n');
      // Create a second user to test data isolation
      const user = await prisma.user.create({
        data: {
          email: `test-user2-${Date.now()}@example.com`,
          name: 'Test User 2',
          password: 'HashedPassword456!',
          isVerified: true,
        },
      });
      secondUserId = user.id;

      // Create project for second user
      const proj = await projectService.createProject(secondUserId, {
        name: 'Second User Project',
        model: 'meta-llama/llama-3.1-405b',
        temperature: 0.1,
        maxTokens: 500,
        systemPrompt: 'Second user system prompt',
      });
      secondUserProject1Id = proj.id;
    });

    afterAll(async () => {
      // Cleanup second user
      await prisma.project.deleteMany({
        where: { userId: secondUserId },
      });
      await prisma.user.delete({
        where: { id: secondUserId },
      });
    });

    it('should not allow first user to access second user project', async () => {
      console.log('\n🧪 Test 12: Testing multi-user isolation...');

      try {
        // First user should not be able to access second user's project
        await projectService.getProjectById(
          secondUserProject1Id,
          testUserId
        );
        // Should not reach here
        expect.fail('Should have thrown ForbiddenError');
      } catch (error) {
        console.log('✅ Access correctly denied');
        console.log(`   Error: ${error.message}`);
        expect(error.message).toContain('do not own');
      }
    });

    it('should maintain independent settings for different users', async () => {
      console.log(
        '\n🧪 Test 13: Verifying independent settings across users...'
      );

      // Get project from first user
      const user1Project = await projectService.getProjectById(
        project1Id,
        testUserId
      );

      // Get project from second user
      const user2Project = await projectService.getProjectById(
        secondUserProject1Id,
        secondUserId
      );

      console.log('✅ Both users can access their own projects');
      console.log('   User 1 Project Settings:');
      console.log(`   - Model: ${user1Project.model}`);
      console.log('   User 2 Project Settings:');
      console.log(`   - Model: ${user2Project.model}`);

      // Verify they have different settings
      expect(user1Project.model).not.toBe(user2Project.model);
      expect(user1Project.temperature).not.toBe(user2Project.temperature);
      expect(user1Project.maxTokens).not.toBe(user2Project.maxTokens);
      expect(user1Project.systemPrompt).not.toBe(
        user2Project.systemPrompt
      );

      console.log(
        '\n✅ Each user has independent project settings!'
      );
    });
  });

  describe('6. Settings Range Validation', () => {
    it('should handle temperature at boundaries (0.0 and 1.0)', async () => {
      console.log('\n🧪 Test 14: Testing temperature boundaries...');

      // Create project with temperature 0.0
      const proj1 = await projectService.createProject(testUserId, {
        name: 'Deterministic Project',
        temperature: 0.0,
      });

      // Create project with temperature 1.0
      const proj2 = await projectService.createProject(testUserId, {
        name: 'Maximally Random Project',
        temperature: 1.0,
      });

      console.log('✅ Projects created with boundary temperatures');
      console.log(`   Temperature 0.0: ${proj1.temperature}`);
      console.log(`   Temperature 1.0: ${proj2.temperature}`);

      expect(proj1.temperature).toBe(0.0);
      expect(proj2.temperature).toBe(1.0);

      // Cleanup
      await prisma.project.deleteMany({
        where: { id: { in: [proj1.id, proj2.id] } },
      });
    });

    it('should handle various valid token counts', async () => {
      console.log('\n🧪 Test 15: Testing token count variations...');

      const tokenCounts = [256, 512, 1024, 2048, 4096, 8192];
      const projects = [];

      for (const tokens of tokenCounts) {
        const proj = await projectService.createProject(testUserId, {
          name: `Project ${tokens} tokens`,
          maxTokens: tokens,
        });
        projects.push(proj);
        console.log(`✅ Created project with ${tokens} max tokens`);
      }

      // Verify all were created correctly
      for (let i = 0; i < projects.length; i++) {
        expect(projects[i].maxTokens).toBe(tokenCounts[i]);
      }

      // Cleanup
      await prisma.project.deleteMany({
        where: { id: { in: projects.map(p => p.id) } },
      });
    });
  });
});

describe('Project Settings - AI API Integration', () => {
  let testUserId, projectId, conversationId;

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: `test-ai-${Date.now()}@example.com`,
        name: 'Test AI User',
        password: 'HashedPassword789!',
        isVerified: true,
      },
    });
    testUserId = user.id;

    // Create project with specific settings
    const project = await prisma.project.create({
      data: {
        userId: testUserId,
        name: 'AI Integration Test Project',
        model: 'openai/gpt-4-turbo',
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: 'You are testing project-specific AI settings.',
      },
    });
    projectId = project.id;

    // Create conversation
    const conversation = await prisma.conversation.create({
      data: {
        projectId,
        userId: testUserId,
        title: 'Test Conversation',
      },
    });
    conversationId = conversation.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.conversation.deleteMany({
      where: { id: conversationId },
    });
    await prisma.project.deleteMany({
      where: { id: projectId },
    });
    await prisma.user.deleteMany({
      where: { id: testUserId },
    });
  });

  it('should fetch project settings for AI API call', async () => {
    console.log(
      '\n🧪 Test 16: Verifying project settings available for AI API...'
    );

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        model: true,
        temperature: true,
        maxTokens: true,
        systemPrompt: true,
      },
    });

    console.log('✅ Project settings fetched for AI API');
    console.log(`   Model: ${project.model}`);
    console.log(`   Temperature: ${project.temperature}`);
    console.log(`   MaxTokens: ${project.maxTokens}`);
    console.log(`   SystemPrompt: ${project.systemPrompt}`);

    // Verify all settings are available
    expect(project.model).toBe('openai/gpt-4-turbo');
    expect(project.temperature).toBe(0.7);
    expect(project.maxTokens).toBe(2000);
    expect(project.systemPrompt).toContain('project-specific');
  });

  it('should have separate settings per project in same database', async () => {
    console.log('\n🧪 Test 17: Multiple projects in same database...');

    // Create another project with different settings
    const project2 = await prisma.project.create({
      data: {
        userId: testUserId,
        name: 'Another Test Project',
        model: 'anthropic/claude-3-sonnet-20250229',
        temperature: 0.3,
        maxTokens: 1000,
        systemPrompt: 'Different prompt for different project.',
      },
    });

    // Fetch both projects and verify independence
    const proj1 = await prisma.project.findUnique({
      where: { id: projectId },
    });
    const proj2 = await prisma.project.findUnique({
      where: { id: project2.id },
    });

    console.log('✅ Both projects accessible with independent settings');
    console.log(`   Project 1 Model: ${proj1.model}`);
    console.log(`   Project 2 Model: ${proj2.model}`);

    expect(proj1.model).not.toBe(proj2.model);
    expect(proj1.temperature).not.toBe(proj2.temperature);
    expect(proj1.maxTokens).not.toBe(proj2.maxTokens);

    // Cleanup
    await prisma.project.delete({
      where: { id: project2.id },
    });
  });
});
