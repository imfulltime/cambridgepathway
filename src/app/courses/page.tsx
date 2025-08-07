import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { BookOpen, Clock, Users, Star } from 'lucide-react'
import Link from 'next/link'

const courses = [
  {
    id: 'igcse-mathematics',
    title: 'IGCSE Mathematics',
    description: 'Master fundamental mathematical concepts including algebra, geometry, statistics, and calculus.',
    level: 'IGCSE',
    duration: '10 weeks',
    lessons: 24,
    students: 456,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    instructor: 'Dr. Sarah Johnson',
    price: 'Free',
    features: [
      'Interactive video lessons',
      'Practice problems with solutions',
      'Mock exams and assessments',
      'Downloadable worksheets',
      'Community support'
    ]
  },
  {
    id: 'igcse-english-literature',
    title: 'IGCSE English Literature',
    description: 'Explore classic and contemporary literature with detailed analysis and critical thinking skills.',
    level: 'IGCSE',
    duration: '12 weeks',
    lessons: 28,
    students: 389,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    instructor: 'Prof. Michael Brown',
    price: 'Free',
    features: [
      'Text analysis techniques',
      'Essay writing guidance',
      'Character and theme exploration',
      'Poetry interpretation',
      'Exam preparation strategies'
    ]
  },
  {
    id: 'igcse-english-language',
    title: 'IGCSE English Language',
    description: 'Develop strong communication skills in reading, writing, speaking, and listening.',
    level: 'IGCSE',
    duration: '10 weeks',
    lessons: 22,
    students: 512,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    instructor: 'Ms. Emma Wilson',
    price: 'Free',
    features: [
      'Grammar and vocabulary building',
      'Comprehension skills',
      'Creative and formal writing',
      'Speaking practice sessions',
      'Language analysis techniques'
    ]
  }
]

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main>
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary-600 to-accent-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">
                Cambridge IGCSE Courses
              </h1>
              <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                Master the Cambridge curriculum with our comprehensive online courses designed for international students.
              </p>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {course.level}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-white bg-opacity-90 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                      {course.price}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        <span>{course.lessons} lessons</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                      <span className="font-medium">{course.rating}</span>
                    </div>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Users className="w-4 h-4 mr-1" />
                    <span>Instructor: {course.instructor}</span>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">What you'll learn:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {course.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={`/courses/${course.id}`}
                    className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center block"
                  >
                    Start Learning
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              More Subjects Coming Soon
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              We're constantly expanding our course offerings. Stay tuned for Physics, Chemistry, Biology, and more IGCSE subjects.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {['Physics', 'Chemistry', 'Biology', 'History'].map((subject) => (
                <div key={subject} className="bg-gray-100 rounded-lg p-4 text-gray-500">
                  <BookOpen className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">{subject}</div>
                  <div className="text-sm">Coming Soon</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
