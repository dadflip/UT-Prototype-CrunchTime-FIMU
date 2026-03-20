import { localDB, Category, Artist, Vote, JuryMember } from './local-storage';

// Interface pour Ranking (non exportée depuis local-storage)
interface Ranking {
  id: string;
  artist_id: string;
  session_id: string;
  total_points: number;
  vote_count: number;
  average_rank?: number;
  final_rank?: number;
  is_finalist: boolean;
}

// Fonction UUID compatible avec tous les navigateurs
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback pour les navigateurs plus anciens
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Hook pour récupérer les catégories actives
export async function getActiveCategories(): Promise<Category[]> {
  await localDB.init();
  return localDB.getActiveCategories();
}

// Hook pour récupérer les artistes par catégorie
export async function getArtistsByCategory(categoryId: string): Promise<Artist[]> {
  await localDB.init();
  return localDB.getArtistsByCategory(categoryId);
}

// Hook pour créer un vote
export async function createVote(voteData: {
  jury_member_id: string;
  artist_id: string;
  category_id: string;
  score: number;
}): Promise<Vote> {
  await localDB.init();
  return localDB.createVote(voteData);
}

// Hook pour récupérer les votes d'un juré
export async function getVotesByJuryMember(juryMemberId: string): Promise<Vote[]> {
  await localDB.init();
  return localDB.getVotesByJuryMember(juryMemberId);
}

// Hook pour récupérer les votes d'un artiste
export async function getVotesByArtist(artistId: string): Promise<Vote[]> {
  await localDB.init();
  return localDB.getVotesByArtist(artistId);
}

// Hook pour calculer les classements
export async function calculateRankings(categoryId?: string): Promise<Ranking[]> {
  await localDB.init();
  
  const votes = await localDB.getAll('votes') as Vote[];
  const artists = await localDB.getAll('artists') as Artist[];
  const categories = await localDB.getAll('categories') as Category[];
  
  // Filtrer par catégorie si spécifiée
  const filteredVotes = categoryId 
    ? votes.filter((vote: Vote) => vote.category_id === categoryId)
    : votes;
  
  // Grouper les votes par artiste
  const artistScores = new Map<string, { totalScore: number; voteCount: number }>();
  
  filteredVotes.forEach((vote: Vote) => {
    const current = artistScores.get(vote.artist_id) || { totalScore: 0, voteCount: 0 };
    current.totalScore += vote.score;
    current.voteCount += 1;
    artistScores.set(vote.artist_id, current);
  });
  
  // Créer les classements
  const rankings: Ranking[] = [];
  
  for (const [artistId, scores] of artistScores.entries()) {
    const artist = artists.find((a: Artist) => a.id === artistId);
    if (!artist) continue;
    
    const ranking: Ranking = {
      id: generateUUID(),
      artist_id: artistId,
      session_id: 'current', // Session par défaut
      total_points: scores.totalScore,
      vote_count: scores.voteCount,
      average_rank: scores.voteCount > 0 ? scores.totalScore / scores.voteCount : 0,
      is_finalist: false
    };
    
    rankings.push(ranking);
  }
  
  // Trier par total de points décroissant
  rankings.sort((a, b) => b.total_points - a.total_points);
  
  // Marquer les finalistes (top 3)
  rankings.slice(0, 3).forEach((ranking, index) => {
    ranking.final_rank = index + 1;
    ranking.is_finalist = true;
  });
  
  return rankings;
}

// Hook pour exporter les données en format CSV
export async function exportVotesToCSV(): Promise<string> {
  await localDB.init();
  
  const votes = await localDB.getAll('votes') as Vote[];
  const artists = await localDB.getAll('artists') as Artist[];
  const categories = await localDB.getAll('categories') as Category[];
  const juryMembers = await localDB.getAll('jury_members') as JuryMember[];
  
  // Créer l'en-tête CSV
  const headers = [
    'ID Vote',
    'Nom du Juré',
    'Email du Juré',
    'Nom de l\'Artiste',
    'Catégorie',
    'Score',
    'Date de vote'
  ];
  
  // Créer les lignes CSV
  const rows = votes.map((vote: Vote) => {
    const artist = artists.find((a: Artist) => a.id === vote.artist_id);
    const category = categories.find((c: Category) => c.id === vote.category_id);
    const juryMember = juryMembers.find((j: JuryMember) => j.id === vote.jury_member_id);
    
    return [
      vote.id,
      (juryMember as JuryMember)?.member_name || 'Inconnu',
      (juryMember as JuryMember)?.email || '',
      (artist as Artist)?.name || 'Inconnu',
      (category as Category)?.name || 'Inconnue',
      vote.score.toString(),
      new Date(vote.created_at).toLocaleString('fr-FR')
    ];
  });
  
  // Combiner l'en-tête et les lignes
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  return csvContent;
}
