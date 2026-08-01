import type { StaticImageData } from 'next/image';

import avi from '../../public/Images/avi-new.png';
import logoBlack from '../../public/Images/score-max-logo-black.png';
import logoWhite from '../../public/Images/score-max-logo-white.png';
import logoWide from '../../public/Images/score-max-logo-wide.png';
import stepUpLogo from '../../public/step-up.avif';
import student1 from '../../public/Images/student-1.jpg';
import student2 from '../../public/Images/student-2.jpg';
import tai from '../../public/Images/tai-new.png';

/**
 * Site imagery that is not a page hero — logos, staff portraits, the two
 * homepage student photos. The companion to hero-images.ts, and imported
 * statically for a second reason on top of that file's blur placeholder.
 *
 * A file in public/ is served with `Cache-Control: public, max-age=0,
 * must-revalidate`, and next/image inherits that onto the *optimised* output.
 * Every "/Images/…" image therefore revalidated over the network on every
 * navigation and never actually sat in the browser cache — measured against the
 * live Netlify deploy on 2026-08-01, where the statically imported hero on the
 * same page came back `max-age=31536000, immutable` and the tile beside it came
 * back `max-age=0`. Importing from _next/static is what earns the long TTL.
 *
 * The header logo is the one that mattered most: it is on every page.
 */
export const siteImages = {
  avi,
  logoBlack,
  logoWhite,
  logoWide,
  stepUpLogo,
  student1,
  student2,
  tai,
} satisfies Record<string, StaticImageData>;
