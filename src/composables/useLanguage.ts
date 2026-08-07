import { ref, computed } from 'vue'

type Language = 'en' | 'zh'

// Global language state
const currentLang = ref<Language>('en')

// Translation dictionary
const translations = {
  // Navigation
  portfolio: { en: 'Portfolio', zh: '作品集' },
  footprints: { en: 'Footprints', zh: '足跡' },
  highlights: { en: 'Highlights', zh: '旅行之最' },
  about: { en: 'About', zh: '關於' },
  contact: { en: 'Contact', zh: '聯絡' },

  // Common
  photos: { en: 'PHOTOS', zh: '張相片' },
  all: { en: 'All', zh: '全部' },
  loadingPhotos: { en: 'Loading photos...', zh: '載入相片中...' },
  loadMorePhotos: { en: 'Load More Photos', zh: '載入更多相片' },
  showingPhotos: { en: 'Showing', zh: '顯示' },
  of: { en: 'of', zh: '共' },

  // Contact page - editorial letter, metadata, and submit states
  inquiries: { en: 'Inquiries', zh: '洽詢' },
  startConversation: { en: 'Start a Conversation.', zh: '展開一場對話。' },
  currentLocationLabel: { en: 'Location', zh: '所在地' },
  currentLocationValue: { en: 'Hong Kong', zh: '香港' },
  availabilityLabel: { en: 'Availability', zh: '狀態' },
  availabilityValue: { en: 'Writing the Next Travelogue', zh: '撰寫下一篇遊記' },
  letterHelloMyName: { en: 'Hello, my name is', zh: '您好，我是' },
  letterReplyAt: { en: 'and you can reply to me at', zh: '，您可以透過' },
  letterTalkAbout: {
    en: '. I would love to talk to you about',
    zh: '與我聯絡。我想和您聊聊',
  },
  letterEnd: { en: '.', zh: '。' },
  sendInquiry: { en: 'Send', zh: '送出' },
  messageSentConfirmation: { en: 'Message Sent • Thank You For Reaching Out', zh: '訊息已送出．感謝您的聯絡' },
  messageSentShort: { en: 'Message Sent ✓', zh: '訊息已送出 ✓' },

  // Portfolio page
  portfolioTitle: { en: 'Portfolio', zh: '作品集' },
  portfolioSubtitle: { en: 'A Collection of Moments from Around the World', zh: '來自世界各地的攝影時刻' },
  loadMore: { en: 'Load More', zh: '載入更多' },
  noAlbumsYet: { en: 'No albums yet', zh: '暫無相簿' },
  checkBackSoon: { en: 'Check back soon for new travel destinations!', zh: '敬請期待新的旅行目的地！' },

  // Footprints page
  footprintsTitle: { en: 'Mapping My Journey Across Continents', zh: '繪製我的跨洲旅程' },
  footprintsSubtitle: { en: 'Mapping My Journey Across Continents', zh: '繪製我的跨洲旅程' },
  globalFootsteps: { en: 'Global Footsteps', zh: '全球足跡' },
  journeys: { en: 'Journeys', zh: '次旅程' },
  tMinus: { en: 'T-Minus', zh: '倒數' },
  days: { en: 'Days', zh: '天' },
  nextDestination: { en: 'Next Destination', zh: '下一站' },
  kmTravelled: { en: 'KM Total Travelled', zh: '公里總旅程' },
  viewFullJourney: { en: 'View Full Journey', zh: '查看完整旅程' },
  albumsInCity: { en: 'albums in', zh: '個相簿於' },
  clickToExplore: { en: 'Click a pin to explore albums from that destination', zh: '點擊標記探索該目的地的相簿' },
  journeyTimeline: { en: 'Journey Timeline', zh: '旅程時間軸' },
  viewBySeason: { en: 'View by Season', zh: '按季節查看' },
  seasonalView: { en: 'Seasonal View', zh: '季節視圖' },

  // Stats Dashboard
  travelInsights: { en: 'Travel Insights', zh: '旅行洞察' },
  countries: { en: 'Countries', zh: '個國家' },
  continents: { en: 'Continents', zh: '個大洲' },
  photos: { en: 'Photos', zh: '張相片' },
  mostVisitedCity: { en: 'Most Visited City', zh: '最常造訪城市' },
  avgPhotosPerTrip: { en: 'Avg Photos Per Trip', zh: '每趟旅程平均相片' },
  totalJourneys: { en: 'Total Journeys', zh: '總旅程數' },
  uniqueCities: { en: 'Unique Cities', zh: '造訪城市數' },
  estDistance: { en: 'Est. Distance', zh: '預估距離' },
  cities: { en: 'Cities', zh: '個城市' },

  // Highlights page
  highlightsSubtitle: { en: 'A Collection of Travel Superlatives', zh: '旅行紀錄精選' },

  // Album page
  story: { en: 'Story', zh: '故事' },
  grid: { en: 'Grid', zh: '網格' },

  // Continents
  africa: { en: 'Africa', zh: '非洲' },
  antarctica: { en: 'Antarctica', zh: '南極洲' },
  asia: { en: 'Asia', zh: '亞洲' },
  europe: { en: 'Europe', zh: '歐洲' },
  northAmerica: { en: 'North America', zh: '北美洲' },
  oceania: { en: 'Oceania', zh: '大洋洲' },
  southAmerica: { en: 'South America', zh: '南美洲' },

  // About page
  aboutTitle: { en: 'About Me', zh: '關於我' },
  theStory: { en: 'The Story', zh: '我的故事' },
  aboutIntro: {
    en: "I'm a travel photographer and storyteller, capturing moments across continents and cultures. My journey began with a simple camera and an unwavering desire to document the beauty I encountered in every corner of the world.",
    zh: '我是一位旅行攝影師和說故事的人，捕捉跨越各大洲和文化的瞬間。我的旅程始於一台簡單的相機，以及記錄我在世界每個角落遇到的美好的堅定願望。'
  },
  aboutPara2: {
    en: "Over the years, I've explored remote villages in Southeast Asia, bustling cities in Europe, and untouched landscapes in South America. Each destination has taught me something new about the world and myself. Through my lens, I aim to share these discoveries and inspire others to embark on their own adventures.",
    zh: '多年來，我探索了東南亞的偏遠村莊、歐洲的繁華城市，以及南美洲未受污染的景觀。每個目的地都教會了我關於世界和我自己的新事物。透過我的鏡頭，我希望分享這些發現，並激勵其他人展開自己的冒險。'
  },
  aboutPara3: {
    en: "This website is a curated collection of my favorite moments, stories, and the places that have left a lasting impression on my soul. Every photograph tells a story, and I hope these images speak to you as much as they speak to me.",
    zh: '這個網站是我最喜愛的時刻、故事和對我的靈魂留下持久印象的地方的精選集。每張照片都講述一個故事，我希望這些影像能對您說話，就像它們對我說話一樣。'
  },
  countriesVisited: { en: 'Countries Visited', zh: '已訪國家' },
  photosPublished: { en: 'Photos Published', zh: '已發表作品' },
  yearsExperience: { en: 'Years Experience', zh: '年經驗' },
  whatIDo: { en: 'What I Do', zh: '我的專長' },
  travelPhotography: { en: 'Travel Photography', zh: '旅行攝影' },
  landscapePhotography: { en: 'Landscape Photography', zh: '風景攝影' },
  streetPhotography: { en: 'Street Photography', zh: '街頭攝影' },
  photojournalism: { en: 'Photojournalism', zh: '新聞攝影' },
  travelWriting: { en: 'Travel Writing', zh: '旅遊寫作' },
  getInTouch: { en: 'Get In Touch', zh: '聯絡我' },
  viewPortfolio: { en: 'View Portfolio', zh: '查看作品集' },

  // Contact page
  contactTitle: { en: 'Get In Touch', zh: '聯絡我們' },
  contactSubtitle: { en: "I'D LOVE TO HEAR FROM YOU", zh: '期待聽到您的聲音' },
  name: { en: 'Name', zh: '姓名' },
  email: { en: 'Email', zh: '電郵' },
  message: { en: 'Message', zh: '訊息' },
  yourName: { en: 'Your name', zh: '您的姓名' },
  yourEmail: { en: 'your@email.com', zh: '您的電郵地址' },
  yourMessage: { en: 'Your message...', zh: '您的訊息...' },
  sendMessage: { en: 'Send Message', zh: '發送訊息' },
  sending: { en: 'Sending...', zh: '發送中...' },
  reachOutDirectly: { en: 'Or Reach Out Directly', zh: '或直接聯絡' },
  instagram: { en: 'Instagram', zh: 'Instagram' },
  twitter: { en: 'Twitter', zh: 'Twitter' },

  // Footer
  allRightsReserved: { en: 'ALL RIGHTS RESERVED', zh: '版權所有' },
}

export function useLanguage() {
  const toggleLanguage = () => {
    currentLang.value = currentLang.value === 'en' ? 'zh' : 'en'
  }

  const t = (key: keyof typeof translations) => {
    return translations[key][currentLang.value]
  }

  const getContinentName = (continent: string) => {
    const continentMap: Record<string, keyof typeof translations> = {
      'Africa': 'africa',
      'Antarctica': 'antarctica',
      'Asia': 'asia',
      'Europe': 'europe',
      'North America': 'northAmerica',
      'Oceania': 'oceania',
      'South America': 'southAmerica',
    }
    const key = continentMap[continent]
    return key ? t(key) : continent
  }

  return {
    currentLang: computed(() => currentLang.value),
    toggleLanguage,
    t,
    getContinentName,
  }
}
