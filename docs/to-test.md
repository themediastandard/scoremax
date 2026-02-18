# To Test

## Google Meet Auto Creation
- Connect a tutor's Google account via OAuth so they have a `google_refresh_token`
- Create a booking for an **online** session
- As admin, assign a tutor, set date/time, and change status from **Processing → Active**
- Verify a Google Meet link is created and stored on the booking
- Verify the Meet link appears in the Session card on the order detail page as a "Join Meeting" button
- Verify both tutor and student calendar events include the Meet link
- Verify the confirmation emails to student and tutor include the Meet link

## Google Calendar Reschedule
- On an active booking, change the date/time and click Save Changes
- Verify both tutor and student calendar events are updated with the new time
- Verify the Meet link remains the same after rescheduling
