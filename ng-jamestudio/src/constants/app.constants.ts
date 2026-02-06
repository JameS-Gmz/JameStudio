export const APP_CONSTANTS = {
  STORAGE_KEYS: {
    PROJECTS: 'jamesstudio_projects',
    COMMENT_EMAIL: 'jamesstudio_comment_email',
    COMMENT_AUTHOR_NAME: 'jamesstudio_comment_author_name'
  },

  DEFAULTS: {
    IMAGE: '/1.jpg',
    PLACEHOLDER_IMAGE: 'https://placehold.co/800x400/1D2437/FFFFFF?text=Image+non+disponible',
    USER_ID: 1,
    STATUS_ID: 1,
    LANGUAGE_ID: 1
  },

  FILE_UPLOAD: {
    MAX_SIZE: 100 * 1024 * 1024, // 100MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    ALLOWED_EXTENSIONS: {
      IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      VIDEOS: ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv']
    }
  },

  MESSAGES: {
    ERROR: {
      SERVER: 'Erreur serveur',
      NOT_FOUND: 'Ressource non trouvée',
      VALIDATION: 'Erreur de validation',
      UPLOAD: 'Erreur lors de l\'upload du fichier',
      LOADING: 'Erreur lors du chargement des données'
    },
    SUCCESS: {
      PROJECT_CREATED: 'Projet ajouté avec succès !',
      PROJECT_UPDATED: 'Projet mis à jour avec succès',
      PROJECT_DELETED: 'Projet supprimé',
      FILE_UPLOADED: 'Fichier uploadé avec succès'
    }
  },

  CAROUSEL: {
    AUTO_SLIDE_INTERVAL: 5000 // 5 secondes
  }
} as const;

