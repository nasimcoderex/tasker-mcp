import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DocumentationTool {
  constructor() {
    this.docsPath = path.join(__dirname, '..', 'docs');
    this.documentCache = new Map();
    this.loadDocuments();
  }

  // Load all documentation files into cache
  loadDocuments() {
    try {
      if (!fs.existsSync(this.docsPath)) {
        console.error('⚠️  Docs directory not found at:', this.docsPath);
        return;
      }

      const files = fs.readdirSync(this.docsPath);
      const mdFiles = files.filter(file => file.endsWith('.md'));

      mdFiles.forEach(file => {
        const filePath = path.join(this.docsPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const docName = file.replace('.md', '');
        
        this.documentCache.set(docName, {
          filename: file,
          content: content,
          title: this.extractTitle(content),
          summary: this.extractSummary(content)
        });
      });

      console.error(`📚 Loaded ${mdFiles.length} documentation files`);
    } catch (error) {
      console.error('❌ Error loading documentation:', error.message);
    }
  }

  // Extract title from markdown content
  extractTitle(content) {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1] : 'Untitled Document';
  }

  // Extract summary from markdown content (first few lines after title)
  extractSummary(content) {
    const lines = content.split('\n');
    const titleIndex = lines.findIndex(line => line.startsWith('# '));
    
    if (titleIndex === -1) return 'No summary available';
    
    // Get the next few non-empty lines after title for summary
    const summaryLines = [];
    for (let i = titleIndex + 1; i < lines.length && summaryLines.length < 3; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('#') && !line.startsWith('>') && !line.startsWith('---')) {
        summaryLines.push(line.replace(/^\*\*|^\>/, '').trim());
      }
    }
    
    return summaryLines.join(' ') || 'No summary available';
  }

  // Main run method for MCP tool
  async run({ action, document, query }) {
    try {
      switch (action) {
        case 'list':
          return this.listDocuments();
        
        case 'get':
          return this.getDocument(document);
        
        case 'search':
          return this.searchDocuments(query);
        
        case 'rules':
          return this.getCompanyRules(document);
        
        case 'guidelines':
          return this.getGuidelines(document);
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Documentation Error: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  // List all available documents
  listDocuments() {
    const docs = Array.from(this.documentCache.values());
    
    return {
      content: [
        {
          type: "text",
          text: `📚 Available Company Documentation:\n\n${docs.map(doc => 
            `📄 **${doc.title}**\n   File: ${doc.filename}\n   ${doc.summary}\n`
          ).join('\n')}\n\n💡 Use action 'get' with document name to read full content`
        }
      ]
    };
  }

  // Get a specific document
  getDocument(docName) {
    if (!docName) {
      return this.listDocuments();
    }

    const doc = this.documentCache.get(docName);
    if (!doc) {
      const availableDocs = Array.from(this.documentCache.keys()).join(', ');
      throw new Error(`Document '${docName}' not found. Available: ${availableDocs}`);
    }

    return {
      content: [
        {
          type: "text",
          text: `📄 **${doc.title}**\n\n${doc.content}`
        }
      ]
    };
  }

  // Search through documents
  searchDocuments(query) {
    if (!query) {
      throw new Error('Search query is required');
    }

    const results = [];
    const searchTerm = query.toLowerCase();

    this.documentCache.forEach((doc, docName) => {
      const content = doc.content.toLowerCase();
      if (content.includes(searchTerm)) {
        // Find relevant sections
        const lines = doc.content.split('\n');
        const matchingLines = lines.filter(line => 
          line.toLowerCase().includes(searchTerm)
        );

        results.push({
          document: docName,
          title: doc.title,
          matches: matchingLines.slice(0, 5) // Limit to 5 matches per doc
        });
      }
    });

    if (results.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `🔍 No results found for: "${query}"\n\n📚 Try searching for: git, coding, review, PR, best practices, security, etc.`
          }
        ]
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `🔍 Search results for "${query}":\n\n${results.map(result => 
            `📄 **${result.title}** (${result.document})\n${result.matches.map(match => `   • ${match.trim()}`).join('\n')}\n`
          ).join('\n')}`
        }
      ]
    };
  }

  // Get company rules for specific actions
  getCompanyRules(category) {
    const rulesMap = {
      'git': 'git-best-practices',
      'coding': 'coding-best-practices', 
      'review': 'code-review-best-practices',
      'pr': 'how-to-make-github-prs',
      'github': 'how-to-make-github-prs'
    };

    const docName = rulesMap[category?.toLowerCase()] || category;
    
    if (!docName) {
      return {
        content: [
          {
            type: "text",
            text: `📋 Company Rules Categories:\n\n${Object.keys(rulesMap).map(key => 
              `• **${key}** - ${rulesMap[key]}`
            ).join('\n')}\n\n💡 Use: action='rules', document='git' (or coding, review, pr)`
          }
        ]
      };
    }

    return this.getDocument(docName);
  }

  // Get guidelines for MCP actions
  getGuidelines(actionType) {
    const guidelines = {
      'create_branch': {
        rules: ['git-best-practices'],
        summary: 'Follow Git branching strategy: feature/fix/enhancement prefixes'
      },
      'create_pr': {
        rules: ['how-to-make-github-prs', 'code-review-best-practices'],
        summary: 'Use proper PR templates, clear descriptions, and link issues'
      },
      'code_review': {
        rules: ['code-review-best-practices', 'coding-best-practices'],
        summary: 'Check functionality, security, performance, and maintainability'
      },
      'coding': {
        rules: ['coding-best-practices'],
        summary: 'Follow DRY, KISS, SOLID principles with proper naming and documentation'
      }
    };

    if (!actionType || !guidelines[actionType]) {
      return {
        content: [
          {
            type: "text",
            text: `📋 Available Action Guidelines:\n\n${Object.keys(guidelines).map(action => 
              `• **${action}** - ${guidelines[action].summary}`
            ).join('\n')}\n\n💡 Use: action='guidelines', document='create_branch' (or create_pr, code_review, coding)`
          }
        ]
      };
    }

    const guideline = guidelines[actionType];
    const relevantDocs = guideline.rules.map(ruleName => {
      const doc = this.documentCache.get(ruleName);
      return doc ? `📄 **${doc.title}**\n${doc.content.split('\n').slice(0, 20).join('\n')}...\n` : '';
    }).join('\n');

    return {
      content: [
        {
          type: "text",
          text: `📋 Guidelines for ${actionType}:\n\n${guideline.summary}\n\n${relevantDocs}`
        }
      ]
    };
  }

  // Get specific rules to enforce during GitHub operations
  getGitHubOperationRules() {
    const gitRules = this.documentCache.get('git-best-practices');
    const prRules = this.documentCache.get('how-to-make-github-prs');
    
    return {
      branchNaming: 'Use prefixes: feature/, fix/, enhancement/, hotfix/',
      commitFormat: 'Use conventional commits: feat:, fix:, docs:, style:, refactor:, test:, chore:',
      prRequirements: 'Link to issues, use proper templates, request reviews',
      mergeStrategy: 'Squash and merge for features, regular merge for hotfixes'
    };
  }

  // Helper to get enforcement rules for GitHub tool
  getEnforcementRules() {
    return this.getGitHubOperationRules();
  }
}
