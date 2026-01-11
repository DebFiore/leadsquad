import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, Eye, ArrowRight } from 'lucide-react';
import { blogService, BlogPost } from '@/services/blogService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CATEGORIES = [
  { id: 'all', label: 'All Posts', color: 'bg-primary' },
  { id: 'ai-automation', label: 'AI Automation', color: 'bg-orange' },
  { id: 'lead-generation', label: 'Lead Generation', color: 'bg-sky' },
  { id: 'voice-ai', label: 'Voice AI', color: 'bg-purple-500' },
  { id: 'case-studies', label: 'Case Studies', color: 'bg-emerald-500' },
  { id: 'industry-insights', label: 'Industry Insights', color: 'bg-amber-500' },
];

const POSTS_PER_PAGE = 9;

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visiblePosts, setVisiblePosts] = useState(POSTS_PER_PAGE);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    const { data, error } = await blogService.getPosts(50);
    if (data) {
      setPosts(data);
    }
    setLoading(false);
  }

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
      const matchesSearch = !searchQuery || 
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [posts, activeCategory, searchQuery]);

  const displayedPosts = filteredPosts.slice(0, visiblePosts);
  const hasMorePosts = filteredPosts.length > visiblePosts;

  const loadMore = () => {
    setVisiblePosts(prev => prev + POSTS_PER_PAGE);
  };

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628] via-[#0d1f3c] to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-60" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6">
            <div className="h-1 w-24 bg-gradient-to-r from-orange to-orange-glow mx-auto rounded-full" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Never Miss Another{' '}
            <span className="text-[#FF6B35]">Lead</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            AI-Driven <span className="text-[#FF6B35]">Lead</span> Generation, Response, and Conversion Strategies for Modern Businesses
          </p>
          
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-orange to-transparent mx-auto rounded-full" />
        </div>
      </section>

      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setVisiblePosts(POSTS_PER_PAGE);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeCategory === category.id
                      ? 'bg-primary text-primary-foreground shadow-md scale-105'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisiblePosts(POSTS_PER_PAGE);
                }}
                className="pl-10 bg-muted/30 border-muted focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : displayedPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground mb-4">
                {searchQuery || activeCategory !== 'all' 
                  ? 'No posts found matching your criteria.' 
                  : 'No blog posts yet. Check back soon!'}
              </p>
              {(searchQuery || activeCategory !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedPosts.map(post => {
                  const categoryInfo = getCategoryInfo(post.category || 'all');
                  
                  return (
                    <article
                      key={post.id}
                      className="group bg-card rounded-2xl overflow-hidden border border-border shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                    >
                      {/* Featured Image */}
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={post.featured_image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop'}
                          alt={post.title || 'Blog post'}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                        
                        {/* Category Badge */}
                        <Badge
                          className={`absolute top-4 left-4 ${categoryInfo.color} text-white border-0`}
                        >
                          {categoryInfo.label}
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                          <Link to={`/blog/${post.slug}`}>
                            {post.title || 'Untitled Post'}
                          </Link>
                        </h2>
                        
                        <p className="text-muted-foreground mb-6 line-clamp-3">
                          {post.excerpt || 'No excerpt available.'}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              5 min read
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {post.view_count || 0} views
                            </span>
                          </div>
                          
                          <Link
                            to={`/blog/${post.slug}`}
                            className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-orange-glow transition-colors group/link"
                          >
                            Read
                            <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Load More Button */}
              {hasMorePosts && (
                <div className="text-center mt-12">
                  <Button
                    onClick={loadMore}
                    variant="outline"
                    size="lg"
                    className="px-8 hover:bg-primary hover:text-primary-foreground"
                  >
                    Load More Articles
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
