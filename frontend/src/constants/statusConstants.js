// 산책 적합도 상태 관련 상수
export const STATUS_COLORS = {
    좋음: "bg-blue-500",
    보통: "bg-green-500",
    나쁨: "bg-amber-500",
    매우나쁨: "bg-red-500",
    default: "bg-gray-500",
};

export const STATUS_TEXT_COLORS = {
    좋음: "text-blue-600",
    보통: "text-green-600",
    나쁨: "text-amber-600",
    매우나쁨: "text-red-600",
    default: "text-gray-600",
};

export const STATUS_EMOJIS = {
    // 좋음: "🐕",
    // 보통: "🐕‍🦺",
    // 나쁨: "⚠️",
    // 매우나쁨: "🚫",
    좋음: "/good.png",
    보통: "/fair.png",
    나쁨: "/poor.png",
    매우나쁨: "/bad.png",
    default: "❓",
};

export const AIR_QUALITY_STANDARDS = [
    { status: "좋음", pm10: "0-30", pm25: "0-15" },
    { status: "보통", pm10: "31-80", pm25: "16-35" },
    { status: "나쁨", pm10: "81-150", pm25: "36-75" },
    { status: "매우나쁨", pm10: "151+", pm25: "76+" },
];
