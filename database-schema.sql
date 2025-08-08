-- CambridgePathway Database Schema
-- This file contains the complete database schema for the e-learning platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('student', 'parent', 'admin');
CREATE TYPE subject_type AS ENUM ('math', 'english');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'short_answer', 'essay');

-- Users table (integrates with Supabase Auth)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table (additional info for students)
CREATE TABLE students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    grade_level VARCHAR(50) NOT NULL,
    subjects TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parents table (links parents to students)
CREATE TABLE parent_students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(parent_id, student_id)
);

-- Courses table
CREATE TABLE courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    subject subject_type NOT NULL,
    level VARCHAR(50) NOT NULL,
    image_url TEXT,
    total_lessons INTEGER DEFAULT 0,
    duration VARCHAR(50),
    instructor_name VARCHAR(255),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons table
CREATE TABLE lessons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    video_url TEXT,
    worksheet_url TEXT,
    order_index INTEGER NOT NULL,
    duration_minutes INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress tracking
CREATE TABLE progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    time_spent_minutes INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Quizzes table
CREATE TABLE quizzes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    time_limit_minutes INTEGER,
    passing_score INTEGER DEFAULT 70,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    type question_type NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB, -- For multiple choice options
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz attempts
CREATE TABLE quiz_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz answers
CREATE TABLE quiz_answers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum posts
CREATE TABLE forum_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    is_resolved BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum replies
CREATE TABLE forum_replies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    is_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum votes (for posts and replies)
CREATE TABLE forum_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT vote_target CHECK (
        (post_id IS NOT NULL AND reply_id IS NULL) OR 
        (post_id IS NULL AND reply_id IS NOT NULL)
    ),
    UNIQUE(user_id, post_id),
    UNIQUE(user_id, reply_id)
);

-- User enrollments
CREATE TABLE enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, course_id)
);

-- Notifications
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_parent_id ON students(parent_id);
CREATE INDEX idx_progress_user_id ON progress(user_id);
CREATE INDEX idx_progress_course_id ON progress(course_id);
CREATE INDEX idx_progress_lesson_id ON progress(lesson_id);
CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_lessons_order ON lessons(course_id, order_index);
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX idx_forum_posts_course_id ON forum_posts(course_id);
CREATE INDEX idx_forum_replies_post_id ON forum_replies(post_id);
CREATE INDEX idx_forum_votes_user_id ON forum_votes(user_id);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON forum_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
-- Users can insert own profile after sign up
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Students can only see their own data
CREATE POLICY "Students can view own data" ON students FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can update own data" ON students FOR UPDATE USING (auth.uid() = user_id);
-- Students can insert their own student record
CREATE POLICY "Students can insert own data" ON students FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Progress is private to the user
CREATE POLICY "Users can view own progress" ON progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON progress FOR UPDATE USING (auth.uid() = user_id);

-- Quiz attempts are private to the user
CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz attempts" ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quiz attempts" ON quiz_attempts FOR UPDATE USING (auth.uid() = user_id);

-- Forum posts are public for viewing
CREATE POLICY "Anyone can view forum posts" ON forum_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON forum_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own posts" ON forum_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON forum_posts FOR DELETE USING (auth.uid() = user_id);

-- Replies policies
CREATE POLICY "Anyone can view replies" ON forum_replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create replies" ON forum_replies FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own replies" ON forum_replies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own replies" ON forum_replies FOR DELETE USING (auth.uid() = user_id);

-- Votes policies
CREATE POLICY "Anyone can view votes" ON forum_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create votes" ON forum_votes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own votes" ON forum_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON forum_votes FOR DELETE USING (auth.uid() = user_id);

-- Quiz answers visibility per user via attempt
CREATE POLICY "Users view own quiz answers" ON quiz_answers FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM quiz_attempts qa WHERE qa.id = attempt_id AND qa.user_id = auth.uid()
  )
);
CREATE POLICY "Users insert quiz answers" ON quiz_answers FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM quiz_attempts qa WHERE qa.id = attempt_id AND qa.user_id = auth.uid()
  )
);

-- Insert sample data
INSERT INTO courses (title, description, subject, level, total_lessons, duration, instructor_name, is_published) VALUES
('IGCSE Mathematics', 'Complete mathematics course covering algebra, geometry, statistics, and calculus', 'math', 'IGCSE', 24, '10 weeks', 'Dr. Sarah Johnson', true),
('IGCSE English Literature', 'Comprehensive literature course with text analysis and critical thinking', 'english', 'IGCSE', 28, '12 weeks', 'Prof. Michael Brown', true);

-- Insert sample lessons for Mathematics
INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, is_published) 
SELECT 
    c.id,
    'Lesson ' || generate_series(1, 24),
    'Description for lesson ' || generate_series(1, 24),
    generate_series(1, 24),
    45,
    true
FROM courses c WHERE c.title = 'IGCSE Mathematics';

-- Insert sample lessons for English Literature  
INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, is_published)
SELECT 
    c.id,
    'Lesson ' || generate_series(1, 28),
    'Description for lesson ' || generate_series(1, 28),
    generate_series(1, 28),
    50,
    true
FROM courses c WHERE c.title = 'IGCSE English Literature';

-- Seed sample quizzes and questions for first 2 lessons of each course
INSERT INTO quizzes (lesson_id, title, description, time_limit_minutes, passing_score, is_published)
SELECT l.id, 'Quick Check', 'Short quiz for the lesson', 10, 70, true
FROM lessons l
JOIN courses c ON c.id = l.course_id
WHERE (c.title = 'IGCSE Mathematics' AND l.order_index IN (1,2))
   OR (c.title = 'IGCSE English Literature' AND l.order_index IN (1,2));

-- For each quiz, add 3 MCQs and 1 short answer
WITH qz AS (
  SELECT q.id AS quiz_id FROM quizzes q
  JOIN lessons l ON l.id = q.lesson_id
  JOIN courses c ON c.id = l.course_id
  WHERE (c.title = 'IGCSE Mathematics' AND l.order_index IN (1,2))
     OR (c.title = 'IGCSE English Literature' AND l.order_index IN (1,2))
)
INSERT INTO questions (quiz_id, type, question_text, options, correct_answer, points, order_index)
SELECT quiz_id, 'multiple_choice', 'Sample MCQ ' || gs::text, '["A","B","C","D"]'::jsonb, 'A', 1, gs
FROM qz, generate_series(1,3) AS gs
UNION ALL
SELECT quiz_id, 'short_answer', 'Short answer: type A', NULL, 'A', 2, 4 FROM qz;

-- -----------------------------------------------------------------------------
-- Seed: Real English Literature Lesson 1 content and quiz (idempotent)
-- -----------------------------------------------------------------------------
DO $$
DECLARE 
  v_course_id uuid;
  v_lesson_id uuid;
  v_quiz_id uuid;
BEGIN
  -- Find English Literature course
  SELECT id INTO v_course_id 
  FROM courses 
  WHERE title = 'IGCSE English Literature'
  LIMIT 1;

  IF v_course_id IS NULL THEN
    RAISE NOTICE 'Course "IGCSE English Literature" not found. Skipping.';
    RETURN;
  END IF;

  -- Update Lesson 1 with real content (or create if missing)
  UPDATE lessons
  SET 
    title = 'Unseen Poetry: Analysing Imagery, Tone, and Structure',
    description = 'Learn how to analyse unseen poems by focusing on imagery, tone and structure. Assessment focus: AO1 (understanding), AO2 (analysis of language and structure).',
    content = $$

Learning Objectives
- Identify imagery, tone, and structural choices in unseen poems (AO2)
- Explain how writers create meaning and effect (AO1/AO2)
- Construct short analytical responses using evidence (PEE/PEEL)

Key Terms
- Imagery: descriptive language that appeals to the senses
- Tone: the writer’s attitude/feeling (e.g. reflective, joyful, sombre)
- Structure: how ideas are organised (stanzas, line length, caesura, enjambment)

Strategy (PEEL)
- Point: a clear claim about meaning or effect
- Evidence: a concise quotation
- Explain: how language/structure creates that effect
- Link: connect back to the question

Unseen Poem (for practice)
"Morning"

Grey morning spills across the slate-grey street;
The kettle hums, a small domestic sun.
Between the window’s breath and radiator’s heat,
I warm my hands and think of what I’ve done.

Model Analysis (Short)
The poet establishes a reflective tone through quiet domestic images. The metaphor “kettle hums, a small domestic sun” suggests comfort and warmth, while “window’s breath” personifies the room, adding intimacy. Structurally, short lines and end-stopped punctuation slow the pace, mirroring the speaker’s thoughtful mood.

Success Criteria
- Use precise subject terms (metaphor, personification, tone)
- Embed brief quotations
- Explain how language choices shape meaning
- Refer to structure when relevant

Practice Tasks
1) Identify two pieces of imagery and explain their effects.
2) What is the tone? Use one quotation to support your view.
3) How do structure and punctuation contribute to the overall mood?
$$,
    video_url = 'https://www.youtube.com/embed/dQw4w9WgXcQ', -- replace with your lesson video
    worksheet_url = 'https://example.com/worksheets/unseen-poetry.pdf', -- replace with your PDF
    is_published = true,
    updated_at = NOW()
  WHERE course_id = v_course_id AND order_index = 1
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NULL THEN
    INSERT INTO lessons (
      course_id, title, description, content, video_url, worksheet_url, order_index, duration_minutes, is_published
    ) VALUES (
      v_course_id,
      'Unseen Poetry: Analysing Imagery, Tone, and Structure',
      'Learn how to analyse unseen poems by focusing on imagery, tone and structure. Assessment focus: AO1 (understanding), AO2 (analysis of language and structure).',
      $$See content above (learning objectives, key terms, PEEL strategy, poem, model analysis, success criteria, practice tasks).$$,
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
      'https://example.com/worksheets/unseen-poetry.pdf',
      1,
      45,
      true
    )
    RETURNING id INTO v_lesson_id;
  END IF;

  -- Ensure a quiz exists for this lesson
  SELECT id INTO v_quiz_id FROM quizzes WHERE lesson_id = v_lesson_id LIMIT 1;

  IF v_quiz_id IS NULL THEN
    INSERT INTO quizzes (lesson_id, title, description, time_limit_minutes, passing_score, is_published)
    VALUES (v_lesson_id, 'Unseen Poetry Quick Check', 'Check your understanding of imagery, tone, and structure', 10, 70, true)
    RETURNING id INTO v_quiz_id;
  ELSE
    UPDATE quizzes
    SET title = 'Unseen Poetry Quick Check',
        description = 'Check your understanding of imagery, tone, and structure',
        time_limit_minutes = 10,
        passing_score = 70,
        is_published = true,
        updated_at = NOW()
    WHERE id = v_quiz_id;
  END IF;

  -- Replace questions with a real set
  DELETE FROM questions WHERE quiz_id = v_quiz_id;

  -- Q1: Mood
  INSERT INTO questions (quiz_id, type, question_text, options, correct_answer, points, order_index)
  VALUES (
    v_quiz_id,
    'multiple_choice'::question_type,
    'Which best describes the overall mood of the poem?',
    '["Reflective","Joyful","Fearful","Angry"]'::jsonb,
    'Reflective',
    1,
    1
  );

  -- Q2: Device (metaphor)
  INSERT INTO questions (quiz_id, type, question_text, options, correct_answer, points, order_index)
  VALUES (
    v_quiz_id,
    'multiple_choice'::question_type,
    'In the phrase "the kettle hums, a small domestic sun", which device is used?',
    '["Simile","Metaphor","Alliteration","Personification"]'::jsonb,
    'Metaphor',
    1,
    2
  );

  -- Q3: Device (personification)
  INSERT INTO questions (quiz_id, type, question_text, options, correct_answer, points, order_index)
  VALUES (
    v_quiz_id,
    'multiple_choice'::question_type,
    '“window’s breath” is an example of:',
    '["Hyperbole","Oxymoron","Personification","Onomatopoeia"]'::jsonb,
    'Personification',
    1,
    3
  );

  -- Q4: Short answer on structure
  INSERT INTO questions (quiz_id, type, question_text, options, correct_answer, points, order_index)
  VALUES (
    v_quiz_id,
    'short_answer'::question_type,
    'Briefly explain how the poem’s structure or punctuation contributes to its mood.',
    NULL,
    'Accept answers that reference short lines/end-stopped punctuation slowing pace to create reflective tone.',
    2,
    4
  );
END $$;

-- -----------------------------------------------------------------------------
-- Teacher/Admin Dashboard Backend Schema Updates (idempotent)
-- Run this after adding 'teacher' to user_role enum
-- -----------------------------------------------------------------------------

-- Teachers table for additional teacher-specific data
CREATE TABLE IF NOT EXISTS teachers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    department VARCHAR(100),
    specialization TEXT[],
    bio TEXT,
    years_experience INTEGER DEFAULT 0,
    certifications TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course instructors (many-to-many relationship)
CREATE TABLE IF NOT EXISTS course_instructors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'instructor',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, teacher_id)
);

-- Class sessions for scheduling
CREATE TABLE IF NOT EXISTS class_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    session_type VARCHAR(50) DEFAULT 'lecture',
    meeting_url TEXT,
    max_students INTEGER,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    max_score INTEGER DEFAULT 100,
    assignment_type VARCHAR(50) DEFAULT 'homework',
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignment submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    submission_text TEXT,
    file_urls TEXT[],
    score INTEGER,
    feedback TEXT,
    graded_by UUID REFERENCES teachers(id),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    graded_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'submitted',
    UNIQUE(assignment_id, student_id)
);

-- Gradebook for comprehensive grade tracking
CREATE TABLE IF NOT EXISTS gradebook (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL,
    item_id UUID,
    item_name VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    weight DECIMAL(3,2) DEFAULT 1.0,
    graded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal',
    target_audience VARCHAR(50) DEFAULT 'students',
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System logs for admin dashboard
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_course_instructors_course_id ON course_instructors(course_id);
CREATE INDEX IF NOT EXISTS idx_course_instructors_teacher_id ON course_instructors(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_course_id ON class_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_teacher_id ON class_sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_gradebook_student_id ON gradebook(student_id);
CREATE INDEX IF NOT EXISTS idx_announcements_course_id ON announcements(course_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
