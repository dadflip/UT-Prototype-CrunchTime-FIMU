import { Vote } from '@/types';

/**
 * Calculate statistics from votes
 */
export function calculateVoteStats(votes: Vote[]) {
  if (votes.length === 0) {
    return {
      totalVotes: 0,
      totalPoints: 0,
      averageScore: 0,
      minScore: 0,
      maxScore: 0,
    };
  }

  const totalVotes = votes.length;
  const totalPoints = votes.reduce((sum, v) => sum + v.points, 0);
  const averageScore = Number((totalPoints / totalVotes).toFixed(2));
  const minScore = Math.min(...votes.map((v) => v.points));
  const maxScore = Math.max(...votes.map((v) => v.points));

  return {
    totalVotes,
    totalPoints,
    averageScore,
    minScore,
    maxScore,
  };
}

/**
 * Group votes by artist
 */
export function groupVotesByArtist(votes: Vote[]) {
  return votes.reduce(
    (acc, vote) => {
      if (!acc[vote.artist_id]) {
        acc[vote.artist_id] = [];
      }
      acc[vote.artist_id].push(vote);
      return acc;
    },
    {} as Record<string, Vote[]>
  );
}

/**
 * Group votes by jury member
 */
export function groupVotesByJury(votes: Vote[]) {
  return votes.reduce(
    (acc, vote) => {
      if (!acc[vote.jury_member_id]) {
        acc[vote.jury_member_id] = [];
      }
      acc[vote.jury_member_id].push(vote);
      return acc;
    },
    {} as Record<string, Vote[]>
  );
}

/**
 * Calculate voting completion percentage
 */
export function calculateVotingCompletion(
  votedArtists: number,
  totalArtists: number
): number {
  if (totalArtists === 0) return 0;
  return Math.round((votedArtists / totalArtists) * 100);
}

/**
 * Validate vote points
 */
export function isValidVotePoints(points: number, min: number = 1, max: number = 5): boolean {
  return Number.isInteger(points) && points >= min && points <= max;
}
