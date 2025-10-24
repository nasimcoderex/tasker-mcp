import { Octokit } from "octokit";

export class GithubTool {
  constructor({ repos, repo, token, defaultBranch = "develop", documentationTool = null }) {
    // Support both single repo (backwards compatibility) and multiple repos
    if (repos) {
      this.repos = repos;
    } else if (repo) {
      this.repos = [{ name: repo.split('/')[1], repo, defaultBranch }];
    }
    
    this.octokit = new Octokit({ auth: token });
    this.docs = documentationTool;
  }

  async run({ repoName, taskBranch, taskDescription, action = 'create_branch' }) {
    try {
      // Find the specified repository
      const targetRepo = this.repos.find(r => r.name === repoName || r.repo === repoName);
      if (!targetRepo) {
        throw new Error(`Repository '${repoName}' not found. Available repos: ${this.repos.map(r => r.name).join(', ')}`);
      }

      const [owner, repo] = targetRepo.repo.split("/");
      const branchName = taskBranch || `task-${Date.now()}`;

      switch (action) {
        case 'list_repos':
          return this.listRepositoriesFormatted();
        
        case 'list_branches':
          return await this.listBranches(owner, repo);
        
        case 'create_branch':
          return await this.createBranch(owner, repo, branchName, targetRepo.defaultBranch, taskDescription);
        
        case 'create_pr':
          return await this.createPullRequest(owner, repo, branchName, targetRepo.defaultBranch, taskDescription);
        
        case 'list_prs':
          return await this.listPullRequests(owner, repo);
        
        case 'get_file':
          return await this.getFileContent(owner, repo, taskDescription, targetRepo.defaultBranch); // taskDescription as filepath
        
        case 'update_file':
          return await this.updateFile(owner, repo, taskDescription, branchName); // taskDescription as file update info
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  // List all branches in a repository
  async listBranches(owner, repo) {
    const branches = await this.octokit.rest.repos.listBranches({
      owner,
      repo,
      per_page: 50
    });

    return {
      content: [
        {
          type: "text",
          text: `📋 Branches in ${owner}/${repo}:\n${branches.data.map(branch => 
            `• ${branch.name}${branch.protected ? ' (protected)' : ''}`
          ).join('\n')}`
        }
      ]
    };
  }

  // Create a new branch from develop
  async createBranch(owner, repo, branchName, baseBranch, description) {
    // Validate branch name according to company rules
    const validation = this.validateBranchName(branchName);
    if (!validation.isValid) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Branch name validation failed: ${validation.error}\n\n📋 Company Rules:\n${validation.rules}`
          }
        ],
        isError: true
      };
    }

    // Get the SHA of the base branch
    const baseRef = await this.octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${baseBranch}`
    });

    // Create new branch
    await this.octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: baseRef.data.object.sha
    });

    return {
      content: [
        {
          type: "text",
          text: `✅ Created branch '${branchName}' from '${baseBranch}' in ${owner}/${repo}\n📝 Description: ${description}\n\n${validation.complianceMessage}`
        }
      ]
    };
  }

  // Create a pull request
  async createPullRequest(owner, repo, headBranch, baseBranch, title) {
    // Generate PR body following company guidelines
    const prBody = this.generatePRBody(title, headBranch, baseBranch);
    
    const pr = await this.octokit.rest.pulls.create({
      owner,
      repo,
      title,
      head: headBranch,
      base: baseBranch,
      body: prBody
    });

    const guidelines = this.getPRGuidelines();

    return {
      content: [
        {
          type: "text",
          text: `✅ Created PR #${pr.data.number}: ${pr.data.html_url}\n📋 ${headBranch} → ${baseBranch}\n\n${guidelines}`
        }
      ]
    };
  }

  // List pull requests
  async listPullRequests(owner, repo) {
    const prs = await this.octokit.rest.pulls.list({
      owner,
      repo,
      state: 'open',
      per_page: 20
    });

    return {
      content: [
        {
          type: "text",
          text: `📋 Open Pull Requests in ${owner}/${repo}:\n${prs.data.map(pr => 
            `• #${pr.number}: ${pr.title}\n  ${pr.head.ref} → ${pr.base.ref} (${pr.html_url})`
          ).join('\n\n')}`
        }
      ]
    };
  }

  // Get file content from repository
  async getFileContent(owner, repo, filepath, branch = 'develop') {
    try {
      const file = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path: filepath,
        ref: branch
      });

      const content = Buffer.from(file.data.content, 'base64').toString('utf-8');
      
      return {
        content: [
          {
            type: "text",
            text: `📄 File: ${filepath} (${branch})\n\`\`\`\n${content}\n\`\`\``
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ File not found: ${filepath} in ${owner}/${repo}:${branch}`
          }
        ],
        isError: true
      };
    }
  }

  // Update a file in the repository
  async updateFile(owner, repo, updateInfo, branch) {
    const { filepath, content, message } = JSON.parse(updateInfo);
    
    try {
      // Get current file to get its SHA
      const currentFile = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path: filepath,
        ref: branch
      });

      // Update the file
      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: filepath,
        message: message || `Update ${filepath}`,
        content: Buffer.from(content).toString('base64'),
        sha: currentFile.data.sha,
        branch
      });

      return {
        content: [
          {
            type: "text",
            text: `✅ Updated ${filepath} in branch '${branch}' of ${owner}/${repo}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to update ${filepath}: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  // Helper method to list available repositories
  listRepositories() {
    return this.repos.map(repo => ({
      name: repo.name,
      repo: repo.repo,
      defaultBranch: repo.defaultBranch
    }));
  }

  // Formatted repository list for MCP responses
  listRepositoriesFormatted() {
    const repos = this.listRepositories();
    return {
      content: [
        {
          type: "text",
          text: `📋 Configured Repositories:\n${repos.map(repo => 
            `• ${repo.name}\n  GitHub: ${repo.repo}\n  Default Branch: ${repo.defaultBranch}`
          ).join('\n\n')}`
        }
      ]
    };
  }

  // Validate branch name according to company rules
  validateBranchName(branchName) {
    const rules = {
      prefixes: ['feature/', 'fix/', 'enhancement/', 'hotfix/', 'bugfix/', 'feat/', 'chore/', 'docs/', 'style/', 'refactor/', 'test/'],
      maxLength: 50,
      allowedChars: /^[a-z0-9\/\-_]+$/i
    };

    // Check prefix
    const hasValidPrefix = rules.prefixes.some(prefix => branchName.startsWith(prefix));
    if (!hasValidPrefix) {
      return {
        isValid: false,
        error: `Branch name must start with one of: ${rules.prefixes.join(', ')}`,
        rules: `📋 Git Best Practice Rules:\n• Use descriptive prefixes (feature/, fix/, enhancement/, etc.)\n• Keep names under ${rules.maxLength} characters\n• Use lowercase with hyphens or underscores\n• Example: feature/user-authentication or fix/login-bug`
      };
    }

    // Check length
    if (branchName.length > rules.maxLength) {
      return {
        isValid: false,
        error: `Branch name too long (${branchName.length}/${rules.maxLength} chars)`,
        rules: `📋 Git Best Practice Rules:\n• Keep branch names under ${rules.maxLength} characters\n• Use concise but descriptive names`
      };
    }

    // Check characters
    if (!rules.allowedChars.test(branchName)) {
      return {
        isValid: false,
        error: 'Branch name contains invalid characters',
        rules: `📋 Git Best Practice Rules:\n• Use only letters, numbers, hyphens, underscores, and forward slashes\n• No spaces or special characters`
      };
    }

    return {
      isValid: true,
      complianceMessage: '✅ Branch name follows company Git best practices'
    };
  }

  // Generate PR body following company guidelines
  generatePRBody(title, headBranch, baseBranch) {
    return `## Description
${title}

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement

## Testing
- [ ] I have tested these changes locally
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Checklist
- [ ] My code follows the company coding standards
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] Any dependent changes have been merged and published

## Branch: \`${headBranch}\` → \`${baseBranch}\`

**Created by:** GitHub MCP Server
**Note:** Please ensure this PR follows all company guidelines before merging.`;
  }

  // Get PR guidelines reminder
  getPRGuidelines() {
    return `📋 **Next Steps - Company PR Guidelines:**
• Add reviewers from your team
• Link related issues using "Closes #123" or "Fixes #123"
• Ensure all CI checks pass
• Update documentation if needed
• Test thoroughly before requesting review
• Use "Squash and merge" for feature branches`;
  }

  // Get company-specific commit message format
  getCommitMessageGuidelines() {
    return `📋 **Commit Message Format (Conventional Commits):**
• feat: A new feature
• fix: A bug fix  
• docs: Documentation changes
• style: Code style changes (formatting, etc.)
• refactor: Code refactoring
• test: Adding or modifying tests
• chore: Maintenance tasks

**Example:** "feat: add user authentication system"`;
  }
}
