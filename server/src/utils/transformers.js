/**
 * Project Data Transformer
 * 
 * Converts database project objects to canonical API format.
 * Ensures consistent data shape across ALL endpoints.
 * 
 * CRITICAL: Use this function in EVERY endpoint that returns project data.
 */

/**
 * Transform database project row to canonical API Project format
 * 
 * @param {Object} dbProject - Raw database project object
 * @param {number} conversationCount - Total conversations for this project
 * @returns {Object} Transformed project with canonical fields
 */
export function transformProjectForAPI(dbProject, conversationCount = 0) {
  if (!dbProject) {
    return null;
  }

  return {
    // === IDENTIFIERS ===
    id: String(dbProject.id),
    userId: String(dbProject.userId || dbProject.user_id),

    // === BASIC INFO ===
    name: String(dbProject.name),
    description: dbProject.description || null,

    // === AI CONFIGURATION ===
    model: String(dbProject.model || 'gemini-2.0-flash'),
    temperature: parseFloat(dbProject.temperature || 0.7),
    maxTokens: parseInt(dbProject.maxTokens || dbProject.max_tokens || 2048),
    systemPrompt: String(dbProject.systemPrompt || dbProject.system_prompt || 'You are a helpful AI assistant.'),

    // === STATUS ===
    isActive: Boolean(dbProject.isActive !== false && dbProject.is_active !== false),

    // === STATISTICS ===
    conversationCount: parseInt(conversationCount) || 0,

    // === TIMESTAMPS (ISO 8601 format) ===
    createdAt: dbProject.createdAt
      ? new Date(dbProject.createdAt).toISOString()
      : new Date().toISOString(),
    updatedAt: dbProject.updatedAt
      ? new Date(dbProject.updatedAt).toISOString()
      : new Date().toISOString(),
    deletedAt: dbProject.deletedAt
      ? new Date(dbProject.deletedAt).toISOString()
      : null,
  };
}

/**
 * Transform array of projects
 * 
 * @param {Array} dbProjects - Array of raw database project objects
 * @param {Map|Object} conversationCounts - Map of projectId -> conversationCount
 * @returns {Array} Array of transformed projects
 */
export function transformProjectsForAPI(dbProjects, conversationCounts = {}) {
  if (!Array.isArray(dbProjects)) {
    return [];
  }

  return dbProjects.map((project) => {
    const count = conversationCounts[project.id] || conversationCounts[String(project.id)] || 0;
    return transformProjectForAPI(project, count);
  });
}

/**
 * Validate transformed project has all required fields
 * 
 * @param {Object} project - Transformed project object
 * @returns {boolean} True if valid, throws otherwise
 */
export function validateTransformedProject(project) {
  const requiredFields = [
    'id',
    'userId',
    'name',
    'model',
    'temperature',
    'maxTokens',
    'systemPrompt',
    'isActive',
    'conversationCount',
    'createdAt',
    'updatedAt',
  ];

  for (const field of requiredFields) {
    if (!(field in project)) {
      throw new Error(`Missing required field in project response: ${field}`);
    }
  }

  // Type validation
  if (typeof project.conversationCount !== 'number') {
    throw new Error(`conversationCount must be a number, got ${typeof project.conversationCount}`);
  }

  if (typeof project.temperature !== 'number') {
    throw new Error(`temperature must be a number, got ${typeof project.temperature}`);
  }

  if (typeof project.maxTokens !== 'number') {
    throw new Error(`maxTokens must be a number, got ${typeof project.maxTokens}`);
  }

  return true;
}

export default {
  transformProjectForAPI,
  transformProjectsForAPI,
  validateTransformedProject,
};
