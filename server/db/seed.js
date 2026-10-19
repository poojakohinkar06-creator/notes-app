const { getDb, resolveDbPath } = require('./index');

const SEED_NOTES = [
  {
    title: 'Welcome to Notes',
    content:
      'This is your first note. Create, edit, search and delete notes from the dashboard. Everything is stored in a local SQLite database, so your notes survive server restarts.',
  },
  {
    title: 'Shopping list',
    content:
      'Milk, eggs, bread, coffee beans, olive oil, spinach, chicken breast, rice, and dark chocolate for the weekend.',
  },
  {
    title: 'Project ideas',
    content:
      '1) Habit tracker with streaks\n2) Recipe box with tags\n3) Expense splitter for trips\n4) Markdown snippet library\n5) Local-first bookmarks manager',
  },
  {
    title: 'Meeting notes - Sprint planning',
    content:
      'Agreed scope for the sprint: ship the notes CRUD API, add debounced search, toast notifications for errors, and write API tests. Owner: frontend team for the card/list toggle.',
  },
  {
    title: 'Keyboard shortcuts',
    content:
      'Ctrl/Cmd + K focuses search. Enter submits the note form. Escape closes the edit modal. Tab moves between cards in order.',
  },
];

function seed() {
  const db = getDb();
  const insert = db.prepare(
    'INSERT INTO notes (title, content) VALUES (@title, @content)'
  );

  const insertAll = db.transaction((notes) => {
    db.prepare('DELETE FROM notes').run();
    for (const note of notes) insert.run(note);
  });

  insertAll(SEED_NOTES);

  const count = db.prepare('SELECT COUNT(*) AS count FROM notes').get().count;
  console.log(`Seeded ${count} notes into ${resolveDbPath()}`);
}

seed();
