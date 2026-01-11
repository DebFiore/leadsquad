import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Linkedin, Twitter, Clock, Eye, ChevronRight, Mail } from 'lucide-react';
import { blogService, BlogPost as BlogPostType } from '@/services/blogService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadPost();
  }, [slug]);

  async function loadPost() {
    if (!slug) return;
    const { data, error } = await blogService.getPostBySlug(slug);
    if (data) {
      setPost(data);
    }
    setLoading(false);
  }

  const shareOnTwitter = () => {
    const url = window.location.href;
    const text = post?.title || 'Check out this article';
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = window.location.href;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="text-center py-32">
          <h1 className="text-2xl font-bold text-foreground mb-4">Post not found</h1>
          <Link to="/blog">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section with Featured Image */}
      <section className="relative pt-24 pb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628] via-[#0d1f3c] to-background" />
        
        <div className="relative z-10 max-w-[800px] mx-auto px-4 sm:px-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate max-w-[200px]">
              {post.title}
            </span>
          </nav>

          {/* Back Button */}
          <Link to="/blog" className="inline-flex items-center gap-2 text-primary hover:text-orange-glow transition-colors mb-6 group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Blog</span>
          </Link>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              5 min read
            </span>
            <span className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {post.view_count || 0} views
            </span>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Share:</span>
            <button
              onClick={shareOnTwitter}
              className="p-2 rounded-full bg-muted/50 hover:bg-primary hover:text-primary-foreground transition-all"
              aria-label="Share on Twitter"
            >
              <Twitter className="h-4 w-4" />
            </button>
            <button
              onClick={shareOnLinkedIn}
              className="p-2 rounded-full bg-muted/50 hover:bg-[#0077B5] hover:text-white transition-all"
              aria-label="Share on LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {post.featured_image && (
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 -mt-4 mb-12">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-auto max-h-[400px] object-cover rounded-2xl shadow-2xl"
          />
        </div>
      )}

      {/* Article Content */}
      <article className="max-w-[800px] mx-auto px-4 sm:px-6 pb-16">
        <div 
          className="prose prose-lg prose-invert max-w-none
            prose-headings:text-foreground prose-headings:font-bold
            prose-p:text-muted-foreground prose-p:text-lg prose-p:leading-[1.8]
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground
            prose-ul:text-muted-foreground prose-ol:text-muted-foreground
            prose-li:text-lg prose-li:leading-[1.8]
            prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
            prose-code:text-primary prose-code:bg-muted/50 prose-code:px-1 prose-code:rounded
            prose-pre:bg-muted/30 prose-pre:border prose-pre:border-border"
        >
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {/* Share Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-muted-foreground">Enjoyed this article? Share it!</p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={shareOnTwitter}
                className="gap-2"
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareOnLinkedIn}
                className="gap-2"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Button>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 p-8 bg-gradient-to-br from-primary/10 via-card to-card rounded-2xl border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-primary/20">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Stay Updated
            </h3>
          </div>
          <p className="text-muted-foreground mb-6">
            Get the latest AI automation insights and strategies delivered straight to your inbox. No spam, just valuable content.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-muted/30 border-muted focus:border-primary"
            />
            <Button type="submit" className="whitespace-nowrap">
              Subscribe
            </Button>
          </form>
        </div>

        {/* Back to Blog */}
        <div className="mt-12 text-center">
          <Link to="/blog">
            <Button variant="outline" size="lg" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to All Articles
            </Button>
          </Link>
        </div>
      </article>

      <Footer />
    </div>
  );
}
