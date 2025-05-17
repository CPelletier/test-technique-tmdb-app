// utils/textUtils.ts
/**
 * Compte le nombre de caractères de texte (sans HTML) dans une chaîne HTML
 */
export function countTextCharacters(html: string): number {
  if (!html) return 0;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const textOnly = tempDiv.textContent || tempDiv.innerText || '';
  return textOnly.length;
}

/**
 * Génère une représentation visuelle d'une note avec des étoiles
 * Traite explicitement les cas limites
 */
export function generateStars(rating: number): string {
  // Gestion explicite des cas limites
  if (rating <= 0) {
    return '☆☆☆☆☆☆☆☆☆☆'; // 10 étoiles vides
  }
  
  if (rating >= 10) {
    return '★★★★★★★★★★'; // 10 étoiles pleines
  }
  
  // Cas normal entre 1 et 9
  const fullStars = '★'.repeat(Math.floor(rating));
  const emptyStars = '☆'.repeat(10 - Math.floor(rating));
  return fullStars + emptyStars;
}