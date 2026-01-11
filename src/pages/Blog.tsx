import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogService, BlogPost } from '@/services/blogService';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    const { data, error } = await blogService.getPosts(20);
    if (data) {
      setPosts(data);
    }
    setLoading(false);
  }

  if (loading) return <div className="text-center p-8">Loading posts...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">LeadSquad.ai Blog</h1>
      
      {posts.length === 0 ? (
        <p className="text-gray-600">No blog posts yet. Check back soon!</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {post.featured_image && (
                <img 
                  src={post.featured_image} 
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">
                  <Link to={`/blog/${post.slug}`} className="hover:text-orange-500">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{new Date(post.published_at || '').toLocaleDateString()}</span>
                  <span>5 min read</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
