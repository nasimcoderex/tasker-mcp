import Trello from 'node-trello';

export class TrelloTool {
  constructor({ apiKey, token, boardId, listId }) {
    if (!apiKey || !token) {
      throw new Error('Trello API key and token are required');
    }
    
    this.trello = new Trello(apiKey, token);
    this.defaultBoardId = boardId;
    this.defaultListId = listId;
  }

  async run({ action, ...args }) {
    try {
      switch (action) {
        case 'list_boards':
          return await this.listBoards();
        
        case 'list_lists':
          return await this.listLists(args.boardId);
        
        case 'create_card':
          return await this.createCard(args);
        
        case 'list_cards':
          return await this.listCards(args.listId);
        
        case 'update_card':
          return await this.updateCard(args);
        
        case 'move_card':
          return await this.moveCard(args);
        
        case 'add_comment':
          return await this.addComment(args);
        
        default:
          throw new Error(`Unknown Trello action: ${action}`);
      }
    } catch (error) {
      console.error('Trello API Error:', error);
      throw new Error(`Trello operation failed: ${error.message}`);
    }
  }

  async listBoards() {
    return new Promise((resolve, reject) => {
      this.trello.get('/1/members/me/boards', (err, data) => {
        if (err) return reject(err);
        
        const formattedBoards = data.map(board => ({
          id: board.id,
          name: board.name,
          url: board.url,
          closed: board.closed
        }));

        resolve({
          content: [{
            type: "text",
            text: `📋 **Trello Boards:**\n\n${formattedBoards.map(board => 
              `• **${board.name}** (ID: ${board.id})\n  URL: ${board.url}\n  Status: ${board.closed ? 'Closed' : 'Open'}`
            ).join('\n\n')}`
          }]
        });
      });
    });
  }

  async listLists(boardId) {
    const targetBoardId = boardId || this.defaultBoardId;
    if (!targetBoardId) {
      throw new Error('Board ID is required. Use list_boards to find board IDs.');
    }

    return new Promise((resolve, reject) => {
      this.trello.get(`/1/boards/${targetBoardId}/lists`, (err, data) => {
        if (err) return reject(err);
        
        const formattedLists = data.map(list => ({
          id: list.id,
          name: list.name,
          closed: list.closed,
          pos: list.pos
        }));

        resolve({
          content: [{
            type: "text", 
            text: `📝 **Lists in Board:**\n\n${formattedLists.map(list => 
              `• **${list.name}** (ID: ${list.id})\n  Status: ${list.closed ? 'Closed' : 'Open'}\n  Position: ${list.pos}`
            ).join('\n\n')}`
          }]
        });
      });
    });
  }

  async createCard({ title, description, listId, boardId, labels, dueDate, members }) {
    const targetListId = listId || this.defaultListId;
    if (!targetListId) {
      throw new Error('List ID is required. Use list_lists to find list IDs.');
    }

    const cardData = {
      name: title,
      desc: description || '',
      idList: targetListId
    };

    // Add optional parameters
    if (dueDate) cardData.due = dueDate;
    if (labels) cardData.idLabels = labels;
    if (members) cardData.idMembers = members;

    return new Promise((resolve, reject) => {
      this.trello.post('/1/cards', cardData, (err, data) => {
        if (err) return reject(err);
        
        resolve({
          content: [{
            type: "text",
            text: `✅ **Trello Card Created Successfully!**\n\n` +
                  `📌 **Title:** ${data.name}\n` +
                  `📝 **Description:** ${data.desc || 'No description'}\n` +
                  `🔗 **URL:** ${data.url}\n` +
                  `📅 **Due Date:** ${data.due || 'Not set'}\n` +
                  `🏷️ **Labels:** ${data.labels?.map(l => l.name).join(', ') || 'None'}`
          }]
        });
      });
    });
  }

  async listCards(listId) {
    const targetListId = listId || this.defaultListId;
    if (!targetListId) {
      throw new Error('List ID is required. Use list_lists to find list IDs.');
    }

    return new Promise((resolve, reject) => {
      this.trello.get(`/1/lists/${targetListId}/cards`, (err, data) => {
        if (err) return reject(err);
        
        const formattedCards = data.map(card => ({
          id: card.id,
          name: card.name,
          desc: card.desc,
          url: card.url,
          due: card.due,
          closed: card.closed,
          labels: card.labels?.map(l => l.name)
        }));

        resolve({
          content: [{
            type: "text",
            text: `🃏 **Cards in List:**\n\n${formattedCards.map(card => 
              `• **${card.name}** (ID: ${card.id})\n` +
              `  Description: ${card.desc || 'No description'}\n` +
              `  Due: ${card.due || 'Not set'}\n` +
              `  Labels: ${card.labels?.join(', ') || 'None'}\n` +
              `  Status: ${card.closed ? 'Closed' : 'Open'}\n` +
              `  URL: ${card.url}`
            ).join('\n\n')}`
          }]
        });
      });
    });
  }

  async updateCard({ cardId, title, description, dueDate, closed }) {
    if (!cardId) {
      throw new Error('Card ID is required for updating.');
    }

    const updateData = {};
    if (title !== undefined) updateData.name = title;
    if (description !== undefined) updateData.desc = description;
    if (dueDate !== undefined) updateData.due = dueDate;
    if (closed !== undefined) updateData.closed = closed;

    return new Promise((resolve, reject) => {
      this.trello.put(`/1/cards/${cardId}`, updateData, (err, data) => {
        if (err) return reject(err);
        
        resolve({
          content: [{
            type: "text",
            text: `✅ **Card Updated Successfully!**\n\n` +
                  `📌 **Title:** ${data.name}\n` +
                  `📝 **Description:** ${data.desc || 'No description'}\n` +
                  `🔗 **URL:** ${data.url}\n` +
                  `📅 **Due Date:** ${data.due || 'Not set'}`
          }]
        });
      });
    });
  }

  async moveCard({ cardId, listId }) {
    if (!cardId || !listId) {
      throw new Error('Both Card ID and List ID are required for moving.');
    }

    return new Promise((resolve, reject) => {
      this.trello.put(`/1/cards/${cardId}`, { idList: listId }, (err, data) => {
        if (err) return reject(err);
        
        resolve({
          content: [{
            type: "text",
            text: `✅ **Card Moved Successfully!**\n\n` +
                  `📌 **Card:** ${data.name}\n` +
                  `📝 **New List:** ${data.list?.name || 'Unknown'}\n` +
                  `🔗 **URL:** ${data.url}`
          }]
        });
      });
    });
  }

  async addComment({ cardId, comment }) {
    if (!cardId || !comment) {
      throw new Error('Both Card ID and comment text are required.');
    }

    return new Promise((resolve, reject) => {
      this.trello.post(`/1/cards/${cardId}/actions/comments`, { text: comment }, (err, data) => {
        if (err) return reject(err);
        
        resolve({
          content: [{
            type: "text",
            text: `💬 **Comment Added Successfully!**\n\n` +
                  `📝 **Comment:** ${data.data.text}\n` +
                  `👤 **Author:** ${data.memberCreator.fullName}\n` +
                  `📅 **Date:** ${new Date(data.date).toLocaleString()}`
          }]
        });
      });
    });
  }
}
