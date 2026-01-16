/**
 * Get project statistics
 * Returns aggregated data like conversation count, message count, etc.
 */
export const getProjectStatistics = async (projectId, userId) => {
  const project = await getProjectById(projectId, userId);

  // Get detailed statistics
  const stats = await prisma.conversation.aggregate({
    where: {
      projectId,
    },
    _count: true,
  });

  return {
    projectId,
    conversationCount: project.conversationCount,
    totalMessages: 0, // Will be calculated if needed
    lastActivityAt: project.updatedAt,
  };
};
