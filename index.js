import 'dotenv/config';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Custom tool implementations
import { WpCliTool } from "./tools/wpcli.js";
import { GithubTool } from "./tools/github.js";
import { DocumentationTool } from "./tools/documentation.js";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load repository configuration
function loadRepositories() {
  try {
    // First try to load from environment variable (JSON string)
    if (process.env.GITHUB_REPOS) {
      return JSON.parse(process.env.GITHUB_REPOS);
    }
    
    // Then try to load from config file
    const configPath = path.join(__dirname, 'config', 'repos.json');
    if (fs.existsSync(configPath)) {
      const configFile = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configFile);
      return config.repositories;
    }
    
    // Fallback to default configuration
    console.error('⚠️  No repository configuration found. Using default CreatorLMS repos.');
    return [
      {
        name: "example-repo",
        repo: "owner/repository", 
        defaultBranch: "develop"
      }
    ];
  } catch (error) {
    console.error('❌ Error loading repository configuration:', error.message);
    console.error('📝 Using default configuration');
    return [
      {
        name: "example-repo", 
        repo: "owner/repository",
        defaultBranch: "develop"
      }
    ];
  }
}

// Create server instance
const server = new Server(
  {
    name: "Tasker MCP Server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Load repositories and initialize tools
const repositories = loadRepositories();
const documentationTool = new DocumentationTool();
const wpCliTool = new WpCliTool("/Users/macbookair/Local Sites/lms/app/public");
const githubTool = new GithubTool({
  repos: repositories,
  token: process.env.GITHUB_TOKEN,
  documentationTool: documentationTool
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "wpcli",
        description: "WordPress CLI tool for CreatorLMS",
        inputSchema: {
          type: "object",
          properties: {
            command: { type: "string", description: "WP-CLI command to execute" }
          },
          required: ["command"]
        }
      },
      {
        name: "github",
        description: `GitHub API integration - pure remote operations for repositories: ${repositories.map(r => r.name).join(', ')}`,
        inputSchema: {
          type: "object",
          properties: {
            repoName: { 
              type: "string", 
              description: `Repository name from configured repos: ${repositories.map(r => r.name).join(', ')}`,
              enum: repositories.map(r => r.name)
            },
            action: { 
              type: "string", 
              description: "Action to perform",
              enum: ["list_branches", "create_branch", "create_pr", "list_prs", "get_file", "update_file", "list_repos"]
            },
            taskBranch: { 
              type: "string", 
              description: "Branch name (required for create_branch, create_pr)" 
            },
            taskDescription: { 
              type: "string", 
              description: "Description/title for branch/PR, or filepath for file operations" 
            }
          },
          required: ["repoName", "action"]
        }
      },
      {
        name: "docs",
        description: "Company documentation and best practices - enforces rules for development",
        inputSchema: {
          type: "object",
          properties: {
            action: {
              type: "string",
              description: "Action to perform",
              enum: ["list", "get", "search", "rules", "guidelines"]
            },
            document: {
              type: "string", 
              description: "Document name or category (git, coding, review, pr, github)"
            },
            query: {
              type: "string",
              description: "Search query for finding specific information"
            }
          },
          required: ["action"]
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      case "wpcli":
        return await wpCliTool.run(args);
      case "github":
        return await githubTool.run(args);
      case "docs":
        return await documentationTool.run(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error executing ${name}: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("CreatorLMS MCP server running...");
}

main().catch(console.error);
