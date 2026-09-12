<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />



# [kuru kuru] 🎯


## Basic Details
### Dashamulan damu: [Name]


### Team Members
- Team Lead: [Rithuraj P V] - [College of engneering trikaripur]
- Member 2: [Athul krishana A ] - [College of engneering trikaripur]

### Project Description
its just a website were you click a button and a character from a game honkai star rail spin around with a funny scream.and also it has a webcam mode which roasts you for just existing
### The Problem (that doesn't exist)
problem of self obsession

### The Solution (that nobody asked for)
this thing will roast you for too self obsessive ,and the other is just a simple satisfying sound.
## Technical Details
### Technologies/Components Used
For Software:
- Language: Vanilla JavaScript (ES6), HTML5, CSS3 — no TypeScript.

Framework: None. No build step, no bundler (no React/Vue/etc.) — plain static site.
- Libraries:

face-api.js (v0.22.2, via CDN) — TensorFlow.js-based face detection (TinyFaceDetector model)
mdui (v1.0.2, via CDN) — Material Design UI component/styling library

- Browser APIs used directly (no library needed):

getUserMedia — webcam access
Canvas API — drawing face bounding boxes
Audio / HTML5 audio playback
localStorage — persisting the click counter


### Project Documentation
For Software:

# Screenshots (Add at least 3)
[https://drive.google.com/drive/folders/1OVDLa27gHLUJOz8ypZWr2E7kA_cgOx_O?usp=drive_link]
# Diagrams
![## Architecture / Workflow

```mermaid
flowchart TD
    A[Load kuru kuru page] --> B[Click kuru button]
    A --> C[Click webcam button]

    B --> D["Play voice line<br/>(kuru2 weighted 3x)"]
    D --> E[Animate spinning GIF]

    C --> F["Detect face<br/>(face-api.js, ~3x/sec)"]
    F --> G["Play meme sound<br/>(random pick, every 3s)"]
```

*The app has two independent workflows triggered from the same page. Clicking the kuru button plays a weighted-random Japanese voice line — "kuru2" ("kuru kuru") is 3x more likely to play than "kuru1" ("kururin") or "kuruto" — and animates the spinning GIF across the screen. Clicking the webcam button opens the camera and runs face-api.js's TinyFaceDetector in a loop (~3 scans/second); as soon as a face is detected, a random meme sound plays from a pool of three clips, repeating every 3 seconds while the face stays in frame. All detection runs client-side in the browser — no video or image data ever leaves the user's machine.*]


### Project Demo
# Video
[https://drive.google.com/drive/folders/1OVDLa27gHLUJOz8ypZWr2E7kA_cgOx_O?usp=drive_link]

# Additional Demos
[Add any extra demo materials/links]

## Team Contributions
- [Athul krishna A]: [idea,ui]
- [Rithuraj P V]: [laptop,idea]

---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)



