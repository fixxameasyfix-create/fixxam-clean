const morningMessages = [
  "Good morning, ready to book?",
  "Good morning, let's begin.",
  "Good morning, find a pro.",
  "Good morning, need help?",
  "Good morning, book now.",
];

const afternoonMessages = [
  "Good afternoon, ready to book?",
  "Good afternoon, need help?",
  "Good afternoon, find a pro.",
  "Good afternoon, book now.",
  "Good afternoon, we're here.",
];

const eveningMessages = [
  "Good evening, ready to book?",
  "Good evening, need help?",
  "Good evening, book now.",
  "Good evening, we're here.",
  "Good evening, relax.",
];

const nightMessages = [
  "Good night, need help?",
  "Good night, book now.",
  "Good night, we're here.",
  "Good night, rest easy.",
  "Good night, stay safe.",
];

export function getHomeGreeting(): string {
  const hour = new Date().getHours();

  let messages: string[];

  if (hour >= 5 && hour < 12) {
    messages = morningMessages;
  } else if (hour >= 12 && hour < 17) {
    messages = afternoonMessages;
  } else if (hour >= 17 && hour < 20) {
    messages = eveningMessages;
  } else {
    messages = nightMessages;
  }

  return messages[Math.floor(Math.random() * messages.length)];
}