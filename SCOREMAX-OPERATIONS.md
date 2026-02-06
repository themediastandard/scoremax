# ScoreMax Tutoring — Operations & Business Reference

This document captures all client-provided information about how ScoreMax operates, including pricing, team, services, workflows, and technical decisions for the booking system build.

---

## Team / Tutors

| Name     | Specialties                        |
|----------|------------------------------------|
| Srijan   | Math, Physics                      |
| Logan    | Chemistry, SAT                     |
| Deva     | Chemistry, Algebra                 |
| Adrian   | Chemistry, Algebra                 |
| Hemaanya | Basic High School Math, English    |
| Avi      | SAT, ACT, LSAT (Founder/Lead)     |

---

## Subjects Offered

### Test Prep
- SAT
- ACT
- LSAT
- PSAT
- GMAT
- GRE
- AP Calculus
- AP Physics
- AP Statistics
- AP Chemistry

### High School
- Algebra I
- Algebra II
- Geometry
- Pre-Calculus
- Calculus
- Statistics
- Chemistry
- Physics
- Competition Mathematics
- English

### College
- Beginning Algebra
- Intermediate Algebra
- College Algebra
- Pre-Calculus
- Statistics
- Calculus I, II, III
- Linear Algebra
- Physics
- Chemistry

### Elementary
- Reading
- Math
- Science

---

## Pricing Structure (4 Pillars)

### Pillar A: 1:1 Tutoring (Non-Member / Pay-As-You-Go)

| Service Level                                      | Per Hour |
|----------------------------------------------------|----------|
| SAT/ACT Session (includes materials)               | $250     |
| AP Mathematics & Science                           | $200     |
| Middle & High School Math/Science (Non-AP)          | $175     |
| Elementary                                         | $150     |
| General non-member rate (simplified for booking)    | $125–$150|

### Pillar B: Monthly Memberships (Recommended)

| Tier    | Price/Month | Included Hours | Perks                                                        |
|---------|-------------|----------------|--------------------------------------------------------------|
| Starter | $299        | 2 hours        | $10 off additional hours                                     |
| Core    | $549        | 4 hours        | Priority scheduling, access to Avi's video library           |
| Premier | $899        | 8 hours        | Priority + weekend access, monthly expert chat, SAT diagnostics |

All memberships are month-to-month. Members get one rollover session per month. Members are prioritized during exam weeks.

### Pillar C: Prepaid Packages

| Package   | Price  | Per Hour |
|-----------|--------|----------|
| 10 hours  | $1,200 | $120     |
| 20 hours  | $2,300 | $115     |

Best for short-term goals or families who want to prepay without a subscription.

### Pillar D: In-Person SAT Course

- 8-week program
- 2 sessions/week, 2 hours each (32 total contact hours)
- Includes diagnostics + practice tests
- Price: $1,200–$1,500
- Bonus: 2 hours of 1:1 tutoring included

### Legacy Price List (2024 Reference)

| Service                                     | Single Session | 10 Sessions | 20 Sessions | 40 Sessions |
|---------------------------------------------|----------------|-------------|-------------|-------------|
| SAT Course (10 sessions, includes materials)| $250/session   | $2,500 total| —           | —           |
| ACT Course (11 sessions, includes materials)| $250/session   | $2,750 total| —           | —           |
| SAT/ACT Full Integrated Course (12 sessions)| —              | —           | —           | $3,000      |
| AP Math & Science                           | $200/hr        | $1,850      | $3,400      | $6,000      |
| Middle/High School Math & Science (Non-AP)  | $175/hr        | $1,600      | $2,900      | $4,800      |
| Elementary                                  | $150/hr        | —           | $2,500      | $3,960      |

---

## Membership / Subscription Incentives

- Exclusive Video Library: Avi explains SAT strategies and core topics
- AI Chat Support: Homework questions, scheduling, FAQs (24-hour availability)
- Chat with an Expert: Monthly live Q&A session
- Progress Tracking & Reports
- Priority booking + rollover hours (limited)
- Member-only hourly discounts
- Discounted pricing for SAT & ACT sessions (value $250/session at standard rate)
- Live tutor within 24 hours of requesting

---

## Sales Approach (From Client)

### Default Positioning

- Always recommend membership first, then let the client downgrade
- Momentum (Premier) should be mentioned before Foundations (Starter)
- Speak slowly when stating price; silence is an ally
- Frame membership as structure + priority, not a discount
- Reframe away from hourly sessions early in the conversation

### Key Talking Points

- "Booking sessions one at a time leads to gaps — missed weeks, scrambling before tests, and slower progress. Students do best with consistency."
- "Monthly academic memberships guarantee a weekly time slot, lock in your rate, and give your child consistent support."
- "It's month-to-month, and you get one rollover session per month if something comes up."
- "Our goal is long-term progress, not just getting through the next assignment."

### Objection Handling

- "I understand — it's an investment. Individual sessions are $125–$150 each, and the membership ensures consistent progress instead of paying more for less consistency."
- For existing hourly clients: "Since you've already been working with us, I can honor your current rate for the first month if you transition to a membership this week."

### Session Recommendations by Level

- Elementary: 1x/week for steady support, 2x/week if closing gaps
- Middle / High School: 2x/week recommended for biggest improvement
- College: At least 2x/week, especially math and science (fast pacing)

---

## Client Workflow (How Customers Should Interact)

### Primary Flow (Website Booking)

1. Parent/student lands on website
2. Can call, email, or chat for more information
3. Selects subject(s) they need help with (multi-select)
4. Picks an available date/time slot
5. Chooses session type (online or in-person)
6. Enters contact information
7. Sees pricing options (single session, membership, package, SAT course)
8. Pays online via Stripe
9. Receives confirmation email + calendar invite
10. ScoreMax team assigns a tutor and notifies the customer
11. After session: prompted to leave a review, book another session, and shown membership upsell (if not a member)

### Important: Tutor Assignment

- Customers do NOT choose their tutor
- Customers select which subject(s) they need help with
- ScoreMax team assigns the appropriate tutor on their end
- Customer is notified of their assigned tutor before the session

### Secondary Flow (Social Media / Referral)

1. Parent sees IG/LinkedIn content
2. Clicks booking link
3. Intake form completed
4. Payment link sent
5. First session scheduled
6. Follow-up + upsell to membership

### In-Person SAT Course Flow

1. Inquiry via phone/chat
2. Diagnostic scheduled
3. Results reviewed
4. Enroll in SAT course
5. Add optional membership
6. Weekly progress updates

---

## Technical Decisions

| Decision              | Choice                                                    |
|-----------------------|-----------------------------------------------------------|
| Payment processor     | Stripe (test mode for development, live for production)   |
| Database              | Supabase (project: fceekjlispfjduetumrf)                  |
| Email service         | Resend                                                    |
| Booking UX            | Dedicated `/book` page (not a modal)                      |
| Component library     | shadcn/ui + Lucide icons                                  |
| In-person in MVP?     | Yes                                                       |
| Packages in MVP?      | Yes                                                       |
| Tutor selection        | Customer does NOT pick a tutor; ScoreMax assigns internally|
| Calendar integration  | ICS file in confirmation email (no Google/Outlook sync for MVP) |
| Session duration      | 1 hour (standard)                                         |

---

## Admin Panel (In MVP)

- Protected admin area at `/admin` with Supabase Auth (role-based: admin/staff)
- **Orders tab**: view all booking requests, expand to see full details, assign tutor + date/time, change status to "active" to trigger confirmation emails + Google Calendar event
- **Tutors tab**: add/edit/remove tutors, manage subject assignments, connect Google Calendar via OAuth
- Google Calendar integration: when a booking is confirmed, an event is created directly on the assigned tutor's Google Calendar

## Future Features (Not in MVP)

- AI chat support (homework questions, scheduling, FAQs)
- Video library gating (membership perk, content delivery separate)
- Customer-facing authentication / login portal
- Outlook calendar sync
- Progress tracking & reports
- Automated review collection
- Automated tutor assignment

---

## Contact Information

- Phone: (954) 214-8880 | (954) 224-1511
- Email: info@scoremaxtutoring.com
- Website: https://scoremax.com

---

## Content Ideas (Free Social Media Content)

These are the most common questions from students/parents, to be answered by Avi for IG Reels, YouTube Shorts, and LinkedIn posts:

1. How many tutoring hours does my child actually need?
2. Is the SAT still important for college admissions?
3. What score improvement is realistic in 8 weeks?
4. 1:1 tutoring vs SAT courses — which is better?
5. When should students start SAT prep?
6. How do I know if my child's tutor is effective?
7. What's the difference between test prep and tutoring?
8. Can tutoring help with confidence and test anxiety?
