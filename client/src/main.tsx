import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Import custom styles for chat bubbles
import { chatBubbleStyles } from "./components/chat/ChatBubble";

// Add chat bubble styles to head
const styleEl = document.createElement('style');
styleEl.textContent = chatBubbleStyles;
document.head.appendChild(styleEl);

// Add Material Icons font
const linkEl = document.createElement('link');
linkEl.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
linkEl.rel = "stylesheet";
document.head.appendChild(linkEl);

// Add Roboto font
const fontEl = document.createElement('link');
fontEl.href = "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap";
fontEl.rel = "stylesheet";
document.head.appendChild(fontEl);

// Set title
document.title = "Maximus - WhatsApp AI Assistant";

createRoot(document.getElementById("root")!).render(<App />);
