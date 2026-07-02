import { Metadata } from 'next';
import { AcademicTutoringLanding } from '@/components/AcademicTutoringLanding';

export const metadata: Metadata = {
  title: 'College Tutoring Services | Advanced Math & Science | ScoreMax',
  description: 'Expert college tutoring services for advanced mathematics, science, and academic subjects. Personalized learning plans for college students with flexible scheduling.',
  keywords: 'college tutoring, college math tutoring, college science tutoring, advanced math, calculus tutoring, college academic support, university tutoring',
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
    url: 'https://scoremax.com/college-tutoring',
    siteName: 'ScoreMax',
    title: 'College Tutoring Services | Advanced Math & Science',
    description: 'Expert college tutoring services for advanced mathematics, science, and academic subjects. Personalized learning plans for college students.',
    images: [
      {
        url: '/logo.avif',
        width: 1200,
        height: 630,
        alt: 'College Tutoring Services - ScoreMax',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'College Tutoring Services',
    description: 'Expert college tutoring for advanced math, science, and academic subjects.',
    images: ['/logo.avif'],
  },
  alternates: {
    canonical: 'https://scoremax.com/college-tutoring',
  },
};

export default function CollegeTutoringPage() {
  return (
    <AcademicTutoringLanding
      eyebrow="College"
      title="Expert College Tutoring"
      intro="We provide specialized college tutoring to help students master advanced subjects and achieve academic excellence. Whether it is complex mathematics, science, or challenging coursework, our expert tutors guide students with clear, personalized support."
      servicesTitle="Comprehensive College Support"
      servicesIntro="Tutoring services designed to help college students excel in advanced coursework."
      services={[
        {
          title: 'Algebra & Calculus',
          description: 'Comprehensive support in advanced mathematics, from College Algebra and Pre-Calculus through Calculus I, II, and III, Differential Equations, Linear Algebra, and Statistics.',
        },
        {
          title: 'Physics & Chemistry',
          description: 'Experienced tutors break down complex college-level science principles into understandable concepts and help students apply theory to practical problems.',
        },
        {
          title: 'Personalized Learning',
          description: "Every college student has different academic goals. Sessions are tailored to the student's course, professor, strengths, gaps, and learning style.",
        },
      ]}
      whyTitle="Expertise, Flexibility & Results"
      whyIntro="We provide the subject expertise, flexible scheduling, and personalized attention that college students need to succeed."
      reasons={[
        {
          title: 'Expert Tutors',
          description: 'Our tutors bring advanced subject knowledge and a track record of helping college students work through demanding coursework.',
        },
        {
          title: 'Flexible Schedule',
          description: 'Sessions are built around classes, exams, labs, work, and other college commitments.',
        },
        {
          title: 'Success-Driven',
          description: 'The goal is deeper understanding, better performance, and stronger academic confidence.',
        },
      ]}
      ctaTitle="Ready to Excel in College?"
      ctaIntro="Start with a free consultation and we will match you with the right tutor for your course and schedule."
    />
  );
}
