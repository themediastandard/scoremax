import type { StaticImageData } from 'next/image';

import act from '../../public/Images/hero-act-tutoring.jpg';
import college from '../../public/Images/hero-college-tutoring.jpg';
import elementary from '../../public/Images/hero-elementary-tutoring.jpg';
import gmat from '../../public/Images/hero-gmat-tutoring.jpg';
import gre from '../../public/Images/hero-gre-tutoring.jpg';
import highSchool from '../../public/Images/hero-high-school-tutoring.jpg';
import lsat from '../../public/Images/hero-lsat-tutoring.jpg';
import middleSchool from '../../public/Images/hero-middle-school-tutoring.jpg';
import sat from '../../public/Images/hero-sat-tutoring.jpg';
import stepUp from '../../public/Images/hero-step-up.jpg';

/**
 * Every landing-page hero photograph, imported statically rather than referenced
 * by "/Images/…" string.
 *
 * The reason is the placeholder. A string src gives next/image nothing to paint
 * before the real file lands, so the hero showed its two dark scrims over an
 * empty box — a grey slab that sat there for over a second on a fresh
 * navigation. A static import makes the build inline a ~8px base64 preview into
 * the HTML, which paints on the first frame and cross-fades into the photo, so
 * the hero is never empty. Add new heroes here rather than passing a "/Images/…"
 * string — PageHero's `image` prop is typed StaticImageData precisely so that a
 * string cannot compile and quietly bring the grey flash back.
 *
 * The files stay in public/ because the homepage tiles still reference three of
 * them by URL. The build therefore emits a second hashed copy under
 * _next/static for these imports; that duplication is the whole cost.
 */
export const heroImages = {
  act,
  college,
  elementary,
  gmat,
  gre,
  highSchool,
  lsat,
  middleSchool,
  sat,
  stepUp,
} satisfies Record<string, StaticImageData>;
