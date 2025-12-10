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
        // Créer la table avec tous les champs
        this.db.run(`CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          imageUrl TEXT,
          images TEXT,
          technologies TEXT,
          github TEXT,
          demo TEXT,
          UserId INTEGER,
          StatusId INTEGER,
          LanguageId INTEGER,
          ControllerIds TEXT,
          PlatformIds TEXT,
          genreIds TEXT,
          tagIds TEXT,
          price REAL,
          authorStudio TEXT,
          madeWith TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
          if (err) {
            reject(err);
            return;
          }
          // Migrer les anciennes colonnes si nécessaire (pour les bases existantes)
          this.migrateTable()
            .then(() => resolve())
            .catch(() => resolve()); // Ignorer les erreurs de migration (colonnes déjà présentes)
        });
      });
    });
  }

  migrateTable() {
    return new Promise((resolve, reject) => {
      const columnsToAdd = [
        { name: 'images', type: 'TEXT' },
        { name: 'technologies', type: 'TEXT' },
        { name: 'github', type: 'TEXT' },
        { name: 'demo', type: 'TEXT' },
        { name: 'UserId', type: 'INTEGER' },
        { name: 'StatusId', type: 'INTEGER' },
        { name: 'LanguageId', type: 'INTEGER' },
        { name: 'ControllerIds', type: 'TEXT' },
        { name: 'PlatformIds', type: 'TEXT' },
        { name: 'genreIds', type: 'TEXT' },
        { name: 'tagIds', type: 'TEXT' },
        { name: 'price', type: 'REAL' },
        { name: 'authorStudio', type: 'TEXT' },
        { name: 'madeWith', type: 'TEXT' }
      ];

      const addColumnPromises = columnsToAdd.map(col => {
        return new Promise((resolveCol, rejectCol) => {
          this.db.run(
            `ALTER TABLE projects ADD COLUMN ${col.name} ${col.type}`,
            (err) => {
              // Ignorer l'erreur si la colonne existe déjà
              if (err && !err.message.includes('duplicate column')) {
                rejectCol(err);
              } else {
                resolveCol();
              }
            }
          );
        });
      });

      Promise.all(addColumnPromises)
        .then(() => resolve())
        .catch(reject);
    });
  }

  getAllProjects() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM projects ORDER BY createdAt DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(this.parseProjects(rows));
      });
    });
  }

  getProjectById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row ? this.parseProject(row) : null);
      });
    });
  }

  createProject(projectData) {
    return new Promise((resolve, reject) => {
      const {
        title, description, imageUrl, images, technologies,
        github, demo, UserId, StatusId, LanguageId,
        ControllerIds, PlatformIds, genreIds, tagIds,
        price, authorStudio, madeWith
      } = projectData;
      
      const db = this.db;
      const stmt = db.prepare(
        `INSERT INTO projects (
          title, description, imageUrl, images, technologies,
          github, demo, UserId, StatusId, LanguageId,
          ControllerIds, PlatformIds, genreIds, tagIds,
          price, authorStudio, madeWith
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      
      stmt.run(
        title,
        description || null,
        imageUrl || null,
        images ? JSON.stringify(images) : null,
        technologies ? JSON.stringify(technologies) : null,
        github || null,
        demo || null,
        UserId || null,
        StatusId || null,
        LanguageId || null,
        ControllerIds ? JSON.stringify(ControllerIds) : null,
        PlatformIds ? JSON.stringify(PlatformIds) : null,
        genreIds ? JSON.stringify(genreIds) : null,
        tagIds ? JSON.stringify(tagIds) : null,
        price || null,
        authorStudio || null,
        madeWith || null,
        function(err) {
          if (err) {
            stmt.finalize();
            reject(err);
          } else {
            const projectId = this.lastID;
            stmt.finalize();
            // Récupérer le projet créé
            db.get('SELECT * FROM projects WHERE id = ?', [projectId], (err, row) => {
              if (err) reject(err);
              else resolve(this.parseProject(row));
            });
          }
        }
      );
    });
  }

  updateProject(id, projectData) {
    return new Promise((resolve, reject) => {
      const {
        title, description, imageUrl, images, technologies,
        github, demo, UserId, StatusId, LanguageId,
        ControllerIds, PlatformIds, genreIds, tagIds,
        price, authorStudio, madeWith
      } = projectData;
      
      const db = this.db;
      const updates = [];
      const values = [];
      
      if (title !== undefined) { updates.push('title = ?'); values.push(title); }
      if (description !== undefined) { updates.push('description = ?'); values.push(description); }
      if (imageUrl !== undefined) { updates.push('imageUrl = ?'); values.push(imageUrl); }
      if (images !== undefined) { updates.push('images = ?'); values.push(images ? JSON.stringify(images) : null); }
      if (technologies !== undefined) { updates.push('technologies = ?'); values.push(technologies ? JSON.stringify(technologies) : null); }
      if (github !== undefined) { updates.push('github = ?'); values.push(github); }
      if (demo !== undefined) { updates.push('demo = ?'); values.push(demo); }
      if (UserId !== undefined) { updates.push('UserId = ?'); values.push(UserId); }
      if (StatusId !== undefined) { updates.push('StatusId = ?'); values.push(StatusId); }
      if (LanguageId !== undefined) { updates.push('LanguageId = ?'); values.push(LanguageId); }
      if (ControllerIds !== undefined) { updates.push('ControllerIds = ?'); values.push(ControllerIds ? JSON.stringify(ControllerIds) : null); }
      if (PlatformIds !== undefined) { updates.push('PlatformIds = ?'); values.push(PlatformIds ? JSON.stringify(PlatformIds) : null); }
      if (genreIds !== undefined) { updates.push('genreIds = ?'); values.push(genreIds ? JSON.stringify(genreIds) : null); }
      if (tagIds !== undefined) { updates.push('tagIds = ?'); values.push(tagIds ? JSON.stringify(tagIds) : null); }
      if (price !== undefined) { updates.push('price = ?'); values.push(price); }
      if (authorStudio !== undefined) { updates.push('authorStudio = ?'); values.push(authorStudio); }
      if (madeWith !== undefined) { updates.push('madeWith = ?'); values.push(madeWith); }
      
      if (updates.length === 0) {
        // Aucune mise à jour, récupérer le projet tel quel
        db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else if (!row) reject(new Error('Project not found'));
          else resolve(this.parseProject(row));
        });
        return;
      }
      
      updates.push('updatedAt = CURRENT_TIMESTAMP');
      values.push(id);
      
      const sql = `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`;
      
      db.run(sql, values, function(err) {
        if (err) reject(err);
        else if (this.changes === 0) reject(new Error('Project not found'));
        else {
          // Récupérer le projet mis à jour
          db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
            if (err) reject(err);
            else resolve(this.parseProject(row));
          });
        }
      });
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

  searchProjects(query) {
    return new Promise((resolve, reject) => {
      const searchTerm = `%${query.toLowerCase()}%`;
      this.db.all(
        `SELECT * FROM projects 
         WHERE LOWER(title) LIKE ? 
            OR LOWER(description) LIKE ?
            OR LOWER(technologies) LIKE ?
         ORDER BY createdAt DESC`,
        [searchTerm, searchTerm, searchTerm],
        (err, rows) => {
          if (err) reject(err);
          else resolve(this.parseProjects(rows));
        }
      );
    });
  }

  getProjectsByUserId(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM projects WHERE UserId = ? ORDER BY createdAt DESC',
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(this.parseProjects(rows));
        }
      );
    });
  }

  parseProject(row) {
    if (!row) return null;
    return {
      ...row,
      images: row.images ? JSON.parse(row.images) : undefined,
      technologies: row.technologies ? JSON.parse(row.technologies) : undefined,
      ControllerIds: row.ControllerIds ? JSON.parse(row.ControllerIds) : undefined,
      PlatformIds: row.PlatformIds ? JSON.parse(row.PlatformIds) : undefined,
      genreIds: row.genreIds ? JSON.parse(row.genreIds) : undefined,
      tagIds: row.tagIds ? JSON.parse(row.tagIds) : undefined
    };
  }

  parseProjects(rows) {
    return rows.map(row => this.parseProject(row));
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

