# CambridgePathway 🎓

A comprehensive e-learning platform for Cambridge Curriculum (IGCSE) designed specifically for students in non-English-speaking countries. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## ✨ Features

### 🏠 **Homepage**
- **Hero Section**: Compelling introduction with platform statistics
- **Features Overview**: Comprehensive feature grid with 12 key features
- **Testimonials**: Real student and parent testimonials with ratings
- **Responsive Design**: Mobile-first design with beautiful animations

### 🔐 **Authentication System**
- **Multi-step Registration**: Role-based signup (Student/Parent) with preferences
- **Secure Login**: Email/password and OAuth (Google) authentication
- **Role-based Access**: Different dashboards for students, parents, and admins
- **Profile Management**: Complete user profile system

### 📊 **Student Dashboard**
- **Progress Tracking**: Visual progress bars and completion statistics
- **Study Streak**: Gamified learning with streak counters
- **Quick Actions**: Direct access to courses, assessments, and forum
- **Performance Analytics**: Average scores and time spent learning
- **Upcoming Assessments**: Calendar view of pending quizzes and exams

### 📚 **Course Management**
- **IGCSE Math & English**: Complete curriculum-aligned courses
- **Interactive Lessons**: Video content with downloadable worksheets
- **Progress Tracking**: Lesson-by-lesson completion tracking
- **Course Catalog**: Beautiful course cards with detailed information

### 💬 **Community Forum**
- **Threaded Discussions**: Organized by subject and topic
- **Voting System**: Upvote/downvote posts and replies
- **Tag System**: Categorized discussions with popular tags
- **Expert Support**: "Ask a Tutor" functionality
- **Markdown Support**: Rich text formatting for posts

### 🌍 **Multilingual Support**
- **Language Toggle**: Easy switching between English and native languages
- **Persistent Preferences**: Language choice saved in localStorage
- **Expandable**: Ready for additional language translations

### 📱 **Responsive Design**
- **Mobile-First**: Optimized for all device sizes
- **Modern UI**: Clean, accessible interface with smooth animations
- **Dark/Light Theme Ready**: Prepared for theme switching

## 🛠️ Technology Stack

### **Frontend**
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful, customizable icons
- **Framer Motion**: Smooth animations and transitions

### **Backend & Database**
- **Supabase**: Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Authentication & Authorization
  - File storage
- **Supabase Auth**: Complete authentication system
- **Database Schema**: Comprehensive relational design

### **Development Tools**
- **ESLint**: Code linting and formatting
- **TypeScript**: Static type checking
- **PostCSS**: CSS processing
- **Git**: Version control

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ and npm
- Supabase account
- Git

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cambridgePathway
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Run the SQL schema from `database-schema.sql` in your Supabase SQL Editor

4. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXTAUTH_SECRET=your_random_secret_string
   NEXTAUTH_URL=http://localhost:3000
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### **Database Setup**

The `database-schema.sql` file contains the complete database schema including:

- **User Management**: Users, students, parents with role-based access
- **Course Structure**: Courses, lessons, progress tracking
- **Assessment System**: Quizzes, questions, attempts, and scoring
- **Community Features**: Forum posts, replies, voting system
- **Security**: Row Level Security policies for data protection

Run this SQL in your Supabase SQL Editor to set up all tables, indexes, and security policies.

## 📁 Project Structure

```
cambridgePathway/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/              # Authentication pages
│   │   ├── courses/           # Course pages
│   │   ├── dashboard/         # User dashboard
│   │   ├── forum/             # Community forum
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable React components
│   │   ├── home/             # Homepage components
│   │   ├── navigation.tsx    # Main navigation
│   │   ├── footer.tsx        # Footer component
│   │   └── providers.tsx     # Context providers
│   ├── lib/                  # Utility libraries
│   │   └── supabase.ts       # Supabase client config
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts          # Main type definitions
│   └── utils/                # Utility functions
├── database-schema.sql       # Complete database schema
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
├── next.config.js           # Next.js configuration
└── package.json             # Dependencies and scripts
```

## 🎯 Key Features Implementation

### **User Roles & Permissions**
- **Students**: Access to courses, progress tracking, forum participation
- **Parents**: Monitor student progress, receive reports, manage subscriptions
- **Admins**: Content management, user administration, analytics

### **Progress Tracking**
- Lesson completion status
- Quiz scores and attempts
- Time spent learning
- Learning streaks
- Achievement badges

### **Assessment System**
- Multiple choice questions
- Short answer questions
- Essay questions (planned)
- Auto-scoring logic
- Detailed feedback
- Mock exam preparation

### **Community Features**
- Subject-specific discussions
- Question and answer format
- Expert tutor responses
- Peer-to-peer learning
- Content moderation tools

## 🔧 Configuration

### **Tailwind CSS Custom Colors**
- **Primary**: Blue shades (brand color)
- **Accent**: Orange/beige shades (secondary)
- **Neutral**: Gray shades (text and backgrounds)

### **Font Configuration**
- **Primary Font**: Inter (Google Fonts)
- **Fallbacks**: System fonts for performance

### **Authentication Flow**
1. User registers with role selection
2. Email verification (Supabase)
3. Profile completion
4. Dashboard access based on role

## 📊 Database Schema Highlights

### **Core Tables**
- `users`: User profiles with role-based access
- `courses`: Course catalog with metadata
- `lessons`: Individual lesson content
- `progress`: User learning progress tracking
- `quizzes`: Assessment structure
- `forum_posts`: Community discussions

### **Security Features**
- Row Level Security (RLS) enabled
- User-specific data access policies
- Secure authentication with Supabase Auth
- Protected API endpoints

## 🚧 Development Status

### ✅ **Completed Features**
- [x] Project setup and configuration
- [x] Homepage with hero, features, testimonials
- [x] Authentication system (login/signup)
- [x] User dashboard with progress tracking
- [x] Course catalog and basic course pages
- [x] Community forum structure
- [x] Responsive navigation and footer
- [x] Database schema design
- [x] Multilingual support framework

### 🔄 **In Progress**
- [ ] Supabase integration and testing
- [ ] Course content management
- [ ] Assessment system implementation
- [ ] Parent dashboard features

### 📋 **Planned Features**
- [ ] Video lesson player
- [ ] Real-time chat support
- [ ] Mobile app development
- [ ] Advanced analytics
- [ ] Payment integration
- [ ] Certificate generation
- [ ] Email notifications
- [ ] Advanced search functionality

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend Development**: React/Next.js, TypeScript, Tailwind CSS
- **Backend Development**: Supabase, PostgreSQL, API design
- **UI/UX Design**: Responsive design, accessibility, user experience
- **Content Strategy**: Cambridge curriculum alignment, educational best practices

## 📞 Support

For support, email support@cambridgepathway.com or join our community forum.

## 🙏 Acknowledgments

- Cambridge Assessment International Education for curriculum guidance
- Supabase team for excellent backend services
- Open source community for amazing tools and libraries
- Beta testers and early adopters for valuable feedback

---

**CambridgePathway** - Empowering global education through technology 🌍✨