# Privacy Policy for Nous

**Effective date:** 2026-04-27
**Last updated:** 2026-10-30

This Privacy Policy describes how the Nous mobile application ("Nous",
"the app", "we", "us") handles information when you use it.

## Summary

Nous is an offline-first educational app. Almost everything, including your
progress, settings, and gameplay data, stays on your device. Two things
leave it:

- **Anonymous usage counts:** how many times each subject, topic, lesson and
  course was opened or finished, so we know which content to improve. They
  carry no ID, account or anything else about you, and you can turn them off
  in Settings.
- **The optional leaderboard:** if you choose to submit a score, your display
  name and XP are sent to our database so they can be shown to other players.

The app does not contain advertising or third-party analytics or tracking
SDKs.

## Information We Collect

Nous does not collect personally identifiable information, contact details,
location data, contacts, photos, microphone audio, camera images, or device
identifiers.

All progress, settings, and gameplay data (such as currency, unlocked
content, and preferences) are stored **locally on your device** using the
browser/WebView local storage provided by the operating system and never
leave it, with one exception:

- **Anonymous usage counts (on by default; turn off in Settings under
  "Share Anonymous Usage Counts"):** the app keeps a tally on your device
  of which subjects, topics and courses you open and which lessons you
  finish, for example "Fire opened 3 times". Once a day, after the day has
  ended, it sends that tally and nothing else to our server, then deletes
  it from your device. The tally contains no user ID, device ID, advertising
  ID, account, name, answers, scores or location. Our server adds the
  numbers to running totals per day and does not record your IP address or
  any other detail of the request. Because the totals are not linked to
  anyone, they cannot be traced back to you, or deleted per person. Turning
  the setting off stops counting immediately and deletes any tally that has
  not been sent.
- **Leaderboard (optional):** if you enter a display name and submit your
  score from the Leaderboard screen, that display name and your current XP
  total are sent to our Firebase Realtime Database so they can be shown on
  the shared leaderboard. This only happens when you tap Submit; nothing is
  sent automatically. You can use the rest of the app without ever
  submitting a score.

## Permissions

Nous requests only the permissions needed to function:

- **Local Notifications**: used to schedule reminders on your device. No
  notification content is sent to or through any server.
- **Internet / Network state** (Android default for WebView apps): used
  to send the anonymous usage counts and optional leaderboard scores
  described above. The app performs no other network requests for
  tracking, analytics, or data collection.

## Children's Privacy

Nous is suitable for general audiences, including children. The leaderboard
is optional and off by default; a display name is not personally
identifiable on its own, and we ask that users not submit their real name.
The app complies with the spirit of the Children's Online Privacy Protection
Act (COPPA) and the Google Play Families policy by collecting no personal
data beyond this optional, user-initiated display name and score. The
anonymous usage counts contain no personal data.

## Third-Party Services

Nous does not integrate with third-party advertising networks, analytics
providers, or social networks. It talks to two outside services:

- **Cloudflare** (Workers and D1), which runs our small server that adds up
  the anonymous usage counts. Like any web host, Cloudflare handles the
  connection itself; our server keeps only the totals.
- **Google Firebase** (Realtime Database), used solely to store and display
  leaderboard entries as described above.

## Data Retention and Deletion

Locally stored progress and settings are never transmitted to us; to delete
them, uninstall the app or clear its storage in your device's system
settings. If you submitted a leaderboard score, your display name and XP are
retained in the Firebase database until you contact us to have them removed.
Anonymous usage totals are kept per day as aggregate numbers only.

## Security

Apart from the anonymous usage counts and optional leaderboard submissions,
all app data stays on your device, protected by the operating system's
standard application sandboxing.

## Changes to This Policy

If this policy changes, the updated version will be published at the same
URL with a new "Last updated" date. Material changes will be reflected in
an app update.

## Contact

For questions about this Privacy Policy, contact:

**Email:** flirpgames@gmail.com
