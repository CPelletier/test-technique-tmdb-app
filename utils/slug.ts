export function generateSlug(title: string, id: number): string {
  // Retirer les caractères spéciaux, remplacer les espaces par des tirets
  const baseSlug = title
    .toLowerCase()
    .normalize('NFD') // Décomposer les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^\w\s-]/g, '') // Supprimer les caractères spéciaux
    .replace(/[\s_-]+/g, '-') // Remplacer les espaces et underscores par des tirets
    .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début et fin
  
  // Ajouter l'ID à la fin pour garantir l'unicité
  return `${baseSlug}-${id}`;
}

export function getIdFromSlug(slug: string): number {
  // Extraire l'ID de la fin du slug
  const parts = slug.split('-');
  const idStr = parts[parts.length - 1];
  return parseInt(idStr);
}