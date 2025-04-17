import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

interface VideoAnalysisRequest {
  videoId: string;
  title: string;
  description: string;
  tags: string[];
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { videoId, title, description, tags, statistics } = await req.json() as VideoAnalysisRequest;

    // Calculate SEO score based on various factors
    const seoScore = {
      overall: calculateOverallScore(title, description, tags, statistics),
      metrics: {
        title: calculateTitleScore(title),
        description: calculateDescriptionScore(description),
        tags: calculateTagsScore(tags),
        engagement: calculateEngagementScore(statistics),
      },
      suggestions: generateSuggestions(title, description, tags),
    };

    // Generate suggested tags based on title and description
    const suggestedTags = generateTags(title, description);

    // Generate video summary
    const summary = generateSummary(title, description);

    // Generate video hook
    const hook = generateHook(title, description);

    return new Response(
      JSON.stringify({
        seoScore,
        suggestedTags,
        summary,
        hook,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in YouTube AI analysis:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

// Helper functions for scoring and analysis
function calculateOverallScore(
  title: string,
  description: string,
  tags: string[],
  statistics: { viewCount: string; likeCount: string; commentCount: string }
): number {
  try {
    const titleScore = calculateTitleScore(title);
    const descriptionScore = calculateDescriptionScore(description);
    const tagsScore = calculateTagsScore(tags);
    const engagementScore = calculateEngagementScore(statistics);

    return Math.round((titleScore + descriptionScore + tagsScore + engagementScore) / 4);
  } catch (error) {
    console.error('Error calculating overall score:', error);
    return 0;
  }
}

function calculateTitleScore(title: string): number {
  try {
    let score = 0;
    
    // Length check (40-60 characters is optimal)
    const length = title.length;
    if (length >= 40 && length <= 60) score += 100;
    else if (length >= 30 && length <= 70) score += 80;
    else if (length >= 20 && length <= 80) score += 60;
    else score += 40;

    // Contains numbers
    if (/\d+/.test(title)) score += 10;

    // Contains question or emotional words
    if (/\?|!|how|why|what|when|best|top|ultimate|guide|tutorial/i.test(title)) score += 10;

    return Math.min(100, Math.round(score));
  } catch (error) {
    console.error('Error calculating title score:', error);
    return 0;
  }
}

function calculateDescriptionScore(description: string): number {
  try {
    let score = 0;
    
    // Length check (minimum 200 characters recommended)
    const length = description.length;
    if (length >= 200) score += 100;
    else score += (length / 200) * 100;

    // Contains timestamps
    if (/\d+:\d+/.test(description)) score += 10;

    // Contains links
    if (/https?:\/\/[^\s]+/.test(description)) score += 10;

    return Math.min(100, Math.round(score));
  } catch (error) {
    console.error('Error calculating description score:', error);
    return 0;
  }
}

function calculateTagsScore(tags: string[]): number {
  try {
    let score = 0;
    
    // Number of tags (8-12 is optimal)
    const count = tags.length;
    if (count >= 8 && count <= 12) score += 100;
    else if (count >= 5 && count <= 15) score += 80;
    else if (count > 0) score += 60;

    return Math.min(100, Math.round(score));
  } catch (error) {
    console.error('Error calculating tags score:', error);
    return 0;
  }
}

function calculateEngagementScore(statistics: { viewCount: string; likeCount: string; commentCount: string }): number {
  try {
    const views = parseInt(statistics.viewCount) || 0;
    const likes = parseInt(statistics.likeCount) || 0;
    const comments = parseInt(statistics.commentCount) || 0;

    const likeRatio = views > 0 ? (likes / views) * 100 : 0;
    const commentRatio = views > 0 ? (comments / views) * 100 : 0;

    let score = 0;

    // Like ratio scoring
    if (likeRatio >= 10) score += 100;
    else if (likeRatio >= 5) score += 80;
    else if (likeRatio >= 2) score += 60;
    else score += 40;

    // Comment ratio scoring
    if (commentRatio >= 1) score += 100;
    else if (commentRatio >= 0.5) score += 80;
    else if (commentRatio >= 0.2) score += 60;
    else score += 40;

    return Math.round(score / 2);
  } catch (error) {
    console.error('Error calculating engagement score:', error);
    return 0;
  }
}

function generateSuggestions(title: string, description: string, tags: string[]): string[] {
  try {
    const suggestions: string[] = [];

    // Title suggestions
    if (title.length < 40) {
      suggestions.push('Make your title longer (40-60 characters recommended)');
    }
    if (!/\d+/.test(title)) {
      suggestions.push('Consider adding numbers to your title for better CTR');
    }

    // Description suggestions
    if (description.length < 200) {
      suggestions.push('Add more content to your description (minimum 200 characters recommended)');
    }
    if (!/\d+:\d+/.test(description)) {
      suggestions.push('Add timestamps to your description for better user experience');
    }

    // Tags suggestions
    if (tags.length < 8) {
      suggestions.push('Add more tags (8-12 tags recommended)');
    }

    return suggestions;
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return ['Unable to generate suggestions due to an error'];
  }
}

function generateTags(title: string, description: string): string[] {
  try {
    // Extract keywords from title and description
    const content = `${title} ${description}`.toLowerCase();
    const words = content.split(/\s+/);
    
    // Common YouTube-related tags
    const commonTags = [
      '#YouTubeTips',
      '#ContentCreation',
      '#VideoMarketing',
      '#CreatorEconomy',
      '#YouTubeStrategy',
      '#DigitalMarketing',
      '#VideoProduction',
      '#OnlinePresence',
    ];

    // Generate specific tags based on content
    const specificTags = words
      .filter(word => word.length > 4)
      .map(word => `#${word.charAt(0).toUpperCase()}${word.slice(1)}`)
      .slice(0, 4);

    return [...commonTags, ...specificTags];
  } catch (error) {
    console.error('Error generating tags:', error);
    return ['#Content', '#Video', '#YouTube'];
  }
}

function generateSummary(title: string, description: string): string {
  try {
    // Extract main points from description
    const lines = description.split('\n');
    const mainPoints = lines
      .filter(line => line.trim().length > 0)
      .slice(0, 5)
      .map(line => `• ${line.trim()}`);

    return `Video Title: ${title}

Key Points:
${mainPoints.join('\n')}

Main Takeaways:
1. Comprehensive coverage of the topic
2. Clear explanations with practical examples
3. Actionable tips for implementation
4. Valuable insights for beginners and experts`;
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Unable to generate summary due to an error';
  }
}

function generateHook(title: string, description: string): string {
  try {
    const keywords = [...title.split(' '), ...description.split(' ')]
      .filter(word => word.length > 4)
      .slice(0, 3);

    return `"Want to master ${keywords.join(', ')}? In this video, I'm revealing proven strategies that will transform your results. These are techniques that nobody's talking about - and the best part? You can start implementing them TODAY. Stay tuned for the game-changing tips!"`;
  } catch (error) {
    console.error('Error generating hook:', error);
    return 'Want to learn something amazing? Watch this video to discover game-changing tips and strategies!';
  }
}