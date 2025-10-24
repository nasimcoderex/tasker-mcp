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
import { TrelloTool } from "./tools/trello.js";
import { WorkflowIntegration } from "./tools/workflow.js";

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
        defaultBranch: "main"
      }
    ];
  } catch (error) {
    console.error('❌ Error loading repository configuration:', error.message);
    console.error('📝 Using default configuration');
    return [
      {
        name: "example-repo", 
        repo: "owner/repository",
        defaultBranch: "main"
      }
    ];
  }
}

// Workflow handler function
async function handleWorkflow(workflowTool, args) {
  const { action, ...params } = args;
  
  try {
    let result;
    
    switch (action) {
      case 'create_task_with_card':
        result = await workflowTool.createTaskWithCard(params);
        break;
      case 'create_pr_and_update_card':
        result = await workflowTool.createPRAndUpdateCard(params);
        break;
      case 'complete_task':
        result = await workflowTool.completeTask(params);
        break;
      default:
        throw new Error(`Unknown workflow action: ${action}`);
    }
    
    // Format the result for MCP response
    const responseText = result.success 
      ? `✅ ${result.message}\n\n${result.results.map(r => 
          `**${r.type.toUpperCase()} - ${r.action}:**\n${r.result.content?.[0]?.text || 'Completed'}`
        ).join('\n\n')}`
      : `❌ ${result.message}`;
    
    return {
      content: [{
        type: "text",
        text: responseText
      }],
      isError: !result.success
    };
    
  } catch (error) {
    return {
      content: [{
        type: "text", 
        text: `❌ Workflow error: ${error.message}`
      }],
      isError: true
    };
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

// Initialize Trello tool (optional - only if credentials are provided)
let trelloTool = null;
let workflowTool = null;
if (process.env.TRELLO_API_KEY && process.env.TRELLO_TOKEN) {
  trelloTool = new TrelloTool({
    apiKey: process.env.TRELLO_API_KEY,
    token: process.env.TRELLO_TOKEN,
    boardId: process.env.TRELLO_BOARD_ID, // Optional default
    listId: process.env.TRELLO_LIST_ID    // Optional default
  });
  
  // Initialize workflow integration if both GitHub and Trello are available
  workflowTool = new WorkflowIntegration(githubTool, trelloTool);
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = [
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
  ];

  // Add Trello tool if available
  if (trelloTool) {
    tools.push({
      name: "trello",
      description: "Trello task management integration - create cards, manage boards and lists",
      inputSchema: {
        type: "object",
        properties: {
          action: {
            type: "string",
            description: "Action to perform",
            enum: ["list_boards", "list_lists", "create_card", "list_cards", "update_card", "move_card", "add_comment"]
          },
          title: {
            type: "string",
            description: "Card title (required for create_card)"
          },
          description: {
            type: "string",
            description: "Card description or comment text"
          },
          boardId: {
            type: "string",
            description: "Trello board ID (optional if default is set)"
          },
          listId: {
            type: "string",
            description: "Trello list ID (optional if default is set)"
          },
          cardId: {
            type: "string",
            description: "Card ID (required for update_card, move_card, add_comment)"
          },
          dueDate: {
            type: "string",
            description: "Due date in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)"
          },
          closed: {
            type: "boolean",
            description: "Whether the card is closed/completed"
          },
          comment: {
            type: "string",
            description: "Comment text (required for add_comment)"
          }
        },
        required: ["action"]
      }
    });

    // Add workflow tool if both GitHub and Trello are available
    tools.push({
      name: "workflow",
      description: "Integrated GitHub + Trello workflows - automate task creation and management",
      inputSchema: {
        type: "object",
        properties: {
          action: {
            type: "string",
            description: "Workflow action to perform",
            enum: ["create_task_with_card", "create_pr_and_update_card", "complete_task"]
          },
          repoName: {
            type: "string",
            description: "Repository name (required for GitHub operations)",
            enum: repositories.map(r => r.name)
          },
          branchName: {
            type: "string",
            description: "Git branch name"
          },
          taskTitle: {
            type: "string",
            description: "Title for both branch and Trello card"
          },
          taskDescription: {
            type: "string",
            description: "Detailed description of the task"
          },
          trelloListId: {
            type: "string",
            description: "Trello list ID where card should be created"
          },
          cardId: {
            type: "string",
            description: "Trello card ID for updates"
          },
          reviewListId: {
            type: "string",
            description: "Trello list ID for review/in-progress cards"
          },
          dueDate: {
            type: "string",
            description: "Due date in ISO format"
          }
        },
        required: ["action"]
      }
    });
  }

  return { tools };
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
      case "trello":
        if (!trelloTool) {
          throw new Error("Trello integration not available. Please set TRELLO_API_KEY and TRELLO_TOKEN environment variables.");
        }
        return await trelloTool.run(args);
      case "workflow":
        if (!workflowTool) {
          throw new Error("Workflow integration not available. Please set up both GitHub and Trello integrations.");
        }
        return await handleWorkflow(workflowTool, args);
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
