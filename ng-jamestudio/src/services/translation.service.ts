import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Language = 'fr' | 'en';

interface Translations {
  [key: string]: {
    fr: string;
    en: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly STORAGE_KEY = 'jamesstudio_language';
  private currentLanguageSubject = new BehaviorSubject<Language>('fr');
  public currentLanguage$: Observable<Language> = this.currentLanguageSubject.asObservable();

  private translations: Translations = {
    'nav.home': { fr: 'Accueil', en: 'Home' },
    'nav.allProjects': { fr: 'Tous les Projets', en: 'All Projects' },
    'nav.addProject': { fr: 'Ajouter un Projet', en: 'Add Project' },
    'nav.myProjects': { fr: 'Mes Projets', en: 'My Projects' },
    'nav.admin': { fr: 'Admin', en: 'Admin' },
    'nav.contact': { fr: 'Contact & Paramètres', en: 'Contact & Settings' },
    
    'home.welcome': { fr: 'Bienvenue sur mon portfolio de développeur', en: 'Welcome to my developer portfolio' },
    'home.description': { fr: 'Ici vous trouverez tous mes projets avec des liens vers leurs dépôts GitHub. Explorez mon travail et découvrez le code source de chaque projet. Ci-dessous, vous pouvez voir les projets les plus récemment ajoutés et les dernières mises à jour.', en: 'Here you will find all my projects with links to their GitHub repositories. Explore my work and discover the source code of each project. Below, you can see the most recently added projects and the latest updates.' },
    'home.recentlyAdded': { fr: 'Récemment Ajoutés', en: 'Recently Added' },
    'home.recentlyUpdated': { fr: 'Récemment Mis à Jour', en: 'Recently Updated' },
    
    'projects.allProjects': { fr: 'Tous les Projets', en: 'All Projects' },
    'projects.loading': { fr: 'Chargement...', en: 'Loading...' },
    'projects.description': { fr: 'Description', en: 'Description' },
    'projects.technologies': { fr: 'Technologies utilisées', en: 'Technologies used' },
    'projects.links': { fr: 'Liens', en: 'Links' },
    'projects.viewGitHub': { fr: 'Voir sur GitHub', en: 'View on GitHub' },
    'projects.viewDemo': { fr: 'Voir la démo', en: 'View demo' },
    'projects.demo': { fr: 'Démo', en: 'Demo' },
    'projects.github': { fr: 'GitHub', en: 'GitHub' },
    'projects.author': { fr: 'Auteur', en: 'Author' },
    'projects.lastUpdate': { fr: 'Dernière mise à jour', en: 'Last updated' },
    'projects.createdAt': { fr: 'Date de création', en: 'Created at' },
    'projects.notSpecified': { fr: 'Non spécifiée', en: 'Not specified' },
    
    'form.addProject': { fr: 'Ajouter un Projet', en: 'Add Project' },
    'form.projectImages': { fr: 'Images du Projet', en: 'Project Images' },
    'form.multipleImages': { fr: 'Vous pouvez ajouter plusieurs images', en: 'You can add multiple images' },
    'form.chooseImages': { fr: 'Choisir des images', en: 'Choose images' },
    'form.dragDrop': { fr: 'Cliquez ou glissez-déposez pour ajouter des images', en: 'Click or drag and drop to add images' },
    'form.title': { fr: 'Titre du Projet', en: 'Project Title' },
    'form.titlePlaceholder': { fr: 'Ex: Mon Portfolio Web', en: 'Ex: My Web Portfolio' },
    'form.description': { fr: 'Description', en: 'Description' },
    'form.descriptionPlaceholder': { fr: 'Décrivez votre projet, ses fonctionnalités, les technologies utilisées...', en: 'Describe your project, its features, technologies used...' },
    'form.technologies': { fr: 'Technologies Utilisées', en: 'Technologies Used' },
    'form.technologiesPlaceholder': { fr: 'Ex: Angular, TypeScript, Node.js, MySQL (séparées par des virgules)', en: 'Ex: Angular, TypeScript, Node.js, MySQL (comma separated)' },
    'form.technologiesHint': { fr: 'Séparez les technologies par des virgules', en: 'Separate technologies with commas' },
    'form.projectLinks': { fr: 'Liens du Projet', en: 'Project Links' },
    'form.githubLink': { fr: 'Lien GitHub', en: 'GitHub Link' },
    'form.demoLink': { fr: 'Lien de Démo (optionnel)', en: 'Demo Link (optional)' },
    'form.submit': { fr: 'Ajouter le Projet', en: 'Add Project' },
    'form.submitting': { fr: 'Création en cours...', en: 'Creating...' },
    'form.required': { fr: '*', en: '*' },
    
    'developer.myProjects': { fr: 'Mes Projets', en: 'My Projects' },
    'developer.loading': { fr: 'Chargement...', en: 'Loading...' },
    'developer.noProjects': { fr: 'Vous n\'avez pas encore créé de projets.', en: 'You haven\'t created any projects yet.' },
    'developer.edit': { fr: 'Modifier', en: 'Edit' },
    'developer.delete': { fr: 'Supprimer', en: 'Delete' },
    'developer.editProject': { fr: 'Modifier le Projet', en: 'Edit Project' },
    'developer.save': { fr: 'Enregistrer', en: 'Save' },
    'developer.cancel': { fr: 'Annuler', en: 'Cancel' },
    'developer.deleteConfirm': { fr: 'Êtes-vous sûr de vouloir supprimer ce projet ?', en: 'Are you sure you want to delete this project?' },
    'developer.yes': { fr: 'Oui', en: 'Yes' },
    'developer.no': { fr: 'Non', en: 'No' },
    
    'contact.title': { fr: 'Contact & Paramètres', en: 'Contact & Settings' },
    'contact.subtitle': { fr: 'Gérez vos paramètres et déconnectez-vous', en: 'Manage your settings and sign out' },
    'contact.contactMe': { fr: 'Me Contacter', en: 'Contact Me' },
    'contact.description': { fr: 'N\'hésitez pas à me contacter pour toute question, demande de collaboration ou opportunité professionnelle.', en: 'Feel free to contact me with any questions, collaboration requests, or professional opportunities.' },
    'contact.myAccount': { fr: 'Mon Compte', en: 'My Account' },
    'contact.registeredEmail': { fr: 'Email enregistré :', en: 'Registered email:' },
    'contact.themeSaved': { fr: 'Vos préférences de thème sont sauvegardées pour cet email.', en: 'Your theme preferences are saved for this email.' },
    'contact.setEmail': { fr: 'Définir mon email', en: 'Set my email' },
    'contact.emailHint': { fr: 'Pour sauvegarder vos préférences de thème, veuillez entrer votre adresse email.', en: 'To save your theme preferences, please enter your email address.' },
    'contact.save': { fr: 'Enregistrer', en: 'Save' },
    'contact.cancel': { fr: 'Annuler', en: 'Cancel' },
    'contact.loggedIn': { fr: 'Vous êtes connecté en tant qu\'administrateur.', en: 'You are logged in as an administrator.' },
    'contact.signOut': { fr: 'Se déconnecter', en: 'Sign out' },
    'contact.signOutConfirm': { fr: 'Êtes-vous sûr de vouloir vous déconnecter ?', en: 'Are you sure you want to sign out?' },
    'contact.themePersonalization': { fr: 'Personnalisation du Thème', en: 'Theme Personalization' },
    'contact.themeDescription': { fr: 'Personnalisez l\'apparence du site selon vos préférences. Vos choix sont sauvegardés uniquement pour votre email.', en: 'Customize the look of the site to your preferences. Your choices are saved only for your email.' },
    'contact.accentColor': { fr: 'Couleur d\'accentuation', en: 'Accent color' },
    'contact.resetTheme': { fr: 'Réinitialiser par défaut', en: 'Reset to default' },
    'contact.resetConfirm': { fr: 'Voulez-vous réinitialiser le thème aux valeurs par défaut (noir et blanc) ?', en: 'Do you want to reset the theme to default values (black and white)?' },
    'contact.preview': { fr: 'Aperçu', en: 'Preview' },
    'contact.accentText': { fr: 'Texte d\'accentuation', en: 'Accent text' },
    
    'comments.leaveReview': { fr: 'Laisser un avis', en: 'Leave a review' },
    'comments.editReview': { fr: 'Modifier votre avis', en: 'Edit your review' },
    'comments.email': { fr: 'Email', en: 'Email' },
    'comments.emailHint': { fr: 'Votre email est requis pour éviter le spam', en: 'Your email is required to prevent spam' },
    'comments.name': { fr: 'Nom / Pseudo (optionnel)', en: 'Name / Username (optional)' },
    'comments.namePlaceholder': { fr: 'Votre nom', en: 'Your name' },
    'comments.rating': { fr: 'Note (optionnel)', en: 'Rating (optional)' },
    'comments.comment': { fr: 'Votre commentaire', en: 'Your comment' },
    'comments.commentPlaceholder': { fr: 'Écrivez votre avis ici...', en: 'Write your review here...' },
    'comments.publish': { fr: 'Publier l\'avis', en: 'Publish review' },
    'comments.edit': { fr: 'Modifier l\'avis', en: 'Edit review' },
    'comments.publishing': { fr: 'Publication...', en: 'Publishing...' },
    'comments.delete': { fr: 'Supprimer', en: 'Delete' },
    'comments.deleteConfirm': { fr: 'Êtes-vous sûr de vouloir supprimer votre commentaire ?', en: 'Are you sure you want to delete your comment?' },
    'comments.title': { fr: 'Commentaires', en: 'Comments' },
    'comments.count': { fr: 'commentaires', en: 'comments' },
    'comments.countSingle': { fr: 'commentaire', en: 'comment' },
    'comments.noComments': { fr: 'Aucun commentaire pour le moment. Soyez le premier à commenter !', en: 'No comments yet. Be the first to comment!' },
    'comments.you': { fr: '(vous)', en: '(you)' },
    'comments.ratingOnly': { fr: 'Note uniquement', en: 'Rating only' },
    'comments.averageRating': { fr: 'Note moyenne', en: 'Average rating' },
    'comments.ratings': { fr: 'notes', en: 'ratings' },
    'comments.ratingSingle': { fr: 'note', en: 'rating' },
    
    'library.addToLibrary': { fr: 'Ajouter à mes projets', en: 'Add to my projects' },
    'library.removeFromLibrary': { fr: 'Retirer de mes projets', en: 'Remove from my projects' },
    
    'search.placeholder': { fr: 'Rechercher des projets...', en: 'Search projects...' },
    'search.noResults': { fr: 'Aucun projet trouvé', en: 'No projects found' },
    'search.error': { fr: 'Erreur lors de la recherche', en: 'Search error' },
    
    'admin.title': { fr: 'Accès Admin', en: 'Admin Access' },
    'admin.subtitle': { fr: 'Connectez-vous pour ajouter ou modifier des projets', en: 'Log in to add or modify projects' },
    'admin.password': { fr: 'Mot de passe', en: 'Password' },
    'admin.passwordPlaceholder': { fr: 'Entrez le mot de passe', en: 'Enter password' },
    'admin.login': { fr: 'Se connecter', en: 'Log in' },
    'admin.loggingIn': { fr: 'Connexion...', en: 'Logging in...' },
    
    'common.loading': { fr: 'Chargement...', en: 'Loading...' },
    'common.error': { fr: 'Erreur', en: 'Error' },
    'common.success': { fr: 'Succès', en: 'Success' },
    'common.yes': { fr: 'Oui', en: 'Yes' },
    'common.no': { fr: 'Non', en: 'No' },
    'common.save': { fr: 'Enregistrer', en: 'Save' },
    'common.cancel': { fr: 'Annuler', en: 'Cancel' },
    'common.delete': { fr: 'Supprimer', en: 'Delete' },
    'common.edit': { fr: 'Modifier', en: 'Edit' },
    'common.close': { fr: 'Fermer', en: 'Close' },
    
    'footer.creativeHub': { fr: 'Hub de projets web créatifs', en: 'Creative web projects hub' },
    'footer.navigation': { fr: 'Navigation', en: 'Navigation' },
    'footer.home': { fr: 'Accueil', en: 'Home' },
    'footer.projects': { fr: 'Projets', en: 'Projects' },
    'footer.support': { fr: 'Support', en: 'Support' },
    'footer.helpCenter': { fr: 'Centre d\'aide', en: 'Help Center' },
    'footer.contact': { fr: 'Contact', en: 'Contact' },
    'footer.legal': { fr: 'Légal', en: 'Legal' },
    'footer.terms': { fr: 'Conditions d\'utilisation', en: 'Terms of Service' },
    'footer.privacy': { fr: 'Politique de confidentialité', en: 'Privacy Policy' },
    'footer.copyright': { fr: 'Tous droits réservés.', en: 'All rights reserved.' },
    
    'gameDetails.loading': { fr: 'Chargement...', en: 'Loading...' },
    'gameDetails.loadingProject': { fr: 'Chargement du projet...', en: 'Loading project...' },
    'gameDetails.noDescription': { fr: 'Aucune description disponible', en: 'No description available' },
    'gameDetails.actions': { fr: 'Actions', en: 'Actions' },
    'gameDetails.information': { fr: 'Informations', en: 'Information' },
    'gameDetails.button': { fr: 'Bouton', en: 'Button' },
    
    'contact.warningEmail': { fr: 'Pour sauvegarder vos préférences, définissez d\'abord votre adresse email dans la section "Mon Compte".', en: 'To save your preferences, first set your email address in the "My Account" section.' },
    
    'developer.description': { fr: 'Description :', en: 'Description:' },
    'developer.technologies': { fr: 'Technologies :', en: 'Technologies:' },
    'developer.title': { fr: 'Titre', en: 'Title' },
    'developer.technologiesComma': { fr: 'Technologies (séparées par des virgules)', en: 'Technologies (comma separated)' },
    'developer.authorStudio': { fr: 'Auteur/Studio', en: 'Author/Studio' },
  };

  constructor() {
    const savedLanguage = localStorage.getItem(this.STORAGE_KEY) as Language;
    if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
      this.currentLanguageSubject.next(savedLanguage);
    }
  }

  getCurrentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  setLanguage(language: Language): void {
    localStorage.setItem(this.STORAGE_KEY, language);
    this.currentLanguageSubject.next(language);
  }

  translate(key: string): string {
    const translation = this.translations[key];
    if (!translation) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translation[this.currentLanguageSubject.value] || translation.fr;
  }

  get(key: string): string {
    return this.translate(key);
  }
}
