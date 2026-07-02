import { Metadata } from 'next';
import { AcademicTutoringLanding } from '@/components/AcademicTutoringLanding';

export const metadata: Metadata = {
  title: 'Middle School Tutoring Services | Math, English & Science | ScoreMax',
  description: 'Expert middle school tutoring in math, English, science, organization, and study skills. Personalized support that builds confidence before high school.',
  keywords: 'middle school tutoring, middle school math tutoring, middle school English tutoring, middle school science tutoring, study skills tutoring, academic confidence',
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
    url: 'https://scoremax.com/middle-school-tutoring',
    siteName: 'ScoreMax',
    title: 'Middle School Tutoring Services | Math, English & Science',
    description: 'Expert middle school tutoring in math, English, science, organization, and study skills.',
    images: [
      {
        url: '/logo.avif',
        width: 1200,
        height: 630,
        alt: 'Middle School Tutoring Services - ScoreMax',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Middle School Tutoring Services',
    description: 'Expert middle school tutoring in math, English, science, and study skills.',
    images: ['/logo.avif'],
  },
  alternates: {
    canonical: 'https://scoremax.com/middle-school-tutoring',
  },
};

export default function MiddleSchoolTutoringPage() {
  return (
    <AcademicTutoringLanding
      eyebrow="Middle School"
      title="Expert Middle School Tutoring"
      intro="Middle school is where students either build momentum or start carrying gaps into high school. ScoreMax helps students strengthen core skills, improve organization, and gain confidence in math, English, and science."
      servicesTitle="Comprehensive Middle School Support"
      servicesIntro="Tutoring designed to help middle school students build stronger academic habits and subject foundations."
      services={[
        {
          title: 'Math Foundations',
          description: 'Targeted support for the skills students need before high school math becomes more demanding. We help students understand the why behind each process, not just memorize steps.',
          items: ['Pre-Algebra', 'Fractions, decimals, and ratios', 'Equations and word problems', 'Geometry foundations'],
        },
        {
          title: 'English & Reading',
          description: 'Focused help with reading comprehension, writing clarity, grammar, vocabulary, and class assignments. Students learn how to organize their thoughts and communicate more clearly.',
          items: ['Reading comprehension', 'Essay structure', 'Grammar and vocabulary', 'Homework support'],
        },
        {
          title: 'Science & Study Skills',
          description: 'Support for classroom science plus the habits that make students more independent: note-taking, planning, test preparation, and keeping track of assignments.',
          items: ['Life and physical science', 'Study routines', 'Organization systems', 'Test preparation'],
        },
      ]}
      whyTitle="Stronger Habits Before High School"
      whyIntro="We help middle school students become more confident, organized, and prepared for the next academic step."
      reasons={[
        {
          title: 'Patient Instruction',
          description: 'Tutors slow the work down, find the gap, and rebuild the concept in a way the student can actually use.',
        },
        {
          title: 'Better Organization',
          description: 'Students get help with planning assignments, preparing for tests, and building routines that reduce last-minute stress.',
        },
        {
          title: 'High School Readiness',
          description: 'The goal is not just getting through this week. We prepare students for the expectations coming next.',
        },
      ]}
      ctaTitle="Ready to Build Stronger Foundations?"
      ctaIntro="Start with a free consultation and we will match your student with the right tutor for their needs."
    />
  );
}
