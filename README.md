# CodeSprint Trainer

An interactive AI interview simulator that helps you crack the tech interview. Built at the 2025 Google Student AI Hackathon.

## Features

- **AI-generated coding questions** tailored to a job role, powered by Google Gemini
- **Simulated interview flow** with a timer and an in-browser code editor
- **Post-interview follow-up questions** — 3 AI-generated questions to reinforce what you just practiced

## Tech Stack

Next.js, TypeScript, Tailwind CSS, Radix UI / shadcn-style components, Monaco Editor, Firebase, Google Genkit + Gemini API

## Getting Started

1. Clone the repository to your local machine.

2. Install dependencies (requires [Node.js](https://nodejs.org)):

   ```bash
   npm install
   ```

3. Create a `.env` file in the repo root and add your Gemini API key:

   ```
   GEMINI_API_KEY=your_key_here
   ```

   Get a key from [Google AI Studio](https://aistudio.google.com/). You can run `npm install` without a key, but AI-powered features won't work.

4. Start the dev server:

   ```bash
   npm run dev
   ```

## Screenshots

**Generate a question with Gemini**

![Question generation page](https://github.com/user-attachments/assets/993777e3-5d48-45e4-afca-92b8187a3751)

**Simulated interview**

![Interview page](https://github.com/user-attachments/assets/88a54647-5e0b-42fa-ae22-d4004c886057)

**Follow-up questions after the interview**

![Follow-up questions](https://github.com/user-attachments/assets/41c2d35d-1470-47e8-a11a-f6b99d997062)
