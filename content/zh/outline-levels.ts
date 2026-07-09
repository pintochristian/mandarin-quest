import type { LevelOutlineInput } from "@/lib/validation/content";

/**
 * Levels 2-8: structural outlines only (objectives, not full lesson bodies).
 * These seed as unpublished lessons with an `outline` payload so the whole
 * 8-level map is navigable end-to-end immediately. The admin panel's
 * content editor / JSON import is how these get fleshed out into full
 * lessons later, without any code changes (see Phase 7/8 of the build plan).
 */
export const outlineLevels: LevelOutlineInput[] = [
  // Level 2 ("Everyday Basics") used to be an outline here but now has full
  // lesson content authored in content/zh/imported/level2-content.json,
  // seeded via zhContent.fullyAuthoredLevels instead — keeping both would
  // have the outline pass (which runs after the full-content pass in
  // prisma/seed.ts) overwrite the real lessons back to isPublished: false.
  {
    index: 3,
    title: "Getting Around Town",
    description: "Take a taxi, catch the right bus, and never get lost.",
    themeColor: "sky",
    modules: [
      {
        index: 1,
        key: "transport",
        title: "Transport",
        description: "Catch a taxi, bus, or subway with confidence.",
        worldIcon: "bus",
        worldTheme: "transport",
        lessons: [
          {
            index: 1,
            title: "Taking a Taxi",
            situationTag: "taxi",
            grammarGoal: "Aspect particle 了 for completed actions",
            vocabularyGoal: "Taxi, address, turn left/right, stop here",
            conversationGoal: "Give a taxi driver your destination.",
          },
          {
            index: 2,
            title: "Catching the Bus",
            situationTag: "bus",
            grammarGoal: "Time expressions (点, 分) for telling time",
            vocabularyGoal: "Bus, subway, ticket, transfer, schedule",
            conversationGoal: "Ask when the next bus arrives.",
          },
        ],
      },
      {
        index: 2,
        key: "directions-2",
        title: "Advanced Directions",
        description: "Follow multi-step directions across town.",
        worldIcon: "signpost",
        worldTheme: "neighbourhood",
        lessons: [
          {
            index: 1,
            title: "Turn by Turn",
            situationTag: "directions",
            grammarGoal: "Directional complements (进/出/上/下 + 来/去)",
            vocabularyGoal: "Intersection, traffic light, straight ahead, block",
            conversationGoal: "Follow and give multi-step directions.",
          },
        ],
      },
    ],
  },
  {
    index: 4,
    title: "Social Life",
    description: "Stay in touch with friends and family.",
    themeColor: "rose",
    modules: [
      {
        index: 1,
        key: "friends-family",
        title: "Friends & Family",
        description: "Talk about your family and make plans with friends.",
        worldIcon: "users",
        worldTheme: "social",
        lessons: [
          {
            index: 1,
            title: "My Family",
            situationTag: "family",
            grammarGoal: "Measure word 个 as the general-purpose default",
            vocabularyGoal: "Parents, siblings, children, ages",
            conversationGoal: "Describe your immediate family.",
          },
          {
            index: 2,
            title: "Making Plans",
            situationTag: "plans",
            grammarGoal: "Time expressions for future plans (明天, 周末)",
            vocabularyGoal: "Weekend, free time, meet up, movie, invite",
            conversationGoal: "Propose a plan and agree on a time.",
          },
        ],
      },
      {
        index: 2,
        key: "phone-call",
        title: "Phone Call",
        description: "Hold a basic conversation over the phone.",
        worldIcon: "phone",
        worldTheme: "social",
        lessons: [
          {
            index: 1,
            title: "Can You Hear Me?",
            situationTag: "phone",
            grammarGoal: "Progressive aspect with 在 (zài + verb)",
            vocabularyGoal: "Phone, call back, busy signal, voicemail",
            conversationGoal: "Have a short phone conversation and reschedule a call.",
          },
        ],
      },
    ],
  },
  {
    index: 5,
    title: "Out and About",
    description: "Go shopping and navigate campus life.",
    themeColor: "violet",
    modules: [
      {
        index: 1,
        key: "shopping",
        title: "Shopping",
        description: "Browse, ask for a different size, and haggle politely.",
        worldIcon: "shopping-bag",
        worldTheme: "shopping",
        lessons: [
          {
            index: 1,
            title: "Just Looking",
            situationTag: "shopping",
            grammarGoal: "Result complements (买到, 找到) for successful actions",
            vocabularyGoal: "Size, color, try on, cheap, expensive",
            conversationGoal: "Ask to try something on and ask the price.",
          },
          {
            index: 2,
            title: "Can You Lower the Price?",
            situationTag: "shopping",
            grammarGoal: "把 (bǎ) construction for handling an object",
            vocabularyGoal: "Discount, too expensive, bargain, wrap it up",
            conversationGoal: "Politely negotiate a price.",
          },
        ],
      },
      {
        index: 2,
        key: "university",
        title: "University",
        description: "Talk about classes, majors, and campus life.",
        worldIcon: "graduation-cap",
        worldTheme: "university",
        lessons: [
          {
            index: 1,
            title: "What's Your Major?",
            situationTag: "university",
            grammarGoal: "Duration expressions (学了三年)",
            vocabularyGoal: "Major, class, professor, homework, exam",
            conversationGoal: "Ask and answer about field of study.",
          },
        ],
      },
    ],
  },
  {
    index: 6,
    title: "Travel",
    description: "Get through the airport and check into a hotel.",
    themeColor: "cyan",
    modules: [
      {
        index: 1,
        key: "airport",
        title: "Airport",
        description: "Check in, go through security, and find your gate.",
        worldIcon: "plane",
        worldTheme: "airport",
        lessons: [
          {
            index: 1,
            title: "Checking In",
            situationTag: "airport",
            grammarGoal: "被 (bèi) passive construction",
            vocabularyGoal: "Passport, boarding pass, luggage, gate, delayed",
            conversationGoal: "Check in for a flight and ask about a delay.",
          },
        ],
      },
      {
        index: 2,
        key: "hotel",
        title: "Hotel",
        description: "Check into a hotel and request what you need.",
        worldIcon: "bed",
        worldTheme: "hotel",
        lessons: [
          {
            index: 1,
            title: "Checking In",
            situationTag: "hotel",
            grammarGoal: "Modal verb 可以 (kěyǐ) for permission/requests",
            vocabularyGoal: "Reservation, room key, wifi, breakfast, checkout",
            conversationGoal: "Check into a hotel and ask about amenities.",
          },
        ],
      },
    ],
  },
  {
    index: 7,
    title: "Professional Life",
    description: "Hold your own in a Mandarin-speaking workplace.",
    themeColor: "slate",
    modules: [
      {
        index: 1,
        key: "office",
        title: "Office",
        description: "Introduce your job and coordinate with coworkers.",
        worldIcon: "briefcase",
        worldTheme: "office",
        lessons: [
          {
            index: 1,
            title: "What Do You Do?",
            situationTag: "office",
            grammarGoal: "Complex sentences with 因为...所以 (because...so)",
            vocabularyGoal: "Job title, department, colleague, deadline, meeting",
            conversationGoal: "Describe your job and department.",
          },
        ],
      },
      {
        index: 2,
        key: "business-meeting",
        title: "Business Meetings",
        description: "Participate in a simple business meeting.",
        worldIcon: "presentation",
        worldTheme: "office",
        lessons: [
          {
            index: 1,
            title: "Let's Get Started",
            situationTag: "business",
            grammarGoal: "Formal register and polite request forms (麻烦你...)",
            vocabularyGoal: "Agenda, proposal, budget, follow up, contract",
            conversationGoal: "Open a meeting and propose an agenda item.",
          },
        ],
      },
    ],
  },
  {
    index: 8,
    title: "Deeper Connections",
    description: "Navigate dating and hold nuanced, natural conversations.",
    themeColor: "pink",
    modules: [
      {
        index: 1,
        key: "dating",
        title: "Dating",
        description: "Ask someone out and talk about your interests.",
        worldIcon: "heart",
        worldTheme: "dating",
        lessons: [
          {
            index: 1,
            title: "Are You Free This Weekend?",
            situationTag: "dating",
            grammarGoal: "Tentative/soft suggestions with 要不要 and 吧",
            vocabularyGoal: "Interests, hobbies, favorite, compliment, date (outing)",
            conversationGoal: "Ask someone out and describe a shared interest.",
          },
        ],
      },
      {
        index: 2,
        key: "advanced-conversation",
        title: "Advanced Conversation",
        description: "Handle opinions, disagreement, and nuance.",
        worldIcon: "message-circle",
        worldTheme: "social",
        lessons: [
          {
            index: 1,
            title: "I Think That...",
            situationTag: "opinions",
            grammarGoal: "Opinion and contrast structures (虽然...但是...)",
            vocabularyGoal: "Opinion, agree, disagree, actually, in my view",
            conversationGoal:
              "State an opinion and politely disagree with someone else's.",
          },
        ],
      },
    ],
  },
];
