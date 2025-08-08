'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { createSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/components/providers'
import { 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  Tag,
  Users,
  TrendingUp,
  Search,
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface ForumPost {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  upvotes: number
  downvotes: number
  replies: number
  created_at: string
  is_resolved: boolean
  is_pinned: boolean
  author: {
    first_name: string
    last_name: string
    role: string
  }
}

interface Category {
  name: string
  count: number
  color: string
}

interface CommunityStats {
  totalMembers: number
  totalPosts: number
  activeToday: number
}

const popularTags = [
  'algebra', 'shakespeare', 'essay-writing', 'geometry', 'poetry', 
  'grammar', 'calculus', 'literary-devices', 'exam-prep', 'study-tips'
]

export default function ForumPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<CommunityStats>({ totalMembers: 0, totalPosts: 0, activeToday: 0 })
  const [loading, setLoading] = useState(true)
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchForumData()
  }, [])

  const fetchForumData = async () => {
    try {
      // Fetch forum posts with author information
      const { data: postsData } = await supabase
        .from('forum_posts')
        .select(`
          id,
          title,
          content,
          category,
          tags,
          upvotes,
          downvotes,
          is_resolved,
          is_pinned,
          created_at,
          users (first_name, last_name, role)
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20)

      // Count replies for each post
      const postsWithReplies = await Promise.all((postsData || []).map(async (post) => {
        const { count } = await supabase
          .from('forum_replies')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id)

        return {
          ...post,
          replies: count || 0,
          author: Array.isArray(post.users) ? post.users[0] || { first_name: 'Unknown', last_name: 'User', role: 'Student' }
            : post.users || { first_name: 'Unknown', last_name: 'User', role: 'Student' }
        }
      }))

      setPosts(postsWithReplies as ForumPost[])

      // Fetch category counts
      const { data: categoryData } = await supabase
        .from('forum_posts')
        .select('category')

      const categoryMap = (categoryData || []).reduce((acc: Record<string, number>, post) => {
        acc[post.category] = (acc[post.category] || 0) + 1
        return acc
      }, {})

      const categoriesWithCounts = [
        { name: 'All Topics', count: categoryData?.length || 0, color: 'primary' },
        { name: 'Mathematics', count: categoryMap['Mathematics'] || 0, color: 'blue' },
        { name: 'English Literature', count: categoryMap['English Literature'] || 0, color: 'green' },
        { name: 'English Language', count: categoryMap['English Language'] || 0, color: 'purple' },
        { name: 'General Discussion', count: categoryMap['General Discussion'] || 0, color: 'gray' }
      ]

      setCategories(categoriesWithCounts)

      // Fetch community stats
      const [{ count: memberCount }, { count: postCount }] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('forum_posts').select('*', { count: 'exact', head: true })
      ])

      setStats({
        totalMembers: memberCount || 0,
        totalPosts: postCount || 0,
        activeToday: Math.floor((memberCount || 0) * 0.1) // Estimate active users
      })

    } catch (error) {
      console.error('Error fetching forum data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const handleVote = async (postId: string, isUpvote: boolean) => {
    if (!user) return

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('forum_votes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()

      if (existingVote) {
        // Update existing vote or remove if same
        if (existingVote.is_upvote === isUpvote) {
          await supabase.from('forum_votes').delete().eq('id', existingVote.id)
        } else {
          await supabase.from('forum_votes').update({ is_upvote: isUpvote }).eq('id', existingVote.id)
        }
      } else {
        // Create new vote
        await supabase.from('forum_votes').insert({
          post_id: postId,
          user_id: user.id,
          is_upvote: isUpvote
        })
      }

      // Refresh posts to show updated counts
      fetchForumData()
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
            <p className="text-gray-600 mt-2">
              Connect with fellow students, ask questions, and share knowledge
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Search className="w-4 h-4 mr-2" />
              Search
            </button>
            <button 
              onClick={() => setShowNewPostModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filter Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex space-x-6">
                  <button className="text-primary-600 border-b-2 border-primary-600 pb-2 font-medium">
                    Recent
                  </button>
                  <button className="text-gray-500 hover:text-gray-700 pb-2">
                    Most Popular
                  </button>
                  <button className="text-gray-500 hover:text-gray-700 pb-2">
                    Unanswered
                  </button>
                  <button className="text-gray-500 hover:text-gray-700 pb-2">
                    Resolved
                  </button>
                </div>
              </div>
            </div>

            {/* Forum Posts */}
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600">Be the first to start a discussion!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                        {post.author.first_name[0]}{post.author.last_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          {post.is_pinned && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              📌 Pinned
                            </span>
                          )}
                          {post.is_resolved && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                              ✅ Resolved
                            </span>
                          )}
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary-100 text-primary-800">
                            {post.category}
                          </span>
                        </div>
                        
                        <Link href={`/forum/post/${post.id}`} className="block group">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {post.title}
                          </h3>
                        </Link>
                        
                        <p className="text-gray-600 mt-2 line-clamp-2">
                          {post.content}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {Array.isArray(post.tags) && post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer"
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Post Meta */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <span className="font-medium text-gray-700">
                                {post.author.first_name} {post.author.last_name}
                              </span>
                              <span className="ml-1">({post.author.role})</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {getTimeAgo(post.created_at)}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <button 
                                onClick={() => handleVote(post.id, true)}
                                className="flex items-center space-x-1 text-gray-500 hover:text-green-600 transition-colors"
                              >
                                <ThumbsUp className="w-4 h-4" />
                                <span>{post.upvotes}</span>
                              </button>
                              <button 
                                onClick={() => handleVote(post.id, false)}
                                className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors"
                              >
                                <ThumbsDown className="w-4 h-4" />
                                <span>{post.downvotes}</span>
                              </button>
                            </div>
                            <div className="flex items-center text-gray-500">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              <span>{post.replies} replies</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <button className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Load More Posts
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <span className="text-gray-700">{category.name}</span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Popular Tags</h3>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <button
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-700 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Community Stats</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-primary-600 mr-2" />
                      <span className="text-gray-700">Total Members</span>
                    </div>
                    <span className="font-semibold text-gray-900">{stats.totalMembers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-gray-700">Total Posts</span>
                    </div>
                    <span className="font-semibold text-gray-900">{stats.totalPosts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-gray-700">Active Today</span>
                    </div>
                    <span className="font-semibold text-gray-900">{stats.activeToday}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Community Guidelines
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Be respectful and constructive</li>
                <li>• Search before posting</li>
                <li>• Use descriptive titles</li>
                <li>• Tag posts appropriately</li>
                <li>• Help others when you can</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
