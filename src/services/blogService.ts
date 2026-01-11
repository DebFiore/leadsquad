import { supabase } from '@/lib/supabase'

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string | null
  author_id: string
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
  category?: string
  view_count?: number
}

export const blogService = {
  async getPosts(limit = 10) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit)
    
    return { data: data as BlogPost[] | null, error }
  },

  async getPostBySlug(slug: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
    
    return { data: data as BlogPost | null, error }
  },

  async getPostById(id: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    
    return { data: data as BlogPost | null, error }
  },

  async createPost(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(post)
      .select()
      .single()
    
    return { data: data as BlogPost | null, error }
  },

  async updatePost(id: string, updates: Partial<BlogPost>) {
    const { data, error } = await supabase
      .from('blog_posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    return { data: data as BlogPost | null, error }
  },

  async deletePost(id: string) {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id)
    
    return { error }
  },

  async publishPost(id: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .update({ 
        status: 'published', 
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    return { data: data as BlogPost | null, error }
  },

  async unpublishPost(id: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .update({ 
        status: 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    return { data: data as BlogPost | null, error }
  }
}
