import { Metadata } from 'next';
import { AcademicTutoringLanding } from '@/components/AcademicTutoringLanding';

export const metadata: Metadata = {
  title: 'Elementary Tutoring Services | Reading, Math & Science | ScoreMax',
  description: 'Personalized elementary tutoring in reading, math, science, homework support, and confidence building for young learners.',
  keywords: 'elementary tutoring, elementary reading tutor, elementary math tutoring, elementary science tutoring, homework support, reading comprehension',
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
    url: 'https://scoremax.com/elementary-tutoring',
    siteName: 'ScoreMax',
    title: 'Elementary Tutoring Services | Reading, Math & Science',
    description: 'Personalized elementary tutoring in reading, math, science, homework support, and confidence building.',
    images: [
      {
        url: '/logo.avif',
        width: 1200,
        height: 630,
        alt: 'Elementary Tutoring Services - ScoreMax',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elementary Tutoring Services',
    description: 'Personalized elementary tutoring in reading, math, science, and homework support.',
    images: ['/logo.avif'],
  },
  alternates: {
    canonical: 'https://scoremax.com/elementary-tutoring',
  },
};

export default function ElementaryTutoringPage() {
  return (
    <AcademicTutoringLanding
      eyebrow="Elementary"
      title="Expert Elementary Tutoring"
      intro="Elementary tutoring should feel supportive, clear, and confidence-building. ScoreMax helps young learners strengthen reading, math, and science fundamentals while developing a better relationship with schoolwork."
      servicesTitle="Foundational Support for Young Learners"
      servicesIntro="Tutoring that helps elementary students build the core skills they will use for years."
      services={[
        {
          title: 'Reading & Comprehension',
          description: 'Students get structured support with fluency, vocabulary, comprehension, and written responses. We help reading feel less frustrating and more manageable.',
          items: ['Reading fluency', 'Comprehension', 'Vocabulary', 'Written responses'],
        },
        {
          title: 'Math Confidence',
          description: 'Elementary math support focused on number sense, operations, problem solving, and class concepts. Students learn the steps and the reasoning behind them.',
          items: ['Number sense', 'Addition and subtraction', 'Multiplication and division', 'Word problems'],
        },
        {
          title: 'Science & Homework Help',
          description: 'Support for science concepts, assignments, project planning, and homework routines so students can stay on track without feeling overwhelmed.',
          items: ['Science basics', 'Homework routines', 'Project support', 'Study confidence'],
        },
      ]}
      whyTitle="Confidence First, Skills Always"
      whyIntro="Young students need clear instruction, patience, and a plan that meets them where they are."
      reasons={[
        {
          title: 'Age-Appropriate Pacing',
          description: 'Sessions move at a pace that keeps students engaged while still building real academic progress.',
        },
        {
          title: 'Positive Reinforcement',
          description: 'We help students see what they can do, then use that confidence to work through harder material.',
        },
        {
          title: 'Parent Clarity',
          description: 'Families get a clearer picture of what the student needs, what is improving, and what to focus on next.',
        },
      ]}
      ctaTitle="Ready to Help Your Student Grow?"
      ctaIntro="Book a free consultation and we will recommend the right tutoring path for your elementary student."
    />
  );
}
