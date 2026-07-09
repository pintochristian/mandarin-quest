import type { LevelContentInput } from "@/lib/validation/content";

const ALL_MODES = [
  "MIC_SPEAKING",
  "TYPE_PINYIN",
  "TYPE_ENGLISH_GUIDED",
  "WORD_TILE_SELECT",
  "SENTENCE_REORDER",
  "DIALOGUE_CHOICE",
  "SHADOW_LISTEN",
  "AI_TEXT_CHAT",
] as const;

export const level1: LevelContentInput = {
  index: 1,
  title: "First Contact",
  description: "The words and phrases you need for your very first real conversations.",
  themeColor: "orange",
  modules: [
    // -------------------------------------------------------------------
    // Module 1: Meeting People
    // -------------------------------------------------------------------
    {
      index: 1,
      key: "meeting-people",
      title: "Meeting People",
      description: "Say hello, share your name, and ask someone else's.",
      worldIcon: "hand-heart",
      worldTheme: "neighbourhood",
      lessons: [
        {
          index: 1,
          title: "Meeting Someone",
          situationTag: "greetings",
          estimatedMinutes: 18,
          isPublished: true,
          grammar: {
            code: "pronouns-basic",
            title: "I, You, He/She",
            simpleExplanation:
              "Chinese pronouns don't change form the way English ones do — no 'I/me/my' to memorize. Just three words: 我 (wǒ) for I/me, 你 (nǐ) for you, and 他/她 (tā) for he/she. Add 们 (men) to any of them to make it plural: 我们 (wǒmen) = we.",
            visualExamples: [
              { script: "我", romanization: "wǒ", english: "I / me" },
              { script: "你", romanization: "nǐ", english: "you" },
              { script: "他", romanization: "tā", english: "he / him" },
              { script: "她", romanization: "tā", english: "she / her" },
              {
                script: "我们",
                romanization: "wǒmen",
                english: "we / us",
                note: "Add 们 (men) to make a pronoun plural",
              },
            ],
            difficulty: 1,
            quiz: [
              {
                prompt: "How do you say 'you' in Mandarin?",
                options: ["我", "你", "他", "们"],
                correctIndex: 1,
              },
              {
                prompt: "What does 我们 mean?",
                options: ["I", "you all", "we", "she"],
                correctIndex: 2,
              },
            ],
          },
          vocabulary: [
            { script: "你好", romanization: "nǐ hǎo", english: "hello" },
            { script: "我", romanization: "wǒ", english: "I / me" },
            { script: "你", romanization: "nǐ", english: "you" },
            { script: "是", romanization: "shì", english: "to be (am/is/are)" },
            { script: "叫", romanization: "jiào", english: "to be called" },
            { script: "什么", romanization: "shénme", english: "what" },
            { script: "名字", romanization: "míngzi", english: "name" },
            { script: "很", romanization: "hěn", english: "very" },
            { script: "高兴", romanization: "gāoxìng", english: "happy / glad" },
            {
              script: "认识",
              romanization: "rènshi",
              english: "to know (a person) / meet",
            },
          ],
          dialogue: {
            title: "Meeting Someone",
            situationTag: "greetings",
            lines: [
              {
                speaker: "A",
                script: "你好!",
                romanization: "Nǐ hǎo!",
                english: "Hello!",
              },
              {
                speaker: "B",
                script: "你好!我叫玛丽。你叫什么名字?",
                romanization: "Nǐ hǎo! Wǒ jiào Mǎlì. Nǐ jiào shénme míngzi?",
                english: "Hello! I'm called Mary. What's your name?",
              },
              {
                speaker: "A",
                script: "我叫大卫。很高兴认识你。",
                romanization: "Wǒ jiào Dàwèi. Hěn gāoxìng rènshi nǐ.",
                english: "I'm called David. Nice to meet you.",
              },
              {
                speaker: "B",
                script: "我也很高兴认识你!",
                romanization: "Wǒ yě hěn gāoxìng rènshi nǐ!",
                english: "I'm also happy to meet you!",
              },
            ],
          },
          exercises: [
            {
              type: "MULTIPLE_CHOICE",
              order: 1,
              prompt: "What does 你好 mean?",
              supportedModes: ["DIALOGUE_CHOICE"],
              data: {
                questionScript: "你好",
                questionRomanization: "nǐ hǎo",
                options: [
                  { text: "Hello", isCorrect: true },
                  { text: "Goodbye", isCorrect: false },
                  { text: "Thank you", isCorrect: false },
                  { text: "Sorry", isCorrect: false },
                ],
              },
            },
            {
              type: "LISTENING",
              order: 2,
              prompt: "Listen and choose what you hear.",
              supportedModes: ["SHADOW_LISTEN", "DIALOGUE_CHOICE"],
              data: {
                audioScript: "我叫大卫。",
                audioRomanization: "Wǒ jiào Dàwèi.",
                options: [
                  { text: "My name is David.", isCorrect: true },
                  { text: "Your name is David.", isCorrect: false },
                  { text: "His name is David.", isCorrect: false },
                  { text: "What is your name?", isCorrect: false },
                ],
              },
            },
            {
              type: "FILL_BLANK",
              order: 3,
              prompt: "Fill in the missing word.",
              supportedModes: ["TYPE_PINYIN", "WORD_TILE_SELECT"],
              data: {
                sentenceTemplate: "你___什么名字?",
                correctAnswer: "叫",
                choices: ["叫", "是", "很", "你"],
              },
            },
            {
              type: "TRANSLATION",
              order: 4,
              prompt: "Translate into Mandarin.",
              supportedModes: ["TYPE_ENGLISH_GUIDED", "TYPE_PINYIN"],
              data: {
                sourceText: "What is your name?",
                sourceLang: "en",
                correctAnswer: "你叫什么名字?",
                acceptableAnswers: ["你叫什么名字", "Nǐ jiào shénme míngzi?"],
              },
            },
            {
              type: "SPEAKING",
              order: 5,
              prompt: "Introduce yourself and say you're glad to meet them.",
              supportedModes: [...ALL_MODES],
              data: {
                targetScript: "我叫大卫。很高兴认识你。",
                targetRomanization: "Wǒ jiào Dàwèi. Hěn gāoxìng rènshi nǐ.",
                targetEnglish: "I'm called David. Nice to meet you.",
                tokens: ["我", "叫", "大卫", "很", "高兴", "认识", "你"],
                distractorTokens: ["他", "你们", "不"],
                acceptablePinyin: [
                  "wo jiao dawei hen gaoxing renshi ni",
                  "wǒ jiào dàwèi hěn gāoxìng rènshi nǐ",
                ],
                englishPrompt:
                  "Introduce yourself as David and say you're happy to meet them.",
                dialogueChoiceOptions: [
                  {
                    script: "很高兴认识你",
                    romanization: "Hěn gāoxìng rènshi nǐ",
                    english: "Nice to meet you",
                    isCorrect: true,
                  },
                  {
                    script: "再见",
                    romanization: "Zàijiàn",
                    english: "Goodbye",
                    isCorrect: false,
                  },
                  {
                    script: "对不起",
                    romanization: "Duìbùqǐ",
                    english: "Sorry",
                    isCorrect: false,
                  },
                ],
                aiScenarioPrompt:
                  "Roleplay meeting the learner for the first time. Greet them and ask their name, using only 你好/我/你/是/叫/什么/名字/很/高兴/认识/也.",
              },
            },
            {
              type: "RAPID_REVIEW",
              order: 6,
              prompt: "Quick review.",
              supportedModes: ["SHADOW_LISTEN"],
              data: {
                items: [
                  {
                    promptScript: "你好",
                    promptRomanization: "nǐ hǎo",
                    answerEnglish: "hello",
                  },
                  {
                    promptScript: "名字",
                    promptRomanization: "míngzi",
                    answerEnglish: "name",
                  },
                  {
                    promptScript: "认识",
                    promptRomanization: "rènshi",
                    answerEnglish: "to know / meet",
                  },
                ],
              },
            },
          ],
        },
        {
          index: 2,
          title: "Are You a Student?",
          situationTag: "greetings",
          estimatedMinutes: 18,
          isPublished: true,
          grammar: {
            code: "ma-questions",
            title: "Asking Yes/No Questions with 吗",
            simpleExplanation:
              "Want to ask a yes/no question? Just add 吗 (ma) to the end of any statement — no need to change the word order at all. 你是学生 (You are a student) becomes 你是学生吗? (Are you a student?).",
            visualExamples: [
              {
                script: "你是学生。",
                romanization: "Nǐ shì xuéshēng.",
                english: "You are a student.",
              },
              {
                script: "你是学生吗?",
                romanization: "Nǐ shì xuéshēng ma?",
                english: "Are you a student?",
                note: "Add 吗 to turn a statement into a question",
              },
              {
                script: "你是美国人吗?",
                romanization: "Nǐ shì měiguó rén ma?",
                english: "Are you American?",
              },
            ],
            difficulty: 1,
            quiz: [
              {
                prompt: "How do you turn 你是老师 into a question?",
                options: [
                  "Add 吗 at the end",
                  "Change the word order",
                  "Add 你 twice",
                  "Remove 是",
                ],
                correctIndex: 0,
              },
              {
                prompt: "你忙吗? means:",
                options: ["You are busy.", "Are you busy?", "I am busy.", "Is he busy?"],
                correctIndex: 1,
              },
            ],
          },
          vocabulary: [
            {
              script: "吗",
              romanization: "ma",
              english: "question particle (turns a statement into a yes/no question)",
            },
            { script: "学生", romanization: "xuéshēng", english: "student" },
            { script: "老师", romanization: "lǎoshī", english: "teacher" },
            { script: "美国人", romanization: "měiguó rén", english: "American person" },
            { script: "中国人", romanization: "zhōngguó rén", english: "Chinese person" },
            { script: "人", romanization: "rén", english: "person" },
            { script: "不", romanization: "bù", english: "not / no" },
            { script: "忙", romanization: "máng", english: "busy" },
            { script: "医生", romanization: "yīshēng", english: "doctor" },
          ],
          dialogue: {
            title: "Are You a Student?",
            situationTag: "greetings",
            lines: [
              {
                speaker: "A",
                script: "你是学生吗?",
                romanization: "Nǐ shì xuéshēng ma?",
                english: "Are you a student?",
              },
              {
                speaker: "B",
                script: "是,我是学生。你也是学生吗?",
                romanization: "Shì, wǒ shì xuéshēng. Nǐ yě shì xuéshēng ma?",
                english: "Yes, I am a student. Are you also a student?",
              },
              {
                speaker: "A",
                script: "不是,我是老师。",
                romanization: "Bú shì, wǒ shì lǎoshī.",
                english: "No, I am a teacher.",
              },
              {
                speaker: "B",
                script: "你是美国人吗?",
                romanization: "Nǐ shì měiguó rén ma?",
                english: "Are you American?",
              },
              {
                speaker: "A",
                script: "不是,我是中国人。",
                romanization: "Bú shì, wǒ shì zhōngguó rén.",
                english: "No, I am Chinese.",
              },
            ],
          },
          exercises: [
            {
              type: "MULTIPLE_CHOICE",
              order: 1,
              prompt: "你是学生吗? asks:",
              supportedModes: ["DIALOGUE_CHOICE"],
              data: {
                questionScript: "你是学生吗?",
                questionRomanization: "Nǐ shì xuéshēng ma?",
                options: [
                  { text: "Are you a student?", isCorrect: true },
                  { text: "You are a student.", isCorrect: false },
                  { text: "I am a student.", isCorrect: false },
                  { text: "Is he a student?", isCorrect: false },
                ],
              },
            },
            {
              type: "LISTENING",
              order: 2,
              prompt: "Listen and choose what you hear.",
              supportedModes: ["SHADOW_LISTEN", "DIALOGUE_CHOICE"],
              data: {
                audioScript: "我是老师。",
                audioRomanization: "Wǒ shì lǎoshī.",
                options: [
                  { text: "I am a teacher.", isCorrect: true },
                  { text: "I am a student.", isCorrect: false },
                  { text: "You are a teacher.", isCorrect: false },
                  { text: "He is a teacher.", isCorrect: false },
                ],
              },
            },
            {
              type: "FILL_BLANK",
              order: 3,
              prompt: "Fill in the missing word.",
              supportedModes: ["TYPE_PINYIN", "WORD_TILE_SELECT"],
              data: {
                sentenceTemplate: "你是中国人___?",
                correctAnswer: "吗",
                choices: ["吗", "呢", "不", "是"],
              },
            },
            {
              type: "TRANSLATION",
              order: 4,
              prompt: "Translate into Mandarin.",
              supportedModes: ["TYPE_ENGLISH_GUIDED", "TYPE_PINYIN"],
              data: {
                sourceText: "Are you busy?",
                sourceLang: "en",
                correctAnswer: "你忙吗?",
                acceptableAnswers: ["你忙吗", "Nǐ máng ma?"],
              },
            },
            {
              type: "SPEAKING",
              order: 5,
              prompt: "Say no, and tell them you're a teacher.",
              supportedModes: [...ALL_MODES],
              data: {
                targetScript: "不是,我是老师。",
                targetRomanization: "Bú shì, wǒ shì lǎoshī.",
                targetEnglish: "No, I am a teacher.",
                tokens: ["不是", "我", "是", "老师"],
                distractorTokens: ["学生", "你", "吗"],
                acceptablePinyin: ["bu shi wo shi laoshi", "bú shì wǒ shì lǎoshī"],
                englishPrompt: "Say no, and tell them you're a teacher.",
                dialogueChoiceOptions: [
                  {
                    script: "不是,我是老师。",
                    romanization: "Bú shì, wǒ shì lǎoshī.",
                    english: "No, I'm a teacher.",
                    isCorrect: true,
                  },
                  {
                    script: "是,我很忙。",
                    romanization: "Shì, wǒ hěn máng.",
                    english: "Yes, I'm very busy.",
                    isCorrect: false,
                  },
                  {
                    script: "你好!",
                    romanization: "Nǐ hǎo!",
                    english: "Hello!",
                    isCorrect: false,
                  },
                ],
                aiScenarioPrompt:
                  "Ask the learner if they are a student using 吗, then react to their answer using only words taught so far.",
              },
            },
            {
              type: "RAPID_REVIEW",
              order: 6,
              prompt: "Quick review.",
              supportedModes: ["SHADOW_LISTEN"],
              data: {
                items: [
                  {
                    promptScript: "学生",
                    promptRomanization: "xuéshēng",
                    answerEnglish: "student",
                  },
                  {
                    promptScript: "老师",
                    promptRomanization: "lǎoshī",
                    answerEnglish: "teacher",
                  },
                  {
                    promptScript: "忙",
                    promptRomanization: "máng",
                    answerEnglish: "busy",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------
    // Module 2: Coffee Shop
    // -------------------------------------------------------------------
    {
      index: 2,
      key: "coffee-shop",
      title: "Coffee Shop",
      description: "Order a drink and talk about what belongs to whom.",
      worldIcon: "coffee",
      worldTheme: "coffee-shop",
      lessons: [
        {
          index: 1,
          title: "Ordering a Drink",
          situationTag: "ordering",
          estimatedMinutes: 18,
          isPublished: true,
          grammar: {
            code: "yao-measure-words",
            title: "I'd Like... (要 + Measure Words)",
            simpleExplanation:
              "要 (yào) means 'to want.' To order something, say 要 plus a number plus a measure word plus the thing itself — like saying 'one cup of coffee' instead of just 'coffee.' The measure word for drinks is 杯 (bēi, cup): 我要一杯咖啡 = I'd like a cup of coffee.",
            visualExamples: [
              {
                script: "我要咖啡。",
                romanization: "Wǒ yào kāfēi.",
                english: "I want coffee.",
              },
              {
                script: "我要一杯咖啡。",
                romanization: "Wǒ yào yì bēi kāfēi.",
                english: "I'd like a cup of coffee.",
                note: "一杯 = one cup — the measure word 杯 sits between the number and the noun",
              },
              {
                script: "我要两杯茶。",
                romanization: "Wǒ yào liǎng bēi chá.",
                english: "I'd like two cups of tea.",
              },
            ],
            difficulty: 2,
            quiz: [
              {
                prompt: "Which word means 'to want'?",
                options: ["杯", "要", "茶", "一"],
                correctIndex: 1,
              },
              {
                prompt: "What is the measure word for a cup of a drink?",
                options: ["个", "杯", "本", "只"],
                correctIndex: 1,
              },
            ],
          },
          vocabulary: [
            { script: "要", romanization: "yào", english: "to want" },
            { script: "一", romanization: "yī", english: "one" },
            { script: "杯", romanization: "bēi", english: "cup (measure word)" },
            { script: "咖啡", romanization: "kāfēi", english: "coffee" },
            { script: "茶", romanization: "chá", english: "tea" },
            { script: "两", romanization: "liǎng", english: "two" },
            { script: "水", romanization: "shuǐ", english: "water" },
            { script: "谢谢", romanization: "xièxie", english: "thank you" },
            {
              script: "多少钱",
              romanization: "duōshǎo qián",
              english: "how much (money)?",
            },
            { script: "好的", romanization: "hǎo de", english: "okay" },
          ],
          dialogue: {
            title: "At the Coffee Shop",
            situationTag: "ordering",
            lines: [
              {
                speaker: "Barista",
                script: "你好!你要什么?",
                romanization: "Nǐ hǎo! Nǐ yào shénme?",
                english: "Hello! What would you like?",
              },
              {
                speaker: "Customer",
                script: "我要一杯咖啡。",
                romanization: "Wǒ yào yì bēi kāfēi.",
                english: "I'd like a cup of coffee.",
              },
              {
                speaker: "Barista",
                script: "好的。你也要茶吗?",
                romanization: "Hǎo de. Nǐ yě yào chá ma?",
                english: "Okay. Would you also like tea?",
              },
              {
                speaker: "Customer",
                script: "不要,谢谢。多少钱?",
                romanization: "Bú yào, xièxie. Duōshǎo qián?",
                english: "No thanks. How much is it?",
              },
              {
                speaker: "Barista",
                script: "十五块。",
                romanization: "Shíwǔ kuài.",
                english: "Fifteen yuan.",
              },
            ],
          },
          exercises: [
            {
              type: "MULTIPLE_CHOICE",
              order: 1,
              prompt: "我要一杯咖啡 means:",
              supportedModes: ["DIALOGUE_CHOICE"],
              data: {
                questionScript: "我要一杯咖啡。",
                questionRomanization: "Wǒ yào yì bēi kāfēi.",
                options: [
                  { text: "I'd like a cup of coffee.", isCorrect: true },
                  { text: "I have a cup of coffee.", isCorrect: false },
                  { text: "Do you want coffee?", isCorrect: false },
                  { text: "I don't want coffee.", isCorrect: false },
                ],
              },
            },
            {
              type: "LISTENING",
              order: 2,
              prompt: "Listen and choose what you hear.",
              supportedModes: ["SHADOW_LISTEN", "DIALOGUE_CHOICE"],
              data: {
                audioScript: "你要什么?",
                audioRomanization: "Nǐ yào shénme?",
                options: [
                  { text: "What would you like?", isCorrect: true },
                  { text: "How much is it?", isCorrect: false },
                  { text: "Do you want tea?", isCorrect: false },
                  { text: "Thank you.", isCorrect: false },
                ],
              },
            },
            {
              type: "FILL_BLANK",
              order: 3,
              prompt: "Fill in the missing word.",
              supportedModes: ["TYPE_PINYIN", "WORD_TILE_SELECT"],
              data: {
                sentenceTemplate: "我要一___咖啡。",
                correctAnswer: "杯",
                choices: ["杯", "个", "本", "是"],
              },
            },
            {
              type: "TRANSLATION",
              order: 4,
              prompt: "Translate into Mandarin.",
              supportedModes: ["TYPE_ENGLISH_GUIDED", "TYPE_PINYIN"],
              data: {
                sourceText: "I'd like two cups of tea.",
                sourceLang: "en",
                correctAnswer: "我要两杯茶。",
                acceptableAnswers: ["我要两杯茶", "Wǒ yào liǎng bēi chá."],
              },
            },
            {
              type: "SPEAKING",
              order: 5,
              prompt: "Order one cup of coffee and say thank you.",
              supportedModes: [...ALL_MODES],
              data: {
                targetScript: "我要一杯咖啡,谢谢。",
                targetRomanization: "Wǒ yào yì bēi kāfēi, xièxie.",
                targetEnglish: "I'd like a cup of coffee, thanks.",
                tokens: ["我", "要", "一", "杯", "咖啡", "谢谢"],
                distractorTokens: ["两", "茶", "不"],
                acceptablePinyin: [
                  "wo yao yi bei kafei xiexie",
                  "wǒ yào yì bēi kāfēi xièxie",
                ],
                englishPrompt: "Order one cup of coffee and say thank you.",
                dialogueChoiceOptions: [
                  {
                    script: "我要一杯咖啡,谢谢。",
                    romanization: "Wǒ yào yì bēi kāfēi, xièxie.",
                    english: "I'd like a cup of coffee, thanks.",
                    isCorrect: true,
                  },
                  {
                    script: "多少钱?",
                    romanization: "Duōshǎo qián?",
                    english: "How much is it?",
                    isCorrect: false,
                  },
                  {
                    script: "你好吗?",
                    romanization: "Nǐ hǎo ma?",
                    english: "How are you?",
                    isCorrect: false,
                  },
                ],
                aiScenarioPrompt:
                  "Play a barista. Ask what the learner wants to drink and respond, using only 你/要/什么/一/两/杯/咖啡/茶/水/谢谢/多少钱/好的.",
              },
            },
            {
              type: "RAPID_REVIEW",
              order: 6,
              prompt: "Quick review.",
              supportedModes: ["SHADOW_LISTEN"],
              data: {
                items: [
                  {
                    promptScript: "咖啡",
                    promptRomanization: "kāfēi",
                    answerEnglish: "coffee",
                  },
                  { promptScript: "茶", promptRomanization: "chá", answerEnglish: "tea" },
                  {
                    promptScript: "多少钱",
                    promptRomanization: "duōshǎo qián",
                    answerEnglish: "how much (money)?",
                  },
                ],
              },
            },
          ],
        },
        {
          index: 2,
          title: "Is This Yours?",
          situationTag: "ordering",
          estimatedMinutes: 18,
          isPublished: true,
          grammar: {
            code: "shi-negation",
            title: "This Is / This Isn't (是 and 不)",
            simpleExplanation:
              "是 (shì) means 'is/am/are' — it links two things together, like 这是咖啡 (This is coffee). To say something is NOT the case, put 不 right before 是: 这不是茶 (This isn't tea). 不 is your all-purpose 'not' — it goes right before the word you're negating.",
            visualExamples: [
              {
                script: "这是咖啡。",
                romanization: "Zhè shì kāfēi.",
                english: "This is coffee.",
              },
              {
                script: "这不是茶。",
                romanization: "Zhè bú shì chá.",
                english: "This isn't tea.",
                note: "不 goes right before 是 to negate it",
              },
              {
                script: "那是我的水。",
                romanization: "Nà shì wǒ de shuǐ.",
                english: "That is my water.",
              },
            ],
            difficulty: 2,
            quiz: [
              {
                prompt: "How do you say 'This is not tea'?",
                options: ["这是不茶", "这不是茶", "不这是茶", "这茶不是"],
                correctIndex: 1,
              },
              {
                prompt: "这 means:",
                options: ["that", "this", "is", "not"],
                correctIndex: 1,
              },
            ],
          },
          vocabulary: [
            { script: "这", romanization: "zhè", english: "this" },
            { script: "那", romanization: "nà", english: "that" },
            {
              script: "的",
              romanization: "de",
              english: "possessive/descriptive particle (my/your/...)",
            },
            { script: "东西", romanization: "dōngxi", english: "thing" },
            { script: "对", romanization: "duì", english: "correct / right" },
            { script: "对不起", romanization: "duìbùqǐ", english: "sorry" },
            {
              script: "没关系",
              romanization: "méi guānxi",
              english: "it's okay / no problem",
            },
            { script: "好喝", romanization: "hǎohē", english: "tasty (for a drink)" },
          ],
          dialogue: {
            title: "Is This Yours?",
            situationTag: "ordering",
            lines: [
              {
                speaker: "A",
                script: "对不起,这是你的咖啡吗?",
                romanization: "Duìbùqǐ, zhè shì nǐ de kāfēi ma?",
                english: "Sorry, is this your coffee?",
              },
              {
                speaker: "B",
                script: "不是,那是我的。这是你的水。",
                romanization: "Bú shì, nà shì wǒ de. Zhè shì nǐ de shuǐ.",
                english: "No, that's mine. This is your water.",
              },
              {
                speaker: "A",
                script: "啊,对!谢谢。",
                romanization: "À, duì! Xièxie.",
                english: "Oh, right! Thanks.",
              },
              {
                speaker: "B",
                script: "没关系。你的咖啡好喝吗?",
                romanization: "Méi guānxi. Nǐ de kāfēi hǎohē ma?",
                english: "No problem. Is your coffee good?",
              },
              {
                speaker: "A",
                script: "很好喝!",
                romanization: "Hěn hǎohē!",
                english: "Very tasty!",
              },
            ],
          },
          exercises: [
            {
              type: "MULTIPLE_CHOICE",
              order: 1,
              prompt: "这不是茶 means:",
              supportedModes: ["DIALOGUE_CHOICE"],
              data: {
                questionScript: "这不是茶。",
                questionRomanization: "Zhè bú shì chá.",
                options: [
                  { text: "This isn't tea.", isCorrect: true },
                  { text: "This is tea.", isCorrect: false },
                  { text: "That isn't tea.", isCorrect: false },
                  { text: "Is this tea?", isCorrect: false },
                ],
              },
            },
            {
              type: "LISTENING",
              order: 2,
              prompt: "Listen and choose what you hear.",
              supportedModes: ["SHADOW_LISTEN", "DIALOGUE_CHOICE"],
              data: {
                audioScript: "那是我的。",
                audioRomanization: "Nà shì wǒ de.",
                options: [
                  { text: "That is mine.", isCorrect: true },
                  { text: "This is mine.", isCorrect: false },
                  { text: "That is yours.", isCorrect: false },
                  { text: "That is not mine.", isCorrect: false },
                ],
              },
            },
            {
              type: "FILL_BLANK",
              order: 3,
              prompt: "Fill in the missing word.",
              supportedModes: ["TYPE_PINYIN", "WORD_TILE_SELECT"],
              data: {
                sentenceTemplate: "这不___你的咖啡。",
                correctAnswer: "是",
                choices: ["是", "不", "的", "这"],
              },
            },
            {
              type: "TRANSLATION",
              order: 4,
              prompt: "Translate into Mandarin.",
              supportedModes: ["TYPE_ENGLISH_GUIDED", "TYPE_PINYIN"],
              data: {
                sourceText: "This is my water.",
                sourceLang: "en",
                correctAnswer: "这是我的水。",
                acceptableAnswers: ["这是我的水", "Zhè shì wǒ de shuǐ."],
              },
            },
            {
              type: "SPEAKING",
              order: 5,
              prompt: "Apologize and say this isn't their coffee.",
              supportedModes: [...ALL_MODES],
              data: {
                targetScript: "对不起,这不是你的咖啡。",
                targetRomanization: "Duìbùqǐ, zhè bú shì nǐ de kāfēi.",
                targetEnglish: "Sorry, this isn't your coffee.",
                tokens: ["对不起", "这", "不是", "你", "的", "咖啡"],
                distractorTokens: ["那", "水", "是"],
                acceptablePinyin: [
                  "duibuqi zhe bushi ni de kafei",
                  "duìbùqǐ zhè bú shì nǐ de kāfēi",
                ],
                englishPrompt: "Apologize and say this isn't their coffee.",
                dialogueChoiceOptions: [
                  {
                    script: "对不起,这不是你的咖啡。",
                    romanization: "Duìbùqǐ, zhè bú shì nǐ de kāfēi.",
                    english: "Sorry, this isn't your coffee.",
                    isCorrect: true,
                  },
                  {
                    script: "没关系,谢谢。",
                    romanization: "Méi guānxi, xièxie.",
                    english: "No problem, thanks.",
                    isCorrect: false,
                  },
                  {
                    script: "你要咖啡吗?",
                    romanization: "Nǐ yào kāfēi ma?",
                    english: "Do you want coffee?",
                    isCorrect: false,
                  },
                ],
                aiScenarioPrompt:
                  "Hold up two drinks and ask the learner which one is theirs, using only 这/那/是/不/的/你/我/咖啡/水/茶/对不起/没关系/好喝.",
              },
            },
            {
              type: "RAPID_REVIEW",
              order: 6,
              prompt: "Quick review.",
              supportedModes: ["SHADOW_LISTEN"],
              data: {
                items: [
                  {
                    promptScript: "这",
                    promptRomanization: "zhè",
                    answerEnglish: "this",
                  },
                  { promptScript: "那", promptRomanization: "nà", answerEnglish: "that" },
                  {
                    promptScript: "对不起",
                    promptRomanization: "duìbùqǐ",
                    answerEnglish: "sorry",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------
    // Module 3: Getting Around
    // -------------------------------------------------------------------
    {
      index: 3,
      key: "getting-around",
      title: "Getting Around",
      description: "Ask where something is and understand the answer.",
      worldIcon: "map-pin",
      worldTheme: "neighbourhood",
      lessons: [
        {
          index: 1,
          title: "Where Is It?",
          situationTag: "directions",
          estimatedMinutes: 18,
          isPublished: true,
          grammar: {
            code: "zai-nar-location",
            title: "Where Is It? (在 + 哪儿)",
            simpleExplanation:
              "在 (zài) means 'is located at.' To ask where something is, use 在哪儿 (zài nǎr) — literally 'is-located-at where.' 洗手间在哪儿? = Where's the bathroom? To answer, just swap 哪儿 for the place: 洗手间在这儿 (The bathroom is here).",
            visualExamples: [
              {
                script: "洗手间在哪儿?",
                romanization: "Xǐshǒujiān zài nǎr?",
                english: "Where is the bathroom?",
              },
              {
                script: "洗手间在这儿。",
                romanization: "Xǐshǒujiān zài zhèr.",
                english: "The bathroom is here.",
                note: "这儿 = here, 那儿 = there",
              },
              {
                script: "银行在那儿。",
                romanization: "Yínháng zài nàr.",
                english: "The bank is over there.",
              },
            ],
            difficulty: 2,
            quiz: [
              {
                prompt: "哪儿 means:",
                options: ["here", "there", "where", "bathroom"],
                correctIndex: 2,
              },
              {
                prompt: "How do you ask 'Where is the bank?'",
                options: ["银行在哪儿?", "哪儿在银行?", "银行是哪儿?", "在银行哪儿?"],
                correctIndex: 0,
              },
            ],
          },
          vocabulary: [
            { script: "在", romanization: "zài", english: "to be located at" },
            { script: "哪儿", romanization: "nǎr", english: "where" },
            { script: "这儿", romanization: "zhèr", english: "here" },
            { script: "那儿", romanization: "nàr", english: "there" },
            {
              script: "洗手间",
              romanization: "xǐshǒujiān",
              english: "bathroom / restroom",
            },
            { script: "银行", romanization: "yínháng", english: "bank" },
            { script: "火车站", romanization: "huǒchēzhàn", english: "train station" },
            { script: "附近", romanization: "fùjìn", english: "nearby" },
            { script: "请问", romanization: "qǐngwèn", english: "excuse me / may I ask" },
          ],
          dialogue: {
            title: "Asking for Directions",
            situationTag: "directions",
            lines: [
              {
                speaker: "A",
                script: "请问,洗手间在哪儿?",
                romanization: "Qǐngwèn, xǐshǒujiān zài nǎr?",
                english: "Excuse me, where's the bathroom?",
              },
              {
                speaker: "B",
                script: "在那儿。",
                romanization: "Zài nàr.",
                english: "It's over there.",
              },
              {
                speaker: "A",
                script: "谢谢!火车站也在附近吗?",
                romanization: "Xièxie! Huǒchēzhàn yě zài fùjìn ma?",
                english: "Thanks! Is the train station also nearby?",
              },
              {
                speaker: "B",
                script: "不在,火车站不在附近。银行在附近。",
                romanization: "Bú zài, huǒchēzhàn bú zài fùjìn. Yínháng zài fùjìn.",
                english: "No, the train station isn't nearby. The bank is nearby.",
              },
              {
                speaker: "A",
                script: "好的,谢谢你!",
                romanization: "Hǎo de, xièxie nǐ!",
                english: "Okay, thank you!",
              },
            ],
          },
          exercises: [
            {
              type: "MULTIPLE_CHOICE",
              order: 1,
              prompt: "洗手间在哪儿? means:",
              supportedModes: ["DIALOGUE_CHOICE"],
              data: {
                questionScript: "洗手间在哪儿?",
                questionRomanization: "Xǐshǒujiān zài nǎr?",
                options: [
                  { text: "Where is the bathroom?", isCorrect: true },
                  { text: "The bathroom is here.", isCorrect: false },
                  { text: "Is there a bathroom?", isCorrect: false },
                  { text: "What is the bathroom?", isCorrect: false },
                ],
              },
            },
            {
              type: "LISTENING",
              order: 2,
              prompt: "Listen and choose what you hear.",
              supportedModes: ["SHADOW_LISTEN", "DIALOGUE_CHOICE"],
              data: {
                audioScript: "银行在附近。",
                audioRomanization: "Yínháng zài fùjìn.",
                options: [
                  { text: "The bank is nearby.", isCorrect: true },
                  { text: "The bank is far.", isCorrect: false },
                  { text: "Where is the bank?", isCorrect: false },
                  { text: "The bank is here.", isCorrect: false },
                ],
              },
            },
            {
              type: "FILL_BLANK",
              order: 3,
              prompt: "Fill in the missing word.",
              supportedModes: ["TYPE_PINYIN", "WORD_TILE_SELECT"],
              data: {
                sentenceTemplate: "火车站___哪儿?",
                correctAnswer: "在",
                choices: ["在", "是", "要", "的"],
              },
            },
            {
              type: "TRANSLATION",
              order: 4,
              prompt: "Translate into Mandarin.",
              supportedModes: ["TYPE_ENGLISH_GUIDED", "TYPE_PINYIN"],
              data: {
                sourceText: "Excuse me, where is the bank?",
                sourceLang: "en",
                correctAnswer: "请问,银行在哪儿?",
                acceptableAnswers: ["请问,银行在哪儿", "Qǐngwèn, yínháng zài nǎr?"],
              },
            },
            {
              type: "SPEAKING",
              order: 5,
              prompt: "Politely ask where the bathroom is.",
              supportedModes: [...ALL_MODES],
              data: {
                targetScript: "请问,洗手间在哪儿?",
                targetRomanization: "Qǐngwèn, xǐshǒujiān zài nǎr?",
                targetEnglish: "Excuse me, where is the bathroom?",
                tokens: ["请问", "洗手间", "在", "哪儿"],
                distractorTokens: ["银行", "这儿", "不"],
                acceptablePinyin: [
                  "qingwen xishoujian zai nar",
                  "qǐngwèn xǐshǒujiān zài nǎr",
                ],
                englishPrompt: "Politely ask where the bathroom is.",
                dialogueChoiceOptions: [
                  {
                    script: "在那儿。",
                    romanization: "Zài nàr.",
                    english: "It's over there.",
                    isCorrect: true,
                  },
                  {
                    script: "我要咖啡。",
                    romanization: "Wǒ yào kāfēi.",
                    english: "I want coffee.",
                    isCorrect: false,
                  },
                  {
                    script: "很高兴认识你。",
                    romanization: "Hěn gāoxìng rènshi nǐ.",
                    english: "Nice to meet you.",
                    isCorrect: false,
                  },
                ],
                aiScenarioPrompt:
                  "Play a stranger on the street. Answer the learner's questions about where things are located, using only 在/哪儿/这儿/那儿/洗手间/银行/火车站/附近/请问/谢谢.",
              },
            },
            {
              type: "RAPID_REVIEW",
              order: 6,
              prompt: "Quick review.",
              supportedModes: ["SHADOW_LISTEN"],
              data: {
                items: [
                  {
                    promptScript: "在",
                    promptRomanization: "zài",
                    answerEnglish: "to be located at",
                  },
                  {
                    promptScript: "哪儿",
                    promptRomanization: "nǎr",
                    answerEnglish: "where",
                  },
                  {
                    promptScript: "附近",
                    promptRomanization: "fùjìn",
                    answerEnglish: "nearby",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};
