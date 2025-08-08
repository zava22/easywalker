const KEYWORDS = {
  programming: [
    'javascript', 'python', 'react', 'vue', 'angular', 'node', 'express', 'mongodb', 'sql',
    'html', 'css', 'typescript', 'java', 'c++', 'php', 'ruby', 'go', 'rust', 'swift',
    'api', 'database', 'frontend', 'backend', 'fullstack', 'framework', 'library',
    'component', 'function', 'variable', 'array', 'object', 'class', 'method',
    'algorithm', 'data structure', 'debugging', 'testing', 'deployment'
  ],
  ai: [
    'artificial intelligence', 'machine learning', 'deep learning', 'neural network',
    'ai', 'ml', 'nlp', 'computer vision', 'chatbot', 'gpt', 'llm', 'model',
    'training', 'dataset', 'algorithm', 'prediction', 'classification'
  ],
  web: [
    'website', 'web development', 'responsive', 'mobile', 'desktop', 'browser',
    'seo', 'performance', 'optimization', 'accessibility', 'ui', 'ux',
    'design', 'layout', 'animation', 'transition'
  ],
  business: [
    'startup', 'business', 'marketing', 'sales', 'revenue', 'profit', 'growth',
    'strategy', 'planning', 'management', 'leadership', 'team', 'project'
  ]
};

const getGradientClass = (category) => {
  const gradients = {
    programming: 'keyword-programming',
    ai: 'keyword-ai',
    web: 'keyword-web',
    business: 'keyword-business',
    default: 'keyword-default'
  };
  return gradients[category] || gradients.default;
};

export const highlightKeywords = (text) => {
  let highlightedText = text;
  
  // Create a map of all keywords with their categories
  const keywordMap = {};
  Object.entries(KEYWORDS).forEach(([category, words]) => {
    words.forEach(word => {
      keywordMap[word.toLowerCase()] = category;
    });
  });
  
  // Sort keywords by length (longest first) to avoid partial matches
  const sortedKeywords = Object.keys(keywordMap).sort((a, b) => b.length - a.length);
  
  sortedKeywords.forEach(keyword => {
    const category = keywordMap[keyword];
    const gradientClass = getGradientClass(category);
    
    // Create regex for whole word matching (case insensitive)
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    
    highlightedText = highlightedText.replace(regex, (match) => {
      return `<span class="${gradientClass}">${match}</span>`;
    });
  });
  
  return highlightedText;
};