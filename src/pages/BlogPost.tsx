import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { blogService, BlogPost as BlogPostType } from '@/services/blogService';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (!post) return <div className="text-center p-8">Post not found</div>;

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      <Link to="/blog" className="text-orange-500 hover:underline mb-4 inline-block">
        ← Back to Blog
      </Link>
      
      {post.featured_image && (
        <img 
          src={post.featured_image} 
          alt={post.title}
          className="w-full h-96 object-cover rounded-lg mb-8"
        />
      )}
      
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      
      <div className="flex items-center text-gray-600 mb-8">
        <span>5 min read</span>
        <span className="mx-2">•</span>
        <span>0 views</span>
      </div>
      
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}
