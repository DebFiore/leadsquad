import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogService, BlogPost as BlogPostType } from '@/services/blogService';
import { ArrowLeft } from 'lucide-react';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPost();
  }, [slug]);

  async function loadPost() {
    if (!slug) return;
    
    const { data, error } = await blogService.getPostBySlug(slug);
    if (error) {
      setError('Failed to load blog post');
      console.error(error);
    } else if (!data) {
      setError('Blog post not found');
    } else {
      setPost(data);
    }
    setLoading(false);
  }

  if (loading) {
    return <div className="text-center p-8">Loading post...</div>;
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">{error || 'Post not found'}</h1>
        <Link to="/blog" className="text-orange-500 hover:underline">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link to="/blog" className="inline-flex items-center gap-2 text-orange-500 hover:underline mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to Blog
      </Link>

      {post.featured_image && (
        <img
          src={post.featured_image}
          alt={post.title}
          className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
        />
      )}

      <article>
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-gray-500">
            <span>{new Date(post.published_at || '').toLocaleDateString()}</span>
            <span>•</span>
            <span>5 min read</span>
          </div>
        </header>

        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}
