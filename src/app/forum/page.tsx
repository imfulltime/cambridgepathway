import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
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

const forumPosts = [
  {
    id: '1',
    title: 'How to approach quadratic equations in IGCSE Math?',
    content: 'I\'m struggling with quadratic equations, especially when it comes to factoring. Can someone explain the best approach?',
    author: {
      name: 'Alex Chen',
      role: 'Student',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
    },
    category: 'Mathematics',
    tags: ['quadratic-equations', 'algebra', 'help-needed'],
    upvotes: 12,
    downvotes: 1,
    replies: 8,
    createdAt: '2024-01-10T14:30:00Z',
    isResolved: false,
    isPinned: false
  },
  {
    id: '2',
    title: 'Best strategies for analyzing Shakespeare\'s Romeo and Juliet',
    content: 'Our class is studying Romeo and Juliet for IGCSE English Literature. What are the key themes and literary devices I should focus on?',
    author: {
      name: 'Maria Rodriguez',
      role: 'Student',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b123?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
    },
    category: 'English Literature',
    tags: ['shakespeare', 'romeo-juliet', 'literary-analysis'],
    upvotes: 18,
    downvotes: 0,
    replies: 15,
    createdAt: '2024-01-09T16:45:00Z',
    isResolved: true,
    isPinned: true
  },
  {
    id: '3',
    title: 'Mock exam tips for Mathematics Paper 2',
    content: 'The extended paper is coming up and I\'m nervous about the problem-solving questions. Any tips from those who have taken it?',
    author: {
      name: 'David Kim',
      role: 'Student',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
    },
    category: 'Mathematics',
    tags: ['mock-exam', 'paper-2', 'problem-solving'],
    upvotes: 25,
    downvotes: 2,
    replies: 12,
    createdAt: '2024-01-08T10:20:00Z',
    isResolved: false,
    isPinned: false
  },
  {
    id: '4',
    title: 'Grammar rules for IGCSE English Language writing',
    content: 'I keep making mistakes with conditionals and passive voice in my essays. Can someone share resources or tips?',
    author: {
      name: 'Sophie Thompson',
      role: 'Student',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
    },
    category: 'English Language',
    tags: ['grammar', 'writing', 'conditionals', 'passive-voice'],
    upvotes: 14,
    downvotes: 1,
    replies: 9,
    createdAt: '2024-01-07T13:15:00Z',
    isResolved: false,
    isPinned: false
  }
]

const categories = [
  { name: 'All Topics', count: 156, color: 'primary' },
  { name: 'Mathematics', count: 67, color: 'blue' },
  { name: 'English Literature', count: 45, color: 'green' },
  { name: 'English Language', count: 32, color: 'purple' },
  { name: 'General Discussion', count: 12, color: 'gray' }
]

const popularTags = [
  'algebra', 'shakespeare', 'essay-writing', 'geometry', 'poetry', 
  'grammar', 'calculus', 'literary-devices', 'exam-prep', 'study-tips'
]

export default function ForumPage() {
  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
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
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
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
              {forumPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        {post.isPinned && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            📌 Pinned
                          </span>
                        )}
                        {post.isResolved && (
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
                        {post.tags.map((tag) => (
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
                            <span className="font-medium text-gray-700">{post.author.name}</span>
                            <span className="ml-1">({post.author.role})</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {getTimeAgo(post.createdAt)}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <button className="flex items-center space-x-1 text-gray-500 hover:text-green-600">
                              <ThumbsUp className="w-4 h-4" />
                              <span>{post.upvotes}</span>
                            </button>
                            <button className="flex items-center space-x-1 text-gray-500 hover:text-red-600">
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
              ))}
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
                    <span className="font-semibold text-gray-900">1,247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-gray-700">Total Posts</span>
                    </div>
                    <span className="font-semibold text-gray-900">3,456</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-gray-700">Active Today</span>
                    </div>
                    <span className="font-semibold text-gray-900">89</span>
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
