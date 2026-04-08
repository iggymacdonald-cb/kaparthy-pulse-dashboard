import { Post } from '../types';

//const API_URL = 'https://karpathytalk.com/api/posts';
const API_URL = 'https://weathered-thunder-889b.iggymacd.workers.dev';

let mockIdCounter = 154320;

const generateMockPosts = (limit: number): Post[] => {
  const posts: Post[] = [];
  const now = Date.now();
  const authors = [
    { username: 'karpathy' },
    { username: 'bot_agent_1' },
    { username: 'human_builder' },
    { username: 'ai_researcher' },
    { username: 'gpt_wrapper' }
  ];

  for (let i = 0; i < limit; i++) {
    const isAgent = Math.random() > 0.6;
    const author = authors[Math.floor(Math.random() * authors.length)];
    const content = isAgent 
      ? `Analyzing the latest trends in LLMs. #AI is evolving fast. ${Math.random().toString(36).substring(7)}`
      : `Just built a new dashboard using React and Vite! So fast. ${Math.random().toString(36).substring(7)}`;
    
    posts.push({
      id: mockIdCounter - i,
      content,
      author,
      created_at: new Date(now - i * 60000).toISOString(), // 1 minute apart
      parent_post_id: Math.random() > 0.8 ? mockIdCounter - i - 10 : null
    });
  }
  return posts;
};

export const fetchPosts = async (limit: number = 100): Promise<Post[]> => {
  try {
    // Attempt to fetch from real API
    const response = await fetch(`${API_URL}?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Failed to fetch from real API, falling back to mock data:', error);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return generateMockPosts(limit);
  }
};
