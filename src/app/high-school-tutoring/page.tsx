import { Metadata } from 'next';
import { AcademicTutoringLanding } from '@/components/AcademicTutoringLanding';

export const metadata: Metadata = {
  title: 'High School Tutoring Services | Math, Science & Test Prep | ScoreMax',
  description: 'Expert high school tutoring services in mathematics, science, and test preparation. Personalized learning plans, flexible scheduling, and proven academic success.',
  keywords: 'high school tutoring, math tutoring, science tutoring, high school math, high school science, academic tutoring, grade improvement',
  authors: [{ name: 'ScoreMax Tutoring' }],
  creator: 'ScoreMax Tutoring',
  publisher: 'ScoreMax Tutoring',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.scoremaxtutoring.com/high-school-tutoring',
    siteName: 'ScoreMax',
    title: 'High School Tutoring Services | Math, Science & Test Prep',
    description: 'Expert high school tutoring services in mathematics, science, and test preparation. Personalized learning plans and proven academic success.',
    images: [
      {
        url: '/logo.avif',
        width: 1200,
        height: 630,
        alt: 'High School Tutoring Services - ScoreMax',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'High School Tutoring Services',
    description: 'Expert high school tutoring in math, science, and test preparation.',
    images: ['/logo.avif'],
  },
  alternates: {
    canonical: 'https://www.scoremaxtutoring.com/high-school-tutoring',
  },
};

export default function HighSchoolTutoringPage() {
  return (
    <AcademicTutoringLanding
      eyebrow="High School"
      title="Expert High School Tutoring"
      intro="We help high school students master challenging subjects, improve grades, and build academic confidence. Whether it is math, science, or test prep, our tutors guide students through the material step by step."
      servicesTitle="Comprehensive High School Support"
      servicesIntro="Tutoring services designed to help high school students excel in their academic journey."
      services={[
        {
          title: 'Mathematics',
          description: 'Support for core and advanced math classes with an emphasis on understanding and problem solving.',
          items: ['Algebra I & II', 'Geometry', 'Pre-Calculus & Calculus', 'Statistics'],
        },
        {
          title: 'Science',
          description: 'Focused science tutoring that helps students understand complex principles and prepare for exams.',
          items: ['Chemistry', 'Physics', 'Biology', 'Environmental Science'],
        },
        {
          title: 'Personalized Learning',
          description: "A tailored approach built around each student's class, strengths, weaknesses, learning style, and goals.",
        },
      ]}
      whyTitle="Expertise, Flexibility & Results"
      whyIntro="We provide the expertise, flexibility, and personalized attention that high school students need to succeed."
      reasons={[
        {
          title: 'Expert Tutors',
          description: 'Our skilled tutors have deep subject knowledge and a proven track record of student success.',
        },
        {
          title: 'Flexible Schedule',
          description: 'We offer convenient scheduling that works around school, sports, activities, and family commitments.',
        },
        {
          title: 'Success-Driven',
          description: 'Our mission is to help students understand the material, improve performance, and move toward their goals.',
        },
      ]}
      ctaTitle="Ready to Excel in High School?"
      ctaIntro="Start with a free consultation and we will match your student with the right tutor."
    />
  );
}
