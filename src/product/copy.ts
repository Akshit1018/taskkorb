import {GEMINI_KEY_HELP_URL} from './identity';

export type UiLang = 'en' | 'hi';

export function uiLanguage(
  prefs: {language: 'auto' | 'en' | 'hi'},
  navigatorLanguage = '',
): UiLang {
  if (prefs.language === 'hi') {
    return 'hi';
  }
  if (prefs.language === 'en') {
    return 'en';
  }
  return navigatorLanguage.toLowerCase().startsWith('hi') ? 'hi' : 'en';
}

export function talkHint(talkMode: 'hold' | 'tap', lang: UiLang): string {
  if (talkMode === 'tap') {
    return lang === 'hi' ? 'बात पर टैप करें और बोलें।' : 'Tap Talk and speak.';
  }
  return lang === 'hi' ? 'बात दबाकर रखें और बोलें।' : 'Hold Talk and speak.';
}

const STATUS_HI: Record<string, string> = {
  'Add a Gemini API key to begin.': 'शुरू करने के लिए Gemini कुंजी डालें।',
  'Connecting to the orb…': 'ऑर्ब से जुड़ रहे हैं…',
  'Connected. Hold Talk and speak.': 'जुड़ गया। बात दबाकर रखें और बोलें।',
  'Requesting microphone access…': 'माइक्रोफ़ोन की अनुमति माँग रहे हैं…',
  'Listening… Release Talk to pause.': 'सुन रहे हैं… रोकने के लिए बात छोड़ें।',
  'The orb is speaking…': 'ऑर्ब बोल रहा है…',
  'Interrupted. Hold Talk to continue.': 'रुक गया। जारी रखने के लिए बात दबाएँ।',
  'Interrupted. Keep talking.': 'रुक गया। बोलते रहें।',
  'Paused. Hold Talk to speak again.': 'रुका। फिर बोलने के लिए बात दबाएँ।',
  'Talk limit reached. Hold Talk to start again.': 'समय सीमा पूरी। फिर शुरू करने के लिए बात दबाएँ।',
  'Something went wrong.': 'कुछ गलत हो गया।',
  'Connection dropped. Reconnecting…': 'कनेक्शन टूटा। फिर जोड़ रहे हैं…',
  'Disconnected. Tap Reconnect.': 'कट गया। फिर जोड़ें दबाएँ।',
  'Reconnecting…': 'फिर जोड़ रहे हैं…',
  'Microphone was blocked. Allow it in the browser, then use Talk.':
    'माइक्रोफ़ोन बंद है। ब्राउज़र में अनुमति दें, फिर बात दबाएँ।',
  'Paste a Gemini API key to connect.': 'जोड़ने के लिए Gemini कुंजी डालें।',
  'That does not look like a Gemini API key.': 'यह Gemini कुंजी नहीं लगती।',
  'That Gemini key was rejected. Check the key and try again.':
    'वह Gemini कुंजी खारिज हुई। जाँचकर फिर कोशिश करें।',
  'This page is not a secure context. Open it over HTTPS so the microphone can work.':
    'यह पेज सुरक्षित नहीं है। माइक्रोफ़ोन के लिए इसे HTTPS पर खोलें।',
  'Microphone is blocked. In Safari tap AA → Website Settings → Microphone → Allow. Or open Settings → Safari → Microphone. This page cannot open Settings for you.':
    'माइक्रोफ़ोन बंद है। Safari में AA → Website Settings → Microphone → Allow करें। या Settings → Safari → Microphone खोलें। यह पेज Settings नहीं खोल सकता।',
  'Microphone is blocked. In Chrome tap the lock icon → Site settings → Microphone, allow this site, then use Talk. This page cannot jump into system settings.':
    'माइक्रोफ़ोन बंद है। Chrome में ताला → Site settings → Microphone से अनुमति दें, फिर बात दबाएँ। यह पेज सेटिंग नहीं खोल सकता।',
};

function applyTalkMode(status: string, talkMode: 'hold' | 'tap'): string {
  if (talkMode !== 'tap') {
    return status;
  }
  return status
    .replaceAll('Hold Talk', 'Tap Talk')
    .replaceAll('Release Talk', 'Tap Talk again')
    .replaceAll('दबाकर रखें', 'टैप करें')
    .replaceAll('बात छोड़ें', 'फिर टैप करें');
}

export function localizeStatus(
  status: string,
  lang: UiLang,
  talkMode: 'hold' | 'tap' = 'hold',
): string {
  const source = lang === 'hi' ? (STATUS_HI[status] ?? status) : status;
  return applyTalkMode(source, talkMode);
}

export function copy(lang: UiLang) {
  if (lang === 'hi') {
    return {
      name: 'Taskkorb',
      tagline: 'बोलो, और ऑर्ब जवाब दे।',
      pasteKey:
        'केवल स्थानीय जाँच के लिए Gemini कुंजी डालें। यह इसी टैब की मेमोरी में रहती है। बेहतर है कि सर्वर कुंजी हो, ताकि जाँच करने वालों को कुंजी न डालनी पड़े।',
      getKey: 'Gemini API कुंजी यहाँ से लें',
      getKeyHref: GEMINI_KEY_HELP_URL,
      opening: 'सेशन खुल रहा है…',
      connect: 'जोड़ें',
      connecting: 'जुड़ रहे हैं…',
      back: 'वापस',
      keyLabel: 'Gemini API कुंजी',
      talk: 'बात',
      more: 'और',
      voice: 'आवाज़',
      replyLanguage: 'जवाब की भाषा',
      matchSpeech: 'जैसी मैं बोलूँ',
      english: 'अंग्रेज़ी',
      hindi: 'हिन्दी',
      volume: 'आवाज़ स्तर',
      changeKey: 'कुंजी बदलें',
      useMyKey: 'मेरी कुंजी',
      useHosted: 'होस्टेड सेशन',
      reconnect: 'फिर जोड़ें',
      export: 'निर्यात',
      clear: 'साफ़',
      undoClear: 'साफ़ वापस लें',
      talkMode: 'बात करने का तरीका',
      holdMode: 'दबाकर रखें',
      tapMode: 'टैप',
      reduceMotion: 'कम हलचल',
      privacyTitle: 'हम क्या भेजते हैं',
      privacy:
        'ऑडियो तभी इस डिवाइस से जाता है जब बात चालू हो। ट्रांस्क्रिप्ट इसी ब्राउज़र में रहती है। होस्टेड पूर्वावलोकन छोटी अवधि का टोकन इस्तेमाल करता है, लंबी कुंजी नहीं।',
      silentIos:
        'iPhone पर रिंगर स्विच साइलेंट हो तो ऑर्ब सुनाई नहीं दे सकता। स्विच खोलें, फिर बात दबाएँ।',
      embeddedBrowser:
        'इस पेज को Safari या Chrome में खोलें। मेल, WhatsApp या Instagram के अंदर का ब्राउज़र अक्सर माइक्रोफ़ोन नहीं दे पाता।',
      empty: 'बात दबाकर बोलें। छोड़ने पर रुक जाएगा।',
      clipped: 'डिवाइस हल्की रखने के लिए पुरानी पंक्तियाँ हटाई गईं।',
      you: 'आप',
      orb: 'ऑर्ब',
      confirmClear: 'इस ब्राउज़र से बातचीत साफ़ करें?',
    };
  }

  return {
    name: 'Taskkorb',
    tagline: 'Speak, and the orb answers.',
    pasteKey:
      'Paste a Gemini key only for local testing. It stays in this tab’s memory. Prefer a server key so testers never paste one.',
    getKey: 'Get a Gemini API key',
    getKeyHref: GEMINI_KEY_HELP_URL,
    opening: 'Opening session…',
    connect: 'Connect',
    connecting: 'Connecting…',
    back: 'Back',
    keyLabel: 'Gemini API key',
    talk: 'Talk',
    more: 'More',
    voice: 'Voice',
    replyLanguage: 'Reply language',
    matchSpeech: 'Match what I speak',
    english: 'English',
    hindi: 'Hindi',
    volume: 'Volume',
    changeKey: 'Change key',
    useMyKey: 'Use my key',
    useHosted: 'Use hosted session',
    reconnect: 'Reconnect',
    export: 'Export',
    clear: 'Clear',
    undoClear: 'Undo clear',
    talkMode: 'Talk mode',
    holdMode: 'Hold',
    tapMode: 'Tap',
    reduceMotion: 'Reduce motion',
    privacyTitle: 'What we send',
    privacy:
      'Audio leaves this device only while Talk is on. Transcripts stay in this browser. Hosted preview uses a short-lived token, not your long-lived key.',
    silentIos:
      'On iPhone, a silent ringer switch can mute the orb. Unmute the phone, then tap Talk. This page cannot change that switch.',
    embeddedBrowser:
      'Open this page in Safari or Chrome. In-app browsers (Mail, WhatsApp, Instagram) often cannot use the microphone.',
    empty: 'Hold Talk and speak. Release to pause.',
    clipped: 'Older lines were dropped to keep this device light.',
    you: 'You',
    orb: 'Orb',
    confirmClear: 'Clear this conversation from this browser?',
  };
}
