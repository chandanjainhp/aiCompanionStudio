/**
 * Project Type Validation
 * Validates project objects from the API
 */

/**
 * Validates a single project object
 * A valid project must have: id, userid, name, systemPrompt, model, temperature, maxTokens, conversationCount
 * @param {any} project - The project object to validate
 * @returns {boolean} True if project is valid
 */
export const isValidProject = (project) => {
  if (!project || typeof project !== 'object') {
    console.warn('❌ Project is not an object:', project);
    return false;
  }

  const requiredFields = ['id', 'userId', 'name', 'systemPrompt', 'model', 'temperature', 'maxTokens', 'conversationCount'];

  for (const field of requiredFields) {
    if (!(field in project)) {
      console.warn(`❌ Project missing required field: ${field}`, project);
      return false;
    }
  }

  // Validate field types
  if (typeof project.id !== 'string' && typeof project.id !== 'number') {
    console.warn('❌ Project id must be string or number:', project.id);
    return false;
  }

  if (typeof project.userId !== 'string' && typeof project.userId !== 'number') {
    console.warn('❌ Project userId must be string or number:', project.userId);
    return false;
  }

  if (typeof project.name !== 'string') {
    console.warn('❌ Project name must be string:', project.name);
    return false;
  }

  if (typeof project.systemPrompt !== 'string') {
    console.warn('❌ Project systemPrompt must be string:', project.systemPrompt);
    return false;
  }

  if (typeof project.model !== 'string') {
    console.warn('❌ Project model must be string:', project.model);
    return false;
  }

  if (typeof project.temperature !== 'number') {
    console.warn('❌ Project temperature must be number:', project.temperature);
    return false;
  }

  if (typeof project.maxTokens !== 'number') {
    console.warn('❌ Project maxTokens must be number:', project.maxTokens);
    return false;
  }

  if (typeof project.conversationCount !== 'number') {
    console.warn('❌ Project conversationCount must be number:', project.conversationCount);
    return false;
  }

  return true;
};

/**
 * Validates an array of project objects
 * @param {any} projects - Array of project objects to validate
 * @returns {boolean} True if all projects are valid
 */
export const isValidProjectArray = (projects) => {
  if (!Array.isArray(projects)) {
    console.warn('❌ Projects is not an array:', projects);
    return false;
  }

  return projects.every((project, index) => {
    const isValid = isValidProject(project);
    if (!isValid) {
      console.warn(`❌ Project at index ${index} is invalid:`, project);
    }
    return isValid;
  });
};
