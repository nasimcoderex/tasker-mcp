# Universal GitHub MCP Server

A configurable Model Context Protocol (MCP) server that provides GitHub API integration for any repositories you specify.

## 🚀 Features

- **Pure GitHub API Operations** - No local file dependencies
- **Multi-Repository Support** - Work with multiple GitHub repositories
- **Configurable** - Easily configure for your own repositories
- **Branch Management** - Create, list, and manage branches
- **Pull Request Operations** - Create and manage PRs
- **File Operations** - Read and update files via GitHub API
- **🆕 Company Documentation Integration** - Enforces company rules and best practices
- **🆕 Automatic Validation** - Validates branch names, PR formats according to your guidelines
- **🆕 Smart Documentation Search** - Find specific rules and guidelines quickly

## 📋 Available Actions

### GitHub Actions
| Action | Description |
|--------|-------------|
| `list_repos` | Show all configured repositories |
| `list_branches` | List branches in a repository |
| `create_branch` | Create a new branch (with validation) |
| `list_prs` | List open pull requests |
| `create_pr` | Create a pull request (with template) |
| `get_file` | Get file content from repository |
| `update_file` | Update file content in repository |

### Documentation Actions  
| Action | Description |
|--------|-------------|
| `list` | Show all available company documentation |
| `get` | Get specific documentation (git, coding, review, pr) |
| `search` | Search through documentation for specific terms |
| `rules` | Get company rules for specific categories |
| `guidelines` | Get action-specific guidelines |

## ⚙️ Configuration

### Method 1: Environment Variable (Recommended)

Set the `GITHUB_REPOS` environment variable with your repository configuration:

```bash
export GITHUB_REPOS='[
  {
    "name": "my-frontend",
    "repo": "myusername/frontend-app",
    "defaultBranch": "main"
  },
  {
    "name": "my-backend",
    "repo": "myusername/backend-api", 
    "defaultBranch": "develop"
  }
]'
```

### Method 2: Configuration File

Edit `config/repos.json`:

```json
{
  "repositories": [
    {
      "name": "my-project",
      "repo": "owner/repository-name",
      "defaultBranch": "main"
    },
    {
      "name": "another-project",
      "repo": "owner/another-repo",
      "defaultBranch": "develop"
    }
  ]
}
```

## 🔑 GitHub Token Setup

1. Generate a Personal Access Token:
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Generate new token with `repo` permissions

2. Set the token as environment variable:
```bash
export GITHUB_TOKEN="your_github_token_here"
```

## 🏃‍♂️ Running the Server

```bash
# Install dependencies
npm install

# Set your GitHub token
export GITHUB_TOKEN="your_token_here"

# Optional: Set custom repositories
export GITHUB_REPOS='[{"name":"my-repo","repo":"owner/repo","defaultBranch":"main"}]'

# Start the MCP server
npm start
# or
node index.js
```

## 🔧 Claude Desktop Integration

Add to your Claude Desktop `config.json`:

```json
{
  "mcpServers": {
    "github-mcp": {
      "command": "node",
      "args": ["/path/to/your/github-mcp/index.js"],
      "env": {
        "GITHUB_TOKEN": "your_github_token_here",
        "GITHUB_REPOS": "[{\"name\":\"my-repo\",\"repo\":\"owner/repo\",\"defaultBranch\":\"main\"}]"
      }
    }
  }
}
```

## 📝 Usage Examples

### List Configured Repositories
```json
{
  "repoName": "any-repo-name",
  "action": "list_repos"
}
```

### Create a New Branch
```json
{
  "repoName": "my-frontend",
  "action": "create_branch",
  "taskBranch": "feature/new-component",
  "taskDescription": "Add new React component"
}
```

### Get File Content
```json
{
  "repoName": "my-backend",
  "action": "get_file", 
  "taskDescription": "src/server.js"
}
```

### List Pull Requests
```json
{
  "repoName": "my-frontend",
  "action": "list_prs"
}
```

## 🔒 Security Notes

- Never commit your GitHub token to version control
- Use environment variables for sensitive configuration
- The server only requires `repo` permissions for private repositories
- For public repositories, you can use a token with minimal permissions

## 🛠 Development

```bash
# Clone the repository
git clone <your-repo-url>
cd github-mcp

# Install dependencies  
npm install

# Create your configuration
cp config/repos.json.example config/repos.json
# Edit config/repos.json with your repositories

# Set environment variables
export GITHUB_TOKEN="your_token"

# Run the server
npm start
```

## 📄 Example Configuration Files

### For Open Source Projects
```json
{
  "repositories": [
    {
      "name": "react",
      "repo": "facebook/react",
      "defaultBranch": "main"
    },
    {
      "name": "vue",
      "repo": "vuejs/vue",
      "defaultBranch": "dev"
    }
  ]
}
```

### For Company Projects
```json
{
  "repositories": [
    {
      "name": "web-app",
      "repo": "company/web-application", 
      "defaultBranch": "develop"
    },
    {
      "name": "mobile-app",
      "repo": "company/mobile-app",
      "defaultBranch": "main"
    },
    {
      "name": "api-service",
      "repo": "company/api-service",
      "defaultBranch": "master"
    }
  ]
}
```

## 🎯 Default Behavior

If no configuration is found, the server will use example configuration and show helpful error messages to guide you through setup.

## 📞 Support

- Check the server logs for configuration loading messages
- Use the `list_repos` action to verify your configuration
- Ensure your GitHub token has the necessary permissions

---

**Ready to use with your own repositories!** 🚀
