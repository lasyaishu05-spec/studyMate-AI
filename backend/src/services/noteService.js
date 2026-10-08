const prisma = require('../config/db');
const { getOwned } = require('./notebookService');

async function create(notebookId, userId, { title, content }) {
  await getOwned(notebookId, userId); // verify notebook belongs to user
  return prisma.note.create({ data: { title, content, notebookId } });
}

async function listForNotebook(notebookId, userId) {
  await getOwned(notebookId, userId);
  return prisma.note.findMany({ where: { notebookId }, orderBy: { updatedAt: 'desc' } });
}

async function getNote(noteId, notebookId, userId) {
  await getOwned(notebookId, userId);
  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note || note.notebookId !== notebookId) {
    throw { status: 404, message: 'Note not found' };
  }
  return note;
}

async function update(noteId, notebookId, userId, data) {
  await getNote(noteId, notebookId, userId); // throws if not found/not owned
  return prisma.note.update({ where: { id: noteId }, data });
}

async function remove(noteId, notebookId, userId) {
  await getNote(noteId, notebookId, userId);
  return prisma.note.delete({ where: { id: noteId } });
}

module.exports = { create, listForNotebook, getNote, update, remove };
