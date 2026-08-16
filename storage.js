/**
 * Service de gestion des fichiers et images avec Appwrite Storage
 */
const StorageService = {
  /**
   * Upload un fichier dans le bucket Appwrite Storage
   * @param {File} file - Fichier sélectionné par l'utilisateur
   * @returns {Promise<Object>} Document fichier Appwrite
   */
  async uploadFile(file) {
    try {
      if (!file) throw new Error("Aucun fichier sélectionné.");
      
      const response = await AppwriteConfig.storage.createFile(
        AppwriteConfig.bucketId,
        Appwrite.ID.unique(),
        file
      );
      return response;
    } catch (error) {
      console.error("Erreur d'upload fichier:", error);
      throw error;
    }
  },

  /**
   * Obtient l'URL de prévisualisation d'un fichier (pour les images)
   * @param {string} fileId 
   * @returns {string} URL de l'image
   */
  getFilePreview(fileId) {
    if (!fileId) return '';
    return AppwriteConfig.storage.getFilePreview(
      AppwriteConfig.bucketId,
      fileId,
      300, // width
      300, // height
      'center', // gravity
      80 // quality
    );
  },

  /**
   * Obtient l'URL de téléchargement direct d'un fichier
   * @param {string} fileId 
   * @returns {string} URL de téléchargement
   */
  getFileDownload(fileId) {
    if (!fileId) return '';
    return AppwriteConfig.storage.getFileDownload(
      AppwriteConfig.bucketId,
      fileId
    );
  },

  /**
   * Supprime un fichier du bucket Storage
   * @param {string} fileId 
   */
  async deleteFile(fileId) {
    try {
      if (!fileId) return;
      await AppwriteConfig.storage.deleteFile(
        AppwriteConfig.bucketId,
        fileId
      );
    } catch (error) {
      console.error("Erreur lors de la suppression du fichier:", error);
      throw error;
    }
  }
};