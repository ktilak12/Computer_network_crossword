# 🧩 NetCrossword Live

> A real-time multiplayer Computer Networks crossword game designed for
> classroom learning, competitions, and interactive demonstrations.

## 📌 Overview

NetCrossword Live is an interactive web-based multiplayer crossword game
based on Computer Networks concepts.

Instead of giving students a traditional printed crossword, the system
allows an entire classroom to participate in the same crossword game
using their own smartphones, tablets, or laptops.

A teacher creates a game session and receives a unique room code and QR
code.

Students scan the QR code or enter the room code to join the game.

The teacher can then start the game and monitor the classroom in real time.

The system supports up to 60 students in a single classroom session.

---

## 🎯 Problem

Traditional classroom activities such as crossword puzzles are usually
paper-based and do not provide:

- Real-time participation
- Live competition
- Automatic scoring
- Instant feedback
- Leaderboards
- Teacher monitoring
- Participation statistics

NetCrossword Live solves this by converting the crossword into a
real-time multiplayer classroom activity.

---

## 💡 Solution

The application provides two major interfaces:

### 👨‍🏫 Teacher / Host

The teacher can:

- Create a game
- Generate a room code
- Display a QR code
- Allow students to join
- See connected students
- Start the game
- Monitor progress
- Track answers
- View the leaderboard
- End the game
- Display final rankings

### 👨‍🎓 Student

Students can:

- Join using a room code
- Scan a QR code
- Enter their name
- View the crossword
- Read clues
- Submit answers
- Track their score
- See their position on the leaderboard
- Complete the puzzle before the timer ends

---

# 🧠 Crossword Content

The game is based on a Computer Networks crossword containing
20 questions.

## Across

| No. | Clue | Concept |
|-----|------|---------|
| 4 | Network designed to cover a metropolitan or city area | MAN |
| 5 | Protocol used for transferring files over a network | FTP |
| 7 | Protocol used to transfer web resources | HTTP |
| 9 | Smaller logical division of an IP network | SUBNET |
| 10 | Protocol that automatically assigns IP addresses to devices | DHCP |
| 11 | Security system that monitors and controls network traffic | FIREWALL |
| 12 | Logical address used to identify a device on a network | IP |
| 17 | Network covering a small geographical area | LAN |
| 18 | Reliable, connection-oriented transport protocol | TCP |

## Down

| No. | Clue | Concept |
|-----|------|---------|
| 1 | Small unit of data transmitted across a network | PACKET |
| 2 | Unique hardware address assigned to a network interface | MAC |
| 3 | Secure version of HTTP that uses encryption | HTTPS |
| 6 | Network connecting devices across a large geographical area | WAN |
| 8 | Physical or logical arrangement of devices in a network | TOPOLOGY |
| 13 | Network utility used to test whether a device is reachable | PING |
| 14 | System that translates domain names into IP addresses | DNS |
| 15 | Device that forwards packets between different networks | ROUTER |
| 16 | Device that connects devices within a network and forwards frames | SWITCH |
| 19 | Device that broadcasts incoming data to all connected ports | HUB |
| 20 | Connectionless transport protocol | UDP |

The original crossword grid and clues are provided in the project source
material.

---

# ✨ Main Features

## 1. 🎮 Multiplayer Game Rooms

Teachers can create a new game session.

Example:

Room Code:

    NET42

Students join using:

    https://your-app.com/join/NET42

The system should support approximately 60 simultaneous students in one
room.

---

## 2. 📱 QR Code Joining

When the teacher creates a room, the application generates a QR code.

Students simply scan the QR code using their phone camera.

After scanning:

    Enter Name
          ↓
    Join Game
          ↓
    Waiting Room

This removes the need for students to manually type long URLs.

---

## 3. 👥 Live Waiting Room

Before the teacher starts the game, students enter a waiting room.

Example:

    ┌──────────────────────────────────┐
    │       NETCROSSWORD LIVE          │
    │                                  │
    │       ROOM: NET42                │
    │                                  │
    │       👥 57 Students Joined      │
    │                                  │
    │   ● Tilak                         │
    │   ● Rahul                         │
    │   ● Priya                         │
    │   ● Arjun                         │
    │   ...                             │
    │                                  │
    │        [ START GAME ]             │
    └──────────────────────────────────┘

The student count updates in real time.

---

# ⏱️ 4. Timed Game

The teacher can select:

- 5 minutes
- 10 minutes
- 15 minutes
- 20 minutes
- Custom duration

Example:

    TIME REMAINING

       08:42

The timer should be controlled by the server so students cannot
manipulate their local browser time.

---

# 🧩 5. Interactive Crossword

Students receive an interactive crossword.

Features:

- Click a cell
- Type letters
- Move between cells
- Highlight current word
- Highlight selected clue
- Across / Down navigation
- Mobile-friendly keyboard input
- Clear answer
- Submit answer

The crossword should closely follow the original puzzle structure.

---

# 💡 6. Clue Panel

Students see two sections:

### Across

4. Network designed to cover a metropolitan or city area.

5. Protocol used for transferring files over a network.

7. Protocol used to transfer web resources.

...

### Down

1. Small unit of data transmitted across a network.

2. Unique hardware address assigned to a network interface.

...

Clicking a clue should automatically select the corresponding cells.

---

# 🧮 7. Scoring System

The scoring system should reward:

- Correct answers
- Fast completion
- Puzzle completion

Example scoring:

Correct answer:

    +100 points

Correct answer with speed bonus:

    +25 points

Incorrect submission:

    0 points

Completion bonus:

    +500 points

The exact scoring rules should be configurable by the teacher.

---

# 🏆 8. Live Leaderboard

The leaderboard updates in real time.

Example:

| Rank | Student | Score |
|------|---------|-------|
| 🥇 1 | Student A | 1825 |
| 🥈 2 | Student B | 1750 |
| 🥉 3 | Student C | 1675 |
| 4 | Student D | 1600 |
| 5 | Student E | 1525 |

Students can see their own position.

The teacher can see the complete leaderboard.

---

# 👨‍🏫 9. Teacher Dashboard

The teacher dashboard should contain:

### Game Information

- Room code
- QR code
- Game status
- Timer
- Number of students
- Number of completed puzzles

### Student Monitoring

- Student name
- Connection status
- Progress
- Score
- Completion percentage
- Correct answers
- Incorrect answers

Example:

| Student | Progress | Score | Status |
|---------|----------|-------|--------|
| Rahul | 85% | 1450 | 🟢 Active |
| Priya | 70% | 1200 | 🟢 Active |
| Arjun | 45% | 800 | 🟢 Active |
| Kiran | 100% | 1800 | 🏆 Finished |

---

# 📊 10. Game Analytics

After the game finishes, the teacher can see:

- Total participants
- Completed students
- Average score
- Average completion time
- Most difficult clue
- Most frequently incorrect answer
- Fastest completion
- Highest score

---

# 🎉 11. Game End Screen

When the game finishes:

    🎉 GAME COMPLETED!

    🥇 Student A
       1825 points

    🥈 Student B
       1750 points

    🥉 Student C
       1675 points

    [ VIEW FULL LEADERBOARD ]

The teacher can display this screen on the classroom projector.

---

# 🔐 12. Anti-Cheating Features

The system should prevent basic cheating.

Implement:

- Server-side answer validation
- Server-side timer
- One player per session/device
- Randomized student IDs
- Do not send crossword answers to frontend
- Do not store answers in visible HTML
- Prevent repeated rapid submissions
- Lock the game after time expires

---

# 🌐 System Architecture

```text
                    ┌─────────────────┐
                    │ Teacher Browser │
                    └────────┬────────┘
                             │
                             │ WebSocket
                             │
                    ┌────────▼────────┐
                    │   Backend API   │
                    │                 │
                    │ Authentication  │
                    │ Game Management │
                    │ Scoring         │
                    │ Validation      │
                    └────────┬────────┘
                             │
                   ┌─────────┴─────────┐
                   │                   │
             WebSocket             REST API
                   │                   │
           ┌───────▼────────┐   ┌──────▼──────┐
           │ Real-time Game │   │   Database  │
           │     Server     │   │             │
           └───────┬────────┘   └─────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
    Student 1  Student 2  Student 60
