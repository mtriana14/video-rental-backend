const CATEGORY_IMAGES: Record<string, string> = {
  'Action':      'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500',
  'Animation':   'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500',
  'Children':    'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=500',
  'Classics':    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500',
  'Comedy':      'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=500',
  'Documentary': 'https://images.unsplash.com/photo-1492724724894-7464c27d0ceb?w=500',
  'Drama':       'https://images.unsplash.com/photo-1503095396549-807759245b35?w=500',
  'Family':      'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?w=500',
  'Foreign':     'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500',
  'Games':       'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=500',
  'Horror':      'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500',
  'Music':       'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
  'New':         'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500',
  'Sci-Fi':      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=500',
  'Sports':      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500',
  'Travel':      'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=500',
};

const ACTOR_IMAGES = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300',
];

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500';

export function getFilmPoster(category?: string): string {
  if (!category) return DEFAULT_IMAGE;
  return CATEGORY_IMAGES[category] ?? DEFAULT_IMAGE;
}

export function getActorPhoto(actorId: number): string {
  return ACTOR_IMAGES[actorId % ACTOR_IMAGES.length];
}