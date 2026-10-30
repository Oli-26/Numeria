# Courses

A course is a story map of skills that sits beside the subjects rather than inside them. From Scratch is the first one. Every course is described in `wwwroot/data/courses.json` and drawn by one page, `Pages/CoursePage.razor` at `/course/{id}`. The Subjects page and the Today hub list every course in that file, and a topic that belongs to a course links back to its map.

## Adding a course with data only

1. **Pick a domain** for the course's topics, for example `"garden"`. Do not add it to `domains.json`: that is what keeps the topics out of the Subjects list and the home grid.
2. **Add the topics** to `topics.json` with `"domain": "garden"` and give each one a `lessons.json` folder in `wwwroot/data/<topicId>/`, the same as any other topic. A skill whose topic is not in `topics.json` yet shows as "Coming soon", so the map can go in before the lessons.
3. **Add an entry** to `courses.json`:

```json
{
  "id": "garden",
  "title": "The Garden",
  "kicker": "Special course",
  "blurb": "One line for the Subjects card.",
  "premise": "Two lines for the top of the course map.",
  "domain": "garden",
  "icon": "garden-soil",
  "accent": "#5B7F3A",
  "price": null,
  "source": "bundled",
  "meter": {
    "kicker": "Growing season",
    "label": "Week {n}",
    "ariaLabel": "{n} of {max} weeks grown",
    "fill": ["#5B7F3A", "#C9971E"],
    "lessonsPerSkill": 5,
    "moods": [
      { "below": 1, "text": "Bare earth." },
      { "below": 12, "text": "Shoots are up." },
      { "text": "A full harvest." }
    ]
  },
  "chapters": [
    {
      "number": 1, "title": "Spring", "span": "Weeks 0 to 12", "start": 0, "end": 12,
      "skills": [
        { "topicId": "garden-soil", "name": "Soil", "color": "#8A6A3B", "needs": [] },
        { "topicId": "garden-seeds", "name": "Seeds", "color": "#5B7F3A", "needs": ["garden-soil"] }
      ]
    }
  ]
}
```

Field notes:

- `icon` is a `TopicArt` key. Reusing one of the course's topic ids is the easy choice; until `Services/TopicArt.cs` has art for it, the fallback icon is drawn.
- `accent` colours the course's icon on the Subjects card and in the Today hub.
- `needs` lists topic ids in the same course. A skill opens once every skill it needs is finished (`TopicsCompleted`), and is shown as locked until then.
- The meter runs from 0 to the last chapter's `end`. Each chapter fills its `start` to `end` share as its lessons are done, and inner chapter ends are drawn as ticks on the bar. `{n}` and `{max}` in `label` and `ariaLabel` are the current value and the end. `lessonsPerSkill` is the lesson count assumed for a skill whose topic has not landed yet, so the meter does not jump when it does.
- `moods` are checked in order: the first one whose `below` is above the current value is shown. Leave `below` off the last one.
- Chapters should follow on from each other (each `start` is the previous `end`); `CourseTests` checks this, along with the domain, the prerequisites and that there are no prerequisite cycles.

Run `dotnet test MathVoyager.Tests` after editing `courses.json`.

## Paid courses (planned)

A course with `"price": { "sku": "...", "display": "£2.99" }` is paid. Until it is owned, `CoursePage` shows its chapters as a locked preview with a disabled "Coming soon" button. Ownership goes through `ICourseEntitlements`: free courses are always owned, and a paid one is owned once its id is in the profile's `CoursesOwned`. Nothing fills that list yet; there is no billing or network code.

The plan for paid content is `"source": "remote"`: the course entry ships in `courses.json` so the preview works offline, but its topics and lessons stay on a server. After a store purchase, the receipt is verified server side, the course id is added to `CoursesOwned`, and the lessons are downloaded and cached for the content repository to read. Courses with `"source": "bundled"` ship their lessons in `wwwroot/data` as today.
