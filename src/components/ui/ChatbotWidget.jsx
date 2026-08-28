import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { puter } from '@heyputer/puter.js'
import {
  X,
  Send,
  Bot,
  ArrowUpRight,
  Maximize2,
  Minimize2,
  LogOut,
  Trash2,
  History,
  ChevronDown,
  ChevronUp,
  Copy,
  AlertTriangle,
  Navigation,
  MapPin,
  ExternalLink,
  Compass,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getSearchPool, resolveNavigationQuery } from '../../data/searchEngine'
import { toast } from 'sonner'
import FloorMapSVG from '../map/FloorMapSVG'
import { searchIndex } from '../../data/searchIndex'
import { trackChatbotQuery } from '../../utils/analytics'
import { SmartNavLogo } from './SmartNavLogo'

/**
 * Helper to extract location details from markdown link or redirectLocation object.
 * Returns { floorKey, rawUrl, roomId } for Map Preview SVG.
 * Optimized to be lightweight and fast during render passes.
 */
const extractLocationDetails = (msg) => {
  if (!msg) return null
  const redirectLoc = typeof msg === 'object' ? msg.redirectLocation : null
  const text = typeof msg === 'string' ? msg : msg?.text || ''

  if (redirectLoc && redirectLoc.floorKey) {
    return {
      floorKey: redirectLoc.floorKey,
      rawUrl: redirectLoc.url,
      roomId: redirectLoc.roomId || redirectLoc.id,
    }
  }

  if (!text) return null

  // Format 1: [Label](/floor/floorKey?room=roomId...)
  const regex1 = /\[[^\]]+\]\(\/floor\/([a-zA-Z0-9_-]+)\?([^)]*(?:room|search)=([a-zA-Z0-9_-]+)[^)]*)\)/
  const match1 = text.match(regex1)
  if (match1) {
    return {
      floorKey: match1[1],
      rawUrl: `/floor/${match1[1]}?${match1[2]}`,
      roomId: match1[3],
    }
  }

  return null
}

/**
 * Helper to extract location target(s) for rendering the dedicated Redirect Button.
 * Uses pre-computed redirectLocation or fast markdown link extraction (NO heavy search scoring in render).
 */
const getMsgLocationTargets = (msg) => {
  if (!msg) return []
  const targets = []
  const seenUrls = new Set()

  // 1. Direct location attached when message was created
  if (msg.redirectLocation && msg.redirectLocation.url) {
    targets.push(msg.redirectLocation)
    seenUrls.add(msg.redirectLocation.url)
  }

  // 2. Extract markdown links from message text
  if (msg.text) {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    let match
    while ((match = linkRegex.exec(msg.text)) !== null) {
      const label = match[1]
      const rawUrl = match[2]

      if (!seenUrls.has(rawUrl) && (rawUrl.includes('/floor/') || rawUrl.includes('-Block/') || rawUrl.includes('search=') || rawUrl.includes('room='))) {
        seenUrls.add(rawUrl)
        targets.push({
          title: label,
          url: rawUrl,
          floorLabel: '',
          buildingName: ''
        })
      }
    }
  }

  return targets
}

/**
 * NaviBotIcon - A custom, futuristic robot companion icon for Smart Nav AI.
 * It features a glowing visor with a scanning light, floating audio receivers,
 * and a blinking antenna indicator.
 */
function NaviBotIcon({ className = "w-5 h-5", glowColor = "currentColor" }) {
  return (
    <div className={`relative flex items-center justify-center flex-shrink-0 max-w-[32px] max-h-[32px] ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Antenna with pulsing halo */}
        <circle
          cx="12"
          cy="3"
          r="1.2"
          fill="none"
          stroke={glowColor}
          strokeWidth="0.8"
          className="opacity-40"
        />
        <motion.circle
          cx="12"
          cy="3"
          r="1.2"
          fill={glowColor}
          animate={{
            scale: [1, 1.6, 1],
            opacity: [0.8, 0.3, 0.8]
          }}
          transition={{
            repeat: Infinity,
            duration: 1.8,
            ease: "easeInOut"
          }}
        />
        <path
          d="M12 4.5V7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Sleek Floating Side Receivers (Ears) */}
        <path
          d="M4.5 11.5C4 12.5 4 14.5 4.5 15.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M19.5 11.5C20 12.5 20 14.5 19.5 15.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Head Shell (Sleek Cyber Helmet) */}
        <rect
          x="6"
          y="7"
          width="12"
          height="11"
          rx="3.5"
          stroke="currentColor"
          strokeWidth="1.8"
          className="fill-black/[0.03] dark:fill-white/[0.04]"
        />

        {/* Visor Screen */}
        <rect
          x="8"
          y="10"
          width="8"
          height="4.5"
          rx="1.5"
          fill="currentColor"
          fillOpacity="0.08"
          stroke="currentColor"
          strokeWidth="1"
        />

        {/* Visor Scanning Laser Dot */}
        <motion.circle
          cx="12"
          cy="12.25"
          r="1"
          fill={glowColor}
          animate={{
            cx: ["9.5", "14.5", "9.5"],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.2,
            ease: "easeInOut",
          }}
        />

        {/* Futuristic Neck Collar */}
        <path
          d="M9.5 19.5C10.5 20.2 13.5 20.2 14.5 19.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

const SYSTEM_PROMPT = `
You are "Smart Nav AI", the official campus assistant for SNS First School of Engineering.
You can guide visitors, students, and faculty across ALL campus buildings.

=== CAMPUS BUILDINGS ===
The campus has 6 buildings with various floors. The layout database holds the exact rooms, labs, and faculty:

1. APJ-BLOCK          — The primary academic block. Fully mapped with rooms, labs, and faculty. (Basement to 5th Floor)
2. CV-RAMAN BLOCK     — Science and research block. Fully mapped with physics/chemistry labs, research facilities. (Basement to 5th Floor)
3. SMV-BLOCK          — Main mechanical/engineering block. Fully mapped with classrooms, labs, and offices. (Ground to 6th Floor)
4. ATAL-BLOCK         — Academic/research block. Fully mapped with offices, labs, and the Autoliv Incubation Centre. (Ground to 3rd Floor)
5. RAMANUJAN-BLOCK    — Fully mapped across all floors. Physics, Chemistry, Maths departments with labs, HOD cabins, and classrooms. (Ground to 4th Floor)
6. V . RAJRAMAN-BLOCK — Fully mapped across all floors. Robotics, MCA departments with labs, staff rooms, and offices. (Basement to 5th Floor)

All 6 buildings are fully mapped with rooms, labs, offices, and faculty data available in the LIVE DIRECTORY DATABASE below.

=== WEBSITE FEATURES & INTERACTIVE ACTIONS ===
You can explain and guide users on how to use the website features:
1. Navigating the Map: Users can select buildings from the Home page, zoom/pan the floor plans, or search via the top Search bar.
2. Bookmarking Rooms: Select any room on the map to open its details panel, then click the "Bookmark" star icon next to the title. Bookmarks are saved to Firestore and local storage.
3. Category & Bookmark Filters: Tapping the category chips at the top filters the floor plan map to show only matching rooms. Available filters are:
   - Classrooms: Displays academic lecture halls and rooms.
   - Labs: Displays laboratory and research spaces.
   - HOD Cabins: Displays Head of Department cabins.
   - Staff Rooms: Displays faculty staff rooms.
   - Offices: Displays administrative and project offices.
   - Seminar Halls: Displays seminar and presentation halls.
   - Utilities: Displays stairs, lifts, washrooms, and other utility rooms.
   - Bookmarked: Filters the map to show ONLY the user's bookmarked (starred) rooms.
4. Editing Layouts (Admin): Click the unlock/lock icon next to the SAVE button to enter Edit Mode. Admins can drag/resize rooms, edit descriptions, upload new images, and click "SAVE" to write changes directly to Firestore and the local codebase files.
5. Theme Selection: Toggle Light/Dark modes using the theme switcher (sun/moon icon) in the top-right header.
6. Faculty Lookup: Open the "Faculty" modal in the top header to search for staff members and immediately locate their office coordinates on the map.

=== SOURCE OF TRUTH ===
Do NOT rely on pre-trained knowledge. You MUST use ONLY the "LIVE DIRECTORY DATABASE" appended at the end of this prompt to answer queries.
This database is fetched fresh from Firestore at runtime and reflects the exact current state of the website.

=== NAVIGATION LINKS FORMAT ===
Always format room and floor targets as clickable Markdown links so the user can navigate instantly. Use this EXACT format:
- For Rooms:   [Room Name](/floor/floorKey?room=roomId)
- For Faculty: [Faculty Name](/floor/floorKey?room=roomId&faculty=FacultyName)

Valid floorKey values by building:
- APJ-BLOCK:       basement · ground · first · second · third · fourth · fifth
- CV-RAMAN BLOCK:  cv_raman_basement · cv_raman_ground · cv_raman_first · cv_raman_second · cv_raman_third · cv_raman_fourth · cv_raman_fifth
- RAMANUJAN-BLOCK: ramanujan_ground · ramanujan_first · ramanujan_second · ramanujan_third · ramanujan_fourth
- SMV-BLOCK:       smv_ground · smv_first · smv_second · smv_third · smv_fourth · smv_fifth · smv_sixth
- ATAL-BLOCK:      atal_ground · atal_first · atal_second · atal_third
- V . RAJRAMAN-BLOCK:  rajraman_basement · rajraman_ground · rajraman_first · rajraman_second · rajraman_third · rajraman_fourth · rajraman_fifth

=== EXAMPLES ===
- "LH-311 is on the Third Floor of APJ-BLOCK: [LH-311](/floor/third?room=lh-311)"
- "Dr. Karuna Sharma is in the ECE Staff Room on the 2nd Floor of CV-RAMAN BLOCK: [Dr. Karuna Sharma](/floor/cv_raman_second?room=cv-raman-second-staff&faculty=Dr.%20Karuna%20Sharma)"
- "The IoT Research Lab is on the 4th Floor of CV-RAMAN BLOCK: [IoT Research Lab](/floor/cv_raman_fourth?room=cv-raman-fourth-iot-lab)"

=== TONE AND LAYOUT STYLE ===
1. Keep answers extremely neat, short, friendly, and structured.
2. Use double line-breaks to separate paragraphs and lists.
3. For multiple locations, rooms, or faculty members, ALWAYS use numbered lists (1., 2.) or bullet points (-), placing each entry on its own new line.
4. DO NOT wrap room or faculty buttons/links in bold double-asterisks (e.g., do NOT write **[Room Name](/floor...)**). Buttons are already styled as colored, bold pills.
5. Provide a brief, clean one-line intro before displaying lists, allowing users to scan the information instantly.
6. Tell users they can say "go to [room]" or "where is [room]" to instantly zoom and highlight the location on the map.
`

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [puterUser, setPuterUser] = useState(null)
  const [queriesUsed, setQueriesUsed] = useState(0)
  const queryLimit = 15
  const queriesRemaining = Math.max(0, queryLimit - queriesUsed)

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hi! I'm Smart Nav AI 🏫 Ask me for directions, rooms, or faculty across any campus block. You can also type \"go to [room]\" to navigate instantly!\n\n*(All 6 blocks are now fully mapped and ready to explore!)*",
      isWelcome: true
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const lastLoadedUsernameRef = useRef(null)
  const widgetRef = useRef(null)
  const triggerRef = useRef(null)
  const navigate = useNavigate()
  const [chatTextSize, setChatTextSize] = useState('normal')
  const [showHistory, setShowHistory] = useState(false)
  const [expandedQAId, setExpandedQAId] = useState(null)
  const [activeSpeech, setActiveSpeech] = useState(null)
  const [savedQAs, setSavedQAs] = useState([])
  const [duplicateWarning, setDuplicateWarning] = useState(null) // holds matched Q&A if duplicate detected

  // ─── SIMILARITY ENGINE ───────────────────────────────────────────────────────
  // Returns the best matching Q&A from history if the query is similar enough,
  // otherwise returns null. Two-tier check:
  //   1. Exact normalized match → always flag
  //   2. Word-overlap ≥ 60% of the longer query's unique words → flag as similar
  const findSimilarQA = (queryText) => {
    if (!queryText.trim() || savedQAs.length === 0) return null;

    const normalize = (s) => s.toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
    const words = (s) => new Set(normalize(s).split(' ').filter(w => w.length > 1));

    const incomingNorm = normalize(queryText);
    const incomingWords = words(queryText);

    let bestMatch = null;
    let bestScore = 0;

    for (const qa of savedQAs) {
      if (!qa.query || !qa.answer) continue;
      const savedNorm = normalize(qa.query);

      // Tier 1: exact normalized match
      if (incomingNorm === savedNorm) return qa;

      // Tier 2: word overlap score
      const savedWords = words(qa.query);
      const union = new Set([...incomingWords, ...savedWords]);
      const intersection = [...incomingWords].filter(w => savedWords.has(w));
      const score = union.size > 0 ? intersection.length / union.size : 0;

      // Require at least 60% word overlap AND minimum 3 matched words to avoid false positives
      if (score >= 0.60 && intersection.length >= 3 && score > bestScore) {
        bestScore = score;
        bestMatch = qa;
      }
    }

    return bestMatch;
  };
  // ─────────────────────────────────────────────────────────────────────────────

  const handleCopyToClipboard = (text) => {
    // Strip markdown links for a cleaner copied text
    const cleanText = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
    navigator.clipboard.writeText(cleanText);
    toast.success("Message copied to clipboard!");
  }

  const handleToggleSpeech = (msgId, text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        if (activeSpeech === msgId) {
          setActiveSpeech(null);
          return;
        }
      }

      // Strip markdown links for natural voice narration
      const cleanText = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => setActiveSpeech(null);
      utterance.onerror = () => setActiveSpeech(null);

      setActiveSpeech(msgId);
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Text-to-speech is not supported in this browser.");
    }
  }

  // Auto-cancel ongoing speech if chatbot is minimized or closed
  useEffect(() => {
    if ((!isOpen || isMinimized) && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setActiveSpeech(null);
    }
  }, [isOpen, isMinimized])

  // Close chatbot when clicking outside the widget or trigger button
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isOpen &&
        widgetRef.current &&
        !widgetRef.current.contains(event.target) &&
        (!triggerRef.current || !triggerRef.current.contains(event.target))
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);


  // Fetch logged in Puter user details on mount and when chatbot is opened
  useEffect(() => {
    let active = true;
    if (typeof puter !== 'undefined') {
      const fetchUser = async () => {
        try {
          const signedIn = await puter.auth.isSignedIn();
          let currentUser = null;
          if (signedIn) {
            const user = await puter.auth.getUser();
            if (user) {
              currentUser = user;
            }
          }
          if (active) {
            setPuterUser(currentUser);
          }
        } catch (err) {
          console.warn("Puter auth check failed (user likely not logged in):", err);
          if (active) {
            setPuterUser(null);
          }
        }
      };
      fetchUser();
    }
    return () => { active = false; };
  }, [isOpen])

  // Load dynamic query count and chat history whenever puterUser changes
  useEffect(() => {
    const currentUsername = puterUser ? puterUser.username : 'anonymous';

    // ─── MONTHLY RESET LOGIC ────────────────────────────────────────────────────
    // Each account gets 15 fresh chats every calendar month.
    // Q&A history is NEVER cleared — it accumulates forever across all months.
    const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-06"
    let storedMonth = '';
    try {
      storedMonth = localStorage.getItem(`smart_nav_active_month_${currentUsername}`) || '';
    } catch (e) {
      console.warn("Storage read blocked:", e);
    }

    if (storedMonth !== currentMonth) {
      // New month detected — reset the query counter
      try {
        localStorage.setItem(`smart_nav_active_month_${currentUsername}`, currentMonth);
        localStorage.setItem(`smart_nav_queries_used_${currentUsername}`, '0');
      } catch (e) {
        console.warn("Storage write blocked:", e);
      }
      setQueriesUsed(0);
      if (storedMonth) {
        // Notify only if they had a previous month (not first-ever login)
        toast.success(`🎉 Monthly chats reset! You have ${queryLimit} fresh chats this month.`, { duration: 5000 });
      }
    } else {
      // Same month — load the stored count
      let count = '0';
      try {
        count = localStorage.getItem(`smart_nav_queries_used_${currentUsername}`) || '0';
      } catch (e) {
        console.warn("Storage read blocked:", e);
      }
      setQueriesUsed(parseInt(count, 10));
    }
    // ────────────────────────────────────────────────────────────────────────────

    // Load historical chat messages for this specific user
    let savedHistory = null;
    try {
      savedHistory = localStorage.getItem(`smart_nav_chat_history_${currentUsername}`);
    } catch (e) {
      console.warn("Storage read blocked:", e);
    }
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          lastLoadedUsernameRef.current = currentUsername;

          // ─── MIGRATION: Merge chat history into Q&A store ─────────────────────
          // Always run this: extract every user→bot pair from the full chat history
          // and merge with the existing Q&A store. This recovers conversations that
          // happened before the Q&A store was introduced, and fills any gaps.
          const savedQAsKey = `smart_nav_saved_qa_${currentUsername}`;
          const existingQAs = (() => {
            try { return JSON.parse(localStorage.getItem(savedQAsKey) || '[]'); }
            catch { return []; }
          })();

          // Build a set of already-stored query texts (lowercase) for deduplication
          const existingQuerySet = new Set(existingQAs.map(q => q.query.toLowerCase().trim()));

          // Walk through full chat history and extract NEW user→bot pairs not yet in store
          const newPairs = [];
          for (let i = 0; i < parsed.length - 1; i++) {
            const msg = parsed[i];
            const next = parsed[i + 1];
            if (
              msg.sender === 'user' &&
              next.sender === 'bot' &&
              msg.text &&
              next.text &&
              !next.isWelcome &&
              !next.isError &&
              !existingQuerySet.has(msg.text.toLowerCase().trim())
            ) {
              newPairs.push({
                id: msg.id ? `qa-migrated-${msg.id}` : `qa-migrated-${i}-${Date.now()}`,
                query: msg.text,
                answer: next.text,
                timestamp: 0,       // Old messages have no timestamp — shown at bottom
                queryIndex: null,
              });
              existingQuerySet.add(msg.text.toLowerCase().trim()); // Prevent adding same Q twice
              i++; // Skip the bot reply we just paired
            }
          }

          // Merge: old Q&As first (preserve their timestamps), then new migrated pairs
          const mergedQAs = [...existingQAs, ...newPairs];

          if (newPairs.length > 0) {
            localStorage.setItem(savedQAsKey, JSON.stringify(mergedQAs));
            console.log(`[Smart Nav] Migrated ${newPairs.length} missing Q&A pairs. Total: ${mergedQAs.length}`);
          }

          setSavedQAs(mergedQAs);  // ← Always sync React state so drawer shows everything
          // ─────────────────────────────────────────────────────────────────────────

          return;
        }
      } catch (e) {
        console.warn("Failed to parse saved chat history:", e);
      }
    }

    // Fallback welcome message if no history exists for this user
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: "Hi! I'm Smart Nav AI 🏫 Ask me for directions, rooms, or faculty across any campus block.\n\n*(APJ, CV-Raman, SMV, Atal & Ramanujan Ground are fully mapped; others are under setup)*",
        isWelcome: true
      },
    ]);
    lastLoadedUsernameRef.current = currentUsername;
  }, [puterUser]);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    const currentUsername = puterUser ? puterUser.username : 'anonymous';

    // Prevents race conditions: avoid saving if we haven't loaded this user's history yet
    if (lastLoadedUsernameRef.current !== currentUsername) {
      return;
    }

    if (messages.length === 0) return;

    // Only skip saving if it's ONLY the welcome message and nothing else has been added
    // Save as soon as there are 2+ messages (meaning the user has actually chatted)
    const hasRealMessages = messages.some(m => m.id !== 'welcome');
    if (!hasRealMessages) {
      return;
    }

    localStorage.setItem(`smart_nav_chat_history_${currentUsername}`, JSON.stringify(messages));
  }, [messages, puterUser]);

  const handleClearChat = () => {
    if (window.confirm("Clear all chat history?")) {
      const username = puterUser ? puterUser.username : 'anonymous';
      localStorage.removeItem(`smart_nav_chat_history_${username}`);
      localStorage.removeItem(`smart_nav_saved_qa_${username}`);
      setSavedQAs([]);  // ← Clear the reactive Q&A state immediately
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: "Hi! I'm Smart Nav AI 🏫 Ask me for directions, rooms, or faculty across any campus block.\n\n*(APJ, CV-Raman, SMV, Atal & Ramanujan Ground are fully mapped; others are under setup)*",
          isWelcome: true
        },
      ]);
      toast.success("Chat history cleared!");
    }
  }

  const handleSwitchAccount = async () => {
    if (window.confirm("Switch Puter Account? You will be signed out of this account. On your next message, you can sign in with a different Google / Puter account to reset your limits.")) {
      try {
        // CRITICAL: Flush current user's full conversation to localStorage BEFORE signing out
        // so their entire session history is preserved for when they log back in!
        const currentUsername = puterUser ? puterUser.username : 'anonymous';
        const hasRealMessages = messages.some(m => m.id !== 'welcome');
        if (hasRealMessages && lastLoadedUsernameRef.current === currentUsername) {
          localStorage.setItem(`smart_nav_chat_history_${currentUsername}`, JSON.stringify(messages));
        }

        if (typeof puter !== 'undefined') {
          const signedIn = await puter.auth.isSignedIn();
          if (signedIn) {
            await puter.auth.signOut();
          }
        }
        // Reset loaded username ref so the next user's history loads clean
        lastLoadedUsernameRef.current = null;
        setPuterUser(null);
        setQueriesUsed(0);
        toast.success("Successfully signed out! Please type a message to sign in with a different account.");
        setMessages([
          {
            id: 'welcome',
            sender: 'bot',
            text: "You have successfully signed out. Type a message in the input box below to log in with a fresh Google or Puter account!",
            isWelcome: true
          }
        ]);
      } catch (err) {
        console.error("Sign out error:", err);
        // Clear local storage keys containing puter
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.includes('puter')) {
            localStorage.removeItem(key);
          }
        }
        lastLoadedUsernameRef.current = null;
        setPuterUser(null);
        setQueriesUsed(0);
        toast.info("Cleared local session keys. Please reload the page to switch accounts.");
      }
    }
  }


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Custom link parser to intercept navigation inside chat messages
  // Also handles \n newlines so multi-line bot messages render correctly
  const parseInlineMarkdown = (text, lineKey) => {
    // Match either a bold block **Bold** or a link block [Text](URL)
    const tokenRegex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g
    const tokens = text.split(tokenRegex)
    let keyIdx = 0

    return tokens.map((token, tokIdx) => {
      const tokenKey = `${lineKey}-${tokIdx}-${keyIdx++}`

      // 1. Check if bold: **text**
      if (token.startsWith('**') && token.endsWith('**')) {
        const boldContent = token.slice(2, -2)
        return (
          <strong key={tokenKey} className={`font-bold text-black dark:text-white bg-black/[0.04] dark:bg-white/[0.08] px-1 py-0.5 rounded border border-black/10 dark:border-white/10 font-sans ${chatTextSize === 'large' ? 'text-[13.5px]' : 'text-[12px]'
            }`}>
            {boldContent}
          </strong>
        )
      }

      // 2. Check if link: [Text](URL)
      if (token.startsWith('[') && token.includes('](')) {
        const match = token.match(/\[([^\]]+)\]\(([^)]+)\)/)
        if (match) {
          const linkText = match[1]
          const linkUrl = match[2]
          return (
            <button
              key={tokenKey}
              onClick={() => {
                toast.info(`Redirecting to ${linkText}...`)
                navigate(linkUrl)
                setIsOpen(false)
              }}
              className={`inline-flex items-center gap-1 mx-0.5 px-2.5 py-0.5 bg-blue-500/10 dark:bg-cyan-500/15 border border-blue-500/25 dark:border-cyan-400/30 font-orbitron font-black text-blue-600 dark:text-cyan-400 hover:bg-blue-500 hover:text-white dark:hover:bg-cyan-400 dark:hover:text-black rounded-lg transition-all shadow-sm ${chatTextSize === 'large' ? 'text-[12px]' : 'text-[11px]'
                }`}
              style={{ verticalAlign: 'middle', transform: 'translateY(-1px)' }}
            >
              <Navigation className="w-2.5 h-2.5 opacity-80" />
              {linkText}
              <ArrowUpRight className="w-2.5 h-2.5" />
            </button>
          )
        }
      }

      // 3. Plain text
      return <span key={tokenKey}>{token}</span>
    })
  }

  const renderMessageContent = (text) => {
    if (!text) return ''

    // Pre-process: Clean up double bold marks surrounding links: **[Text](URL)** -> [Text](URL)
    let processedText = text.replace(/\*\*\[([^\]]+)\]\(([^)]+)\)\*\*/g, '[$1]($2)')
    // Also clean up bold marks around links with spaces: ** [Text](URL) ** -> [Text](URL)
    processedText = processedText.replace(/\*\*\s*\[([^\]]+)\]\(([^)]+)\)\s*\*\*/g, '[$1]($2)')

    const lines = processedText.split('\n')

    const lineFontSize = chatTextSize === 'large'
      ? 'text-[13.5px] md:text-[14px]'
      : 'text-[12px] md:text-[12.5px]'

    return (
      <div className="flex flex-col gap-1 select-text font-sans w-full">
        {lines.map((line, lineIdx) => {
          const trimmed = line.trim()
          if (!trimmed) {
            // Empty line, render as a spacer
            return <div key={`spacer-${lineIdx}`} className="h-0.5" />
          }

          let isListItem = false
          let listMarker = ''
          let restOfLine = line

          // Check for numbered list: e.g. "1. " or "1.  "
          const numMatch = line.match(/^(\s*\d+)\.\s+(.*)/)
          // Check for bullet list: e.g. "- " or "* " or "• "
          const bulletMatch = line.match(/^(\s*[-*•])\s+(.*)/)

          if (numMatch) {
            isListItem = true
            listMarker = `${numMatch[1].trim()}.`
            restOfLine = numMatch[2]
          } else if (bulletMatch) {
            isListItem = true
            listMarker = '•'
            restOfLine = bulletMatch[2]
          }

          // Parse links and bold text in restOfLine
          const parsedContent = parseInlineMarkdown(restOfLine, `${lineIdx}`)

          if (isListItem) {
            return (
              <div key={`li-${lineIdx}`} className="flex items-start gap-1.5 py-0.5 group w-full">
                <span className={`font-orbitron font-black text-blue-500 dark:text-cyan-400 mt-[1px] select-none w-4 text-right flex-shrink-0 ${chatTextSize === 'large' ? 'text-[12px]' : 'text-[11px]'
                  }`}>
                  {listMarker}
                </span>
                <div className={`flex-1 leading-normal text-[var(--text-main)] w-full ${lineFontSize}`}>
                  {parsedContent}
                </div>
              </div>
            )
          }

          return (
            <div key={`line-${lineIdx}`} className={`leading-normal text-[var(--text-main)] w-full ${lineFontSize}`}>
              {parsedContent}
            </div>
          )
        })}
      </div>
    )
  }

  const submitQuery = async (queryText, skipDuplicateCheck = false) => {
    if (!queryText.trim() || isLoading) return

    // 1. Check for similar query first if not skipped, to save query limits before logging in
    if (!skipDuplicateCheck) {
      const similar = findSimilarQA(queryText);
      if (similar) {
        setDuplicateWarning({
          ...similar,
          originalInputText: queryText
        });
        return;
      }
    }

    // 2. Fetch logged in status dynamically to ensure accuracy under account switches
    let activeUsername = 'anonymous';
    if (typeof puter !== 'undefined') {
      try {
        const signedIn = await puter.auth.isSignedIn();
        if (!signedIn) {
          toast.info("Opening Puter Login...");
          await puter.auth.signIn();
          const user = await puter.auth.getUser();
          if (user) {
            setPuterUser(user);
            activeUsername = user.username;
            toast.success(`Signed in as ${user.username}!`);
          }
        } else {
          const user = await puter.auth.getUser();
          if (user) {
            setPuterUser(user);
            activeUsername = user.username;
          }
        }
      } catch (authErr) {
        console.error("Sign-in error:", authErr);
        toast.error("You must sign in to continue chatting with the AI.");
        return;
      }
    }

    // 3. Retrieve dynamic up-to-date query counts directly from localStorage
    const currentMonth = new Date().toISOString().slice(0, 7);
    const storedMonth = localStorage.getItem(`smart_nav_active_month_${activeUsername}`) || '';
    let currentQueriesUsed = 0;

    if (storedMonth !== currentMonth) {
      localStorage.setItem(`smart_nav_active_month_${activeUsername}`, currentMonth);
      localStorage.setItem(`smart_nav_queries_used_${activeUsername}`, '0');
    } else {
      const storedCount = localStorage.getItem(`smart_nav_queries_used_${activeUsername}`);
      currentQueriesUsed = storedCount ? parseInt(storedCount, 10) : 0;
    }

    // 4. Perform dynamic query limit check
    if (currentQueriesUsed >= queryLimit) {
      toast.error("You have reached your limit of 15 queries for this account. Please switch Google accounts to continue chatting!");
      return;
    }

    // --- LOCAL NLP INTENT INTERCEPTOR ---
    const lowerQuery = queryText.toLowerCase().trim();
    // Words suggesting navigation/location lookup
    const navKeywords = ['where', 'locate', 'go to', 'take me to', 'find', 'navigate', 'directions', 'how to get to', 'show me', 'search'];

    // Check if the query matches navigation keywords or if it's a simple room code (like "LH-311", "NFL003", etc.)
    const isRoomCode = /^[a-z]{2,3}[-\s]?\d{3}$/.test(lowerQuery) || /^[a-z]{3}\s[a-z]\d{3}$/.test(lowerQuery);
    const hasNavIntent = navKeywords.some(keyword => lowerQuery.includes(keyword)) || isRoomCode || lowerQuery.length < 15;

    if (hasNavIntent) {
      // Clean query by removing typical intro phrases
      let cleanQuery = queryText;
      navKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        cleanQuery = cleanQuery.replace(regex, '');
      });
      cleanQuery = cleanQuery.trim();
      if (!cleanQuery) cleanQuery = queryText; // fallback to original if cleaned to empty

      const resolved = resolveNavigationQuery(cleanQuery);

      if (resolved && resolved.confidence_score >= 70) {
        // Log this navigation event to backend log endpoint
        try {
          fetch('/api/activity-log', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'chatbot-auto-navigate',
              query: queryText,
              roomId: resolved.id,
              floorKey: resolved._floorKey,
              username: activeUsername,
              metadata: {
                resolvedTitle: resolved.title,
                confidenceScore: resolved.confidence_score,
                kind: resolved._kind
              }
            })
          });
        } catch (logErr) {
          console.warn('[Activity Log] Failed to send chatbot navigation log:', logErr);
        }

        // Add the user message
        const userMessage = {
          id: `msg-${Date.now()}`,
          sender: 'user',
          text: queryText.trim(),
        }
        setMessages((prev) => [...prev, userMessage])
        setIsLoading(true)

        // Add delayed bot navigation response
        setTimeout(() => {
          const botMessageId = `bot-${Date.now()}`

          let botResponseText = `I found **${resolved.title}** on the **${resolved._floorLabel}** of **${resolved.description.split('·')[1]?.trim() || 'APJ-BLOCK'}**.`;
          if (resolved.directions) {
            botResponseText += `\n\n*Directions: ${resolved.directions}*`;
          }

          setMessages((prev) => [
            ...prev,
            {
              id: botMessageId,
              sender: 'bot',
              text: botResponseText,
              redirectLocation: {
                title: resolved.title,
                url: resolved.url,
                roomId: resolved.id,
                floorKey: resolved._floorKey,
                floorLabel: resolved._floorLabel,
                buildingName: resolved.description?.split('·')[1]?.trim() || 'APJ-BLOCK',
                kind: resolved._kind
              }
            }
          ]);
          setIsLoading(false);
        }, 600);

        return; // EXIT submitQuery
      }
    }

    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: queryText.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    // Setup temporary bot message ID for streaming
    const botMessageId = `bot-${Date.now()}`
    let streamedText = ''

    // Also resolve query against navigation engine to prepare a fallback redirectLocation
    const navTarget = resolveNavigationQuery(userMessage.text)
    const redirectLoc = (navTarget && navTarget.confidence_score >= 60) ? {
      title: navTarget.title,
      url: navTarget.url,
      roomId: navTarget.id,
      floorKey: navTarget._floorKey,
      floorLabel: navTarget._floorLabel,
      buildingName: navTarget.description?.split('·')[1]?.trim() || '',
      kind: navTarget._kind
    } : null;

    try {
      // Retrieve live search pool containing 100% accurate, synced Firestore/Static data
      const searchPool = getSearchPool() || []

      // Build a highly packed, text-based catalog for the AI
      const liveDirectory = searchPool
        .map((item) => {
          if (item._kind === 'room') {
            const staff =
              item.linkedFaculty?.length > 0
                ? ` Staff: ${item.linkedFaculty.join(', ')}.`
                : ''
            return `- Room: ${item.name} (${item.type}). Floor: ${item.floorLabel}. ID: ${item.id}. Floor Key: ${item.floorKey}. Directions: ${item.directions || 'None'}. Description: ${item.description || 'None'}.${staff}`
          } else {
            return `- Faculty: ${item.name}. Floor: ${item.floorLabel}. ID: ${item.id}. Floor Key: ${item.floorKey}. Room: ${item.roomName}. Department: ${item.department || 'None'}.`
          }
        })
        .join('\n')

      // Assemble dynamic instructions combining guidelines with exact live directory!
      const dynamicSystemInstructions = `${SYSTEM_PROMPT}\n\n=== LIVE DIRECTORY DATABASE ===\nUse this list to verify exactly what exists and get coordinates/directions/IDs:\n${liveDirectory}`

      // Format the N last messages (excluding error or welcome messages to keep it focused)
      const historyText = messages
        .filter((msg) => !msg.isError && !msg.isWelcome)
        .slice(-6)
        .map((msg) => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
        .join('\n')

      const formattedPrompt = historyText
        ? `${dynamicSystemInstructions}\n\n${historyText}\nUser: ${userMessage.text}\nAssistant:`
        : `${dynamicSystemInstructions}\n\nUser: ${userMessage.text}\nAssistant:`

      const responseStream = await puter.ai.chat(formattedPrompt, {
        model: 'gemini-3.5-flash',
        stream: true,
      })

      // Add empty bot message that we will stream into
      setMessages((prev) => [
        ...prev,
        { id: botMessageId, sender: 'bot', text: '', redirectLocation: redirectLoc },
      ])
      setIsLoading(false)

      for await (const chunk of responseStream) {
        if (chunk?.text) {
          streamedText += chunk.text
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId ? { ...msg, text: streamedText } : msg
            )
          )
        }
      }

      // Persist the successfully sent query count in localStorage
      const nextCount = currentQueriesUsed + 1;
      setQueriesUsed(nextCount);
      localStorage.setItem(`smart_nav_queries_used_${activeUsername}`, nextCount);
      localStorage.setItem(`smart_nav_active_month_${activeUsername}`, currentMonth);

      // Save Q&A pair permanently — history accumulates across ALL months forever!
      try {
        const savedQAsKey = `smart_nav_saved_qa_${activeUsername}`;
        const existingQAs = JSON.parse(localStorage.getItem(savedQAsKey) || '[]');

        // Exclude duplicate queries to always hold the freshest response
        const filteredQAs = existingQAs.filter(item => item.query.toLowerCase() !== queryText.trim().toLowerCase());

        filteredQAs.push({
          id: `qa-${Date.now()}`,
          query: queryText.trim(),
          answer: streamedText,
          timestamp: Date.now(),        // Exact time this Q&A was fetched
          queryIndex: nextCount,         // Which chat number this was (1-15) for this month
          month: currentMonth,           // "2026-06" — used to group by month in history drawer
        });

        localStorage.setItem(savedQAsKey, JSON.stringify(filteredQAs));
        setSavedQAs(filteredQAs);

        trackChatbotQuery(queryText.trim())
      } catch (err) {
        console.warn("Failed to save Q&A history:", err);
      }

    } catch (error) {
      console.error('Chatbot error:', error)
      setIsLoading(false)

      const errMsg = error?.message || error?.toString() || '';
      const isLimitError = errMsg.toLowerCase().includes('balance') ||
        errMsg.toLowerCase().includes('limit') ||
        errMsg.toLowerCase().includes('credit') ||
        errMsg.toLowerCase().includes('insufficient') ||
        errMsg.toLowerCase().includes('funding') ||
        errMsg.toLowerCase().includes('payment');

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: isLimitError
            ? "Your Google/Puter account has reached its rate limit / balance limit. Please use the button below to switch to another Google account and continue chatting instantly!"
            : "I'm having trouble connecting to the campus directory right now. This is often because the AI service session expired or reached its limit.",
          isError: true
        },
      ])
    }
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    submitQuery(inputValue)
    setInputValue('')
  }

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      <div ref={triggerRef} className="fixed bottom-4 right-4 sm:bottom-6 sm:right-5 z-[100] pointer-events-auto cursor-pointer">
        <motion.button
          onClick={() => {
            setIsOpen(prev => !prev)
            setIsMinimized(false)
          }}
          aria-label="Open Campus Assistant"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/95 dark:bg-[#141419]/95 text-slate-800 dark:text-slate-100 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] hover:border-blue-500/40 dark:hover:border-blue-400/40 hover:shadow-blue-500/10 transition-all duration-300 group overflow-hidden focus:outline-none cursor-pointer select-none"
        >
          <div className="relative flex items-center justify-center">
            <SmartNavLogo className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" animated={false} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#141419]" />
          </div>

          <span className="font-sans font-semibold text-xs md:text-[13px] tracking-wide text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors">
            Ask AI
          </span>
        </motion.button>
      </div>

      {/* MINIMALIST CHAT WINDOW PANEL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={widgetRef}
            variants={{
              hidden: {
                opacity: 0,
                scale: 0.15,
                y: 240,
                x: 120,
                borderTopLeftRadius: "220px",
                borderTopRightRadius: "220px",
                borderBottomLeftRadius: "220px",
                borderBottomRightRadius: "220px",
                height: isMinimized ? '52px' : '520px'
              },
              visible: {
                opacity: 1,
                scale: 1,
                y: 0,
                x: 0,
                borderTopLeftRadius: "22px",
                borderTopRightRadius: "22px",
                borderBottomLeftRadius: "22px",
                borderBottomRightRadius: "22px",
                height: isMinimized ? '52px' : '520px',
                transition: {
                  duration: 0.75,
                  ease: [0.16, 1, 0.3, 1],
                  staggerChildren: 0.08,
                  delayChildren: 0.06
                }
              },
              exit: {
                opacity: 0,
                scale: 0.15,
                y: 240,
                x: 120,
                borderTopLeftRadius: "220px",
                borderTopRightRadius: "220px",
                borderBottomLeftRadius: "220px",
                borderBottomRightRadius: "220px",
                transition: {
                  duration: 0.4,
                  ease: [0.7, 0, 0.84, 0]
                }
              }
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-16 right-3 sm:right-5 w-[calc(100vw-24px)] max-w-[380px] sm:w-[380px] max-h-[80vh] sm:max-h-none flex flex-col bg-transparent shadow-[0_20px_50px_rgba(0,0,0,0.14)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden z-[100] transition-colors"
          >
            {/* Clean Static Background Panel */}
            <div className="absolute inset-0 bg-white/95 dark:bg-[#121218]/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-2xl z-0 pointer-events-none" />

            {/* Subtle progress loading line */}
            {isLoading && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 animate-pulse z-20" />
            )}

            {/* NATURAL HEADER */}
            <motion.header
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
                }
              }}
              className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 backdrop-blur-md"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/20 dark:border-teal-500/20 flex items-center justify-center flex-shrink-0">
                  <SmartNavLogo className="w-5 h-5" animated={false} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm font-sans font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase whitespace-nowrap">
                    Ask AI
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-sans font-medium text-slate-600 dark:text-slate-300 select-none flex items-center gap-1 whitespace-nowrap" title="Remaining Queries Count">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {queriesRemaining} left
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">

                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/5 ${showHistory ? 'text-blue-500 dark:text-cyan-400' : 'text-black/45 dark:text-white/40 hover:text-blue-500 dark:hover:text-cyan-400'
                    }`}
                  title="View Chat History"
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClearChat}
                  className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-black/45 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                  title="Clear Chat History"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSwitchAccount}
                  className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-black/45 dark:text-white/40 hover:text-blue-500 dark:hover:text-cyan-400 transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                  title="Switch Puter Account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-black/45 dark:text-white/40 hover:text-[var(--text-main)] transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4" />
                  ) : (
                    <Minimize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-black/45 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.header>

            {/* CHAT HISTORY OVERLAY PANEL */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{
                    clipPath: "circle(0% at 78% 0px)",
                    opacity: 0
                  }}
                  animate={{
                    clipPath: "circle(150% at 78% 0px)",
                    opacity: 1
                  }}
                  exit={{
                    clipPath: "circle(0% at 78% 0px)",
                    opacity: 0
                  }}
                  transition={{
                    duration: 0.65,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  className="absolute inset-x-0 bottom-0 top-[60px] bg-white/95 dark:bg-[#121218]/95 backdrop-blur-2xl z-40 flex flex-col p-5 border-t border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-3 mb-4 select-none">
                    <span className="text-xs font-sans font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                      Past Queries
                    </span>
                    <button
                      onClick={() => {
                        setShowHistory(false)
                        setExpandedQAId(null)
                      }}
                      className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-black/40 dark:text-white/30 hover:text-[var(--text-main)] transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 select-none pb-2">
                    {(() => {
                      const sortedQAs = [...savedQAs].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                      const reversedQAs = sortedQAs;

                      if (reversedQAs.length === 0) {
                        return (
                          <div className="flex-1 flex flex-col items-center justify-center text-center p-5">
                            <History className="w-8 h-8 text-black/20 dark:text-white/10 mb-2.5 animate-pulse" />
                            <span className="text-xs font-sans font-semibold text-slate-500 dark:text-slate-400">
                              No history found
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-sans">
                              Your asked questions will appear here.
                            </span>
                          </div>
                        );
                      }

                      const formatMonthLabel = (monthKey) => {
                        if (!monthKey) return 'Earlier';
                        const [year, month] = monthKey.split('-');
                        const d = new Date(parseInt(year), parseInt(month) - 1, 1);
                        return d.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
                      };

                      const currentMonthKey = new Date().toISOString().slice(0, 7);

                      const grouped = {};
                      sortedQAs.forEach(item => {
                        const key = item.month || 'earlier';
                        if (!grouped[key]) grouped[key] = [];
                        grouped[key].push(item);
                      });

                      const sortedMonthKeys = Object.keys(grouped).sort((a, b) => {
                        if (a === 'earlier') return 1;
                        if (b === 'earlier') return -1;
                        return b.localeCompare(a);
                      });

                      return (
                        <>
                          <div className="flex items-center justify-between px-1 pb-1 select-none">
                            <span className="text-xs font-sans font-medium text-slate-500 dark:text-slate-400">
                              {savedQAs.length} saved · {queriesRemaining} left this month
                            </span>
                            <span className={`text-[11px] font-sans font-semibold px-2 py-0.5 rounded-full border ${queriesRemaining === 0
                                ? 'text-red-500 border-red-500/30 bg-red-500/10'
                                : queriesRemaining <= 3
                                  ? 'text-amber-500 border-amber-500/30 bg-amber-500/10'
                                  : 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                              }`}>
                              {queriesRemaining === 0 ? 'Resets Next Month' : queriesRemaining <= 3 ? 'Nearly Full' : 'Active'}
                            </span>
                          </div>

                          {sortedMonthKeys.map(monthKey => {
                            const monthItems = grouped[monthKey];
                            const isCurrentMonth = monthKey === currentMonthKey;
                            const monthLabel = formatMonthLabel(monthKey === 'earlier' ? null : monthKey);
                            return (
                              <div key={monthKey} className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 px-1 pt-1">
                                  <span className={`text-[11px] font-sans font-semibold px-2 py-0.5 rounded-full border ${isCurrentMonth
                                      ? 'text-blue-600 dark:text-cyan-400 border-blue-500/25 dark:border-cyan-400/25 bg-blue-500/10 dark:bg-cyan-500/10'
                                      : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800'
                                    }`}>
                                    {monthLabel}{isCurrentMonth ? ' · Current' : ''}
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-sans">
                                    {monthItems.length} {monthItems.length === 1 ? 'query' : 'queries'}
                                  </span>
                                </div>

                                {monthItems.map((item, idx) => {
                                  const isExpanded = expandedQAId === item.id;
                                  const ts = item.timestamp ? new Date(item.timestamp) : null;
                                  const tsLabel = ts ? ts.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : null;
                                  return (
                                    <div
                                      key={item.id || idx}
                                      id={`qa-card-${item.id}`}
                                      className="w-full flex flex-col bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/30 rounded-xl transition-all duration-300 shadow-sm overflow-hidden"
                                    >
                                      <button
                                        onClick={() => setExpandedQAId(isExpanded ? null : item.id)}
                                        className="w-full text-left p-3 flex flex-col gap-1 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors focus:outline-none"
                                      >
                                        <div className="flex items-center justify-between gap-3">
                                          <span className="line-clamp-2 font-medium text-[13px] pr-2 leading-snug flex-1 font-sans">
                                            {item.query}
                                          </span>
                                          <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-[11px] font-sans font-semibold text-blue-600 dark:text-cyan-400 bg-blue-500/10 dark:bg-cyan-500/10 border border-blue-500/20 dark:border-cyan-500/20 px-2 py-0.5 rounded-md">
                                              {isExpanded ? 'Hide' : 'View'}
                                            </span>
                                            {isExpanded ? (
                                              <ChevronUp className="w-4 h-4 text-slate-400" />
                                            ) : (
                                              <ChevronDown className="w-4 h-4 text-slate-400" />
                                            )}
                                          </div>
                                        </div>
                                        {tsLabel && (
                                          <span className="text-xs text-slate-400 font-sans">
                                            {tsLabel}
                                          </span>
                                        )}
                                      </button>

                                      <AnimatePresence initial={false}>
                                        {isExpanded && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="border-t border-slate-200/80 dark:border-slate-800 p-3 bg-white/60 dark:bg-slate-950/60"
                                          >
                                            <p className="text-[12.5px] text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                                              {item.answer}
                                            </p>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </>
                      );
                    })()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MAIN CONTENT AREA */}
            {!isMinimized && (
              <>
                <motion.main
                  className="flex-1 overflow-y-auto p-4 space-y-4 z-10 select-text"
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start items-start gap-2'}`}
                    >
                      {/* Bot Avatar Badge on Left */}
                      {msg.sender === 'bot' && (
                        <div className="w-6 h-6 rounded-full bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/20 dark:border-teal-500/20 flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                          <SmartNavLogo className="w-4 h-4" animated={false} />
                        </div>
                      )}

                      <div
                        className={`max-w-[82%] rounded-2xl px-4 py-2.5 leading-relaxed select-text font-sans shadow-sm border transition-all duration-300 ${chatTextSize === 'large' ? 'text-[15px]' : 'text-[13.5px]'
                          } ${msg.sender === 'user'
                            ? 'bg-blue-600 border-blue-600 text-white rounded-br-xs font-medium ml-auto'
                            : 'bg-slate-100 dark:bg-[#1a1a24] border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs'
                          }`}
                      >
                        {renderMessageContent(msg.text)}

                        {/* Render inline map preview if a location link or redirect target is found */}
                        {msg.sender === 'bot' && !msg.isError && (
                          (() => {
                            const loc = extractLocationDetails(msg)
                            if (loc && searchIndex[loc.floorKey]) {
                              const targetFloorData = searchIndex[loc.floorKey]
                              return (
                                <div
                                  onClick={() => {
                                    toast.info(`Redirecting to ${loc.roomId || targetFloorData.label}...`)
                                    navigate(loc.rawUrl)
                                    setIsOpen(false)
                                  }}
                                  className="mt-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden h-[130px] w-full relative cursor-pointer group/map shadow-sm transition-all hover:border-blue-500/40 select-none"
                                >
                                  {/* Small map indicator banner */}
                                  <div className="absolute top-1.5 left-1.5 z-10 px-2 py-0.5 bg-slate-900/80 backdrop-blur-md rounded-md flex items-center gap-1.5 pointer-events-none">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[11px] font-sans font-semibold text-white tracking-wide">
                                      {targetFloorData.label} Map Preview
                                    </span>
                                  </div>

                                  {/* Hover overlay with button */}
                                  <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover/map:opacity-100 transition-opacity flex items-center justify-center z-10 backdrop-blur-[1px]">
                                    <div className="bg-blue-600 text-white font-sans font-semibold text-xs tracking-wide px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 scale-90 group-hover/map:scale-100 transition-transform">
                                      <Maximize2 className="w-3.5 h-3.5" />
                                      Open Map View
                                    </div>
                                  </div>

                                  {/* Render static scaled svg container */}
                                  <div className="w-full h-full pointer-events-none">
                                    <FloorMapSVG
                                      floorData={targetFloorData}
                                      isEditMode={false}
                                      highlightedRoomId={loc.roomId}
                                      activeFilters={[]}
                                    />
                                  </div>
                                </div>
                              )
                            }
                            return null
                          })()
                        )}

                        {/* Render minimalistic Redirect Button for searched locations */}
                        {msg.sender === 'bot' && !msg.isWelcome && !msg.isError && (
                          (() => {
                            const targets = getMsgLocationTargets(msg)

                            if (!targets || targets.length === 0) return null

                            return (
                              <div className="mt-3 flex flex-col gap-2 select-none">
                                {targets.map((target, tIdx) => (
                                  <button
                                    key={`redirect-${msg.id}-${tIdx}`}
                                    onClick={() => {
                                      toast.info(`Redirecting to ${target.title}...`)
                                      navigate(target.url)
                                      setIsOpen(false)
                                    }}
                                    className="w-full p-2.5 bg-blue-500/10 dark:bg-cyan-500/15 hover:bg-blue-500/20 dark:hover:bg-cyan-500/25 border border-blue-500/25 dark:border-cyan-400/30 rounded-xl transition-all duration-300 flex items-center justify-between gap-2.5 shadow-sm active:scale-[0.99] cursor-pointer group select-none"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                      <div className="w-7 h-7 rounded-lg bg-blue-500/15 dark:bg-cyan-400/15 border border-blue-500/30 dark:border-cyan-400/30 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/25 dark:group-hover:bg-cyan-400/25 transition-colors">
                                        <Navigation className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
                                      </div>
                                      <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                                        <span className="font-sans font-semibold text-[13px] text-blue-600 dark:text-cyan-300 tracking-wide truncate">
                                          Go to {target.title}
                                        </span>
                                        {target.floorLabel && (
                                          <span className="px-2 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-wider rounded-md bg-blue-500/10 dark:bg-cyan-400/15 text-blue-600/90 dark:text-cyan-300/90 border border-blue-500/20 dark:border-cyan-400/25 whitespace-nowrap flex-shrink-0">
                                            {target.floorLabel}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="w-6 h-6 rounded-lg bg-black/5 dark:bg-white/5 group-hover:bg-blue-500/20 dark:group-hover:bg-cyan-400/20 flex items-center justify-center flex-shrink-0 transition-colors">
                                      <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )
                          })()
                        )}

                        {/* Bot actions: Copy and Listen */}
                        {msg.sender === 'bot' && !msg.isWelcome && !msg.isError && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-3.5 select-none">
                            <button
                              onClick={() => handleCopyToClipboard(msg.text)}
                              className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1 text-[11px] font-sans font-semibold"
                              title="Copy response to clipboard"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                              Copy
                            </button>
                            <button
                              onClick={() => handleToggleSpeech(msg.id, msg.text)}
                              className={`transition-colors flex items-center gap-1 text-[11px] font-sans font-semibold ${activeSpeech === msg.id
                                  ? 'text-emerald-500 dark:text-emerald-400 animate-pulse'
                                  : 'text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400'
                                }`}
                              title="Read response aloud"
                            >
                              {activeSpeech === msg.id ? (
                                <>
                                  <span className="flex h-1.5 w-1.5 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                  </span>
                                  Stop
                                </>
                              ) : (
                                <>
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                  </svg>
                                  Listen
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Clean thinking state */}
                  {isLoading && (
                    <div className="flex justify-start gap-2.5 animate-fade-in">
                      <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 mt-0.5">
                        <SmartNavLogo className="w-4 h-4" animated={false} />
                      </div>

                      <div className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-xs px-3.5 py-2 shadow-sm font-sans text-xs flex items-center gap-2">
                        <span>Thinking...</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </motion.main>

                {/* Natural Footer */}
                <motion.footer
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
                    }
                  }}
                  className="relative z-10 p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 backdrop-blur-md"
                >
                  <AnimatePresence>
                    {duplicateWarning && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        className="mb-2.5 p-3 bg-blue-50 dark:bg-slate-900 border border-blue-200 dark:border-slate-800 rounded-xl flex flex-col gap-1.5 select-text"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-blue-600 dark:text-cyan-400 font-sans font-semibold text-xs">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Similar Query Found</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDuplicateWarning(null)}
                            className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                          Found in your history: <strong>"{duplicateWarning.query}"</strong>. View past answer to save queries.
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setShowHistory(true);
                              setExpandedQAId(duplicateWarning.id);
                              setDuplicateWarning(null);
                              setInputValue('');
                              toast.info("Showing past answer from history!");
                              setTimeout(() => {
                                const element = document.getElementById(`qa-card-${duplicateWarning.id}`);
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                              }, 300);
                            }}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-sans font-semibold text-xs rounded-md transition-all active:scale-95 shadow-sm"
                          >
                            View Past Answer
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const textToSend = duplicateWarning.originalInputText || duplicateWarning.query;
                              setDuplicateWarning(null);
                              submitQuery(textToSend, true);
                              setInputValue('');
                            }}
                            className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-sans font-semibold text-xs rounded-md transition-all active:scale-95"
                          >
                            Send Anyway
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSend} className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-1 pl-4 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/15 transition-all duration-300 shadow-sm">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={queriesRemaining <= 0 ? "Query limit reached." : "Ask about rooms, departments, faculty, or directions..."}
                      disabled={isLoading || queriesRemaining <= 0}
                      className="flex-1 bg-transparent border-none text-[13px] md:text-[14px] text-slate-900 dark:text-slate-100 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-50 font-sans py-1.5 pr-10"
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isLoading || queriesRemaining <= 0}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 dark:disabled:text-slate-600 rounded-full transition-all duration-300 flex items-center justify-center shadow-sm disabled:shadow-none focus:outline-none cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                  {/* Natural disclaimer note */}
                  <div className="text-center text-[11px] font-sans text-slate-400 dark:text-slate-500 mt-2 select-none font-normal">
                    Campus Assistant helps with navigation. Verify critical routes before walking.
                  </div>
                </motion.footer>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}


