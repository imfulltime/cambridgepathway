'use client'

import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: 'Maria Rodriguez',
    role: 'IGCSE Student',
    location: 'Spain',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b123?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    content: 'CambridgePathway made learning English so much easier! The interactive lessons and native language support helped me understand complex concepts. I improved my grades from C to A* in just 6 months.',
    rating: 5,
    subject: 'IGCSE English'
  },
  {
    id: 2,
    name: 'Ahmed Hassan',
    role: 'IGCSE Student',
    location: 'Egypt',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    content: 'The math courses are incredibly well-structured. The step-by-step explanations and practice problems helped me master algebra and geometry. The tutors are always available when I need help.',
    rating: 5,
    subject: 'IGCSE Mathematics'
  },
  {
    id: 3,
    name: 'Sophie Chen',
    role: 'Parent',
    location: 'Singapore',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    content: 'As a parent, I love the detailed progress reports and the ability to monitor my daughter\'s learning. The platform is user-friendly and the customer support is excellent.',
    rating: 5,
    subject: 'Parent Experience'
  },
  {
    id: 4,
    name: 'Carlos Mendoza',
    role: 'IGCSE Student',
    location: 'Mexico',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    content: 'The community forum is amazing! I can discuss problems with other students and get help from tutors. It feels like having a study group available 24/7.',
    rating: 5,
    subject: 'Community Support'
  },
  {
    id: 5,
    name: 'Fatima Al-Zahra',
    role: 'IGCSE Student',
    location: 'UAE',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    content: 'The mobile app is perfect for studying on the go. I can review lessons during my commute and practice quizzes anywhere. The offline mode is a game-changer!',
    rating: 5,
    subject: 'Mobile Learning'
  },
  {
    id: 6,
    name: 'David Kim',
    role: 'IGCSE Student',
    location: 'South Korea',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    content: 'The assessment system really helped me prepare for my exams. The mock tests are similar to the actual IGCSE format, and the instant feedback helped me identify weak areas.',
    rating: 5,
    subject: 'Assessment Preparation'
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-neutral-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            What our students say
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. See what students and parents around the world are saying about CambridgePathway.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-gray-300" />
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center space-x-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-primary-600">{testimonial.location}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {testimonial.subject}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">98%</div>
              <div className="text-sm text-gray-600 mt-1">Student Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">1,200+</div>
              <div className="text-sm text-gray-600 mt-1">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">50+</div>
              <div className="text-sm text-gray-600 mt-1">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">4.9/5</div>
              <div className="text-sm text-gray-600 mt-1">Average Rating</div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Join our growing community
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Start your Cambridge journey today and join thousands of successful students worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
              Get Started Free
            </button>
            <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
