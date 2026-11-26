export type Level = "easy" | "medium" | "hell";

/** 3 chế độ: thời gian tập trung được chọn ngẫu nhiên (theo phút) trong khoảng [minH, maxH] giờ */
export const LEVELS: Record<Level, { label: string; emoji: string; note: string; minH: number; maxH: number }> = {
  easy: { label: "Đơn giản", emoji: "😊", note: "Nhẹ nhàng", minH: 1, maxH: 2 },
  medium: { label: "Trung cấp", emoji: "😤", note: "Hơi căng", minH: 2, maxH: 3 },
  hell: { label: "Địa ngục", emoji: "😈", note: "Cháy hết mình", minH: 4, maxH: 5 },
};

export const LEVEL_KEYS = Object.keys(LEVELS) as Level[];

export function isLevel(v: unknown): v is Level {
  return typeof v === "string" && v in LEVELS;
}

export type TimerTheme = {
  slug: string;
  /** Chế độ mặc định của bộ đếm, dùng để lọc ở trang chủ */
  level: Level;
  /** Tên đầy đủ, dùng làm tiêu đề trang */
  title: string;
  /** Tên ngắn, dùng trên tab trình duyệt */
  short: string;
  emoji: string;
  description: string;
  /** Màu nền thẻ / trang */
  bg: string;
  /** Màu nhấn cho nút và thanh tiến độ */
  accent: string;
  doneTitle: string;
  doneMessage: string;
  /** Câu cảnh báo trong popup khi định thoát giữa chừng */
  exitWarning: string;
  /** Câu động viên hiển thị theo tiến độ (chia đều từ 0% đến 100%) */
  milestones: string[];
};

export const TIMERS: TimerTheme[] = [
  {
    slug: "da-tan",
    level: "easy",
    title: "Tập trung cho đến khi đá tan",
    short: "Đá tan",
    emoji: "🧊",
    description: "Viên đá nhỏ đổ mồ hôi tan dần trong ly. Đá tan hết thì được nghỉ.",
    bg: "#e0f2fe",
    accent: "#0284c7",
    doneTitle: "Đá tan hết rồi! 💧",
    doneMessage: "Ly nước mát lạnh này là phần thưởng cho bạn. Uống một ngụm rồi nghỉ chút nha.",
    exitWarning: "Viên đá đang tan dở, thoát bây giờ là nó đông cứng lại y như cũ đó!",
    milestones: [
      "Viên đá còn cứng cáp lắm, bắt đầu thôi!",
      "Đá bắt đầu đổ mồ hôi... bạn cũng vậy à?",
      "Một nửa viên đá đã ra đi, giữ vững nha!",
      "Đá chỉ còn bé xíu, sắp xong rồi!",
      "Giọt cuối cùng đây rồi!",
    ],
  },
  {
    slug: "ngu-cong-doi-nui",
    level: "hell",
    title: "Tập trung cho đến khi Ngu Công dời xong núi",
    short: "Ngu Công dời núi",
    emoji: "⛰️",
    description: "Ông lão Ngu Công cuốc từng nhát, dời ngọn núi sang bên kia. Kiên trì là được!",
    bg: "#fef3c7",
    accent: "#b45309",
    doneTitle: "Núi đã dời xong! ⛏️",
    doneMessage: "Có công mài sắt có ngày nên kim. Ngu Công tự hào về bạn lắm đó.",
    exitWarning: "Ngu Công cuốc mỏi cả tay rồi, bạn nỡ bắt ông đắp lại núi sao?",
    milestones: [
      "Ngu Công vác cuốc ra núi rồi!",
      "Từng nhát cuốc, từng phút tập trung...",
      "Đã dời được nửa quả núi, phi thường!",
      "Bên kia đã thành một quả đồi mới rồi!",
      "Nhát cuốc cuối cùng, cố lên!",
    ],
  },
  {
    slug: "tat-can-bien-dong",
    level: "hell",
    title: "Tập trung cho đến khi hai vợ chồng tát cạn Biển Đông",
    short: "Tát cạn Biển Đông",
    emoji: "🌊",
    description: "Thuận vợ thuận chồng, tát Biển Đông cũng cạn. Tập trung hết mình, việc gì cũng xong!",
    bg: "#cffafe",
    accent: "#0e7490",
    doneTitle: "Biển Đông cạn rồi! 🐟",
    doneMessage: "Thuận vợ thuận chồng, tát Biển Đông cũng cạn. Còn bạn thì tập trung đến phút cuối rồi đó!",
    exitWarning: "Hai vợ chồng tát mỏi tay rồi, thoát là nước biển ùa về lại hết!",
    milestones: [
      "Hai vợ chồng xắn tay áo, cầm gàu ra biển!",
      "Một gàu, hai gàu... biển vẫn mênh mông.",
      "Nước đã rút một nửa, lộ cả xác tàu đắm!",
      "Cá tôm bắt đầu hoảng hốt rồi...",
      "Chỉ còn vài vũng nước, tát nốt thôi!",
    ],
  },
  {
    slug: "nen-chay",
    level: "medium",
    title: "Tập trung cho đến khi ngọn nến cháy hết",
    short: "Nến cháy",
    emoji: "🕯️",
    description: "Ngọn nến lung linh cháy dần trong đêm. Nến tắt là lúc đi ngủ.",
    bg: "#1e1b4b",
    accent: "#f59e0b",
    doneTitle: "Nến đã tắt 🌙",
    doneMessage: "Bạn đã cháy hết mình như ngọn nến. Giờ thì nghỉ ngơi thôi.",
    exitWarning: "Thoát là nến tắt phụt, phải thắp lại cây mới từ đầu đó!",
    milestones: [
      "Thắp nến lên, tập trung nào.",
      "Ánh nến lung linh, tâm trí tĩnh lặng.",
      "Nến đã cháy được một nửa.",
      "Sáp chảy tèm lem rồi, sắp xong!",
      "Ngọn lửa cuối cùng đang lay lắt...",
    ],
  },
  {
    slug: "oc-sen-ve-nha",
    level: "medium",
    title: "Tập trung cho đến khi ốc sên bò về nhà",
    short: "Ốc sên về nhà",
    emoji: "🐌",
    description: "Bạn ốc sên chậm rãi bò về ngôi nhà nấm. Chậm mà chắc!",
    bg: "#dcfce7",
    accent: "#16a34a",
    doneTitle: "Ốc sên đã về tới nhà! 🍄",
    doneMessage: "Chậm mà chắc, bạn và ốc sên đều đã về đích.",
    exitWarning: "Ốc sên bò được một đoạn rồi, thoát là bạn ấy phải bò lại từ vạch xuất phát!",
    milestones: [
      "Ốc sên khởi hành! Không vội đâu.",
      "Bò bò bò... từng chút một.",
      "Được nửa đường rồi đó!",
      "Thấy nhà nấm trước mặt rồi!",
      "Chỉ còn vài bước ốc sên nữa thôi!",
    ],
  },
  {
    slug: "cay-lon",
    level: "hell",
    title: "Tập trung cho đến khi hạt mầm thành cây",
    short: "Cây lớn",
    emoji: "🌱",
    description: "Gieo một hạt mầm, mỗi phút tập trung là một giọt nước tưới cây.",
    bg: "#ecfccb",
    accent: "#65a30d",
    doneTitle: "Cây đã ra trái! 🍎",
    doneMessage: "Sự tập trung cũng như cây, chăm chỉ tưới tắm thì sẽ đơm hoa kết trái.",
    exitWarning: "Cây đang lớn mà, thoát là phải gieo lại hạt mầm từ đầu đó!",
    milestones: [
      "Một hạt mầm nhỏ vừa nhú lên.",
      "Cây con đang vươn mình đón nắng.",
      "Tán lá xanh đã thành hình!",
      "Cây đã lớn khoẻ rồi!",
      "Sắp ra trái rồi đó!",
    ],
  },
  {
    slug: "tra-sua",
    level: "easy",
    title: "Tập trung cho đến khi uống cạn ly trà sữa",
    short: "Trà sữa",
    emoji: "🧋",
    description: "Ly trà sữa trân châu vơi dần theo từng phút. Uống từ từ thôi nha!",
    bg: "#fde68a",
    accent: "#92400e",
    doneTitle: "Hết sạch trà sữa! 🧋",
    doneMessage: "Cạn ly rồi! Order thêm ly nữa rồi tập trung tiếp không?",
    exitWarning: "Ly trà sữa còn dở, thoát là phải order lại ly mới từ đầu!",
    milestones: [
      "Ly trà sữa đầy ụ, hút một ngụm nào!",
      "Trân châu dai dai, đầu óc minh mẫn.",
      "Còn nửa ly, đừng hút nhanh quá!",
      "Sắp lộ đáy ly rồi...",
      "Rột rột rột... những giọt cuối!",
    ],
  },
  {
    slug: "het-pin",
    level: "easy",
    title: "Tập trung cho đến khi điện thoại hết pin",
    short: "Hết pin",
    emoji: "🔋",
    description: "Pin cạn dần từ 100% về 0%. Đặt điện thoại xuống và tập trung thôi!",
    bg: "#f1f5f9",
    accent: "#0f172a",
    doneTitle: "Hết pin rồi! 🪫",
    doneMessage: "Điện thoại cần sạc, còn bạn thì cần nghỉ ngơi. Đi uống nước thôi.",
    exitWarning: "Pin đang tụt ngon lành, thoát là sạc đầy lại 100% luôn đó!",
    milestones: [
      "Pin đầy 100%, năng lượng tràn trề!",
      "Pin còn kha khá, cứ tiếp tục.",
      "Pin còn một nửa, bạn vẫn ổn chứ?",
      "Pin yếu rồi, đừng cầm điện thoại nha!",
      "Pin sắp cạn... bạn sắp xong!",
    ],
  },
  {
    slug: "trung-no",
    level: "medium",
    title: "Tập trung cho đến khi trứng nở",
    short: "Trứng nở",
    emoji: "🐣",
    description: "Ấp quả trứng bằng sự tập trung. Trứng nứt dần và... chiếp chiếp!",
    bg: "#fef9c3",
    accent: "#ca8a04",
    doneTitle: "Chiếp chiếp! Gà con chào đời 🐥",
    doneMessage: "Sự kiên nhẫn của bạn vừa ấp nở một bé gà con.",
    exitWarning: "Trứng đang ấp dở, thoát là bé gà con không nở được đâu!",
    milestones: [
      "Ấp trứng thôi, im lặng nào...",
      "Hình như có gì đó cựa quậy bên trong?",
      "Có vết nứt rồi!",
      "Trứng lắc dữ quá!",
      "Sắp nở rồi sắp nở rồi!",
    ],
  },
  {
    slug: "mat-troi-lan",
    level: "medium",
    title: "Tập trung cho đến khi mặt trời lặn",
    short: "Mặt trời lặn",
    emoji: "🌅",
    description: "Ngắm mặt trời từ từ lặn xuống biển, bầu trời chuyển sang đêm đầy sao.",
    bg: "#ffedd5",
    accent: "#ea580c",
    doneTitle: "Trời đã tối, sao đã lên ✨",
    doneMessage: "Một buổi tập trung trọn vẹn từ chiều đến tối. Giỏi lắm!",
    exitWarning: "Mặt trời đang lặn dở, thoát là phải chờ lại từ giữa trưa đó!",
    milestones: [
      "Nắng còn chói chang, tập trung thôi!",
      "Mặt trời bắt đầu nghiêng bóng.",
      "Hoàng hôn rực rỡ, đẹp như bạn đang cố gắng.",
      "Mặt trời chạm mặt biển rồi.",
      "Những ngôi sao đầu tiên xuất hiện...",
    ],
  },
  {
    slug: "pizza",
    level: "easy",
    title: "Tập trung cho đến khi hết sạch pizza",
    short: "Pizza",
    emoji: "🍕",
    description: "8 miếng pizza, mỗi lúc biến mất một miếng. Ai ăn vậy trời?",
    bg: "#fee2e2",
    accent: "#dc2626",
    doneTitle: "Pizza hết sạch! 🍕",
    doneMessage: "Không còn miếng nào. Chắc là não bạn đã ăn hết vì tập trung quá sức.",
    exitWarning: "Pizza đang ăn dở, thoát là phải nướng lại nguyên cái mới!",
    milestones: [
      "Pizza nóng hổi vừa ra lò!",
      "Mất vài miếng rồi, ai đó đang ăn vụng...",
      "Còn một nửa cái pizza.",
      "Chỉ còn vài miếng thôi!",
      "Miếng cuối cùng!",
    ],
  },
];

export function getTimer(slug: string) {
  return TIMERS.find((t) => t.slug === slug);
}
