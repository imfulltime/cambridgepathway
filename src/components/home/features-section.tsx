'use client'

import { 
  BookOpen, 
  Users, 
  Award, 
  Clock, 
  Globe, 
  Target,
  Video,
  MessageCircle,
  BarChart3,
  Shield,
  Smartphone,
  Headphones
} from 'lucide-react'

const features = [
  {
    name: 'Comprehensive Curriculum',
    description: 'Complete IGCSE Math and English courses aligned with Cambridge standards.',
    icon: BookOpen,
    color: 'primary'
  },
  {
    name: 'Interactive Learning',
    description: 'Engaging video lessons, interactive exercises, and hands-on activities.',
    icon: Video,
    color: 'accent'
  },
  {
    name: 'Progress Tracking',
    description: 'Monitor your learning journey with detailed analytics and reports.',
    icon: BarChart3,
    color: 'primary'
  },
  {
    name: 'Community Support',
    description: 'Connect with peers and tutors in our active discussion forums.',
    icon: MessageCircle,
    color: 'accent'
  },
  {
    name: 'Multilingual Support',
    description: 'Learn in your preferred language with native language support.',
    icon: Globe,
    color: 'primary'
  },
  {
    name: 'Expert Tutors',
    description: '24/7 access to qualified Cambridge curriculum specialists.',
    icon: Headphones,
    color: 'accent'
  },
  {
    name: 'Flexible Schedule',
    description: 'Learn at your own pace with self-paced courses and deadlines.',
    icon: Clock,
    color: 'primary'
  },
  {
    name: 'Mobile Learning',
    description: 'Access your courses anywhere with our responsive mobile platform.',
    icon: Smartphone,
    color: 'accent'
  },
  {
    name: 'Secure Platform',
    description: 'Your data and progress are protected with enterprise-grade security.',
    icon: Shield,
    color: 'primary'
  },
  {
    name: 'Achievement System',
    description: 'Earn certificates and badges as you complete courses and assessments.',
    icon: Award,
    color: 'accent'
  },
  {
    name: 'Personalized Learning',
    description: 'AI-powered recommendations adapt to your learning style and pace.',
    icon: Target,
    color: 'primary'
  },
  {
    name: 'Parent Dashboard',
    description: 'Parents can monitor progress and receive detailed performance reports.',
    icon: Users,
    color: 'accent'
  }
]

export function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Everything you need to succeed
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Our comprehensive platform provides all the tools and support you need to master the Cambridge curriculum.
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {features.map((feature) => {
              const IconComponent = feature.icon
              const colorClasses = feature.color === 'primary' 
                ? 'text-primary-600 bg-primary-100' 
                : 'text-accent-600 bg-accent-100'
              
              return (
                <div key={feature.name} className="relative group">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className={`inline-flex p-3 rounded-lg ${colorClasses} mb-4`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-8 sm:p-12">
            <h3 className="text-2xl font-bold text-white sm:text-3xl">
              Ready to start your Cambridge journey?
            </h3>
            <p className="mt-4 text-lg text-primary-100 max-w-2xl mx-auto">
              Join thousands of students who have successfully mastered their Cambridge curriculum with our platform.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                Start Free Trial
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
