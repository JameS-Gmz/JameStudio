const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, '..', 'database.sqlite');
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          this.initializeTables()
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  }

  initializeTables() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(`CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          imageUrl TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  getAllProjects() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM projects ORDER BY createdAt DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  getProjectById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  createProject(projectData) {
    return new Promise((resolve, reject) => {
      const { title, description, imageUrl } = projectData;
      const db = this.db;
      const stmt = db.prepare(
        'INSERT INTO projects (title, description, imageUrl) VALUES (?, ?, ?)'
      );
      
      stmt.run(title, description || '', imageUrl || null, function(err) {
        if (err) {
          stmt.finalize();
          reject(err);
        } else {
          const projectId = this.lastID;
          stmt.finalize();
          // Récupérer le projet créé
          db.get('SELECT * FROM projects WHERE id = ?', [projectId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        }
      });
    });
  }

  updateProject(id, projectData) {
    return new Promise((resolve, reject) => {
      const { title, description, imageUrl } = projectData;
      const db = this.db;
      db.run(
        'UPDATE projects SET title = COALESCE(?, title), description = COALESCE(?, description), imageUrl = COALESCE(?, imageUrl), updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [title, description, imageUrl, id],
        function(err) {
          if (err) reject(err);
          else if (this.changes === 0) reject(new Error('Project not found'));
          else {
            // Récupérer le projet mis à jour
            db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          }
        }
      );
    });
  }

  deleteProject(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM projects WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else if (this.changes === 0) reject(new Error('Project not found'));
        else resolve();
      });
    });
  }

  updateProjectImageUrl(id, imageUrl) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE projects SET imageUrl = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [imageUrl, id],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  getProjectImageUrl(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT imageUrl FROM projects WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row?.imageUrl || null);
      });
    });
  }

  close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) console.error('Error closing database:', err);
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = new Database();

