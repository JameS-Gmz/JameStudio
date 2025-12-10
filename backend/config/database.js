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
            .then(() => {
              // Créer la table comments
              this.db.run(`CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                projectId INTEGER NOT NULL,
                author TEXT NOT NULL,
                authorName TEXT,
                content TEXT,
                rating INTEGER,
                email TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
              )`, (err) => {
                if (err) {
                  reject(err);
                  return;
                }
                // Migrer les colonnes manquantes si la table existe déjà
                this.migrateCommentsTable()
                  .then(() => resolve())
                  .catch(() => resolve()); // Ignorer les erreurs de migration
              });
            })
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

  migrateCommentsTable() {
    return new Promise((resolve, reject) => {
      const columnsToAdd = [
        { name: 'authorName', type: 'TEXT' },
        { name: 'rating', type: 'INTEGER' }
      ];

      const addColumnPromises = columnsToAdd.map(col => {
        return new Promise((resolveCol, rejectCol) => {
          this.db.run(
            `ALTER TABLE comments ADD COLUMN ${col.name} ${col.type}`,
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
      const self = this; // Preserve 'this' context for callbacks
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
              else resolve(self.parseProject(row));
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
      const self = this; // Preserve 'this' context for callbacks
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
          else resolve(self.parseProject(row));
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
            else resolve(self.parseProject(row));
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

  // Ajouter une image au tableau images d'un projet
  addProjectImage(id, imageUrl) {
    return new Promise((resolve, reject) => {
      const self = this;
      // Récupérer le projet actuel
      this.db.get('SELECT imageUrl, images FROM projects WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!row) {
          reject(new Error('Project not found'));
          return;
        }

        // Parser le tableau images existant ou créer un nouveau tableau
        let images = [];
        if (row.images) {
          try {
            images = JSON.parse(row.images);
            if (!Array.isArray(images)) {
              images = [];
            }
          } catch (e) {
            images = [];
          }
        }

        // Ajouter la nouvelle image si elle n'existe pas déjà
        if (!images.includes(imageUrl)) {
          images.push(imageUrl);
        }

        // Mettre à jour imageUrl avec la première image si elle est vide
        const newImageUrl = row.imageUrl || imageUrl;

        // Mettre à jour la base de données
        self.db.run(
          'UPDATE projects SET imageUrl = ?, images = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
          [newImageUrl, JSON.stringify(images), id],
          function(updateErr) {
            if (updateErr) {
              reject(updateErr);
            } else {
              resolve({ imageUrl: newImageUrl, images });
            }
          }
        );
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

  // ========== MÉTHODES POUR LES COMMENTAIRES ==========

  // Créer un commentaire
  createComment(commentData) {
    return new Promise((resolve, reject) => {
      const { projectId, author, authorName, content, rating, email } = commentData;
      const db = this.db;
      
      if (!projectId || !author) {
        reject(new Error('projectId et author sont requis'));
        return;
      }

      if (!content && !rating) {
        reject(new Error('content ou rating est requis'));
        return;
      }

      db.run(
        'INSERT INTO comments (projectId, author, authorName, content, rating, email) VALUES (?, ?, ?, ?, ?, ?)',
        [projectId, author, authorName || author, content || null, rating || null, email || null],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          // Récupérer le commentaire créé
          const commentId = this.lastID;
          db.get('SELECT * FROM comments WHERE id = ?', [commentId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        }
      );
    });
  }

  // Récupérer tous les commentaires d'un projet
  getCommentsByProjectId(projectId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM comments WHERE projectId = ? ORDER BY createdAt DESC',
        [projectId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  // Récupérer un commentaire par ID
  getCommentById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM comments WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

  // Mettre à jour un commentaire
  updateComment(id, commentData) {
    return new Promise((resolve, reject) => {
      const { author, authorName, content, rating, email } = commentData;
      const self = this;
      const db = this.db;
      const updates = [];
      const values = [];

      if (author !== undefined) { updates.push('author = ?'); values.push(author); }
      if (authorName !== undefined) { updates.push('authorName = ?'); values.push(authorName); }
      if (content !== undefined) { updates.push('content = ?'); values.push(content); }
      if (rating !== undefined) { updates.push('rating = ?'); values.push(rating); }
      if (email !== undefined) { updates.push('email = ?'); values.push(email); }

      if (updates.length === 0) {
        // Aucune mise à jour, récupérer le commentaire tel quel
        db.get('SELECT * FROM comments WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else if (!row) reject(new Error('Comment not found'));
          else resolve(row);
        });
        return;
      }

      updates.push('updatedAt = CURRENT_TIMESTAMP');
      values.push(id);

      const sql = `UPDATE comments SET ${updates.join(', ')} WHERE id = ?`;
      
      db.run(sql, values, function(err) {
        if (err) {
          reject(err);
          return;
        }
        if (this.changes === 0) {
          reject(new Error('Comment not found'));
          return;
        }
        // Récupérer le commentaire mis à jour
        db.get('SELECT * FROM comments WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    });
  }

  // Supprimer un commentaire
  deleteComment(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM comments WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else if (this.changes === 0) reject(new Error('Comment not found'));
        else resolve();
      });
    });
  }

  // Récupérer tous les commentaires
  getAllComments() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM comments ORDER BY createdAt DESC',
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
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

