// Enhanced workflow functions for GitHub + Trello integration

export class WorkflowIntegration {
  constructor(githubTool, trelloTool) {
    this.github = githubTool;
    this.trello = trelloTool;
  }

  /**
   * Create a GitHub branch and corresponding Trello card
   */
  async createTaskWithCard({ 
    repoName, 
    branchName, 
    taskTitle, 
    taskDescription, 
    trelloListId,
    dueDate 
  }) {
    const results = [];
    
    try {
      // 1. Create GitHub branch
      const branchResult = await this.github.run({
        repoName,
        action: 'create_branch',
        taskBranch: branchName,
        taskDescription: taskTitle
      });
      results.push({
        type: 'github',
        action: 'branch_created',
        result: branchResult
      });

      // 2. Create Trello card with GitHub link
      const cardDescription = `${taskDescription}\n\n🔗 **GitHub Branch:** ${branchName}\n📁 **Repository:** ${repoName}`;
      
      const cardResult = await this.trello.run({
        action: 'create_card',
        title: taskTitle,
        description: cardDescription,
        listId: trelloListId,
        dueDate: dueDate
      });
      results.push({
        type: 'trello',
        action: 'card_created',
        result: cardResult
      });

      return {
        success: true,
        message: 'Task workflow completed successfully!',
        results
      };

    } catch (error) {
      return {
        success: false,
        message: `Workflow failed: ${error.message}`,
        results
      };
    }
  }

  /**
   * Create PR and move Trello card to review
   */
  async createPRAndUpdateCard({
    repoName,
    branchName,
    prTitle,
    prDescription,
    cardId,
    reviewListId
  }) {
    const results = [];

    try {
      // 1. Create GitHub PR
      const prResult = await this.github.run({
        repoName,
        action: 'create_pr',
        taskBranch: branchName,
        taskDescription: prTitle
      });
      results.push({
        type: 'github',
        action: 'pr_created',
        result: prResult
      });

      // 2. Move Trello card to review column
      if (cardId && reviewListId) {
        const moveResult = await this.trello.run({
          action: 'move_card',
          cardId,
          listId: reviewListId
        });
        results.push({
          type: 'trello',
          action: 'card_moved',
          result: moveResult
        });

        // 3. Add comment with PR link
        const commentResult = await this.trello.run({
          action: 'add_comment',
          cardId,
          comment: `🔍 **Pull Request Created!**\n\n📝 **Title:** ${prTitle}\n🌿 **Branch:** ${branchName}\n📁 **Repository:** ${repoName}\n\nReady for code review! 🚀`
        });
        results.push({
          type: 'trello',
          action: 'comment_added',
          result: commentResult
        });
      }

      return {
        success: true,
        message: 'PR workflow completed successfully!',
        results
      };

    } catch (error) {
      return {
        success: false,
        message: `PR workflow failed: ${error.message}`,
        results
      };
    }
  }

  /**
   * Complete task: Close card and optionally delete branch
   */
  async completeTask({
    cardId,
    repoName,
    branchName,
    deleteBranch = false
  }) {
    const results = [];

    try {
      // 1. Mark Trello card as complete
      const updateResult = await this.trello.run({
        action: 'update_card',
        cardId,
        closed: true
      });
      results.push({
        type: 'trello',
        action: 'card_completed',
        result: updateResult
      });

      // 2. Add completion comment
      const commentResult = await this.trello.run({
        action: 'add_comment',
        cardId,
        comment: `✅ **Task Completed!**\n\n🎉 This task has been successfully completed and the card is now closed.\n📁 Repository: ${repoName}\n🌿 Branch: ${branchName}`
      });
      results.push({
        type: 'trello',
        action: 'completion_comment_added',
        result: commentResult
      });

      // Note: Branch deletion would require additional GitHub API calls
      // This could be implemented as a separate action if needed

      return {
        success: true,
        message: 'Task completion workflow finished!',
        results
      };

    } catch (error) {
      return {
        success: false,
        message: `Completion workflow failed: ${error.message}`,
        results
      };
    }
  }
}
