const prisma = require('../config/db');

async function create(userId, title) {
 return prisma.notebook.create({ data: { title, userId } });
}

async function listForUser(userId) {
 return prisma.notebook.findMany({ where: { userId } });
}

async function getOwned(notebookId, userId) {
 const notebook = await prisma.notebook.findUnique({ where: { id: notebookId } });
 if (!notebook || notebook.userId !== userId) {
   throw { status: 404, message: 'Notebook not found' };
 }
 return notebook;
}

async function update(notebookId, userId, title) {
 await getOwned(notebookId, userId); // throws if not owned
 return prisma.notebook.update({ where: { id: notebookId }, data: { title } });
}

async function remove(notebookId, userId) {
 await getOwned(notebookId, userId);
 return prisma.notebook.delete({ where: { id: notebookId } });
}

module.exports = { create, listForUser, getOwned, update, remove };