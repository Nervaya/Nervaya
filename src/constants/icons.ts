// Icon registry - Centralized Iconify icon IDs
// All icons used across the application should be defined here

// Sidebar Icons
export const ICON_HOME = 'solar:home-2-bold';
export const ICON_HOUSE = 'solar:home-bold-duotone';
export const ICON_DASHBOARD = 'solar:widget-2-bold-duotone';
export const ICON_BED = 'solar:bed-bold-duotone';
export const ICON_HEART_PULSE = 'solar:heart-pulse-bold';
export const ICON_CART = 'solar:cart-3-bold-duotone';
export const ICON_CHART = 'solar:chart-2-bold-duotone';
export const ICON_PILL = 'solar:pill-bold';
export const ICON_CALENDAR = 'solar:calendar-bold';
export const ICON_CALENDAR_DAY = 'solar:calendar-date-bold';
export const ICON_GLOBE = 'solar:global-bold';
export const ICON_TRUCK = 'solar:truck-bold';
export const ICON_ENVELOPE = 'solar:letter-bold';
export const ICON_BOX = 'solar:box-bold';
export const ICON_USERS_GROUP = 'solar:users-group-rounded-bold-duotone';
export const ICON_CLIPBOARD = 'solar:clipboard-add-bold-duotone';
export const ICON_FILE = 'solar:file-bold';
export const ICON_WALLET = 'solar:wallet-bold';
export const ICON_SHOPPING_BAG = 'solar:bag-bold';
export const ICON_SHOPPING_CART = 'solar:cart-bold';
export const ICON_HEADSET = 'solar:airbuds-case-bold';
export const ICON_HEADPHONES = 'solar:headphones-round-bold-duotone';
export const ICON_CHAT = 'solar:chat-square-bold';
export const ICON_MENU = 'solar:hamburger-menu-bold-duotone';
export const ICON_SETTINGS = 'solar:settings-bold';
export const ICON_BELL = 'solar:bell-bold';
export const ICON_SHIELD = 'solar:shield-bold';
export const ICON_RECEIPT = 'solar:document-text-bold';
export const ICON_TAG = 'solar:tag-bold';
export const ICON_RUPEE = 'solar:tag-bold';
export const ICON_USER_PLUS = 'solar:user-plus-bold';
export const ICON_LOGOUT = 'solar:logout-2-bold';
export const ICON_CLOSE = 'solar:close-circle-bold';
export const ICON_EYE = 'solar:eye-bold';
export const ICON_EYE_SLASH = 'solar:eye-closed-bold';
export const ICON_EYE_CLOSED = 'solar:eye-closed-bold';
export const ICON_ADD = 'solar:add-square-bold';
export const ICON_MINUS = 'solar:minus-circle-bold';
export const ICON_REMOVE = 'solar:minus-circle-bold';
export const ICON_SEARCH = 'solar:magnifer-bold';
export const ICON_CLOCK = 'solar:clock-circle-bold';
export const ICON_PLAY = 'solar:play-circle-bold';
export const ICON_ARROW_LEFT = 'solar:arrow-left-bold';
export const ICON_ARROW_RIGHT = 'solar:arrow-right-bold';
export const ICON_ARROW_LEFT_OUTLINE = 'solar:arrow-left-outline';
export const ICON_ARROW_RIGHT_OUTLINE = 'solar:arrow-right-outline';
export const ICON_SHARE = 'solar:share-bold';
export const ICON_ALERT = 'solar:danger-circle-bold';
export const ICON_ARROW_DOWN = 'solar:alt-arrow-down-bold';
export const ICON_CHECK = 'solar:check-circle-bold';
export const ICON_INFO = 'solar:info-circle-bold';
export const ICON_TRASH = 'solar:trash-bin-minimalistic-bold';
export const ICON_PEN = 'solar:pen-bold';
export const ICON_USER = 'solar:user-bold';
export const ICON_MOON = 'solar:moon-bold';
export const ICON_STARS = 'solar:stars-bold-duotone';
export const ICON_STAR = 'solar:star-bold';
export const ICON_MOON_SLEEP = 'solar:moon-sleep-bold-duotone';
export const ICON_SHIELD_USER = 'solar:shield-user-bold-duotone';
export const ICON_SOUNDWAVE = 'solar:soundwave-bold';
export const ICON_BRAIN = 'tabler:brain';
export const ICON_ARROW_UP = 'solar:alt-arrow-up-bold';
export const ICON_LINK = 'solar:link-bold';
export const ICON_FOLDER = 'solar:folder-bold';
export const ICON_UPLOAD = 'solar:upload-square-bold';
export const ICON_MAIL = 'solar:letter-bold';
export const ICON_VIDEO = 'solar:video-library-bold';
export const ICON_INFINITY = 'solar:infinity-bold';
export const ICON_GRID = 'solar:widget-2-bold';
export const ICON_LIST = 'solar:list-bold';
export const ICON_FILTER = 'solar:filter-bold';
export const ICON_WHATSAPP = 'solar:chat-round-bold';
export const ICON_MAGNIFYING_GLASS = 'solar:magnifer-bold';
export const ICON_DOCUMENT = 'solar:document-text-bold';
export const ICON_HANDSHAKE = 'mdi:handshake';
export const ICON_CREDIT_CARD = 'solar:card-bold';
export const ICON_GAVEL = 'tabler:scale';
export const ICON_LOCK = 'solar:lock-bold';
export const ICON_SAVE = 'solar:diskette-bold';
export const ICON_DATABASE = 'solar:database-bold';
export const ICON_COOKIE = 'mdi:cookie';
export const ICON_CHART_SIMPLE = 'solar:chart-square-bold';
export const ICON_DOWNLOAD = 'solar:download-square-bold';
export const ICON_BAN = 'solar:forbidden-bold';
export const ICON_PAUSE = 'solar:pause-circle-bold';
export const ICON_PHONE = 'solar:phone-bold';
export const ICON_LOCATION = 'solar:map-point-bold';
export const ICON_SUNRISE = 'solar:sunrise-bold';
export const ICON_USER_SETTINGS = 'solar:user-id-bold';
export const ICON_USER_MEDICAL = 'solar:user-check-bold';

// Sidebar icon map for NavigationMenuGroup
type SidebarIconMap = Record<string, string>;

export const SIDEBAR_ICON_MAP: SidebarIconMap = {
  FaHouse: ICON_HOME,
  FaHome: ICON_DASHBOARD,
  FaBed: ICON_BED,
  FaHeartPulse: ICON_HEART_PULSE,
  FaCartShopping: ICON_CART,
  FaChartPie: ICON_DASHBOARD,
  FaCalendarCheck: ICON_CALENDAR,
  FaUserGroup: ICON_USERS_GROUP,
  FaClipboardList: ICON_CLIPBOARD,
  FaFileMedical: ICON_FILE,
  FaMoneyBillWave: ICON_WALLET,
  FaBoxOpen: ICON_BOX,
  FaHeadset: ICON_CHAT,
  FaHeadphones: ICON_HEADPHONES,
  FaCommentDots: ICON_CHAT,
  FaRegCommentDots: ICON_CHAT,
  FaBars: ICON_MENU,
  FaUserDoctor: ICON_USER,
  FaGear: ICON_SETTINGS,
  FaUsers: ICON_USERS_GROUP,
  FaIndianRupeeSign: ICON_TAG,
  FaBell: ICON_BELL,
  FaShieldHalved: ICON_SHIELD,
  FaStethoscope: ICON_HEART_PULSE,
  FaPills: ICON_BOX,
  FaCapsules: ICON_BOX,
  FaNewspaper: ICON_FILE,
  FaTag: ICON_TAG,
  FaRightFromBracket: ICON_LOGOUT,
};
