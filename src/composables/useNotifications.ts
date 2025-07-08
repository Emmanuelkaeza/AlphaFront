import { ref } from 'vue'
import type { Notification } from '@/components/ui/NotificationContainer.vue'

// Instance globale du système de notifications
const notificationContainer = ref<any>(null)

export const useNotifications = () => {
  // Méthode pour définir le container
  const setNotificationContainer = (container: any) => {
    notificationContainer.value = container
  }

  // Méthodes pour afficher des notifications
  const success = (title: string, message?: string, duration?: number) => {
    if (notificationContainer.value) {
      return notificationContainer.value.success(title, message, duration)
    }
    console.log('Success:', title, message)
  }

  const error = (title: string, message?: string, duration?: number) => {
    if (notificationContainer.value) {
      return notificationContainer.value.error(title, message, duration)
    }
    console.error('Error:', title, message)
  }

  const warning = (title: string, message?: string, duration?: number) => {
    if (notificationContainer.value) {
      return notificationContainer.value.warning(title, message, duration)
    }
    console.warn('Warning:', title, message)
  }

  const info = (title: string, message?: string, duration?: number) => {
    if (notificationContainer.value) {
      return notificationContainer.value.info(title, message, duration)
    }
    console.info('Info:', title, message)
  }

  // Méthode générique pour ajouter une notification
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    if (notificationContainer.value) {
      return notificationContainer.value.addNotification(notification)
    }
    console.log('Notification:', notification)
  }

  // Supprimer une notification spécifique
  const removeNotification = (id: string) => {
    if (notificationContainer.value) {
      notificationContainer.value.removeNotification(id)
    }
  }

  // Supprimer toutes les notifications
  const clearAll = () => {
    if (notificationContainer.value) {
      notificationContainer.value.clearAll()
    }
  }

  // Notifications pour les opérations courantes
  const notifySuccess = (operation: string, entity?: string) => {
    const messages = {
      create: `${entity || 'Élément'} créé avec succès`,
      update: `${entity || 'Élément'} mis à jour avec succès`,
      delete: `${entity || 'Élément'} supprimé avec succès`,
      save: `${entity || 'Données'} sauvegardé avec succès`,
      export: `Export terminé avec succès`,
      import: `Import terminé avec succès`,
      send: `Envoi effectué avec succès`,
      process: `Traitement effectué avec succès`
    }
    
    const title = messages[operation as keyof typeof messages] || 'Opération réussie'
    success(title)
  }

  const notifyError = (operation: string, entity?: string, details?: string) => {
    const messages = {
      create: `Erreur lors de la création de ${entity || 'l\'élément'}`,
      update: `Erreur lors de la mise à jour de ${entity || 'l\'élément'}`,
      delete: `Erreur lors de la suppression de ${entity || 'l\'élément'}`,
      save: `Erreur lors de la sauvegarde de ${entity || 'données'}`,
      export: `Erreur lors de l'export`,
      import: `Erreur lors de l'import`,
      send: `Erreur lors de l'envoi`,
      process: `Erreur lors du traitement`,
      load: `Erreur lors du chargement de ${entity || 'données'}`,
      network: `Erreur de connexion`,
      permission: `Permissions insuffisantes`,
      validation: `Erreur de validation`
    }
    
    const title = messages[operation as keyof typeof messages] || 'Une erreur est survenue'
    error(title, details)
  }

  const notifyLoading = (operation: string, entity?: string) => {
    const messages = {
      create: `Création de ${entity || 'l\'élément'} en cours...`,
      update: `Mise à jour de ${entity || 'l\'élément'} en cours...`,
      delete: `Suppression de ${entity || 'l\'élément'} en cours...`,
      save: `Sauvegarde en cours...`,
      export: `Export en cours...`,
      import: `Import en cours...`,
      send: `Envoi en cours...`,
      process: `Traitement en cours...`,
      load: `Chargement en cours...`
    }
    
    const title = messages[operation as keyof typeof messages] || 'Opération en cours...'
    info(title, undefined, 0) // Durée infinie
  }

  return {
    setNotificationContainer,
    success,
    error,
    warning,
    info,
    addNotification,
    removeNotification,
    clearAll,
    notifySuccess,
    notifyError,
    notifyLoading
  }
}

// Instance globale
export const notifications = useNotifications()
