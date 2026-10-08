/**
 * Integration test: two-user isolation
 * Run: node test-auth-isolation.js
 */

const BASE = 'http://localhost:3000';

async function req(method, path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, body: json };
}

function pass(label) { console.log(`  ✅ ${label}`); }
function fail(label, got) { console.error(`  ❌ ${label} — got:`, JSON.stringify(got)); process.exitCode = 1; }
function section(title) { console.log(`\n── ${title}`); }

async function run() {
  // ── Sign up two users ─────────────────────────────────────────────────────
  section('Sign up');

  const ts = Date.now();
  const userAEmail = `usera_${ts}@test.com`;
  const userBEmail = `userb_${ts}@test.com`;

  const signupA = await req('POST', '/auth/signup', { name: 'User A', email: userAEmail, password: 'pass1234' });
  signupA.status === 201 ? pass('User A signed up') : fail('User A signup', signupA);
  const tokenA = signupA.body.token;

  const signupB = await req('POST', '/auth/signup', { name: 'User B', email: userBEmail, password: 'pass1234' });
  signupB.status === 201 ? pass('User B signed up') : fail('User B signup', signupB);
  const tokenB = signupB.body.token;

  // ── User A: create notebook ───────────────────────────────────────────────
  section('User A — notebook CRUD');

  const nbRes = await req('POST', '/notebooks', { title: 'My Notebook' }, tokenA);
  nbRes.status === 201 ? pass('Create notebook') : fail('Create notebook', nbRes);
  const notebookId = nbRes.body.id;

  // ── User A: add two notes ─────────────────────────────────────────────────
  const n1Res = await req('POST', `/notebooks/${notebookId}/notes`, { title: 'Note 1', content: 'Content 1' }, tokenA);
  n1Res.status === 201 ? pass('Add Note 1') : fail('Add Note 1', n1Res);
  const note1Id = n1Res.body.id;

  const n2Res = await req('POST', `/notebooks/${notebookId}/notes`, { title: 'Note 2', content: 'Content 2' }, tokenA);
  n2Res.status === 201 ? pass('Add Note 2') : fail('Add Note 2', n2Res);
  const note2Id = n2Res.body.id;

  // ── User A: list notes ────────────────────────────────────────────────────
  const listRes = await req('GET', `/notebooks/${notebookId}/notes`, null, tokenA);
  listRes.status === 200 && listRes.body.length === 2
    ? pass(`List notes (got ${listRes.body.length})`)
    : fail('List notes', listRes);

  // ── User A: update Note 1 ─────────────────────────────────────────────────
  const updRes = await req('PATCH', `/notebooks/${notebookId}/notes/${note1Id}`, { title: 'Note 1 Updated', content: 'Updated content' }, tokenA);
  updRes.status === 200 && updRes.body.title === 'Note 1 Updated'
    ? pass('Update Note 1')
    : fail('Update Note 1', updRes);

  // ── User A: delete Note 2 ─────────────────────────────────────────────────
  const delRes = await req('DELETE', `/notebooks/${notebookId}/notes/${note2Id}`, null, tokenA);
  delRes.status === 204 ? pass('Delete Note 2') : fail('Delete Note 2', delRes);

  // Verify only 1 note remains
  const listAfter = await req('GET', `/notebooks/${notebookId}/notes`, null, tokenA);
  listAfter.status === 200 && listAfter.body.length === 1
    ? pass(`Notes after delete (${listAfter.body.length} remaining)`)
    : fail('List after delete', listAfter);

  // ── User B: cross-user isolation ──────────────────────────────────────────
  section('User B — isolation checks (all should be 404)');

  const xNotes = await req('GET', `/notebooks/${notebookId}/notes`, null, tokenB);
  xNotes.status === 404 ? pass('User B cannot list User A notes (404)') : fail('Isolation: list notes', xNotes);

  const xNote = await req('GET', `/notebooks/${notebookId}/notes/${note1Id}`, null, tokenB);
  xNote.status === 404 ? pass('User B cannot GET User A note (404)') : fail('Isolation: GET note', xNote);

  const xDelNotebook = await req('DELETE', `/notebooks/${notebookId}`, null, tokenB);
  xDelNotebook.status === 404 ? pass('User B cannot DELETE User A notebook (404)') : fail('Isolation: DELETE notebook', xDelNotebook);

  const xDelNote = await req('DELETE', `/notebooks/${notebookId}/notes/${note1Id}`, null, tokenB);
  xDelNote.status === 404 ? pass('User B cannot DELETE User A note (404)') : fail('Isolation: DELETE note', xDelNote);

  // ── No token ──────────────────────────────────────────────────────────────
  section('Unauthenticated access (should be 401)');

  const noToken = await req('GET', `/notebooks`, null, null);
  noToken.status === 401 ? pass('No token → 401') : fail('No token check', noToken);

  console.log('\nDone.\n');
}

run().catch(err => { console.error('Unexpected error:', err); process.exit(1); });
