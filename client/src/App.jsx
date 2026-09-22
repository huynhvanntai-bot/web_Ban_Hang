import { Component, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./App.css";
import "./ecommerce.css";
import AdminPage from "./AdminPage.jsx";
import {
  CATEGORIES,
  PRODUCTS,
  CATEGORY_FILTER_CONFIGS,
  getProductBySlug,
  getCategoryBySlug,
  getProductsByCategory,
  searchProducts,
  getBestSellers,
  getSaleProducts,
  getNewProducts,
  getRelatedProducts,
  getFrequentlyBoughtTogether,
} from "./data/products.js";
import ProductCard from "./components/ProductCard.jsx";
import MainNavigation from "./components/MainNavigation.jsx";
import CategoryView from "./components/CategoryView.jsx";
import ProductDetailView from "./components/ProductDetailView.jsx";
import EcommerceFooter from "./components/EcommerceFooter.jsx";

const apiUrl = (() => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== "undefined") {
    const { hostname, port, protocol } = window.location;
    if (protocol === "file:") return "http://localhost:5000/api";
    if ((hostname === "localhost" || hostname === "127.0.0.1") && port && port !== "5000") {
      return "http://localhost:5000/api";
    }
  }
  return "/api";
})();

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

const locationData = {
  "Cần Thơ": {
    "Quận Ninh Kiều": [
      "Phường Xuân Khánh",
      "Phường An Khánh",
      "Phường An Hòa",
      "Phường Tân An",
      "Phường Cái Khế",
      "Phường Hưng Lợi",
      "Phường An Cư",
    ],
    "Quận Cái Răng": [
      "Phường Lê Bình",
      "Phường Hưng Phú",
      "Phường Hưng Thạnh",
      "Phường Ba Láng",
    ],
    "Quận Bình Thủy": [
      "Phường Bình Thủy",
      "Phường An Thới",
      "Phường Trà Nóc",
    ],
    "Quận Ô Môn": ["Phường Châu Văn Liêm", "Phường Thới Hòa"],
    "Quận Thốt Nốt": ["Phường Thốt Nốt", "Phường Thuận An"],
    "Huyện Phong Điền": ["Thị trấn Phong Điền", "Xã Mỹ Khánh"],
  },
  "TP. Hồ Chí Minh": {
    "Quận 1": ["Phường Bến Nghé", "Phường Đa Kao"],
    "Quận 3": ["Phường Võ Thị Sáu", "Phường 7"],
    "Thành phố Thủ Đức": ["Phường Thảo Điền", "Phường Linh Chiểu"],
  },
  "Hà Nội": {
    "Quận Ba Đình": ["Phường Điện Biên", "Phường Ngọc Hà"],
    "Quận Hoàn Kiếm": ["Phường Hàng Bạc", "Phường Tràng Tiền"],
    "Quận Cầu Giấy": ["Phường Dịch Vọng", "Phường Yên Hòa"],
  },
  "Đà Nẵng": {
    "Quận Hải Châu": ["Phường Hải Châu", "Phường Thạch Thang"],
    "Quận Sơn Trà": ["Phường An Hải Bắc", "Phường Mân Thái"],
  },
};

const FREESHIP_THRESHOLD = 200000;

const CATEGORY_META = {
  "len-soi": { icon: "🧶", desc: "Bán lẻ cuộn Milk Bò, Nhung Đũa, Baby Yarn" },
  "set-diy-tu-lam": { icon: "🎁", desc: "Kit tự móc tại nhà kèm video HD A-Z" },
  "dung-cu-dan-moc": { icon: "🪡", desc: "Kim móc cán dẻo, kẹp định vị & phụ liệu" },
  "thu-len-handmade": { icon: "🧸", desc: "Thú bông Amigurumi đan tay mẫu sẵn" },
  "hoa-len-vinh-cuu": { icon: "💐", desc: "Hoa tulip, hoa hồng, cẩm tú cầu vĩnh cửu" },
  "tui-phu-kien-len": { icon: "👜", desc: "Túi xách sợi dệt, mũ & khăn choàng ấm" },
};

const YARN_COLORS = [
  { name: "Trắng sữa", code: "01", hex: "#fffdf5", border: "#e8dfd8" },
  { name: "Hồng phấn", code: "08", hex: "#fbcfe8", border: "#f472b6" },
  { name: "Hồng đào", code: "12", hex: "#fda4af", border: "#fb7185" },
  { name: "Vàng bơ", code: "16", hex: "#fef08a", border: "#eab308" },
  { name: "Xanh bơ mint", code: "23", hex: "#bbf7d0", border: "#4ade80" },
  { name: "Xanh baby", code: "29", hex: "#bae6fd", border: "#38bdf8" },
  { name: "Tím khoai môn", code: "35", hex: "#e9d5ff", border: "#c084fc" },
  { name: "Trà sữa kem", code: "42", hex: "#e2d1c3", border: "#c4a482" },
  { name: "Nâu cacao", code: "48", hex: "#a27b5c", border: "#7f5539" },
  { name: "Đỏ dâu tây", code: "54", hex: "#fb7185", border: "#e11d48" },
];

const INITIAL_CATEGORIES = CATEGORIES;
const INITIAL_PRODUCTS = PRODUCTS;

const CUSTOMER_REVIEWS = [
  {
    id: 1,
    name: "Minh Anh",
    location: "Quận 1, TP.HCM",
    avatar: "/images/avatars/avatar-khach-hang-01.jpg",
    rating: 5,
    product: "Len Milk Bò 50g & Bộ kim cán dẻo",
    comment:
      "Len sờ cực kỳ mướt tay, màu hồng pastel chuẩn hình. Shop đóng gói xinh xắn có kẹp đánh dấu mũi tặng kèm nữa, 10 điểm chu đáo!",
    date: "2 ngày trước",
  },
  {
    id: 2,
    name: "Hoàng Yến",
    location: "Cầu Giấy, Hà Nội",
    avatar: "/images/avatars/avatar-khach-hang-02.jpg",
    rating: 5,
    product: "Bé Thỏ Len Tai Dài Đan Tay",
    comment:
      "Thú bông len móc tay đều tăm tắp, form chuẩn không có sợi len thừa nào luôn. Mua làm quà sinh nhật cho bé bạn, bạn thích mê!",
    date: "1 tuần trước",
  },
  {
    id: 3,
    name: "Thanh Trúc",
    location: "Hải Châu, Đà Nẵng",
    avatar: "/images/avatars/avatar-khach-hang-03.jpg",
    rating: 5,
    product: "Kit Tự Móc Hoa Tulip 3 Cành",
    comment:
      "Video hướng dẫn quay cận cảnh rất dễ hiểu. Người chưa từng cầm kim móc như mình mà cũng hoàn thiện được bó hoa tulip tặng mẹ!",
    date: "2 tuần trước",
  },
];

const YARN_PROJECT_PRESETS = [
  {
    id: "preset-scarf",
    name: "Khăn Quàng Cổ Ấm",
    icon: "🧣",
    recommendedYarn: "Len Milk Cotton 50g Siêu Mềm",
    amount: "3 cuộn (150g)",
    needle: "Kim móc 3.5mm - 4.0mm",
    tip: "Mũi nửa kép (HDC) giúp khăn xốp nhẹ và giữ ấm tốt",
    estimatedPrice: 54000,
    productName: "Len Milk Cotton 50g Bán Lẻ",
    quantity: 3,
  },
  {
    id: "preset-beanie",
    name: "Mũ Len Beanie / Beret",
    icon: "🧢",
    recommendedYarn: "Len Nhung Đũa Cỡ Đại 100g",
    amount: "2 cuộn (200g)",
    needle: "Kim móc 5.0mm - 6.0mm",
    tip: "Móc xoắn ốc đều tay, sợi nhung mềm mịn mướt tay",
    estimatedPrice: 70000,
    productName: "Len Nhung Đũa Cỡ Đại 100g",
    quantity: 2,
  },
  {
    id: "preset-tulip",
    name: "Bó 5 Cành Hoa Tulip Tự Làm",
    icon: "🌷",
    recommendedYarn: "Set Kit Hoa Tulip 5 Cành",
    amount: "1 trọn bộ kit đầy đủ",
    needle: "Kèm sẵn kim móc & kẽm cành",
    tip: "Kèm video quét mã QR hướng dẫn từng cánh hoa",
    estimatedPrice: 69000,
    productName: "Set Kit Tự Móc Bó Hoa Tulip Pastel 5 Cành",
    quantity: 1,
  },
  {
    id: "preset-tote",
    name: "Túi Tote Dệt Đi Chơi",
    icon: "👜",
    recommendedYarn: "Sợi Dệt Trơn 2mm",
    amount: "2 cuộn (200g)",
    needle: "Kim móc 2.5mm - 3.0mm",
    tip: "Sợi dệt đứng form, quai túi chắc chắn không dão",
    estimatedPrice: 64000,
    productName: "Sợi Dệt Trơn 2mm Móc Túi Xách",
    quantity: 2,
  },
  {
    id: "preset-bunny",
    name: "Bé Thỏ Bông Len Nhung Ôm Ngủ",
    icon: "🐰",
    recommendedYarn: "Len Nhung Đũa Cỡ Đại",
    amount: "2 cuộn nhung (200g)",
    needle: "Kim móc 5.5mm",
    tip: "Mũi đơn X chặt tay, nhồi bông gòn bi tròn trịa",
    estimatedPrice: 70000,
    productName: "Len Nhung Đũa Cỡ Đại 100g",
    quantity: 2,
  },
];

const CRAFT_GUIDES = [
  {
    id: 1,
    tag: "Dành cho người mới",
    shortTitle: "1. Chọn len người mới",
    title: "Bí kíp chọn dòng len phù hợp cho người mới bắt đầu",
    summary:
      "Mới tập đan móc thì Len Milk Bò 50g là chân ái: sợi se tròn êm ái, không đổ lông, dễ nhìn rõ chân mũi và giá thành siêu tiết kiệm.",
    readTime: "3 phút đọc",
    icon: "🧶",
    sections: [
      {
        heading: "1. Tại sao người mới nên bắt đầu bằng Len Milk Bò 50g?",
        content:
          "Khi mới tập cầm kim móc, điều quan trọng nhất là bạn cần nhìn thấy rõ từng chân mũi móc (stitch definition) để đếm số mũi và không bị đâm nhầm. Len Milk Bò 50g (sợi cotton pha acrylic mềm mịn) có cấu trúc sợi se tròn chặt chẽ, không bị tưa tách chỉ khi kéo sợi. Len có độ đàn hồi vừa phải, bảng màu hơn 80 sắc độ pastel ngọt ngào, và giá thành siêu hạt dẻ chỉ 18.000đ/cuộn giúp bạn thoải mái tháo ra móc lại nhiều lần mà sợi vẫn bền đẹp.",
      },
      {
        heading: "2. Bảng so sánh 5 dòng len sợi thông dụng nhất",
        table: [
          { name: "Len Milk Bò 50g", type: "Cotton + Acrylic", needle: "2.5mm - 3.0mm", feature: "Mềm mịn, se tròn, dễ nhìn chân mũi", suitable: "Móc thú bông, hoa len, móc khóa" },
          { name: "Len Nhung Đũa", type: "Chenille Velvet", needle: "5.0mm - 6.0mm", feature: "Sợi to 6-8mm, bồng bềnh, mướt tay", suitable: "Thú bông khổng lồ, chăn len mùa đông" },
          { name: "Len Baby Yarn 40g", type: "Cotton chải kỹ", needle: "2.0mm - 2.5mm", feature: "Không xơ xù, cực lành tính cho da bé", suitable: "Mũ, giày, áo len cho trẻ sơ sinh" },
          { name: "Sợi Dệt Trơn 2mm", type: "Polyester dệt bản", needle: "2.5mm - 3.5mm", feature: "Rất đứng phom, chịu lực kéo, không dão", suitable: "Túi xách tay, mũ rộng vành, lót ly" },
          { name: "Len Mohair tơ tằm", type: "Mohair + Silk", needle: "3.5mm - 5.0mm", feature: "Sợi tơ lông xù nhẹ, bay bổng và ấm", suitable: "Khăn quàng, áo cardigan mỏng" },
        ],
      },
      {
        heading: "3. Ba sai lầm 'xương máu' người mới tuyệt đối cần tránh",
        tips: [
          "Tuyệt đối KHÔNG chọn len màu đen hoặc tông màu quá tối đậm ở sản phẩm đầu tay, vì bạn sẽ hoàn toàn không nhìn thấy lỗ chân mũi để đâm kim.",
          "Tránh xa các loại len lông xù xì, len mohair hay len nhung khi chưa quen tay, vì nếu móc sai bạn sẽ không thể tháo ra được (các sợi lông sẽ bết dính vào nhau).",
          "Đầu tư ngay một cây kim móc cán dẻo silicon chất lượng thay vì kim nhôm trơn rẻ tiền, bạn sẽ móc hàng giờ mà ngón tay không bị chai hay đau mỏi.",
        ],
      },
    ],
  },
  {
    id: 2,
    tag: "Kỹ thuật đan móc",
    shortTitle: "2. Bảng size kim móc",
    title: "Bảng tra cứu cỡ kim móc chuẩn & Bảng ký hiệu mũi móc A-Z",
    summary:
      "Len Milk bò dùng kim 2.5mm - 3.0mm; Sợi dệt móc túi dùng kim 2.5mm - 3.5mm; còn Len nhung đũa sợi bồng bềnh cần kim từ 5.0mm đến 6.0mm.",
    readTime: "5 phút đọc",
    icon: "🪡",
    sections: [
      {
        heading: "1. Bảng tra cứu cỡ kim móc chuẩn xác nhất",
        content:
          "Quy tắc vàng: Nếu móc thú bông Amigurumi, bạn hãy chọn cỡ kim NHỎ HƠN 0.5mm so với khuyến nghị trên nhãn len để mũi móc thật khít chặt, không bị lộ gòn bông ra ngoài. Ngược lại nếu móc khăn quàng cổ hoặc áo len, hãy chọn kim LỚN HƠN 0.5mm - 1.0mm để thành phẩm bay bổng mềm mại và không bị thô cứng.",
        needleList: [
          { yarn: "Len Milk Cotton 50g / 125g", hook: "2.5mm - 3.0mm (Thú bông: 2.0mm - 2.5mm)", knit: "3.0mm - 4.0mm" },
          { yarn: "Len Nhung Đũa sợi to", hook: "5.0mm - 6.0mm", knit: "6.0mm - 7.0mm" },
          { yarn: "Sợi Dệt Canvas 2mm", hook: "2.5mm - 3.5mm", knit: "Không khuyên dùng" },
          { yarn: "Len Baby Yarn / Jeans Yarn", hook: "2.0mm - 2.5mm", knit: "2.5mm - 3.5mm" },
        ],
      },
      {
        heading: "2. Bảng thuật ngữ & Ký hiệu chart móc (Việt Nam & Quốc Tế)",
        table: [
          { symbol: "MR", en: "Magic Ring", vi: "Vòng tròn ma thuật", desc: "Tạo vòng khởi đầu tròn trịa cho thú bông" },
          { symbol: "CH / o", en: "Chain stitch", vi: "Mũi bính (mũi xích)", desc: "Mũi cơ bản nhất dùng tạo dây xích khởi đầu" },
          { symbol: "X / SC", en: "Single Crochet", vi: "Mũi đơn", desc: "Mũi móc phổ biến nhất, chiếm 90% kết cấu thú len" },
          { symbol: "V / INC", en: "Increase", vi: "Mũi tăng (2 mũi chung 1 chân)", desc: "Giúp hình tròn to dần đều ra ngoài" },
          { symbol: "A / DEC", en: "Decrease", vi: "Mũi giảm (gộp 2 mũi làm 1)", desc: "Thu nhỏ phom dáng, nên dùng mũi giảm tàng hình" },
          { symbol: "T / HDC", en: "Half Double Crochet", vi: "Mũi nửa kép", desc: "Độ cao vừa phải, thường móc lá cây, tai thỏ" },
          { symbol: "F / DC", en: "Double Crochet", vi: "Mũi kép đơn", desc: "Mũi cao, dùng tạo cánh hoa tulip, váy xòe" },
          { symbol: "SL ST", en: "Slip stitch", vi: "Mũi trượt (mũi dời)", desc: "Dùng kết thúc vòng móc hoặc di chuyển len" },
        ],
      },
      {
        heading: "3. Chart thực hành ngay: Búp Hoa Tulip Len Mini",
        chartSteps: [
          "Hàng 1: Tạo MR 6X (6 mũi đơn trong vòng ma thuật)",
          "Hàng 2: 6V (móc 2 mũi đơn vào mỗi chân, tổng 12 mũi)",
          "Hàng 3: (1X, 1V) * 6 lần (tổng 18 mũi)",
          "Hàng 4: (2X, 1V) * 6 lần (tổng 24 mũi)",
          "Hàng 5 - 13: Móc 24 mũi đơn X không tăng không giảm tạo thân hoa",
          "Hoàn thiện: Nhồi gòn hạt vừa phải, bóp mép hoa thành 4 cánh chéo và khâu chốt tâm hoa lại bằng kim khâu len!",
        ],
      },
    ],
  },
  {
    id: 3,
    tag: "Bảo quản sản phẩm",
    shortTitle: "3. Mẹo giặt & Bảo quản",
    title: "Mẹo giặt & giữ gìn đồ len handmade luôn bền đẹp như mới",
    summary:
      "Không giặt máy giặt vắt mạnh. Hãy hòa tan sữa tắm trong nước ấm 30°C, bóp nhẹ nhàng và trải phơi trên mặt phẳng lưới nơi thoáng mát.",
    readTime: "4 phút đọc",
    icon: "🧼",
    sections: [
      {
        heading: "1. Bốn nguyên tắc 'VÀNG' bảo vệ sợi len",
        tips: [
          "KHÔNG giặt nước nóng trên 35°C: Nước nóng làm biến tính sợi acrylic và co rút sợi cotton, làm phai màu nhuộm.",
          "KHÔNG vắt vặn xoắn như vắt khăn mặt: Lực xoắn sẽ bẻ gãy cấu trúc sợi se, làm thú bông bị xô lệch bông gòn bên trong.",
          "KHÔNG dùng bột giặt có chất tẩy mạnh: Hãy thay bằng sữa tắm em bé hoặc nước giặt đồ lót dịu nhẹ để giữ sợi len luôn mềm mại.",
          "KHÔNG treo móc phơi thẳng đứng khi còn ướt: Trọng lượng của nước đọng sẽ kéo dão chảy xệ toàn bộ phom dáng sản phẩm.",
        ],
      },
      {
        heading: "2. Quy trình 4 bước giặt chuẩn Sene Handmade",
        chartSteps: [
          "Bước 1: Chuẩn bị thau nước mát (dưới 30°C), hòa tan 1 nắp nhỏ sữa tắm dịu nhẹ tạo bọt nhẹ.",
          "Bước 2: Nhúng sản phẩm len ngập nước, dùng lòng bàn tay bóp nhẹ nhàng trong 3 - 5 phút (tuyệt đối không chà xát).",
          "Bước 3: Xả lại bằng nước sạch 2 lần. Trải một chiếc khăn tắm khô lớn ra mặt bàn, đặt đồ len vào giữa và cuộn khăn lại rồi ấn nhẹ để khăn hút ráo 80% nước thừa.",
          "Bước 4: Đặt sản phẩm nằm ngang trên khay phơi lưới hoặc mặt phẳng có lót khăn khô ở nơi râm mát, có gió tự nhiên.",
        ],
      },
      {
        heading: "3. Mẹo xử lý khi đồ len bị xù lông hoặc bám bụi",
        content:
          "Nếu đồ len sau một thời gian sử dụng có những hạt xù li ti do cọ xát, bạn hãy dùng một chiếc máy cắt lông xù mini hoặc dao cạo nhẹ lướt trên bề mặt để lấy đi lớp xù, sản phẩm sẽ mướt mịn như lúc mới mua. Khi cất giữ trong tủ, hãy cho vào túi zip kèm gói hút ẩm và một túi hoa oải hương khô để xua đuổi côn trùng gặm nhấm sợi len.",
      },
    ],
  },
];

// DỤNG CỤ ĐAN MÓC GỢI Ý MUA KÈM (UPSELL & CROSS-SELL)
const CRAFT_ADDONS = [
  {
    id: "addon-hook-skc",
    name: "Kim móc SKC cán dẻo êm tay",
    price: 25000,
    originalPrice: 35000,
    icon: "🪡",
    desc: "Size 2.5mm / 3.0mm đầu mạ vàng chống rít",
    images: ["https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=400&auto=format&fit=crop&q=80"],
    stock: 99,
  },
  {
    id: "addon-stuffing-gon",
    name: "Bông gòn bi 100g nhồi thú bông",
    price: 15000,
    originalPrice: 22000,
    icon: "☁️",
    desc: "Bông bi loại 1 trắng tinh, giặt không xẹp",
    images: ["https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&auto=format&fit=crop&q=80"],
    stock: 99,
  },
  {
    id: "addon-pin-markers",
    name: "Set 10 kẹp định vị mũi móc hoa",
    price: 8000,
    originalPrice: 15000,
    icon: "📎",
    desc: "Đủ màu pastel, kẹp chống tuột mũi đan",
    images: ["https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80"],
    stock: 99,
  },
  {
    id: "addon-thread-scissors",
    name: "Kéo bấm cắt chỉ mini có nắp chụp",
    price: 12000,
    originalPrice: 18000,
    icon: "✂️",
    desc: "Lưỡi thép siêu bén, có nắp an toàn",
    images: ["https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=400&auto=format&fit=crop&q=80"],
    stock: 99,
  },
];

// Helper nén ảnh trực tiếp trên trình duyệt qua Canvas
function compressImageToDataUrl(file, maxWidth = 800, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff5f8",
          padding: "24px",
          fontFamily: "'Quicksand', system-ui, sans-serif"
        }}>
          <div style={{
            maxWidth: "520px",
            width: "100%",
            background: "#ffffff",
            borderRadius: "20px",
            padding: "36px 30px",
            boxShadow: "0 10px 30px rgba(244, 114, 182, 0.15)",
            border: "1.5px solid #fce7f3",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🌸</div>
            <h2 style={{ color: "#3f1a26", fontSize: "22px", marginBottom: "10px", fontWeight: 800 }}>
              Sene Handmade
            </h2>
            <p style={{ color: "#7a5364", fontSize: "14.5px", lineHeight: "1.6", marginBottom: "24px" }}>
              Giao diện đã tự động bảo vệ an toàn để tránh màn hình trắng. Bạn bấm nút bên dưới để tiếp tục nhé!
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  background: "linear-gradient(135deg, #f472b6, #fb7185)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "14px",
                  padding: "12px 24px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(244, 114, 182, 0.35)"
                }}
              >
                🔄 Tải lại trang ngay
              </button>
              <a
                href="/"
                style={{
                  background: "#fff0f5",
                  color: "#db2777",
                  border: "1.5px solid #fbcfe8",
                  borderRadius: "14px",
                  padding: "12px 20px",
                  fontWeight: 700,
                  fontSize: "14px",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center"
                }}
              >
                🏠 Về trang chủ
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function DeliveryMapPicker({
  selectedProvince,
  address,
  onSelectLocation,
  locations,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [mapOpen, setMapOpen] = useState(true);
  const [pinnedInfo, setPinnedInfo] = useState(null);
  const [mapSearch, setMapSearch] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const defaultCoords = {
    "Cần Thơ": [10.0452, 105.7469],
    "TP. Hồ Chí Minh": [10.7769, 106.7009],
    "Hà Nội": [21.0285, 105.8542],
    "Đà Nẵng": [16.0544, 108.2022],
    "Hải Phòng": [20.8449, 106.6881],
  };

  async function reverseGeocode(lat, lng) {
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=vi`
      );
      if (!resp.ok) return;
      const data = await resp.json();
      const addr = data.address || {};

      const road = addr.road || addr.pedestrian || addr.street || "";
      const houseNumber = addr.house_number || "";
      const quarter = addr.quarter || addr.suburb || addr.neighbourhood || addr.residential || "";
      const city = addr.city || addr.state || addr.province || "";

      let formattedStreet = [houseNumber, road].filter(Boolean).join(" ");
      if (!formattedStreet && quarter) formattedStreet = quarter;
      if (!formattedStreet) {
        const parts = (data.display_name || "").split(",");
        formattedStreet = parts.slice(0, 2).join(",").trim();
      }

      setPinnedInfo({
        street: formattedStreet,
        full: data.display_name || "",
        lat,
        lng,
      });

      function cleanStr(s) {
        if (!s) return "";
        return s
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/[^a-z0-9]/g, "");
      }

      const districtRaw =
        addr.city_district || addr.district || addr.county || addr.suburb || "";
      const wardRaw =
        addr.quarter ||
        addr.suburb ||
        addr.neighbourhood ||
        addr.ward ||
        addr.village ||
        addr.hamlet ||
        "";

      let matchedProvince = "";
      let matchedDistrict = "";
      let matchedWard = "";

      if (locations) {
        const provKeys = Object.keys(locations);
        const cityClean = cleanStr(city);
        const displayClean = cleanStr(data.display_name || "");

        matchedProvince =
          provKeys.find((p) => {
            const pClean = cleanStr(p);
            return (
              cityClean.includes(pClean) ||
              pClean.includes(cityClean) ||
              displayClean.includes(pClean) ||
              (cityClean.includes("hochiminh") && pClean.includes("hochiminh")) ||
              (cityClean.includes("hanoi") && pClean.includes("hanoi")) ||
              (cityClean.includes("danang") && pClean.includes("danang"))
            );
          }) || "";

        if (matchedProvince && locations[matchedProvince]) {
          const distKeys = Object.keys(locations[matchedProvince]);
          const districtRawClean = cleanStr(districtRaw);

          matchedDistrict =
            distKeys.find((d) => {
              const dClean = cleanStr(d);
              return (
                (districtRawClean &&
                  (districtRawClean.includes(dClean) || dClean.includes(districtRawClean))) ||
                displayClean.includes(dClean)
              );
            }) || "";

          if (matchedDistrict && locations[matchedProvince][matchedDistrict]) {
            const wardList = locations[matchedProvince][matchedDistrict];
            const wardRawClean = cleanStr(wardRaw);

            matchedWard =
              wardList.find((w) => {
                const wClean = cleanStr(w);
                return (
                  (wardRawClean &&
                    (wardRawClean.includes(wClean) || wClean.includes(wardRawClean))) ||
                  displayClean.includes(wClean)
                );
              }) || "";
          }
        }
      }

      onSelectLocation({
        address: formattedStreet,
        province: matchedProvince || undefined,
        district: matchedDistrict || undefined,
        ward: matchedWard || undefined,
        lat,
        lon: lng,
        fullDisplay: data.display_name,
      });
    } catch (err) {
      console.warn("Reverse geocode err:", err);
    }
  }

  async function handleSearch(e) {
    if (e) e.preventDefault();
    if (!mapSearch.trim()) return;
    setSearchLoading(true);
    try {
      const query = mapSearch.trim();
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Vietnam")}&limit=1&accept-language=vi`
      );
      const results = await resp.json();
      if (results && results.length > 0) {
        const item = results[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lon], 16, { duration: 1.2 });
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lon]);
          }
          reverseGeocode(lat, lon);
        }
      } else {
        alert("Không tìm thấy địa điểm này, vui lòng thử tên đường hoặc khu vực khác.");
      }
    } catch (err) {
      console.warn("Search map err:", err);
    } finally {
      setSearchLoading(false);
    }
  }

  function handleGetLocation() {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ GPS.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lon], 16, { duration: 1.2 });
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lon]);
          }
          reverseGeocode(lat, lon);
        }
      },
      (err) => {
        setIsLocating(false);
        alert("Không thể lấy vị trí hiện tại: " + (err.message || "Vui lòng cấp quyền truy cập vị trí"));
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }

  function jumpToCity(coords) {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(coords, 14, { duration: 1 });
      if (markerRef.current) {
        markerRef.current.setLatLng(coords);
      }
      reverseGeocode(coords[0], coords[1]);
    }
  }

  useEffect(() => {
    if (!mapOpen || !mapContainerRef.current) return;
    const L = window.L;
    if (!L) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initialCoord =
      (selectedProvince && defaultCoords[selectedProvince]) || [10.0452, 105.7469];

    const map = L.map(mapContainerRef.current, {
      center: initialCoord,
      zoom: 14,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);

    const customIcon = L.divIcon({
      className: "sene-delivery-marker",
      html: `
        <div class="marker-pin-wrapper">
          <div class="marker-pulse-ring"></div>
          <div class="marker-pin-badge">
            <span>📍</span>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    const marker = L.marker(initialCoord, {
      draggable: true,
      icon: customIcon,
    }).addTo(map);

    marker.on("dragend", (e) => {
      const pos = e.target.getLatLng();
      reverseGeocode(pos.lat, pos.lng);
    });

    map.on("click", (e) => {
      const pos = e.latlng;
      marker.setLatLng(pos);
      reverseGeocode(pos.lat, pos.lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mapOpen]);

  useEffect(() => {
    if (selectedProvince && defaultCoords[selectedProvince] && mapInstanceRef.current) {
      const coords = defaultCoords[selectedProvince];
      mapInstanceRef.current.flyTo(coords, 14);
      if (markerRef.current) {
        markerRef.current.setLatLng(coords);
      }
    }
  }, [selectedProvince]);

  return (
    <div className="checkout-map-box">
      <div className="map-box-header">
        <div className="map-box-title">
          <span className="map-icon-tag">📍</span>
          <div>
            <strong>Ghim vị trí nhận hàng trên bản đồ</strong>
            <small>Bấm vào bản đồ hoặc kéo ghim để shipper giao chính xác tận cửa</small>
          </div>
        </div>
        <div className="map-box-controls">
          <button
            type="button"
            className="map-btn-gps"
            onClick={handleGetLocation}
            disabled={isLocating}
            title="Lấy vị trí GPS hiện tại của tôi"
          >
            {isLocating ? "⏳ Đang lấy..." : "🎯 Vị trí của tôi"}
          </button>
          <button
            type="button"
            className="map-btn-toggle"
            onClick={() => setMapOpen(!mapOpen)}
          >
            {mapOpen ? "▲ Thu gọn" : "▼ Mở bản đồ"}
          </button>
        </div>
      </div>

      {mapOpen && (
        <div className="map-viewport">
          {/* Quick city presets */}
          <div className="map-presets-row">
            <span className="presets-label">Chọn nhanh:</span>
            <button
              type="button"
              className="map-preset-highlight"
              style={{ fontWeight: 800, color: "#be185d", background: "#fce7f3", borderColor: "#f472b6" }}
              onClick={() => jumpToCity([10.0452, 105.7469])}
            >
              📍 Cần Thơ (Kho Shop)
            </button>
            <button type="button" onClick={() => jumpToCity([10.7769, 106.7009])}>
              TP.HCM
            </button>
            <button type="button" onClick={() => jumpToCity([21.0285, 105.8542])}>
              Hà Nội
            </button>
            <button type="button" onClick={() => jumpToCity([16.0544, 108.2022])}>
              Đà Nẵng
            </button>
          </div>

          {/* Search bar inside map */}
          <div className="map-search-bar">
            <input
              type="text"
              placeholder="🔍 Nhập tên đường, toà nhà, chung cư cần tìm..."
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
            />
            <button type="button" onClick={handleSearch} disabled={searchLoading}>
              {searchLoading ? "..." : "Tìm"}
            </button>
          </div>

          <div ref={mapContainerRef} className="map-canvas-container" />

          {pinnedInfo && (
            <div className="map-pinned-badge">
              <span className="pinned-pin">📌</span>
              <div className="pinned-text">
                <b>{pinnedInfo.street || "Vị trí đã chọn"}</b>
                <small>{pinnedInfo.full}</small>
              </div>
              <span className="pinned-check">✓ Đã ghim địa chỉ</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const SOCIAL_PROOF_ORDERS = [
  { name: "Chị Thu Thảo", location: "Ninh Kiều, Cần Thơ", product: "Combo Kit Len Hoa Tulip Vĩnh Cửu", time: "2 phút trước", icon: "🌷" },
  { name: "Bạn Mai Linh", location: "Cái Răng, Cần Thơ", product: "4 Cuộn Len Milk Cotton 50g (Pastel)", time: "5 phút trước", icon: "🧶" },
  { name: "Anh Hoàng Nam", location: "Bình Thủy, Cần Thơ", product: "Bé Capybara Đan Móc Handmade", time: "11 phút trước", icon: "🧸" },
  { name: "Chị Phương Uyên", location: "Xuân Khánh, Cần Thơ", product: "Set 2 Kim Móc Cán Dẻo SKC & Kẹp Định Vị", time: "16 phút trước", icon: "🪡" },
  { name: "Bạn Yến Vy", location: "Ô Môn, Cần Thơ", product: "Set Len Tự Làm Bó Hoa Hướng Dương", time: "25 phút trước", icon: "🌻" },
];

const HOT_SEARCH_KEYWORDS = [
  "Len Milk Cotton 50g",
  "Len Nhung Đũa",
  "Kim Móc SKC",
  "Kit Hoa Tulip",
  "Capybara Đan Móc",
  "Khăn Len Tự Đan",
];

const PROMO_ANNOUNCEMENTS = [
  { icon: "🧶", title: "Sene Handmade:", desc: "Tiệm Len Sợi & Thú Bông Thủ Công tại Cần Thơ" },
  { icon: "⚡", title: "Hỏa Tốc 2H:", desc: "Giao hàng siêu tốc trong 2H tại TP. Cần Thơ" },
  { icon: "🎁", title: "Mua về tự làm:", desc: "Tặng bộ kẹp định vị & kim khâu cho đơn từ 150k" },
  { icon: "🚚", title: "Freeship:", desc: "Miễn phí giao hàng toàn quốc từ 200.000đ" },
  { icon: "📞", title: "Hotline/Zalo chọn len:", desc: "0942.901.124 tư vấn 24/7" },
  { icon: "🌸", title: "Ưu đãi khách quen:", desc: "Tích điểm giảm 5% cho đơn tiếp theo" },
];

function App() {
  if (window.location.pathname === "/admin") {
    return (
      <ErrorBoundary>
        <AdminPage />
      </ErrorBoundary>
    );
  }
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [currentRoute, setCurrentRoute] = useState(() => {
    if (typeof window === "undefined") return { type: "home", slug: "" };
    const cleanPath = window.location.pathname.replace(/\/+$/, "");
    if (cleanPath === "/danh-muc" || cleanPath.startsWith("/danh-muc/")) {
      const slug = cleanPath.replace(/^\/danh-muc\/?/, "").split("?")[0] || "len-soi";
      const params = new URLSearchParams(window.location.search);
      const sub = params.get("sub") || "";
      return { type: "category", slug, subcategory: sub };
    }
    if (cleanPath.startsWith("/san-pham/")) {
      const slug = cleanPath.replace("/san-pham/", "").split("?")[0];
      return { type: "product", slug };
    }
    return { type: "home", slug: "" };
  });
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(() =>
    JSON.parse(localStorage.getItem("tai-shop-user") || "null"),
  );
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [authMessage, setAuthMessage] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [cartItems, setCartItems] = useState(() =>
    JSON.parse(localStorage.getItem("tai-shop-cart") || "[]"),
  );
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [shippingMethod, setShippingMethod] = useState("STANDARD");
  const [isGiftWrap, setIsGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState("");
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [detailTab, setDetailTab] = useState("specs");
  const [detailImageIdx, setDetailImageIdx] = useState(0);
  const [detailMediaType, setDetailMediaType] = useState("image"); // 'image' | 'video'
  const [detailVideoIdx, setDetailVideoIdx] = useState(0);
  const [checkoutForm, setCheckoutForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    province: "Cần Thơ",
    district: "Quận Ninh Kiều",
    ward: "",
    note: "",
    promoCode: "",
  });
  const [orderMessage, setOrderMessage] = useState("");
  const [showCenteredQrModal, setShowCenteredQrModal] = useState(false);
  const [activeQrOrder, setActiveQrOrder] = useState(null);
  const [paymentDetecting, setPaymentDetecting] = useState(false);
  const [paymentSuccessAnim, setPaymentSuccessAnim] = useState(false);
  const [qrCountdown, setQrCountdown] = useState(600);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [toast, setToast] = useState("");
  const [activePromotions, setActivePromotions] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingQuery, setTrackingQuery] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingMsg, setTrackingMsg] = useState("");
  const [locations, setLocations] = useState(locationData);

  const [wishlist, setWishlist] = useState(() =>
    JSON.parse(localStorage.getItem("tai-yarn-wishlist") || "[]"),
  );
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [selectedColor, setSelectedColor] = useState("Trắng kem");
  const [searchFocused, setSearchFocused] = useState(false);
  const [copiedVoucherCode, setCopiedVoucherCode] = useState("");
  const [currentSocialProof, setCurrentSocialProof] = useState(null);
  const [socialProofDismissed, setSocialProofDismissed] = useState(false);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tai-recently-viewed") || "[]");
    } catch {
      return [];
    }
  });
  const [fabOpen, setFabOpen] = useState(false);

  // ĐẶT MÓC THEO YÊU CẦU (CUSTOM CROCHET ORDER)
  const [customOrderModalOpen, setCustomOrderModalOpen] = useState(false);
  const [customOrderSubmitting, setCustomOrderSubmitting] = useState(false);
  const [customOrderSuccess, setCustomOrderSuccess] = useState(null);
  const [customOrderForm, setCustomOrderForm] = useState({
    customerName: "",
    phone: "",
    zalo: "",
    productType: "Hoa len handmade vĩnh cửu",
    description: "",
    colorPreference: "",
    desiredDate: "",
    budget: "",
    referenceImages: [],
  });

  async function handleCustomOrderImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageToDataUrl(file, 800, 0.8);
      if (dataUrl) {
        setCustomOrderForm((prev) => ({
          ...prev,
          referenceImages: [dataUrl],
        }));
      }
    } catch (err) {
      console.warn("Lỗi đọc ảnh mẫu:", err);
    }
  }

  async function handleCustomOrderSubmit(e) {
    e.preventDefault();
    if (!customOrderForm.customerName.trim() || !customOrderForm.phone.trim() || !customOrderForm.description.trim()) {
      alert("Vui lòng điền đủ Họ tên, Số điện thoại và Mô tả mẫu cần móc!");
      return;
    }
    setCustomOrderSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/custom-orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customOrderForm),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gửi yêu cầu thất bại");
      setCustomOrderSuccess(result.order || { ...customOrderForm, _id: "ORD-" + Date.now().toString().slice(-6) });
    } catch (err) {
      console.warn("API lỗi, lưu cục bộ fallback:", err.message);
      // Fallback lưu local
      const localOrder = {
        ...customOrderForm,
        _id: "ORD-" + Date.now().toString().slice(-6),
        createdAt: new Date().toISOString(),
        status: "pending",
      };
      const existing = JSON.parse(localStorage.getItem("sene_custom_orders") || "[]");
      existing.unshift(localOrder);
      localStorage.setItem("sene_custom_orders", JSON.stringify(existing));
      setCustomOrderSuccess(localOrder);
    } finally {
      setCustomOrderSubmitting(false);
    }
  }

  const [flashSaleTime, setFlashSaleTime] = useState({
    hours: 4,
    minutes: 25,
    seconds: 38,
  });

  useEffect(() => {
    localStorage.setItem("tai-yarn-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
      });
    }
  }, [currentUser]);

  useEffect(() => {
    const timer = setInterval(() => {
      setFlashSaleTime((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds -= 1;
        } else if (minutes > 0) {
          minutes -= 1;
          seconds = 59;
        } else if (hours > 0) {
          hours -= 1;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function toggleWishlist(product, event) {
    if (event) event.stopPropagation();
    const exists = wishlist.includes(product._id);
    setWishlist((prev) =>
      exists ? prev.filter((id) => id !== product._id) : [...prev, product._id],
    );
    setToast(
      exists
        ? `Đã bỏ lưu ${product.name}`
        : `Đã lưu ${product.name} vào Yêu thích ♡`,
    );
    setTimeout(() => setToast(""), 2200);
  }

  useEffect(() => {
    localStorage.setItem("tai-shop-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const handlePop = () => {
      const cleanPath = window.location.pathname.replace(/\/+$/, "");
      if (cleanPath === "/danh-muc" || cleanPath.startsWith("/danh-muc/")) {
        const slug = cleanPath.replace(/^\/danh-muc\/?/, "").split("?")[0] || "len-soi";
        const params = new URLSearchParams(window.location.search);
        const sub = params.get("sub") || "";
        setCurrentRoute({ type: "category", slug, subcategory: sub });
        setSelectedProduct(null);
      } else if (cleanPath.startsWith("/san-pham/")) {
        const slug = cleanPath.replace("/san-pham/", "").split("?")[0];
        setCurrentRoute({ type: "product", slug });
        const prod = products.find((p) => p.slug === slug) || PRODUCTS.find((p) => p.slug === slug);
        if (prod) setSelectedProduct(prod);
      } else {
        setCurrentRoute({ type: "home", slug: "" });
        setSelectedProduct(null);
      }
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [products]);

  // Dynamic Google SEO & JSON-LD schema
  useEffect(() => {
    let title = "Sene Handmade - Tiệm Len Sợi Bán Lẻ & Set Kit DIY Tự Móc Tại Nhà";
    let description = "Tiệm len sợi Sene Handmade chuyên cung cấp len Milk Cotton 50g, len nhung đũa, kim móc công thái học, set kit tự móc kèm video hướng dẫn chi tiết A-Z.";
    let canonicalUrl = window.location.origin + window.location.pathname;

    if (currentRoute.type === "category") {
      const cat = CATEGORIES.find((c) => c.slug === currentRoute.slug);
      if (cat) {
        title = `${cat.name} Chất Lượng Cao, Giá Tốt Nhất | Sene Handmade`;
        description = cat.description || `Mua sắm ${cat.name} tại Sene Handmade. Đa dạng mẫu mã, len sợi mềm mịn, ship hỏa tốc toàn quốc.`;
      } else if (currentRoute.slug === "san-pham-ban-chay") {
        title = "Sản Phẩm Bán Chạy Nhất | Sene Handmade";
        description = "Tổng hợp các sản phẩm len sợi và set DIY bán chạy nhất tại Sene Handmade.";
      } else if (currentRoute.slug === "khuyen-mai") {
        title = "Chương Trình Khuyến Mãi & Giảm Giá | Sene Handmade";
        description = "Săn ngay các ưu đãi giảm giá len sợi và kit tự làm tại Sene Handmade.";
      } else if (currentRoute.slug === "san-pham-moi") {
        title = "Sản Phẩm Mới Cập Bến | Sene Handmade";
        description = "Khám phá các mẫu len và phụ kiện handmade mới nhất tại Sene Handmade.";
      }
    } else if (currentRoute.type === "product" && selectedProduct) {
      title = `${selectedProduct.name} | Sene Handmade`;
      description = selectedProduct.description ? selectedProduct.description.slice(0, 160) : `Mua ${selectedProduct.name} tại Sene Handmade.`;
    }

    document.title = title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description;

    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.rel = "canonical";
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = canonicalUrl;

    let schemaScript = document.getElementById("sene-jsonld-schema");
    if (!schemaScript) {
      schemaScript = document.createElement("script");
      schemaScript.id = "sene-jsonld-schema";
      schemaScript.type = "application/ld+json";
      document.head.appendChild(schemaScript);
    }

    if (currentRoute.type === "product" && selectedProduct) {
      schemaScript.text = JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": selectedProduct.name,
        "image": selectedProduct.images || [],
        "description": selectedProduct.description,
        "brand": {
          "@type": "Brand",
          "name": selectedProduct.brand || "Sene Handmade"
        },
        "offers": {
          "@type": "Offer",
          "priceCurrency": "VND",
          "price": selectedProduct.price,
          "availability": (selectedProduct.stock || 50) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "url": canonicalUrl
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": selectedProduct.rating || 4.9,
          "reviewCount": selectedProduct.reviewCount || 120
        }
      });
    } else if (currentRoute.type === "category") {
      const cat = CATEGORIES.find((c) => c.slug === currentRoute.slug);
      schemaScript.text = JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "CollectionPage",
        "name": cat ? cat.name : "Danh mục sản phẩm",
        "url": canonicalUrl,
        "description": cat?.description || ""
      });
    } else {
      schemaScript.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Store",
        "name": "Sene Handmade",
        "image": "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=1200&q=80",
        "telephone": "0942901124",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "124 Đường 30 Tháng 4, Phường Xuân Khánh",
          "addressLocality": "Ninh Kiều",
          "addressRegion": "Cần Thơ",
          "addressCountry": "VN"
        },
        "url": window.location.origin
      });
    }
  }, [currentRoute, selectedProduct]);


  useEffect(() => {
    if (socialProofDismissed) return;
    let idx = 0;
    const showOrder = () => {
      setCurrentSocialProof(SOCIAL_PROOF_ORDERS[idx % SOCIAL_PROOF_ORDERS.length]);
      idx++;
      setTimeout(() => {
        setCurrentSocialProof(null);
      }, 6000);
    };
    const initTimer = setTimeout(showOrder, 3500);
    const cycleTimer = setInterval(showOrder, 22000);
    return () => {
      clearTimeout(initTimer);
      clearInterval(cycleTimer);
    };
  }, [socialProofDismissed]);

  useEffect(() => {
    const localOrders = JSON.parse(
      localStorage.getItem("tai-shop-placed-orders") || "[]"
    );
    if (!currentUser) {
      setOrderHistory(localOrders);
      return;
    }
    const token = localStorage.getItem("tai-shop-token");
    fetch(`${apiUrl}/orders/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => (response.ok ? response.json() : []))
      .then((serverOrders) => {
        const orderMap = new Map();
        for (const order of [...serverOrders, ...localOrders]) {
          orderMap.set(order._id, order);
        }
        setOrderHistory(Array.from(orderMap.values()));
      })
      .catch(() => setOrderHistory(localOrders));
  }, [currentUser]);

  async function handleTrackOrder(e) {
    if (e) e.preventDefault();
    const query = trackingQuery.trim();
    if (!query) {
      setTrackingMsg("Vui lòng nhập Mã đơn hàng (VD: FD6F63) hoặc Số điện thoại");
      return;
    }
    setTrackingLoading(true);
    setTrackingMsg("");
    try {
      const res = await fetch(`${apiUrl}/orders/track/${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không tìm thấy đơn hàng");
      if (Array.isArray(data) && data.length > 0) {
        setSelectedOrder(data[0]);
        setOrderHistory((prev) => {
          const map = new Map();
          for (const o of [...data, ...prev]) map.set(o._id, o);
          return Array.from(map.values());
        });
      } else {
        throw new Error("Không tìm thấy đơn hàng phù hợp");
      }
    } catch (err) {
      setTrackingMsg(err.message);
    } finally {
      setTrackingLoading(false);
    }
  }

  // TỰ ĐỘNG THEO DÕI THANH TOÁN VIETQR (POLLING MỖI 2.5 GIÂY, KHÔNG CẦN BẤM XÁC NHẬN)
  useEffect(() => {
    if (!showCenteredQrModal || !activeQrOrder?._id) return;

    const countdownTimer = setInterval(() => {
      setQrCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    let isCancelled = false;
    const pollPayment = async () => {
      try {
        const res = await fetch(`${apiUrl}/orders/${activeQrOrder._id}/check-payment`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.isPaid && !isCancelled) {
          setPaymentSuccessAnim(true);
          const updated = data.order || { ...activeQrOrder, paymentStatus: "paid", status: "confirmed" };
          setOrderHistory((prev) =>
            prev.map((o) => (o._id === updated._id ? updated : o))
          );
          setTimeout(() => {
            setShowCenteredQrModal(false);
            setPaymentSuccessAnim(false);
            setSelectedOrder(updated);
            setToast(`🎉 MB Bank nhận tiền thành công! Đơn hàng #${updated.trackingCode || updated._id.slice(-6).toUpperCase()} đã xác nhận.`);
          }, 2200);
        }
      } catch (err) {
        // Network error ignored
      }
    };

    const pollTimer = setInterval(pollPayment, 2500);

    return () => {
      isCancelled = true;
      clearInterval(countdownTimer);
      clearInterval(pollTimer);
    };
  }, [showCenteredQrModal, activeQrOrder]);

  // GIẢ LẬP XÁC NHẬN CHUYỂN KHOẢN THÀNH CÔNG (TỨC THÌ CHO KHÁCH TEST)
  async function handleSimulatePayment(orderId) {
    if (!orderId) return;
    setPaymentDetecting(true);
    try {
      let updatedOrder = null;
      try {
        const res = await fetch(`${apiUrl}/orders/${orderId}/simulate-payment`, {
          method: "POST",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.order) updatedOrder = data.order;
        }
      } catch (netErr) {
        console.warn("Máy chủ chưa phản hồi, cập nhật thanh toán trực tiếp:", netErr);
      }

      if (!updatedOrder) {
        const base = activeQrOrder || orderHistory.find((o) => o._id === orderId) || {};
        updatedOrder = {
          ...base,
          _id: orderId,
          paymentStatus: "paid",
          status: "confirmed",
          paidAt: new Date().toISOString(),
          shippingLogs: [
            ...(base.shippingLogs || []),
            {
              time: new Date(),
              title: "Tài khoản nhận tiền thành công",
              desc: `Tài khoản MB Bank 0942901124 (HUYNH VAN TAI) đã nhận số tiền ${(base.totalAmount || finalOrderTotal || 0).toLocaleString("vi-VN")}đ qua VietQR.`,
              location: "MB Bank CN Cần Thơ",
              icon: "💳",
            },
            {
              time: new Date(),
              title: "Shop đã duyệt & chuẩn bị hàng",
              desc: "Tiệm Len Sene Handmade đã xác nhận thanh toán và đang đóng gói sản phẩm len.",
              location: "Kho Tổng Cần Thơ (124 Đ. 30/4, Ninh Kiều)",
              icon: "🏪",
            },
          ],
        };
      }

      setPaymentSuccessAnim(true);
      setActiveQrOrder(updatedOrder);
      setOrderHistory((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
      const savedLocal = JSON.parse(
        localStorage.getItem("tai-shop-placed-orders") || "[]"
      );
      const exists = savedLocal.some((o) => o._id === updatedOrder._id);
      const newLocal = exists
        ? savedLocal.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
        : [updatedOrder, ...savedLocal];
      localStorage.setItem("tai-shop-placed-orders", JSON.stringify(newLocal));

      if (selectedOrder && selectedOrder._id === updatedOrder._id) {
        setSelectedOrder(updatedOrder);
      }
      setTimeout(() => {
        setShowCenteredQrModal(false);
        setPaymentSuccessAnim(false);
        setSelectedOrder(updatedOrder);
        setToast("🎉 MB Bank: Nhận tiền thành công! Hệ thống tự động xác nhận đơn!");
      }, 2200);
    } catch (err) {
      console.error(err);
      setToast("Chưa thể cập nhật thanh toán: " + err.message);
    } finally {
      setPaymentDetecting(false);
    }
  }

  // CẬP NHẬT TIẾN ĐỘ GIAO HÀNG SHOPEE XPRESS (TIẾP TỤC BƯỚC TIẾP THEO)
  async function handleAdvanceShipping(orderId, targetStatus) {
    if (!orderId) return;
    try {
      const res = await fetch(`${apiUrl}/orders/${orderId}/advance-shipping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setSelectedOrder(data.order);
        setOrderHistory((prev) =>
          prev.map((o) => (o._id === data.order._id ? data.order : o))
        );
        const stNames = {
          confirmed: "Shop Đã Xác Nhận & Đóng Gói",
          shipping: "Bưu Tá SPX Đang Đi Giao Hàng",
          delivered: "Đã Giao Hàng Thành Công",
        };
        setToast(`🚚 Tiến độ Shopee Xpress: ${stNames[data.order.status] || data.order.status}!`);
        setTimeout(() => setToast(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function reorder(order) {
    if (!order || !order.items) return;
    for (const item of order.items) {
      const productObj = products.find((p) => p._id === item.product) || {
        _id: item.product,
        name: item.name,
        price: item.price,
        images: [item.image],
      };
      addToCart(productObj, item.quantity);
    }
    setSelectedOrder(null);
    setCartOpen(true);
    setToast(`Đã thêm ${order.items.length} món vào giỏ hàng!`);
    setTimeout(() => setToast(""), 2500);
  }

  useEffect(() => {
    if (window.location.pathname === "/account" && currentUser) {
      setTimeout(
        () =>
          document
            .querySelector("#orders")
            ?.scrollIntoView({ behavior: "smooth" }),
        150,
      );
    }
  }, [currentUser]);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then((response) => (response.ok ? response.json() : []))
      .then((provinces) => {
        if (!provinces.length) return;
        const mapped = Object.fromEntries(
          provinces.map((province) => [
            province.name,
            Object.fromEntries(
              (province.districts || []).map((district) => [
                district.name,
                (district.wards || []).map((ward) => ward.name),
              ]),
            ),
          ]),
        );
        setLocations(mapped);
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    async function loadStore() {
      try {
        const [categoryResponse, productResponse, promotionResponse] =
          await Promise.all([
            fetch(`${apiUrl}/categories`),
            fetch(`${apiUrl}/products`),
            fetch(`${apiUrl}/promotions/active`),
          ]);
        if (!categoryResponse.ok || !productResponse.ok) return;

        const catText = await categoryResponse.text();
        if (!catText.trim().startsWith("<")) {
          const catData = JSON.parse(catText);
          if (Array.isArray(catData) && catData.length) setCategories(catData);
        }

        const prodText = await productResponse.text();
        if (!prodText.trim().startsWith("<")) {
          const prodData = JSON.parse(prodText);
          const loadedProducts = prodData?.products || prodData;
          if (Array.isArray(loadedProducts) && loadedProducts.length) {
            setProducts(loadedProducts);
          }
        }

        if (promotionResponse.ok) {
          const promoText = await promotionResponse.text();
          if (!promoText.trim().startsWith("<")) {
            setActivePromotions(JSON.parse(promoText));
          }
        }

        const detailSlug = window.location.pathname.startsWith("/san-pham/")
          ? window.location.pathname.replace("/san-pham/", "").split("?")[0]
          : "";
        const allProds = PRODUCTS;
        const directProduct = allProds.find(
          (product) => product.slug === detailSlug,
        );
        if (directProduct) {
          setSelectedProduct(directProduct);
          setCurrentRoute({ type: "product", slug: directProduct.slug });
        }
      } catch (loadError) {
        console.warn("Dùng dữ liệu sản phẩm tích hợp sẵn:", loadError);
      } finally {
        setLoading(false);
      }
    }
    loadStore();
  }, []);

  const visibleProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory =
          !activeCategory || product.category?.slug === activeCategory;
        const normalizedSearch = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !normalizedSearch ||
          `${product.name} ${product.brand} ${product.category?.name}`
            .toLowerCase()
            .includes(normalizedSearch);

        let matchesPrice = true;
        if (priceFilter === "<50k") matchesPrice = product.price < 50000;
        else if (priceFilter === "50k-150k")
          matchesPrice = product.price >= 50000 && product.price <= 150000;
        else if (priceFilter === "150k-300k")
          matchesPrice = product.price > 150000 && product.price <= 300000;
        else if (priceFilter === ">300k") matchesPrice = product.price > 300000;

        return matchesCategory && matchesSearch && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [activeCategory, priceFilter, products, searchQuery, sortBy]);

  const liveSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchProducts(searchQuery).slice(0, 6);
  }, [searchQuery]);

  const recentlyViewedProducts = useMemo(() => {
    if (!recentlyViewedIds || recentlyViewedIds.length === 0) return [];
    return recentlyViewedIds
      .map((id) => products.find((p) => p._id === id))
      .filter(Boolean);
  }, [recentlyViewedIds, products]);

  function handleClaimVoucher(voucher) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(voucher.code);
    }
    setCopiedVoucherCode(voucher.code);
    setPromoInput(voucher.code);
    if (cartTotal >= voucher.minOrder) {
      applyVoucher(voucher.code);
    } else {
      setToast(`Đã lưu mã ${voucher.code}! Sẽ tự động áp dụng khi đơn đủ ${formatPrice(voucher.minOrder)}.`);
      setTimeout(() => setToast(""), 3500);
    }
    setTimeout(() => setCopiedVoucherCode(""), 2500);
  }

  async function submitAuth(event) {
    event.preventDefault();
    setAuthMessage("");
    try {
      const response = await fetch(`${apiUrl}/auth/${authMode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      localStorage.setItem("tai-shop-token", data.token);
      localStorage.setItem("tai-shop-user", JSON.stringify(data.user));
      setCurrentUser(data.user);
      setAuthMessage("Đăng nhập thành công.");
      setAuthForm({ name: "", email: "", password: "" });
    } catch (authError) {
      setAuthMessage(authError.message);
    }
  }

  function logout() {
    localStorage.removeItem("tai-shop-token");
    localStorage.removeItem("tai-shop-user");
    setCurrentUser(null);
    setIsEditingProfile(false);
    setAuthMessage("Bạn đã đăng xuất.");
  }

  async function saveProfile(event) {
    event.preventDefault();
    setProfileMessage("");
    try {
      const token = localStorage.getItem("tai-shop-token");
      if (!token) throw new Error("Vui lòng đăng nhập lại để cập nhật thông tin");
      const response = await fetch(`${apiUrl}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Cập nhật thất bại");
      const updatedUser = { ...currentUser, ...data.user };
      setCurrentUser(updatedUser);
      localStorage.setItem("tai-shop-user", JSON.stringify(updatedUser));
      setIsEditingProfile(false);
      setToast("🎉 Đã lưu thông tin tài khoản thành công!");
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      setProfileMessage(err.message);
    }
  }

  function addPresetComboToCart(preset) {
    const matched =
      products.find((p) =>
        p.name?.toLowerCase().includes(preset.productName.toLowerCase())
      ) ||
      products.find((p) => p.category?.slug === "len-soi-dan-moc") ||
      products[0];

    if (matched) {
      addToCart(matched, preset.quantity);
      setToast(`🎉 Đã thêm trọn combo "${preset.name}" (${preset.quantity} cuộn) vào giỏ hàng!`);
      setCartOpen(true);
    }
  }

  function addYarnShadeToCart(shade) {
    const milkYarn =
      products.find((p) => p.slug === "len-milk-cotton-50g-ban-le") ||
      products.find((p) => p.category?.slug === "len-soi") ||
      products[0];
    if (milkYarn) {
      const shadeItem = {
        ...milkYarn,
        _id: `${milkYarn._id}-mau-${shade.code || shade.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: `Len Milk Cotton 50g (Màu ${shade.name} - Mã ${shade.code || "01"})`,
        price: 18000,
      };
      addToCart(shadeItem, 1);
      setToast(`🧶 Đã thêm 1 cuộn Len Milk Cotton - ${shade.name} vào giỏ!`);
      setCartOpen(true);
    }
  }

  function addToCart(product, quantity = 1) {
    setCartItems((items) => {
      const existing = items.find((item) => item.product === product._id);
      if (existing)
        return items.map((item) =>
          item.product === product._id
            ? {
              ...item,
              quantity: Math.min(item.quantity + quantity, product.stock),
            }
            : item,
        );
      return [
        ...items,
        {
          product: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0],
          stock: product.stock,
          quantity: Math.min(quantity, product.stock),
        },
      ];
    });
    setToast(`${product.name} đã được thêm vào giỏ hàng`);
    setTimeout(() => setToast(""), 2600);
  }

  function changeQuantity(productId, change) {
    setCartItems((items) =>
      items
        .map((item) =>
          item.product === productId
            ? {
              ...item,
              quantity: Math.min(
                Math.max(item.quantity + change, 0),
                item.stock,
              ),
            }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function clearCart() {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ sản phẩm khỏi giỏ hàng?")) {
      setCartItems([]);
      setAppliedVoucher(null);
      setToast("Đã xóa toàn bộ sản phẩm khỏi giỏ hàng");
      setTimeout(() => setToast(""), 2000);
    }
  }

  function openProductDetail(product, mediaType = "image", videoIdx = 0) {
    if (!product) return;
    setSelectedProduct(product);
    setDetailQuantity(1);
    setDetailTab("specs");
    setDetailImageIdx(0);
    setDetailMediaType(mediaType);
    setDetailVideoIdx(videoIdx);
    const pId = product._id || product.id;
    if (pId) {
      setRecentlyViewedIds((prev) => {
        const next = [pId, ...prev.filter((id) => id !== pId)].slice(0, 8);
        try {
          localStorage.setItem("tai-recently-viewed", JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    }
    window.history.pushState({}, "", `/san-pham/${product.slug}`);
    setCurrentRoute({ type: "product", slug: product.slug });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeProductDetail() {
    setSelectedProduct(null);
    window.history.pushState({}, "", "/");
    setCurrentRoute({ type: "home", slug: "" });
  }

  function navigateHome() {
    window.history.pushState({}, "", "/");
    setCurrentRoute({ type: "home", slug: "" });
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function navigateCategory(slug, subcategory = "") {
    const cleanSlug = String(slug || "len-soi").replace(/^\/danh-muc\/?/, "").replace(/\/+$/, "");
    const url = subcategory ? `/danh-muc/${cleanSlug}?sub=${encodeURIComponent(subcategory)}` : `/danh-muc/${cleanSlug}`;
    window.history.pushState({}, "", url);
    setCurrentRoute({ type: "category", slug: cleanSlug, subcategory });
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollToSection(sectionId) {
    if (currentRoute.type !== "home") {
      navigateHome();
      setTimeout(() => {
        document.querySelector(`#${sectionId}`)?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } else {
      document.querySelector(`#${sectionId}`)?.scrollIntoView({ behavior: "smooth" });
    }
  }
  function buyNow(product, quantity) {
    addToCart(product, quantity);
    closeProductDetail();
    setCartOpen(false);
    setCheckoutOpen(true);
  }

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const STORE_VOUCHERS = [
    {
      code: "TIEMLEN10",
      title: "Giảm 10% Toàn Đơn",
      label: "Giảm 10% tổng đơn hàng",
      desc: "Áp dụng cho mọi đơn hàng",
      minOrder: 0,
      type: "percent",
      value: 0.1,
      badge: "-10%",
    },
    {
      code: "FREESHIP",
      title: "Freeship Toàn Quốc",
      label: "Miễn phí ship tiêu chuẩn (25.000đ)",
      desc: "Giảm 25.000đ phí giao hàng",
      minOrder: 0,
      type: "shipping",
      value: 25000,
      badge: "Freeship",
    },
    {
      code: "LENXINH30",
      title: "Ưu Đãi Len Xinh 30K",
      label: "Giảm ngay 30.000đ",
      desc: "Áp dụng cho đơn từ 100.000đ",
      minOrder: 100000,
      type: "fixed",
      value: 30000,
      badge: "-30k",
    },
  ];

  // CHỈ MÃ NÀO THỰC SỰ SỬ DỤNG ĐƯỢC CHO ĐƠN NÀY MỚI HIỆN LÊN:
  const eligibleVouchers = STORE_VOUCHERS.filter((v) => cartTotal >= v.minOrder);

  function applyVoucher(codeToApply) {
    const code = (codeToApply || promoInput).trim().toUpperCase();
    setVoucherError("");
    setOrderMessage("");
    if (!code) return;

    const matched = STORE_VOUCHERS.find((v) => v.code === code);
    if (!matched) {
      setVoucherError("Mã giảm giá không hợp lệ hoặc đã hết lượt dùng");
      return;
    }

    if (cartTotal < matched.minOrder) {
      setVoucherError(`Mã ${matched.code} chỉ áp dụng cho đơn từ ${formatPrice(matched.minOrder)} trở lên`);
      return;
    }

    setAppliedVoucher(matched);
    setToast(`Đã áp dụng mã ${matched.code}: ${matched.label} ♡`);
    setTimeout(() => setToast(""), 2200);
  }

  const shippingFee =
    shippingMethod === "EXPRESS" ? 30000 : cartTotal >= 300000 ? 0 : 25000;
  let discountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.type === "percent") {
      discountAmount = Math.min(Math.round(cartTotal * appliedVoucher.value), 60000);
    } else if (appliedVoucher.type === "shipping") {
      discountAmount = Math.min(shippingFee, appliedVoucher.value);
    } else if (appliedVoucher.type === "fixed") {
      discountAmount = Math.min(cartTotal, appliedVoucher.value);
    }
  }
  const finalOrderTotal = Math.max(0, cartTotal + shippingFee - discountAmount);

  async function submitOrder(event) {
    if (event) event.preventDefault();
    setOrderMessage("");

    if (!checkoutForm.customerName.trim() || !checkoutForm.phone.trim() || !checkoutForm.address.trim()) {
      setOrderMessage("Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng.");
      return;
    }
    if (!cartItems || cartItems.length === 0) {
      setOrderMessage("Giỏ hàng của bạn đang trống.");
      return;
    }

    try {
      const token = localStorage.getItem("tai-shop-token");
      const orderNote = [
        checkoutForm.note,
        shippingMethod === "EXPRESS" ? "[Giao Hỏa Tốc 2H Cần Thơ]" : "[Giao Tiêu Chuẩn]",
        isGiftWrap
          ? `[Gói quà & Thiệp: "${giftMessage || "Thiệp viết tay handmade chúc mừng"}" ]`
          : "",
        appliedVoucher
          ? `[Voucher: ${appliedVoucher.code} -${formatPrice(discountAmount)}]`
          : "",
      ]
        .filter(Boolean)
        .join(" | ");

      let orderData = null;

      try {
        const response = await fetch(`${apiUrl}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            ...checkoutForm,
            address: [
              checkoutForm.address,
              checkoutForm.ward,
              checkoutForm.district,
              checkoutForm.province,
            ]
              .filter(Boolean)
              .join(", "),
            promoCode: appliedVoucher ? appliedVoucher.code : checkoutForm.promoCode,
            paymentMethod,
            note: orderNote,
            items: cartItems.map((item) => ({
              product: item.product?._id || item.product,
              name: item.product?.name || "Sản phẩm len handmade",
              price: item.product?.price || 0,
              image: item.product?.images?.[0] || "",
              quantity: item.quantity,
            })),
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.order) {
          throw new Error(data.message || "Không thể tạo đơn hàng trên máy chủ");
        }
        orderData = data.order;
      } catch (netErr) {
        throw new Error(
          netErr.message && !netErr.message.includes("fetch")
            ? netErr.message
            : "Chưa thể kết nối tới máy chủ để tạo đơn hàng. Vui lòng thử lại sau giây lát!"
        );
      }

      if (!orderData) {
        throw new Error("Không thể khởi tạo đơn hàng. Vui lòng thử lại!");
      }

      setCartItems([]);
      setCheckoutForm({
        customerName: "",
        phone: "",
        address: "",
        province: "Cần Thơ",
        district: "Quận Ninh Kiều",
        ward: "",
        note: "",
        promoCode: "",
      });
      setAppliedVoucher(null);
      setIsGiftWrap(false);
      setGiftMessage("");
      setCheckoutOpen(false);

      const savedLocal = JSON.parse(
        localStorage.getItem("tai-shop-placed-orders") || "[]"
      );
      const updatedLocal = [
        orderData,
        ...savedLocal.filter((o) => o._id !== orderData._id),
      ];
      localStorage.setItem(
        "tai-shop-placed-orders",
        JSON.stringify(updatedLocal)
      );
      setOrderHistory(updatedLocal);

      if (paymentMethod === "BANK_TRANSFER") {
        setActiveQrOrder(orderData);
        setQrCountdown(600);
        setPaymentSuccessAnim(false);
        setShowCenteredQrModal(true);
        setToast(`⚡ Đã tạo đơn #${orderData.trackingCode || orderData._id.slice(-6).toUpperCase()}! Vui lòng quét mã VietQR chuyển khoản.`);
      } else {
        setSelectedOrder(orderData);
        setToast(`🎉 Đặt hàng thành công! Mã đơn: #${orderData.trackingCode || orderData._id.slice(-6).toUpperCase()}`);
      }
      setTimeout(() => setToast(""), 4500);
    } catch (orderError) {
      setOrderMessage(orderError.message);
    }
  }

  const heroProducts = products.slice(0, 3);
  const flashSaleProducts = products.filter((p) => p.featured).slice(0, 4);
  const videoProducts = products.filter((p) => p.videos && p.videos.length > 0);
  const freeshipRemaining = Math.max(0, FREESHIP_THRESHOLD - cartTotal);
  const freeshipPercent = Math.min(
    100,
    Math.round((cartTotal / FREESHIP_THRESHOLD) * 100),
  );
  const wishlistProducts = products.filter((p) => wishlist.includes(p._id));

  return (
    <main className="storefront">
      <div className="promo-bar" role="region" aria-label="Thông báo ưu đãi">
        <div className="promo-ticker-track">
          <div className="promo-ticker-content">
            {PROMO_ANNOUNCEMENTS.concat(PROMO_ANNOUNCEMENTS).map((item, idx) => (
              <span key={`p1-${idx}`} className="promo-ticker-item">
                <span>{item.icon}</span>
                <strong>{item.title}</strong>
                <span>{item.desc}</span>
                <span className="promo-ticker-sep">•</span>
              </span>
            ))}
          </div>
          <div className="promo-ticker-content" aria-hidden="true">
            {PROMO_ANNOUNCEMENTS.concat(PROMO_ANNOUNCEMENTS).map((item, idx) => (
              <span key={`p2-${idx}`} className="promo-ticker-item">
                <span>{item.icon}</span>
                <strong>{item.title}</strong>
                <span>{item.desc}</span>
                <span className="promo-ticker-sep">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="header-main">
          <a
            className="brand"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigateHome();
            }}
          >
            <span className="brand-icon">🧶</span>
            <div className="brand-text">
              SENE <span>HANDMADE</span>
              <small className="brand-slogan">Tiệm Len Sợi Bán Lẻ & Kit Tự Làm</small>
            </div>
          </a>

          <div className="search-box-wrapper">
            <form
              className={`search-box ${searchFocused ? "focused" : ""}`}
              onSubmit={(event) => {
                event.preventDefault();
                setSearchFocused(false);
                document
                  .querySelector("#products")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <span className="search-icon">⌕</span>
              <input
                id="site-search-input"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => {
                  setTimeout(() => setSearchFocused(false), 260);
                }}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm len milk cotton, nhung đũa, kim móc, kit tự làm, hoa len..."
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  className="search-clear-btn"
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchFocused(false);
                  }}
                  title="Xóa tìm kiếm"
                >
                  ×
                </button>
              )}
              <button type="submit" className="search-submit-btn">
                Tìm kiếm
              </button>
            </form>

            {searchFocused && (
              <div className="search-autocomplete-dropdown" onMouseDown={(e) => e.preventDefault()}>
                {searchQuery.trim() ? (
                  <>
                    <div className="search-dropdown-header">
                      <span>Gợi ý sản phẩm ({liveSearchResults.length})</span>
                      <small>Nhấn Enter để lọc tất cả</small>
                    </div>

                    {liveSearchResults.length > 0 ? (
                      <div className="search-dropdown-list">
                        {liveSearchResults.map((prod) => (
                          <div
                            key={`search-res-${prod._id}`}
                            className="search-dropdown-item"
                            onClick={() => {
                              setSearchFocused(false);
                              openProductDetail(prod);
                            }}
                          >
                            <img
                              src={prod.images?.[0]}
                              alt={prod.name}
                              className="search-item-thumb"
                            />
                            <div className="search-item-info">
                              <span className="search-item-name">{prod.name}</span>
                              <div className="search-item-meta">
                                <span className="search-item-cat">{prod.category?.name}</span>
                                <strong className="search-item-price">{formatPrice(prod.price)}</strong>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="search-item-quick-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSearchFocused(false);
                                buyNow(prod, 1);
                              }}
                              title="Mua ngay"
                            >
                              Mua ngay
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="search-dropdown-view-all"
                          onClick={() => {
                            setSearchFocused(false);
                            document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" });
                          }}
                        >
                          Xem tất cả kết quả cho "{searchQuery}" →
                        </button>
                      </div>
                    ) : (
                      <div className="search-dropdown-empty">
                        <p>Không tìm thấy sản phẩm nào khớp với <strong>"{searchQuery}"</strong></p>
                        <span className="search-empty-hint">Gợi ý: "len milk", "kim móc", "hoa tulip", "capybara"</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="search-dropdown-hot">
                    <div className="search-dropdown-header">
                      <span>🔥 Từ khóa tìm kiếm phổ biến</span>
                    </div>
                    <div className="search-hot-tags">
                      {HOT_SEARCH_KEYWORDS.map((kw) => (
                        <button
                          key={kw}
                          type="button"
                          className="search-hot-tag"
                          onClick={() => {
                            setSearchQuery(kw);
                            setSearchFocused(false);
                            document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" });
                          }}
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="header-user-actions">
            <button
              className="header-action-btn header-wishlist-btn"
              type="button"
              onClick={() => setWishlistOpen(true)}
              title="Danh sách yêu thích"
            >
              <span className="action-icon">♡</span>
              <span className="action-label">Yêu thích</span>
              {wishlist.length > 0 && <b className="action-badge">{wishlist.length}</b>}
            </button>

            <a
              className="header-action-btn"
              href="#account"
              title={currentUser ? `Tài khoản: ${currentUser.name}` : "Đăng nhập / Đăng ký"}
            >
              <span className="action-icon">👤</span>
              <span className="action-label">
                {currentUser ? currentUser.name : "Tài khoản"}
              </span>
            </a>

            {currentUser && (
              <a className="header-action-btn header-orders-link" href="#orders" title="Lịch sử đơn hàng">
                <span className="action-icon">📋</span>
                <span className="action-label">Đơn hàng</span>
              </a>
            )}

            <button
              className="header-cart-btn"
              type="button"
              onClick={() => setCartOpen(true)}
            >
              <span className="cart-icon">🛒</span>
              <div className="cart-info">
                <small>Giỏ hàng</small>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>
              <b className="cart-badge">{cartCount}</b>
            </button>
          </div>
        </div>

        <MainNavigation
          activeCategorySlug={currentRoute.type === "category" ? currentRoute.slug : ""}
          onSelectCategory={(slug, sub) => navigateCategory(slug, sub)}
          onSelectSubcategory={(catSlug, subSlug) => navigateCategory(catSlug, subSlug)}
          onOpenCustomOrder={() => {
            setCustomOrderSuccess(null);
            setCustomOrderModalOpen(true);
          }}
          onScrollToSection={scrollToSection}
        />
      </header>

      {/* VIEW 1: CATEGORY PAGE */}
      {currentRoute.type === "category" && (
        <ErrorBoundary>
          <CategoryView
            categorySlug={currentRoute.slug}
            initialSubcategory={currentRoute.subcategory}
            allProducts={products}
            onOpenProductDetail={openProductDetail}
            onAddToCart={(prod, qty) => addToCart(prod, qty || 1)}
            onBuyNow={buyNow}
            isWishlisted={(id) => wishlist.includes(id)}
            onToggleWishlist={toggleWishlist}
            onNavigateHome={navigateHome}
            onNavigateCategory={navigateCategory}
          />
        </ErrorBoundary>
      )}

      {/* VIEW 2: PRODUCT DETAIL PAGE */}
      {currentRoute.type === "product" && (
        <ProductDetailView
          product={selectedProduct || products.find((p) => p.slug === currentRoute.slug) || PRODUCTS[0]}
          onAddToCart={(prod, qty) => addToCart(prod, qty || 1)}
          onBuyNow={buyNow}
          isWishlisted={(id) => wishlist.includes(id)}
          onToggleWishlist={toggleWishlist}
          onNavigateHome={navigateHome}
          onNavigateCategory={navigateCategory}
          onOpenProductDetail={openProductDetail}
        />
      )}

      {/* VIEW 3: HOMEPAGE (13 SALES FUNNEL SECTIONS) */}
      {currentRoute.type === "home" && (
        <>

      <section className="hero-banner">
        <div className="banner-copy">
          <div className="banner-badge-top">
            <span className="banner-badge-sparkle">🌸</span>
            <span>TIỆM BÁN LẺ LEN SỢI &amp; KIT TỰ LÀM CHO NGƯỜI MỚI</span>
          </div>
          <h1>
            Mua len về tự làm,
            <br />
            <em>dệt trọn vẹn yêu thương.</em>
          </h1>
          <p>
            Chuyên bán lẻ từng cuộn len Milk Cotton 50g mềm mịn, len nhung đũa bồng bềnh,
            bộ kim móc êm tay và các set Kit tự làm kèm video hướng dẫn từng mũi đan cho người mới!
          </p>
          <div className="banner-cta-group">
            <a className="banner-button primary-cta" href="#yarn-palette">
              🧶 Bảng màu len bán lẻ (18k) <span>→</span>
            </a>
            <button
              className="banner-button secondary-cta"
              type="button"
              onClick={() => {
                document.querySelector("#beginner-corner")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              🌱 Combo cho người mới bắt đầu ✨
            </button>
          </div>
          <div className="banner-trust-badges">
            <span>✓ Bán lẻ từ 1 cuộn</span>
            <span>✓ 80+ mã màu pastel</span>
            <span>✓ Kèm video HD A-Z</span>
            <span>✓ Đổi trả miễn phí 7 ngày</span>
          </div>
        </div>

        <div className="hero-showcase">
          <div
            className="hero-card-featured"
            onClick={() => openProductDetail(heroProducts[0] || products[0])}
            role="button"
            tabIndex={0}
          >
            <span className="hero-card-tag">★ BÁN CHẠY NHẤT</span>

            {/* Artisan floating seal */}
            <div className="hero-artisan-seal" title="100% Len Sợi Chọn Lọc & Handmade With Love">
              <div className="seal-ring">
                <span className="seal-pct">100%</span>
                <span className="seal-sub">YARN &amp; DIY</span>
                <span className="seal-heart">WITH LOVE ♡</span>
              </div>
            </div>

            <img
              src={heroProducts[0]?.images?.[0] || "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80"}
              alt={heroProducts[0]?.name || "Len Milk Cotton 50g"}
              className="hero-card-img"
            />
            <div className="hero-card-bottom-pill">
              <div className="pill-info">
                <strong>{heroProducts[0]?.name || "Len Milk Cotton 50g Bán Lẻ"}</strong>
                <span className="pill-rating">★★★★★ <span>(1.200+ đã bán)</span></span>
              </div>
              <div className="pill-price">
                <small>Giá lẻ:</small>
                <b>{formatPrice(heroProducts[0]?.price || 18000)}</b>
              </div>
            </div>
          </div>

          <div className="hero-sub-cards">
            {heroProducts.slice(1, 3).map((prod) => (
              <div
                key={prod._id}
                className="hero-sub-card-item"
                onClick={() => openProductDetail(prod)}
                role="button"
                tabIndex={0}
              >
                <img src={prod.images?.[0]} alt={prod.name} />
                <div className="sub-card-details">
                  <h4>{prod.name}</h4>
                  <div className="sub-card-price-row">
                    <strong>{formatPrice(prod.price)}</strong>
                    <span className="sub-card-link">Xem chi tiết →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VOUCHER STRIP / MÃ GIẢM GIÁ TRỰC QUAN */}
      <section className="voucher-strip-section" aria-label="Mã giảm giá hot">
        <div className="voucher-strip-inner">
          <div className="voucher-strip-title">
            <span className="voucher-strip-sparkle">🎟️</span>
            <div>
              <strong>MÃ GIẢM GIÁ TIỆM TẶNG BẠN</strong>
              <small>Thu thập mã ngay để được trừ tiền trực tiếp khi đặt hàng</small>
            </div>
          </div>
          <div className="voucher-strip-cards">
            {STORE_VOUCHERS.map((v) => {
              const isCopied = copiedVoucherCode === v.code;
              return (
                <div className="voucher-strip-card" key={v.code}>
                  <div className="voucher-card-left">
                    <span className="voucher-badge-val">{v.badge}</span>
                    <span className="voucher-type-tag">TIỆM LEN</span>
                  </div>
                  <div className="voucher-card-body">
                    <strong>{v.title}</strong>
                    <p>{v.desc}</p>
                    <small>Mã: <code>{v.code}</code></small>
                  </div>
                  <button
                    type="button"
                    className={`voucher-claim-btn ${isCopied ? "claimed" : ""}`}
                    onClick={() => handleClaimVoucher(v)}
                    title={`Lưu mã ${v.code}`}
                  >
                    {isCopied ? "✓ Đã lưu" : "Lưu mã"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GÓC CHO NGƯỜI MỚI BẮT ĐẦU (BEGINNER STARTER CORNER) */}
      <section className="beginner-corner-section" id="beginner-corner">
        <div className="beginner-corner-header">
          <div className="beginner-title-wrap">
            <span className="beginner-pill-tag">🌱 DÀNH CHO NGƯỜI MỚI BẮT ĐẦU</span>
            <h2>Chưa Từng Cầm Kim Móc? 3 Bước Dễ Dàng Tự Làm Tại Nhà</h2>
            <p>
              Đừng lo nếu bạn chưa biết bắt đầu từ đâu! Sene Handmade đã chuẩn bị sẵn từng cuộn len dễ móc nhất,
              kim móc êm tay và video cầm tay chỉ việc từ mũi đầu tiên.
            </p>
          </div>
        </div>

        <div className="beginner-steps-grid">
          <div className="beginner-step-card">
            <div className="step-number-badge">01</div>
            <div className="step-icon">🧶</div>
            <h3>Chọn Len Milk Cotton 50g</h3>
            <p>
              Sợi len se tròn chặt không tưa, mềm mịn không ngứa tay, dễ nhìn rõ chân mũi để đếm.
              Giá chỉ <b>18.000đ/cuộn</b> bán lẻ.
            </p>
            <button
              type="button"
              className="step-action-btn"
              onClick={() => {
                setActiveCategory("len-soi");
                document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Xem các dòng len →
            </button>
          </div>

          <div className="beginner-step-card">
            <div className="step-number-badge">02</div>
            <div className="step-icon">🪡</div>
            <h3>Chọn Kim Móc Cán Dẻo 2.5mm</h3>
            <p>
              Cán cầm silicon công thái học nâng đỡ ngón tay, móc liên tục không bị chai hay mỏi.
              Đầu kim mạ chống rít len.
            </p>
            <button
              type="button"
              className="step-action-btn"
              onClick={() => {
                setActiveCategory("dung-cu-dan-moc");
                document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Xem dụng cụ kim móc →
            </button>
          </div>

          <div className="beginner-step-card">
            <div className="step-number-badge">03</div>
            <div className="step-icon">🎁</div>
            <h3>Chọn Kit Tự Làm Kèm Video</h3>
            <p>
              Trọn bộ gồm đầy đủ len, kim móc, phụ kiện và mã QR xem video kèm cặp từng mũi.
              Tự tay làm hoa tulip hay thú bông trong 2 giờ!
            </p>
            <button
              type="button"
              className="step-action-btn"
              onClick={() => {
                setActiveCategory("set-diy-tu-lam");
                document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Xem các set Kit DIY →
            </button>
          </div>
        </div>

        {/* BANNER COMBO NHẬP MÔN ĐẶC BIỆT */}
        <div className="beginner-combo-banner">
          <div className="combo-banner-left">
            <span className="combo-badge-hot">🔥 COMBO KHUYÊN DÙNG CHO BẠN MỚI</span>
            <h3>Combo Nhập Môn Tự Học Móc Len A-Z (Trọn Gói)</h3>
            <p>
              Bao gồm: <b>4 cuộn len Milk Cotton</b> pastel tự chọn + <b>2 kim móc cán dẻo SKC</b> (2.5mm & 3.0mm) +
              <b>10 kẹp định vị</b> + <b>2 kim khâu len</b> + <b>kéo bấm cắt chỉ</b> + <b>Khóa học video quét QR hướng dẫn</b>.
            </p>
            <div className="combo-perks">
              <span>✓ Đầy đủ không thiếu phụ kiện</span>
              <span>✓ Tự học thành công 100%</span>
              <span>✓ Tặng kẹp định vị sắc màu</span>
            </div>
          </div>
          <div className="combo-banner-right">
            <div className="combo-pricing">
              <del>185.000đ</del>
              <strong>135.000đ</strong>
              <small>Tiết kiệm 50.000đ so với mua lẻ</small>
            </div>
            <button
              type="button"
              className="combo-buy-now-btn"
              onClick={() => {
                const kit = products.find((p) => p.slug === "combo-nhap-mon-tu-hoc-moc-len-tron-goi") || products[0];
                addToCart(kit, 1);
                setCartOpen(true);
              }}
            >
              🛍️ Thêm Ngay Vào Giỏ Hàng
            </button>
          </div>
        </div>
      </section>

      {/* BẢNG MÀU CHỌN CUỘN LEN BÁN LẺ (INTERACTIVE YARN SWATCH PALETTE) */}
      <section className="yarn-palette-section" id="yarn-palette">
        <div className="section-title-wrap">
          <p className="section-kicker">BẢNG MÀU BÁN LẺ</p>
          <h2>🎨 Chọn Màu Len Milk Cotton 50g (18.000đ / cuộn)</h2>
          <p>
            Bấm vào màu sắc bạn yêu thích bên dưới để thêm nhanh từng cuộn len vào giỏ hàng:
          </p>
        </div>

        <div className="yarn-swatches-interactive">
          {YARN_COLORS.map((shade) => (
            <button
              key={shade.name}
              type="button"
              className={`yarn-swatch-card ${selectedColor === shade.name ? "selected" : ""}`}
              onClick={() => {
                setSelectedColor(shade.name);
                addYarnShadeToCart(shade);
              }}
              title={`Bấm để chọn và thêm 1 cuộn màu ${shade.name}`}
            >
              <span
                className="yarn-swatch-circle"
                style={{
                  backgroundColor: shade.hex,
                  borderColor: shade.border,
                }}
              >
                {selectedColor === shade.name && <span className="swatch-check">✓</span>}
              </span>
              <span className="yarn-swatch-name">{shade.name}</span>
              <span className="yarn-swatch-code">Mã {shade.code}</span>
              <span className="yarn-swatch-price">18.000đ</span>
              <span className="yarn-swatch-add-hint">+ Thêm cuộn</span>
            </button>
          ))}
        </div>
      </section>

      {/* FLASH SALE / DEAL CHỚP NHOÁNG */}
      {flashSaleProducts.length > 0 && (
        <section className="flash-sale-section">
          <div className="flash-sale-header">
            <div className="flash-sale-title">
              <span className="flash-badge">⚡ DEAL CHỚP NHOÁNG</span>
              <h2>Giờ Vàng Ưu Đãi Sene Handmade</h2>
              <p>Trợ giá cực tốt cho các dòng len & kit đan móc bán chạy</p>
            </div>
            <div className="flash-countdown">
              <span>Ưu đãi kết thúc sau:</span>
              <div className="timer-boxes">
                <span className="timer-box"><b>{String(flashSaleTime.hours).padStart(2, "0")}</b><small>Giờ</small></span>
                <span className="timer-sep">:</span>
                <span className="timer-box"><b>{String(flashSaleTime.minutes).padStart(2, "0")}</b><small>Phút</small></span>
                <span className="timer-sep">:</span>
                <span className="timer-box"><b>{String(flashSaleTime.seconds).padStart(2, "0")}</b><small>Giây</small></span>
              </div>
            </div>
          </div>

          <div className="flash-sale-grid">
            {flashSaleProducts.map((product, idx) => (
              <article className="flash-card" key={product._id}>
                <div className="flash-card-img" onClick={() => openProductDetail(product)}>
                  <img src={product.images?.[0]} alt={product.name} />
                  <span className="flash-discount-tag">GIẢM 20%</span>
                  <button
                    className={`card-wishlist-btn ${wishlist.includes(product._id) ? "active" : ""}`}
                    onClick={(e) => toggleWishlist(product, e)}
                    aria-label="Yêu thích"
                  >
                    {wishlist.includes(product._id) ? "♥" : "♡"}
                  </button>
                </div>
                <div className="flash-card-info">
                  <span className="flash-card-brand">{product.brand}</span>
                  <h3 onClick={() => openProductDetail(product)}>{product.name}</h3>
                  <div className="flash-card-prices">
                    <strong>{formatPrice(product.price)}</strong>
                    <del>{formatPrice(Math.round(product.price * 1.25))}</del>
                  </div>
                  <div className="flash-progress">
                    <div className="flash-progress-bar" style={{ width: `${80 + idx * 5}%` }}></div>
                    <small>🔥 Đã bán {16 + idx * 3} suất</small>
                  </div>
                  <button className="flash-buy-btn" type="button" onClick={() => addToCart(product)}>
                    Thêm vào giỏ +
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* GÓC VIDEO SẢN PHẨM THỰC TẾ (REELS / SHOWCASE) */}
      {videoProducts.length > 0 && (
        <section className="video-showcase-section">
          <div className="video-showcase-header">
            <div className="video-showcase-title">
              <span className="video-pill-badge">🎬 REVIEW THỰC TẾ</span>
              <h2>Video Cận Cảnh Thú Móc Len & Quà Tặng</h2>
              <p>
                Trải nghiệm chân thực từng mũi móc len đũa, độ bồng bềnh và phom dáng chuẩn của thú bông handmade
              </p>
            </div>
            <div className="video-header-hint">
              <span>Bấm vào để xem video chi tiết ↗</span>
            </div>
          </div>

          <div className="video-showcase-slider">
            {videoProducts.map((product) => (
              <div
                key={`video-card-${product._id}`}
                className="video-showcase-card"
                onClick={() => openProductDetail(product, "video")}
              >
                <div className="video-thumbnail-box">
                  <img
                    src={product.videoPoster || product.images?.[0]}
                    alt={product.name}
                    loading="lazy"
                  />
                  <div className="video-play-overlay">
                    <span className="video-play-icon">▶</span>
                  </div>
                  <span className="video-duration-tag">Video Full HD</span>
                </div>
                <div className="video-card-meta">
                  <h4>{product.name}</h4>
                  <div className="video-card-bottom">
                    <span className="video-card-price">{formatPrice(product.price)}</span>
                    <button
                      type="button"
                      className="video-watch-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openProductDetail(product, "video");
                      }}
                    >
                      Xem video ↗
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* DANH MỤC TRỰC QUAN VỚI ICON */}
      <section className="categories-showcase">
        <div className="section-title-wrap">
          <p className="section-kicker">BỘ SƯU TẬP</p>
          <h2>Khám Phá Theo Danh Mục</h2>
          <p>Lựa chọn những chất liệu len và phụ kiện tốt nhất cho dự án của bạn</p>
        </div>
        <div className="categories-grid">
          {CATEGORIES.map((category) => (
            <div
              key={category.slug}
              className="category-card"
              onClick={() => navigateCategory(category.slug)}
            >
              <div className="category-icon-wrap">{category.icon}</div>
              <h3>{category.name}</h3>
              <p>{category.description ? category.description.slice(0, 70) + "..." : "Sản phẩm chất lượng cao"}</p>
              <span className="category-link">Khám phá ngay →</span>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICE ROW */}
      <section className="service-row">
        <div>
          <b>🧶</b>
          <span>
            <strong>Len sợi chọn lọc</strong>
            <small>Mềm mịn, không xù lông, an toàn cho da</small>
          </span>
        </div>
        <div>
          <b>✂️</b>
          <span>
            <strong>Đan móc tỉ mỉ</strong>
            <small>Chăm chút từng mũi len thủ công</small>
          </span>
        </div>
        <div>
          <b>🎁</b>
          <span>
            <strong>Đóng gói quà xinh</strong>
            <small>Kèm thiệp chúc & quà tặng nhỏ</small>
          </span>
        </div>
        <div>
          <b>🚚</b>
          <span>
            <strong>Giao hàng toàn quốc</strong>
            <small>Kiểm tra hàng trước khi thanh toán</small>
          </span>
        </div>
      </section>

      {/* CÔNG CỤ TÍNH CUỘN LEN & COMBO DỰ ÁN CHO NGƯỜI MỚI */}
      <section className="yarn-calc-section">
        <div className="section-title-wrap">
          <p className="section-kicker">GỢI Ý THEO DỰ ÁN</p>
          <h2>🧮 Mua Trọn Combo Theo Món - Không Lo Thiếu Sợi</h2>
          <p>
            Bạn chưa biết móc 1 chiếc khăn hay túi xách cần bao nhiêu cuộn len?
            Tiệm tính sẵn số lượng & loại len tối ưu, bấm 1 nút để thêm trọn combo vào giỏ!
          </p>
        </div>
        <div className="yarn-calc-grid">
          {YARN_PROJECT_PRESETS.map((preset) => (
            <div className="preset-card" key={preset.id}>
              <div className="preset-header">
                <span className="preset-icon">{preset.icon}</span>
                <div>
                  <h3>{preset.name}</h3>
                  <span className="preset-amount-tag">Đề xuất: {preset.amount}</span>
                </div>
              </div>
              <div className="preset-specs">
                <div className="spec-item">
                  <span className="spec-label">🧶 Sợi len:</span>
                  <span className="spec-val">{preset.recommendedYarn}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">🪡 Cỡ kim:</span>
                  <span className="spec-val">{preset.needle}</span>
                </div>
                <div className="spec-tip">
                  💡 <em>{preset.tip}</em>
                </div>
              </div>
              <div className="preset-footer">
                <div className="preset-price">
                  <small>Giá ước tính combo:</small>
                  <strong>{formatPrice(preset.estimatedPrice)}</strong>
                </div>
                <button
                  type="button"
                  className="preset-add-btn"
                  onClick={() => addPresetComboToCart(preset)}
                >
                  + Thêm combo
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATALOG SECTION */}
      <section className="catalog-section" id="products">
        <div className="catalog-heading">
          <div>
            <p className="section-kicker">CỬA HÀNG LEN SỢI</p>
            <h2>{activeCategory ? categories.find(c => c.slug === activeCategory)?.name : "Tất Cả Sản Phẩm"}</h2>
          </div>
          <span className="catalog-count">{visibleProducts.length} sản phẩm</span>
        </div>

        {/* TOOLBAR: FILTER BY PRICE & SORT */}
        <div className="catalog-toolbar">
          <div className="price-filters">
            <span className="filter-label">Mức giá:</span>
            {[
              { id: "all", label: "Tất cả" },
              { id: "<50k", label: "Dưới 50k" },
              { id: "50k-150k", label: "50k - 150k" },
              { id: "150k-300k", label: "150k - 300k" },
              { id: ">300k", label: "Trên 300k" },
            ].map((pf) => (
              <button
                key={pf.id}
                type="button"
                className={`filter-chip ${priceFilter === pf.id ? "active" : ""}`}
                onClick={() => setPriceFilter(pf.id)}
              >
                {pf.label}
              </button>
            ))}
          </div>

          <div className="sort-box">
            <label htmlFor="sort-select">Sắp xếp:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Gợi ý hàng đầu</option>
              <option value="price-asc">Giá: Thấp đến cao</option>
              <option value="price-desc">Giá: Cao đến thấp</option>
              <option value="name-asc">Tên: A - Z</option>
            </select>
          </div>
        </div>

        {loading && <p className="catalog-message">Đang tải sản phẩm...</p>}
        {error && <p className="catalog-message error-message">{error}</p>}
        {!loading && !error && visibleProducts.length === 0 && (
          <div className="catalog-empty">
            <span>🧶</span>
            <p>Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.</p>
            <button
              className="banner-button"
              type="button"
              onClick={() => {
                setActiveCategory("");
                setSearchQuery("");
                setPriceFilter("all");
              }}
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        <div className="product-grid">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              onOpenDetail={openProductDetail}
              onAddToCart={(prod, qty) => addToCart(prod, qty || 1)}
              onBuyNow={buyNow}
              isWishlisted={wishlist.includes(product._id || product.id)}
              onToggleWishlist={toggleWishlist}
            />
          ))}
        </div>
      </section>

      <section className="account-section" id="account">
        <div>
          <p className="section-kicker">TÀI KHOẢN SENE HANDMADE</p>
          <h2>
            {currentUser
              ? `Xin chào, ${currentUser.name} 👋`
              : "Đăng Nhập / Đăng Ký"}
          </h2>
          <p>
            {currentUser
              ? "Quản lý thông tin nhận hàng, lịch sử các kiện hàng đã đặt và cập nhật thông tin cá nhân."
              : "Lưu thông tin giao hàng và theo dõi đơn hàng dễ dàng hơn."}
          </p>
          {currentUser && (
            <div className="account-actions">
              <button
                className="orders-button"
                type="button"
                onClick={() =>
                  document
                    .querySelector("#orders")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                📦 Xem đơn đã đặt ({orderHistory.length})
              </button>
              <button className="text-button" onClick={logout}>
                Đăng xuất
              </button>
            </div>
          )}
        </div>

        {currentUser ? (
          <div className="member-profile-card">
            <div className="member-card-header">
              <div className="member-avatar">
                {currentUser.name
                  ? currentUser.name
                    .trim()
                    .split(" ")
                    .filter(Boolean)
                    .map((w) => w[0])
                    .slice(-2)
                    .join("")
                    .toUpperCase()
                  : "TL"}
              </div>
              <div className="member-details">
                <h3>{currentUser.name}</h3>
                <span className="member-badge">
                  {currentUser.role === "admin" ? "🛡️ Quản trị viên" : "✨ Khách hàng thân thiết"}
                </span>
                <p className="member-email">📧 {currentUser.email}</p>
              </div>
            </div>

            {!isEditingProfile ? (
              <div className="member-info-fields">
                <div className="info-field-item">
                  <span className="field-label">📱 Số điện thoại nhận hàng:</span>
                  <span className="field-val">
                    {currentUser.phone || <em>(Chưa cập nhật số điện thoại)</em>}
                  </span>
                </div>
                <div className="info-field-item">
                  <span className="field-label">📍 Địa chỉ nhận hàng mặc định:</span>
                  <span className="field-val">
                    {currentUser.address || <em>(Chưa cập nhật địa chỉ giao hàng)</em>}
                  </span>
                </div>

                <div className="profile-actions-row">
                  <button
                    type="button"
                    className="edit-profile-btn"
                    onClick={() => {
                      setProfileForm({
                        name: currentUser.name || "",
                        phone: currentUser.phone || "",
                        address: currentUser.address || "",
                      });
                      setIsEditingProfile(true);
                    }}
                  >
                    ✏️ Đổi họ tên & Địa chỉ
                  </button>
                </div>
              </div>
            ) : (
              <form className="profile-edit-form" onSubmit={saveProfile}>
                <div className="edit-form-field">
                  <label>Họ và tên hiển thị</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, name: e.target.value })
                    }
                    placeholder="Nhập họ và tên đầy đủ (VD: Huỳnh Văn Tài)"
                  />
                </div>
                <div className="edit-form-field">
                  <label>Số điện thoại nhận hàng</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, phone: e.target.value })
                    }
                    placeholder="VD: 0942901124"
                  />
                </div>
                <div className="edit-form-field">
                  <label>Địa chỉ giao hàng mặc định</label>
                  <textarea
                    rows="2"
                    value={profileForm.address}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, address: e.target.value })
                    }
                    placeholder="Số nhà, tên đường, phường/xã..."
                  />
                </div>

                {profileMessage && (
                  <p className="profile-msg-error">{profileMessage}</p>
                )}

                <div className="edit-actions-row">
                  <button type="submit" className="save-profile-btn">
                    💾 Lưu cập nhật
                  </button>
                  <button
                    type="button"
                    className="cancel-profile-btn"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileMessage("");
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <form className="auth-form" onSubmit={submitAuth}>
            <div className="auth-tabs">
              <button
                type="button"
                className={authMode === "login" ? "active" : ""}
                onClick={() => setAuthMode("login")}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                className={authMode === "register" ? "active" : ""}
                onClick={() => setAuthMode("register")}
              >
                Đăng ký
              </button>
            </div>
            {authMode === "register" && (
              <input
                required
                placeholder="Họ và tên"
                value={authForm.name}
                onChange={(event) =>
                  setAuthForm({ ...authForm, name: event.target.value })
                }
              />
            )}
            <input
              required
              type="email"
              placeholder="Email"
              value={authForm.email}
              onChange={(event) =>
                setAuthForm({ ...authForm, email: event.target.value })
              }
            />
            <input
              required
              minLength="6"
              type="password"
              placeholder="Mật khẩu (ít nhất 6 ký tự)"
              value={authForm.password}
              onChange={(event) =>
                setAuthForm({ ...authForm, password: event.target.value })
              }
            />
            <button className="banner-button auth-submit" type="submit">
              {authMode === "login" ? "Đăng nhập" : "Tạo tài khoản"}{" "}
              <span>→</span>
            </button>
            {authMessage && <p className="auth-message">{authMessage}</p>}
          </form>
        )}
      </section>

      {/* QUẢN LÝ & THEO DÕI TÌNH TRẠNG ĐƠN HÀNG */}
      <section className="order-history" id="orders">
        <div className="history-heading">
          <div>
            <p className="section-kicker">SENE HANDMADE XINH XẮN</p>
            <h2>Tra Cứu & Theo Dõi Tình Trạng Đơn Hàng</h2>
            <p className="history-subtitle">
              Xem tiến trình đóng gói, bưu tá giao nhận và chi tiết từng món len bạn đã đặt.
            </p>
          </div>
          {orderHistory.length > 0 && (
            <span className="order-count-badge">
              {orderHistory.length} đơn hàng trên thiết bị
            </span>
          )}
        </div>

        {/* Ô TRA CỨU ĐƠN HÀNG DÀNH CHO MỌI KHÁCH HÀNG */}
        <form className="order-tracking-search" onSubmit={handleTrackOrder}>
          <span className="track-icon">🔍</span>
          <input
            placeholder="Nhập mã đơn (ví dụ: FD6F63) hoặc Số điện thoại để tra cứu ngay..."
            value={trackingQuery}
            onChange={(e) => setTrackingQuery(e.target.value)}
          />
          <button type="submit" className="track-submit-btn" disabled={trackingLoading}>
            {trackingLoading ? "Đang tra cứu..." : "Tra cứu đơn hàng"}
          </button>
        </form>
        {trackingMsg && <p className="tracking-msg">{trackingMsg}</p>}

        {orderHistory.length === 0 ? (
          <div className="history-empty-box">
            <span className="empty-box-icon">📦</span>
            <h4>Chưa có lịch sử đơn hàng nào lưu trên máy</h4>
            <p>
              Nếu bạn vừa đặt đơn hoặc đặt trước đó, hãy nhập <b>Mã đơn (VD: FD6F63)</b> hoặc <b>Số điện thoại</b> vào ô tìm kiếm ở trên để xem ngay nhé.
            </p>
          </div>
        ) : (
          <div className="history-cards-grid">
            {orderHistory.map((order) => (
              <article
                className="shopee-order-card"
                key={order._id}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="card-top-bar">
                  <div className="card-order-id">
                    <span className="order-id-prefix">Mã đơn:</span>
                    <b>#{order._id.slice(-6).toUpperCase()}</b>
                  </div>
                  <div className="card-order-date">
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </div>
                  <span className={`shopee-status-tag ${order.status}`}>
                    {{
                      pending: "🟡 Chờ xác nhận",
                      confirmed: "🔵 Shop đã duyệt",
                      shipping: "🚚 Đang giao hàng",
                      delivered: "🟢 Giao thành công",
                      cancelled: "❌ Đã hủy",
                    }[order.status] || order.status}
                  </span>
                </div>

                {/* ITEMS PREVIEW */}
                <div className="card-items-preview">
                  {order.items.slice(0, 3).map((item, i) => (
                    <div className="card-preview-item" key={i}>
                      <img
                        src={
                          item.image ||
                          "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=120&q=80"
                        }
                        alt={item.name}
                      />
                      <div className="preview-item-info">
                        <strong>{item.name}</strong>
                        <small>
                          {formatPrice(item.price)} × {item.quantity}
                        </small>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <small className="more-items-tag">
                      +{order.items.length - 3} món khác...
                    </small>
                  )}
                </div>

                <div className="card-bottom-bar">
                  <div className="card-recipient">
                    <span>
                      Người nhận: <b>{order.customerName}</b> ({order.phone})
                    </span>
                    <small>{order.address}</small>
                  </div>
                  <div className="card-actions-row">
                    <div className="card-total-box">
                      <span>Tổng thanh toán:</span>
                      <strong>{formatPrice(order.totalAmount)}</strong>
                    </div>
                    <div className="card-btn-group">
                      <button
                        type="button"
                        className="btn-view-order"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                      >
                        👁️ Xem chi tiết & Tình trạng
                      </button>
                      <button
                        type="button"
                        className="btn-reorder"
                        onClick={(e) => {
                          e.stopPropagation();
                          reorder(order);
                        }}
                      >
                        🔄 Mua lại
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* SẢN PHẨM VỪA XEM GẦN ĐÂY (RECENTLY VIEWED) */}
      {recentlyViewedProducts.length > 0 && (
        <section className="recently-viewed-section">
          <div className="section-title-wrap">
            <p className="section-kicker">LỊCH SỬ XEM HÀNG</p>
            <h2>👀 Sản Phẩm Bạn Vừa Xem Qua</h2>
            <p>Dễ dàng chọn lại các cuộn len hoặc set kit bạn vừa quan tâm</p>
          </div>
          <div className="recently-viewed-grid">
            {recentlyViewedProducts.map((p) => (
              <div
                key={`recent-${p._id}`}
                className="recent-card"
                onClick={() => openProductDetail(p)}
              >
                <img src={p.images?.[0]} alt={p.name} loading="lazy" />
                <div className="recent-card-body">
                  <h4>{p.name}</h4>
                  <div className="recent-card-bottom">
                    <strong>{formatPrice(p.price)}</strong>
                    <button
                      type="button"
                      className="recent-quick-add"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(p, 1);
                      }}
                      title="Thêm vào giỏ"
                    >
                      + Giỏ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* GÓC CẨM NANG & KINH NGHIỆM */}
      <section className="guides-section" id="guides">
        <div className="section-title-wrap">
          <p className="section-kicker">GÓC CẨM NANG & CHIA SẺ</p>
          <h2>Bí Kíp Đan Móc Len Dành Cho Bạn</h2>
          <p>Kinh nghiệm thực tế giúp bạn chọn đúng loại len sợi và hoàn thiện sản phẩm ưng ý nhất.</p>
        </div>
        <div className="guides-grid">
          {CRAFT_GUIDES.map((guide) => (
            <article
              className="guide-card"
              key={guide.id}
              onClick={() => setSelectedGuide(guide)}
              tabIndex={0}
              role="button"
            >
              <div className="guide-card-top">
                <span className="guide-icon">{guide.icon}</span>
                <span className="guide-tag">{guide.tag}</span>
              </div>
              <h3>{guide.title}</h3>
              <p>{guide.summary}</p>
              <div className="guide-footer">
                <span>⏱ {guide.readTime}</span>
                <button
                  type="button"
                  className="guide-read-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGuide(guide);
                  }}
                >
                  Đọc thêm →
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ĐÁNH GIÁ KHÁCH HÀNG */}
      <section className="reviews-section">
        <div className="section-title-wrap">
          <p className="section-kicker">CẢM NHẬN KHÁCH HÀNG</p>
          <h2>Yêu Thương Từ Từng Mũi Đan Len</h2>
          <p>Hơn 1.200+ bạn thợ móc và khách yêu đã tin chọn Sene Handmade</p>
        </div>
        <div className="reviews-grid">
          {CUSTOMER_REVIEWS.map((rev) => (
            <div className="review-card" key={rev.id}>
              <div className="review-rating">{"★".repeat(rev.rating)}</div>
              <p className="review-comment">"{rev.comment}"</p>
              <div className="review-meta">
                <img src={rev.avatar} alt={rev.name} className="review-avatar" />
                <div>
                  <strong>{rev.name}</strong>
                  <small>{rev.location} · Đã mua <b>{rev.product}</b></small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

        </>
      )}

      {/* COMPREHENSIVE 4-COLUMN E-COMMERCE FOOTER */}
      <EcommerceFooter
        onNavigateCategory={navigateCategory}
        onScrollToSection={scrollToSection}
      />

      {/* LUXURY PROFESSIONAL CART DRAWER */}
      {cartOpen && createPortal(
        <>
          <div
            className="cart-backdrop"
            onClick={() => setCartOpen(false)}
            aria-hidden="true"
          />

          <aside
            className="cart-drawer-pro"
            role="dialog"
            aria-modal="true"
            aria-label="Giỏ Hàng Của Bạn"
          >
            {/* 1. DRAWER HEADER */}
            <div className="cart-pro-header">
              <div className="cart-pro-header-left">
                <div className="cart-pro-icon-badge">🛍️</div>
                <div>
                  <div className="cart-pro-title-line">
                    <h3>Giỏ Hàng Của Bạn</h3>
                    <span className="cart-pro-count-badge">{cartCount} món</span>
                  </div>
                  <small className="cart-pro-subtitle">
                    {cartItems.length} loại mặt hàng đang chọn
                  </small>
                </div>
              </div>
              <div className="cart-pro-header-actions">
                {cartItems.length > 0 && (
                  <button
                    type="button"
                    className="cart-pro-clear-btn"
                    onClick={clearCart}
                    title="Xóa tất cả sản phẩm"
                  >
                    Xóa tất cả
                  </button>
                )}
                <button
                  className="cart-pro-close-btn"
                  type="button"
                  onClick={() => setCartOpen(false)}
                  title="Đóng giỏ hàng"
                  aria-label="Đóng"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 2. FREESHIP PROGRESS MILESTONE */}
            {cartItems.length > 0 && (
              <div className={`cart-pro-freeship ${freeshipRemaining <= 0 ? "unlocked" : ""}`}>
                <div className="freeship-pro-header">
                  <div className="freeship-pro-msg">
                    <span className="freeship-pro-icon">🚚</span>
                    {freeshipRemaining <= 0 ? (
                      <span className="freeship-pro-won">
                        🎉 <strong>Đã đủ điều kiện FREESHIP toàn quốc!</strong>
                      </span>
                    ) : (
                      <span>
                        Mua thêm <strong>{formatPrice(freeshipRemaining)}</strong> để được <strong>FREESHIP toàn quốc</strong>
                      </span>
                    )}
                  </div>
                  <span className="freeship-pro-percent">{freeshipPercent}%</span>
                </div>
                <div className="freeship-pro-track">
                  <div
                    className="freeship-pro-fill"
                    style={{ width: `${freeshipPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* 3. SCROLLABLE CONTAINER (ITEMS + CROSS-SELL + VOUCHER) */}
            <div className="cart-pro-scroll">
              {cartItems.length === 0 ? (
                <div className="cart-pro-empty">
                  <div className="empty-pro-icon-wrap">
                    <span className="empty-pro-icon">🧶</span>
                  </div>
                  <h4>Giỏ hàng của bạn đang trống</h4>
                  <p>Chưa có cuộn len hay bộ kit nào được chọn. Hãy dạo tiệm và chọn những món thật xinh xắn nhé!</p>
                  <button
                    className="shop-now-pro-btn"
                    type="button"
                    onClick={() => {
                      setCartOpen(false);
                      document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Khám phá tiệm len ngay ✨
                  </button>
                </div>
              ) : (
                <>
                  {/* LIST OF CART ITEMS */}
                  <div className="cart-pro-items-list">
                    {cartItems.map((item) => {
                      const prodObj = products.find((p) => p._id === item.product);
                      return (
                        <div className="cart-pro-item-card" key={item.product}>
                          <div
                            className="cart-pro-item-thumb-box"
                            onClick={() => prodObj && openProductDetail(prodObj)}
                            title="Xem chi tiết sản phẩm"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="cart-pro-item-thumb"
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=400&q=80";
                              }}
                            />
                          </div>

                          <div className="cart-pro-item-details">
                            <div className="cart-pro-item-header">
                              <span className="cart-pro-item-tag">Len Handmade Sene</span>
                              <button
                                type="button"
                                className="cart-pro-item-del"
                                onClick={() => changeQuantity(item.product, -item.quantity)}
                                title="Xóa sản phẩm này"
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                              </button>
                            </div>

                            <h4
                              className="cart-pro-item-name"
                              onClick={() => prodObj && openProductDetail(prodObj)}
                              title="Xem chi tiết sản phẩm"
                            >
                              {item.name}
                            </h4>

                            <div className="cart-pro-item-price-line">
                              <span className="cart-pro-item-unit">Đơn giá: {formatPrice(item.price)}</span>
                            </div>

                            <div className="cart-pro-item-actions">
                              {/* MODERN SLEEK STEPPER */}
                              <div className="cart-pro-stepper">
                                <button
                                  type="button"
                                  className="cart-pro-step-btn"
                                  disabled={item.quantity <= 1}
                                  onClick={() => changeQuantity(item.product, -1)}
                                  title="Giảm số lượng"
                                >
                                  −
                                </button>
                                <span className="cart-pro-step-qty">{item.quantity}</span>
                                <button
                                  type="button"
                                  className="cart-pro-step-btn"
                                  onClick={() => changeQuantity(item.product, 1)}
                                  title="Tăng số lượng"
                                >
                                  +
                                </button>
                              </div>

                              <div className="cart-pro-item-total">
                                <small>Thành tiền:</small>
                                <strong>{formatPrice(item.price * item.quantity)}</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 4. GỢI Ý MUA KÈM (COMBO TIẾT KIỆM) */}
                  <div className="cart-pro-addons-section">
                    <div className="cart-pro-addons-heading">
                      <div>
                        <span className="cart-pro-addons-badge">🎁 COMBO TIẾT KIỆM</span>
                        <h4>Dụng cụ thiết yếu mua kèm</h4>
                      </div>
                      <small>Đồng giá ưu đãi trực tiếp trong giỏ</small>
                    </div>

                    <div className="cart-pro-addons-grid">
                      {CRAFT_ADDONS.map((addon) => {
                        const alreadyInCart = cartItems.some((c) => c.product === addon.id);
                        return (
                          <div key={addon.id} className="cart-pro-addon-card">
                            <div className="cart-pro-addon-icon">{addon.icon}</div>
                            <div className="cart-pro-addon-meta">
                              <strong className="cart-pro-addon-name">{addon.name}</strong>
                              <div className="cart-pro-addon-prices">
                                <span className="addon-price-curr">{formatPrice(addon.price)}</span>
                                <span className="addon-price-old">{formatPrice(addon.originalPrice)}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              className={`cart-pro-addon-btn ${alreadyInCart ? "in-cart" : ""}`}
                              onClick={() => {
                                addToCart({
                                  _id: addon.id,
                                  name: addon.name,
                                  price: addon.price,
                                  images: addon.images,
                                  stock: addon.stock,
                                }, 1);
                              }}
                            >
                              {alreadyInCart ? "✓ Đã có" : "+ Thêm"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 5. VOUCHER / MÃ GIẢM GIÁ TRỰC TIẾP TRONG GIỎ */}
                  <div className="cart-pro-voucher-box">
                    <div className="cart-pro-voucher-header">
                      <span>🎫 Mã ưu đãi / Voucher Tiệm Len</span>
                    </div>

                    {appliedVoucher ? (
                      <div className="cart-pro-voucher-active">
                        <div className="voucher-active-left">
                          <span className="voucher-code-pill">{appliedVoucher.code}</span>
                          <span className="voucher-discount-text">
                            Tiết kiệm {formatPrice(discountAmount)}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="voucher-remove-pill"
                          onClick={() => {
                            setAppliedVoucher(null);
                            setToast("Đã gỡ mã ưu đãi");
                            setTimeout(() => setToast(""), 1800);
                          }}
                        >
                          ✕ Gỡ mã
                        </button>
                      </div>
                    ) : (
                      <div className="cart-pro-voucher-form">
                        <input
                          type="text"
                          className="cart-pro-voucher-input"
                          placeholder="Nhập mã ưu đãi..."
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              applyVoucher(promoInput);
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="cart-pro-voucher-apply"
                          onClick={() => applyVoucher(promoInput)}
                        >
                          Áp dụng
                        </button>
                      </div>
                    )}

                    {voucherError && <div className="cart-pro-voucher-error">{voucherError}</div>}

                    {!appliedVoucher && (
                      <div className="cart-pro-voucher-chips">
                        <small className="chips-title">Gợi ý:</small>
                        {STORE_VOUCHERS.map((v) => (
                          <button
                            key={v.code}
                            type="button"
                            className="voucher-chip-item"
                            onClick={() => {
                              setPromoInput(v.code);
                              applyVoucher(v.code);
                            }}
                          >
                            <strong>{v.code}</strong> {v.badge}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* 6. STICKY PROFESSIONAL FOOTER */}
            {cartItems.length > 0 && (
              <div className="cart-pro-footer">
                <div className="cart-pro-breakdown">
                  <div className="cart-breakdown-row">
                    <span>Tạm tính ({cartCount} sản phẩm):</span>
                    <strong>{formatPrice(cartTotal)}</strong>
                  </div>

                  {discountAmount > 0 && (
                    <div className="cart-breakdown-row discount">
                      <span>Giảm giá voucher ({appliedVoucher?.code}):</span>
                      <strong className="discount-val">−{formatPrice(discountAmount)}</strong>
                    </div>
                  )}

                  <div className="cart-breakdown-row shipping">
                    <span>Ưu đãi vận chuyển:</span>
                    <span className="shipping-badge">
                      {cartTotal >= 200000 ? "✓ Miễn phí toàn quốc" : "Tính khi thanh toán"}
                    </span>
                  </div>

                  <div className="cart-breakdown-divider" />

                  <div className="cart-breakdown-total">
                    <div>
                      <span className="total-title">Tổng thanh toán:</span>
                      <small className="total-tax-note">(Đã gồm VAT & bộ quà tặng)</small>
                    </div>
                    <strong className="total-final-price">
                      {formatPrice(Math.max(0, cartTotal - discountAmount))}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="cart-pro-checkout-cta"
                  onClick={() => {
                    setCartOpen(false);
                    setCheckoutOpen(true);
                  }}
                >
                  <span>TIẾN HÀNH ĐẶT HÀNG ({cartCount} món)</span>
                  <span className="cta-arrow">→</span>
                </button>

                <div className="cart-pro-trust-badges">
                  <span>🛡️ Đồng kiểm khi nhận</span>
                  <span className="trust-sep">•</span>
                  <span>⚡ Hỏa tốc 2H Cần Thơ</span>
                  <span className="trust-sep">•</span>
                  <span>💎 Len chuẩn loại 1</span>
                </div>
              </div>
            )}
          </aside>
        </>,
        document.body
      )}


      {/* WISHLIST DRAWER */}
      {wishlistOpen && (
        <aside className="wishlist-panel">
          <div className="cart-panel-heading">
            <div>
              <p className="section-kicker">DANH SÁCH YÊU THÍCH</p>
              <h2>Món bạn đã thả tim ({wishlistProducts.length})</h2>
            </div>
            <button
              className="close-cart"
              type="button"
              onClick={() => setWishlistOpen(false)}
            >
              ×
            </button>
          </div>

          {wishlistProducts.length === 0 ? (
            <div className="wishlist-empty">
              <span className="empty-icon">♡</span>
              <p>Bạn chưa lưu sản phẩm nào vào danh sách yêu thích.</p>
              <button
                className="banner-button"
                type="button"
                onClick={() => {
                  setWishlistOpen(false);
                  document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Khám phá tiệm len ngay <span>→</span>
              </button>
            </div>
          ) : (
            <div className="wishlist-items-list">
              {wishlistProducts.map((item) => (
                <div className="wishlist-item" key={item._id}>
                  <img src={item.images?.[0]} alt={item.name} />
                  <div className="wishlist-item-info">
                    <h3>{item.name}</h3>
                    <strong>{formatPrice(item.price)}</strong>
                    <div className="wishlist-actions">
                      <button
                        className="wishlist-add-btn"
                        type="button"
                        onClick={() => {
                          addToCart(item);
                          setToast(`Đã thêm ${item.name} vào giỏ hàng`);
                        }}
                      >
                        Thêm vào giỏ +
                      </button>
                      <button
                        className="wishlist-remove-btn"
                        type="button"
                        onClick={(e) => toggleWishlist(item, e)}
                      >
                        Bỏ lưu
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      )}

      {/* TRANG THANH TOÁN ĐƠN HÀNG (CHECKOUT) */}
      {checkoutOpen && (
        <div className="checkout-page">
          <div className="checkout-inner">
            <header className="checkout-top">
              <div className="checkout-top-brand">
                <span className="brand-icon">🧶</span>
                <div>
                  <strong>SENE HANDMADE</strong>
                  <small>Thanh toán an toàn · Dệt yêu thương</small>
                </div>
              </div>

              <div className="checkout-stepper">
                <span className="step done">1. Giỏ hàng ✓</span>
                <span className="step-arrow">→</span>
                <span className="step active">2. Thanh toán & Nhận hàng</span>
                <span className="step-arrow">→</span>
                <span className="step">3. Hoàn tất</span>
              </div>

              <button
                type="button"
                className="checkout-back-btn"
                onClick={() => setCheckoutOpen(false)}
              >
                ← Quay lại giỏ hàng
              </button>
            </header>

            <div className="checkout-layout">
              <section className="checkout-main">
                <div className="checkout-section-header">
                  <h2>1. Thông tin giao hàng</h2>
                  <p>Vui lòng nhập chính xác để shipper giao hàng tận nơi nhanh chóng nhất.</p>
                </div>

                <form
                  className="checkout-form checkout-page-form"
                  onSubmit={submitOrder}
                >
                  <div className="checkout-fields">
                    <div className="form-group">
                      <label>Họ và tên người nhận *</label>
                      <input
                        required
                        placeholder="Ví dụ: Nguyễn Thị Mai Lan"
                        value={checkoutForm.customerName}
                        onChange={(event) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            customerName: event.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Số điện thoại nhận hàng *</label>
                      <input
                        required
                        type="tel"
                        placeholder="Ví dụ: 0942 901 124"
                        value={checkoutForm.phone}
                        onChange={(event) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            phone: event.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="address-fields">
                    <div className="form-group">
                      <label>Tỉnh / Thành phố *</label>
                      <select
                        required
                        value={checkoutForm.province}
                        onChange={(event) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            province: event.target.value,
                            district: "",
                            ward: "",
                          })
                        }
                      >
                        <option value="">-- Chọn Tỉnh / Thành --</option>
                        {Object.keys(locations).map((province) => (
                          <option key={province} value={province}>
                            {province}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Quận / Huyện *</label>
                      <select
                        required
                        disabled={!checkoutForm.province}
                        value={checkoutForm.district}
                        onChange={(event) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            district: event.target.value,
                            ward: "",
                          })
                        }
                      >
                        <option value="">-- Chọn Quận / Huyện --</option>
                        {Object.keys(locations[checkoutForm.province] || {}).map(
                          (district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Phường / Xã *</label>
                      <select
                        required
                        disabled={!checkoutForm.district}
                        value={checkoutForm.ward}
                        onChange={(event) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            ward: event.target.value,
                          })
                        }
                      >
                        <option value="">-- Chọn Phường / Xã --</option>
                        {(
                          locations[checkoutForm.province]?.[
                          checkoutForm.district
                          ] || []
                        ).map((ward) => (
                          <option key={ward} value={ward}>
                            {ward}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* BẢN ĐỒ CHỌN VỊ TRÍ GIAO HÀNG (DELIVERY MAP PICKER) */}
                  <DeliveryMapPicker
                    selectedProvince={checkoutForm.province}
                    address={checkoutForm.address}
                    locations={locations}
                    onSelectLocation={({
                      address: newAddr,
                      province: newProv,
                      district: newDist,
                      ward: newWard,
                    }) => {
                      setCheckoutForm((prev) => ({
                        ...prev,
                        ...(newAddr ? { address: newAddr } : {}),
                        ...(newProv ? { province: newProv } : {}),
                        ...(newDist ? { district: newDist } : {}),
                        ...(newWard ? { ward: newWard } : {}),
                      }));
                    }}
                  />

                  <div className="form-group">
                    <label>Địa chỉ số nhà, tên đường cụ thể *</label>
                    <input
                      required
                      placeholder="Ví dụ: 124 Đường số 5, KDC Nam Long"
                      value={checkoutForm.address}
                      onChange={(event) =>
                        setCheckoutForm({
                          ...checkoutForm,
                          address: event.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Ghi chú cho shipper (không bắt buộc)</label>
                    <textarea
                      placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao 15 phút..."
                      value={checkoutForm.note}
                      onChange={(event) =>
                        setCheckoutForm({
                          ...checkoutForm,
                          note: event.target.value,
                        })
                      }
                    />
                  </div>

                  {/* CHỌN PHƯƠNG THỨC VẬN CHUYỂN */}
                  <div className="checkout-section-header" style={{ marginTop: 24 }}>
                    <h2>2. Phương thức vận chuyển</h2>
                    <p>Chọn hình thức giao hàng phù hợp với thời gian nhận hàng của bạn.</p>
                  </div>

                  <div className="shipping-options-list">
                    <label
                      className={`shipping-option ${shippingMethod === "STANDARD" ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === "STANDARD"}
                        onChange={() => setShippingMethod("STANDARD")}
                      />
                      <div className="shipping-option-info">
                        <strong>🚚 Giao hàng tiêu chuẩn (2 - 3 ngày)</strong>
                        <small>Giao hàng toàn quốc qua Viettel Post / Giao Hàng Nhanh</small>
                      </div>
                      <span className="shipping-fee-badge">
                        {cartTotal >= 300000 ? (
                          <span className="free-text">MIỄN PHÍ</span>
                        ) : (
                          "25.000đ"
                        )}
                      </span>
                    </label>

                    <label
                      className={`shipping-option ${shippingMethod === "EXPRESS" ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === "EXPRESS"}
                        onChange={() => setShippingMethod("EXPRESS")}
                      />
                      <div className="shipping-option-info">
                        <strong>⚡ Giao hàng hỏa tốc trong 2H (Cần Thơ)</strong>
                        <small>Áp dụng nội thành TP. Cần Thơ (Ninh Kiều, Cái Răng, Bình Thủy... nhận ngay trong 2H qua Grab / Shipper ruột)</small>
                      </div>
                      <span className="shipping-fee-badge">30.000đ</span>
                    </label>
                  </div>

                  {/* DỊCH VỤ GÓI HỘP QUÀ TẶNG & THIỆP VIẾT TAY */}
                  <div className="gift-wrap-box">
                    <label className="gift-wrap-checkbox">
                      <input
                        type="checkbox"
                        checked={isGiftWrap}
                        onChange={(e) => setIsGiftWrap(e.target.checked)}
                      />
                      <span>
                        🎁 <strong>Dịch vụ đóng hộp quà vintage & viết thiệp tay</strong>
                        <small> (Tiệm tặng miễn phí 100% khi mua làm quà tặng người thân yêu)</small>
                      </span>
                    </label>
                    {isGiftWrap && (
                      <div className="gift-message-input">
                        <textarea
                          placeholder="Nhập lời chúc bạn muốn Tiệm viết tay lên thiệp xinh (tối đa 150 ký tự)..."
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          maxLength={150}
                        />
                        <small>Tiệm sẽ dùng thiệp giấy Kraft vintage đính kèm cành hoa khô nhỏ xíu gửi tặng bạn.</small>
                      </div>
                    )}
                  </div>

                  {/* PHƯƠNG THỨC THANH TOÁN */}
                  <div className="checkout-section-header" style={{ marginTop: 24 }}>
                    <h2>3. Phương thức thanh toán</h2>
                    <p>Mọi giao dịch đều được đảm bảo quyền lợi kiểm tra hàng trước khi thanh toán.</p>
                  </div>

                  <div className="payment-options-list">
                    <label
                      className={`payment-option ${paymentMethod === "COD" ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                      />
                      <span>
                        <b>💵 Thanh toán khi nhận hàng (COD)</b>
                        <small>Được mở hộp kiểm tra màu len, độ mềm mịn rồi mới thanh toán tiền mặt</small>
                      </span>
                    </label>

                    <label
                      className={`payment-option ${paymentMethod === "BANK_TRANSFER" ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "BANK_TRANSFER"}
                        onChange={() => setPaymentMethod("BANK_TRANSFER")}
                      />
                      <span>
                        <b>🏦 Chuyển khoản ngân hàng (VietQR / MB Bank)</b>
                        <small>Quét mã tiện lợi, đơn hàng được ưu tiên đóng gói và xuất kho trong ngày</small>
                      </span>
                    </label>
                  </div>

                  {paymentMethod === "BANK_TRANSFER" && (
                    <div className="bank-info">
                      <div className="bank-info-header">
                        <span>💳 THÔNG TIN CHUYỂN KHOẢN CHÍNH THỨC</span>
                        <small>Xác nhận tự động sau 1-3 phút</small>
                      </div>
                      <div className="bank-details-grid">
                        <div className="bank-text-details">
                          <div className="bank-copy-row">
                            <span>Ngân hàng:</span>
                            <strong>MB Bank (Ngân Hàng Quân Đội)</strong>
                          </div>
                          <div className="bank-copy-row">
                            <span>Số tài khoản:</span>
                            <div className="copy-field">
                              <strong className="syntax-highlight">0942901124</strong>
                              <button
                                type="button"
                                className="copy-btn"
                                onClick={() => {
                                  navigator.clipboard?.writeText("0942901124");
                                  setToast("Đã sao chép STK MB Bank: 0942901124!");
                                  setTimeout(() => setToast(""), 2000);
                                }}
                              >
                                Sao chép
                              </button>
                            </div>
                          </div>
                          <div className="bank-copy-row">
                            <span>Chủ tài khoản:</span>
                            <strong>HUYNH VAN TAI</strong>
                          </div>
                          <div className="bank-copy-row">
                            <span>Số tiền cần chuyển:</span>
                            <div className="copy-field">
                              <strong className="highlight-price">{formatPrice(finalOrderTotal)}</strong>
                              <button
                                type="button"
                                className="copy-btn"
                                onClick={() => {
                                  navigator.clipboard?.writeText(String(finalOrderTotal));
                                  setToast(`Đã sao chép số tiền: ${formatPrice(finalOrderTotal)}!`);
                                  setTimeout(() => setToast(""), 2000);
                                }}
                              >
                                Sao chép
                              </button>
                            </div>
                          </div>
                          <div className="bank-copy-row">
                            <span>Nội dung CK:</span>
                            <div className="copy-field">
                              <strong className="syntax-highlight">
                                {checkoutForm.phone ? `DH ${checkoutForm.phone.replace(/\s+/g, "")}` : "DH TIEMLEN"}
                              </strong>
                              <button
                                type="button"
                                className="copy-btn"
                                onClick={() => {
                                  const content = checkoutForm.phone ? `DH ${checkoutForm.phone.replace(/\s+/g, "")}` : "DH TIEMLEN";
                                  navigator.clipboard?.writeText(content);
                                  setToast(`Đã sao chép nội dung: ${content}!`);
                                  setTimeout(() => setToast(""), 2000);
                                }}
                              >
                                Sao chép
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="bank-qr-mockup">
                          <div className="vietqr-box">
                            <div className="vietqr-top-bar">
                              <span className="vietqr-brand-label">Viet<b>QR</b></span>
                              <span className="napas-label">napas<b>247</b></span>
                            </div>
                            <img
                              src={`https://img.vietqr.io/image/970422-0942901124-qr_only.png?amount=${finalOrderTotal}&addInfo=${encodeURIComponent(checkoutForm.phone ? `DH${checkoutForm.phone.replace(/[^0-9]/g, "")}` : "DHTIEMLEN")}&accountName=HUYNH%20VAN%20TAI`}
                              alt="Mã VietQR Chuyển Khoản MB Bank"
                              className="vietqr-scan-img"
                              onClick={() => setShowCenteredQrModal(true)}
                              title="Bấm để xem mã to"
                              style={{ cursor: "pointer" }}
                            />
                            <div className="vietqr-footer-hint">MB Bank · HUYNH VAN TAI</div>
                          </div>
                          <button
                            type="button"
                            className="btn-open-qr-center-link"
                            onClick={() => setShowCenteredQrModal(true)}
                          >
                            🔍 Xem mã QR phóng to
                          </button>
                        </div>
                      </div>
                      <small className="bank-note">
                        💡 <i>Sau khi bấm <b>"Đặt Hàng & Nhận Thông Tin Chuyển Khoản"</b> bên dưới, hệ thống sẽ tạo đơn hàng và mở chi tiết thanh toán để bạn chuyển khoản.</i>
                      </small>
                    </div>
                  )}

                  <button
                    className={`banner-button checkout-submit ${paymentMethod === "BANK_TRANSFER" ? "qr-submit-highlight" : ""}`}
                    type="submit"
                  >
                    {paymentMethod === "BANK_TRANSFER" ? (
                      <>
                        <span>🛍️ Đặt Hàng & Nhận Thông Tin Chuyển Khoản • {formatPrice(finalOrderTotal)}</span>
                        <span>💳</span>
                      </>
                    ) : (
                      <>
                        <span>🛍️ Hoàn Tất Đặt Hàng (COD) • {formatPrice(finalOrderTotal)}</span>
                        <span>🚚</span>
                      </>
                    )}
                  </button>
                  {orderMessage && (
                    <p className="auth-message">{orderMessage}</p>
                  )}
                </form>
              </section>

              {/* TỔNG QUAN ĐƠN HÀNG BÊN PHẢI */}
              <aside className="checkout-summary">
                <div className="summary-header">
                  <h3>ĐƠN HÀNG CỦA BẠN</h3>
                  <span className="summary-count">{cartItems.length} sản phẩm</span>
                </div>

                <div className="summary-items-list">
                  {cartItems.map((item) => (
                    <div className="summary-item" key={item.product}>
                      <div className="summary-item-img">
                        <img src={item.image} alt={item.name} />
                        <span className="summary-badge">{item.quantity}</span>
                      </div>
                      <div className="summary-item-desc">
                        <strong>{item.name}</strong>
                        <small>Màu sắc: Trắng kem · {formatPrice(item.price)}</small>
                      </div>
                      <b className="summary-item-price">
                        {formatPrice(item.price * item.quantity)}
                      </b>
                    </div>
                  ))}
                </div>

                {/* MÃ GIẢM GIÁ / VOUCHER (CHỈ HIỆN MÃ SỬ DỤNG ĐƯỢC) */}
                <div className="checkout-voucher-box">
                  <div className="voucher-section-header">
                    <span className="voucher-sec-title">🎟️ Mã Khuyến Mãi Có Thể Dùng:</span>
                    <small>Chỉ hiện các mã dùng được cho đơn hàng của bạn</small>
                  </div>

                  <div className="usable-vouchers-list">
                    {eligibleVouchers.length > 0 ? (
                      eligibleVouchers.map((v) => {
                        const isSelected = appliedVoucher?.code === v.code;
                        return (
                          <div
                            key={v.code}
                            className={`usable-voucher-card ${isSelected ? "selected" : ""}`}
                            onClick={() => {
                              if (isSelected) {
                                setAppliedVoucher(null);
                                setVoucherError("");
                                setToast(`Đã bỏ dùng mã ${v.code}`);
                              } else {
                                applyVoucher(v.code);
                              }
                            }}
                          >
                            <div className="voucher-card-badge">{v.badge}</div>
                            <div className="voucher-card-body">
                              <strong>{v.title}</strong>
                              <small>{v.desc}</small>
                            </div>
                            <div className="voucher-card-btn-wrap">
                              <span className={`voucher-pill-btn ${isSelected ? "active" : ""}`}>
                                {isSelected ? "✓ Đã áp dụng" : "Áp dụng"}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="no-usable-vouchers">
                        Chưa có voucher khả dụng cho đơn giá trị này. Thêm sản phẩm để nhận ưu đãi nhé!
                      </p>
                    )}
                  </div>

                  {voucherError && <small className="voucher-error">{voucherError}</small>}

                  {appliedVoucher && (
                    <div className="applied-voucher-badge">
                      <span>✓ Đã áp dụng: <b>{appliedVoucher.label}</b> (-{formatPrice(discountAmount)})</span>
                      <button type="button" onClick={() => setAppliedVoucher(null)}>✕ Bỏ chọn</button>
                    </div>
                  )}
                </div>

                {/* BẢNG TÍNH TIỀN CHI TIẾT */}
                <div className="summary-calc-table">
                  <div className="calc-row">
                    <span>Tạm tính hàng hóa:</span>
                    <strong>{formatPrice(cartTotal)}</strong>
                  </div>
                  <div className="calc-row">
                    <span>Phí vận chuyển:</span>
                    <strong>
                      {shippingFee === 0 ? (
                        <span className="free-text">Miễn phí (Freeship)</span>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </strong>
                  </div>
                  {discountAmount > 0 && (
                    <div className="calc-row discount-row">
                      <span>Voucher giảm giá ({appliedVoucher?.code}):</span>
                      <strong>-{formatPrice(discountAmount)}</strong>
                    </div>
                  )}
                  <div className="calc-row bonus-row">
                    <span>🎁 Quà tặng từ Sene Handmade:</span>
                    <em>10 khóa đánh dấu + Chart PDF (0đ)</em>
                  </div>
                  <div className="summary-total">
                    <span>Tổng thanh toán:</span>
                    <strong>{formatPrice(finalOrderTotal)}</strong>
                  </div>
                </div>

                <div className="checkout-trust-guarantee">
                  <div>
                    <span>🔒</span>
                    <small>Bảo mật thanh toán 100% theo tiêu chuẩn SSL</small>
                  </div>
                  <div>
                    <span>📦</span>
                    <small>Đóng gói cẩn thận 3 lớp chống thấm nước</small>
                  </div>
                  <div>
                    <span>📞</span>
                    <small>Hotline / Zalo hỗ trợ: 0942.901.124</small>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MÃ QR THANH TOÁN CHÍNH GIỮA MÀN HÌNH - TỰ ĐỘNG NHẬN DIỆN TIỀN VÀO */}
      {showCenteredQrModal && (() => {
        const payingAmount = activeQrOrder?.totalAmount ?? finalOrderTotal;
        const payingCode = activeQrOrder?._id
          ? `DH${activeQrOrder._id.slice(-6).toUpperCase()}`
          : `DH${checkoutForm.phone ? checkoutForm.phone.replace(/[^0-9]/g, "") : "TIEMLEN"}`;

        return (
          <div className="centered-qr-backdrop" onClick={() => setShowCenteredQrModal(false)}>
            <div className="centered-qr-modal" onClick={(e) => e.stopPropagation()}>
              {paymentSuccessAnim ? (
                /* MÀN HÌNH CHÚC MỪNG: TỰ ĐỘNG NHẬN DIỆN TIỀN THÀNH CÔNG (KHÔNG CẦN BẤM GÌ) */
                <div className="payment-celebrate-screen">
                  <div className="celebrate-badge-circle">
                    <span className="celebrate-icon">🎉</span>
                  </div>
                  <h3 className="celebrate-title">TIỀN ĐÃ QUA TÀI KHOẢN THÀNH CÔNG!</h3>
                  <div className="celebrate-amount-card">
                    <span>MB Bank vừa báo có:</span>
                    <strong className="celebrate-amount">+{formatPrice(payingAmount)}</strong>
                    <small>Số tài khoản nhận: 0942901124 · HUYNH VAN TAI</small>
                  </div>
                  <div className="celebrate-auto-pill">
                    <span className="pill-dot" />
                    <span>Hệ thống tự động xác nhận chuyển khoản • Không cần bấm xác nhận</span>
                  </div>
                  <div className="celebrate-redirect-box">
                    <div className="redirect-spinner" />
                    <p>Đang tự động chuyển sang màn hình theo dõi vận chuyển Shopee Xpress...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="centered-qr-header">
                    <div className="centered-qr-title">
                      <span className="qr-title-icon">🎉</span>
                      <div>
                        <h3>Đặt Hàng Thành Công • Thông Tin Chuyển Khoản</h3>
                        <p>
                          Mã vận đơn: <b>#{activeQrOrder?.trackingCode || (activeQrOrder?._id ? activeQrOrder._id.slice(-6).toUpperCase() : "SPX")}</b> · Tiệm Len Sene Handmade
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="centered-qr-close"
                      onClick={() => setShowCenteredQrModal(false)}
                      title="Đóng (Esc)"
                    >
                      ✕
                    </button>
                  </div>

                  {/* THANH HƯỚNG DẪN THANH TOÁN THỰC TẾ */}
                  <div className="qr-real-notice-bar">
                    <span className="real-notice-icon">📌</span>
                    <span>Quý khách mở ứng dụng Ngân hàng (MB, Vietcombank, Techcombank, MoMo...) quét mã VietQR hoặc chuyển khoản đúng nội dung bên dưới:</span>
                  </div>

                  <div className="centered-qr-body">
                    {/* KHUNG MÃ QR LỚN Ở CHÍNH GIỮA */}
                    <div className="centered-qr-frame">
                      <div className="vietqr-header-strip">
                        <span className="vietqr-logo-big">Viet<b>QR</b></span>
                        <span className="napas-badge-big">napas<b>247</b></span>
                      </div>
                      <img
                        src={`https://img.vietqr.io/image/970422-0942901124-qr_only.png?amount=${payingAmount}&addInfo=${payingCode}&accountName=HUYNH%20VAN%20TAI`}
                        alt="Mã QR Chuyển Khoản VietQR"
                        className="centered-qr-img"
                      />
                      <div className="centered-qr-caption">
                        <span>MB Bank · HUYNH VAN TAI</span>
                      </div>
                    </div>

                    {/* BẢNG THÔNG TIN SỐ TIỀN & STK */}
                    <div className="centered-qr-info-card">
                      <div className="info-total-row">
                        <span>Số tiền cần chuyển:</span>
                        <div className="info-price-copy">
                          <strong className="centered-qr-price">{formatPrice(payingAmount)}</strong>
                          <button
                            type="button"
                            className="qr-copy-btn"
                            onClick={() => {
                              navigator.clipboard?.writeText(String(payingAmount));
                              setToast(`Đã sao chép số tiền: ${formatPrice(payingAmount)}!`);
                              setTimeout(() => setToast(""), 2000);
                            }}
                          >
                            Sao chép
                          </button>
                        </div>
                      </div>

                      <div className="info-meta-grid">
                        <div className="info-meta-row">
                          <span>Ngân hàng:</span>
                          <strong>MB Bank (Ngân Hàng Quân Đội)</strong>
                        </div>
                        <div className="info-meta-row">
                          <span>Số tài khoản:</span>
                          <div className="info-copy-field">
                            <strong className="syntax-highlight">0942901124</strong>
                            <button
                              type="button"
                              className="qr-copy-btn"
                              onClick={() => {
                                navigator.clipboard?.writeText("0942901124");
                                setToast("Đã sao chép STK: 0942901124!");
                                setTimeout(() => setToast(""), 2000);
                              }}
                            >
                              Sao chép
                            </button>
                          </div>
                        </div>
                        <div className="info-meta-row">
                          <span>Chủ tài khoản:</span>
                          <strong>HUYNH VAN TAI</strong>
                        </div>
                        <div className="info-meta-row">
                          <span>Nội dung CK:</span>
                          <div className="info-copy-field">
                            <strong className="syntax-highlight">{payingCode}</strong>
                            <button
                              type="button"
                              className="qr-copy-btn"
                              onClick={() => {
                                navigator.clipboard?.writeText(payingCode);
                                setToast(`Đã sao chép nội dung: ${payingCode}!`);
                                setTimeout(() => setToast(""), 2000);
                              }}
                            >
                              Sao chép
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* HƯỚNG DẪN THỰC TẾ & XÁC NHẬN CHUYỂN KHOẢN */}
                      <div className="qr-real-guideline-box">
                        <div className="guideline-row">
                          <span className="guideline-icon">📦</span>
                          <div>
                            <strong>Xác nhận & Chuẩn bị đơn:</strong>
                            <p>Sau khi nhận được chuyển khoản, tiệm sẽ kiểm tra sao kê và tiến hành đóng gói, gửi hàng trong ngày.</p>
                          </div>
                        </div>
                        <div className="guideline-row">
                          <span className="guideline-icon">💬</span>
                          <div>
                            <strong>Hỗ trợ nhanh qua Zalo:</strong>
                            <p>Bạn có thể chụp màn hình biên lai gửi qua Zalo <b>0942.901.124</b> để tiệm ưu tiên xuất kho hỏa tốc.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="centered-qr-footer-real">
                    <button
                      type="button"
                      className="btn-confirm-transferred-primary"
                      onClick={() => {
                        setShowCenteredQrModal(false);
                        if (activeQrOrder) setSelectedOrder(activeQrOrder);
                        setToast("🎉 Cảm ơn bạn! Tiệm đã ghi nhận. Shop sẽ kiểm tra biến động số dư và chuẩn bị hàng sớm nhất!");
                        setTimeout(() => setToast(""), 4000);
                      }}
                    >
                      ✅ Tôi Đã Chuyển Khoản Xong
                    </button>
                    <a
                      href={`https://zalo.me/0942901124?text=${encodeURIComponent(
                        `Chào Shop Sene Handmade, mình vừa chuyển khoản đơn hàng #${
                          activeQrOrder?.trackingCode ||
                          (activeQrOrder?._id ? activeQrOrder._id.slice(-6).toUpperCase() : "")
                        } với số tiền ${formatPrice(payingAmount)}. Shop kiểm tra và gửi hàng giúp mình nhé!`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-zalo-chat-action"
                    >
                      💬 Gửi Biên Lai Qua Zalo (0942.901.124)
                    </a>
                    <button
                      type="button"
                      className="btn-view-order-secondary"
                      onClick={() => {
                        setShowCenteredQrModal(false);
                        if (activeQrOrder) setSelectedOrder(activeQrOrder);
                      }}
                    >
                      📋 Xem Chi Tiết Đơn Hàng
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* CHI TIẾT SẢN PHẨM ĐÃ ĐƯỢC CHUYỂN SANG DEDICATED PRODUCT DETAIL VIEW (/san-pham/:slug) */}
      {false && selectedProduct && (() => {
        const isRawYarn =
          selectedProduct.category?.slug === "len-soi" ||
          selectedProduct.category === "Len sợi" ||
          selectedProduct.category?.name === "Len sợi" ||
          (selectedProduct.name &&
            (selectedProduct.name.toLowerCase().includes("cuộn len") ||
             selectedProduct.name.toLowerCase().includes("len sợi")) &&
            !selectedProduct.name.toLowerCase().includes("thú") &&
            !selectedProduct.name.toLowerCase().includes("bé") &&
            !selectedProduct.name.toLowerCase().includes("hoa") &&
            !selectedProduct.name.toLowerCase().includes("kit"));

        return (
          <div className="detail-backdrop shopee-backdrop" onClick={closeProductDetail}>
            <div className="detail-page shopee-detail-page" onClick={(e) => e.stopPropagation()}>
              {/* SHOPEE BREADCRUMB & CLOSE BAR */}
              <div className="shopee-top-bar">
                <div className="shopee-breadcrumb">
                  <span className="shopee-crumb-link" onClick={closeProductDetail}>Shopee</span>
                  <span className="shopee-crumb-sep">&gt;</span>
                  <span className="shopee-crumb-link" onClick={closeProductDetail}>Sene Handmade</span>
                  <span className="shopee-crumb-sep">&gt;</span>
                  <span className="shopee-crumb-link">{selectedProduct.category?.name || "Thủ công Handmade"}</span>
                  <span className="shopee-crumb-sep">&gt;</span>
                  <span className="shopee-crumb-current">{selectedProduct.name}</span>
                </div>
                <button
                  type="button"
                  className="shopee-close-btn"
                  onClick={closeProductDetail}
                  title="Đóng xem chi tiết (Esc)"
                >
                  ✕ Đóng
                </button>
              </div>

              <article className="shopee-product-main" role="main">
                {/* CỘT TRÁI: HÌNH ẢNH & VIDEO SHOPEE GALLERY */}
                <div className="shopee-gallery-col">
                  {/* Switch ảnh / video nếu có video */}
                  {selectedProduct.videos?.length > 0 && (
                    <div className="shopee-media-tabs">
                      <button
                        type="button"
                        className={`shopee-media-tab ${detailMediaType === "image" ? "active" : ""}`}
                        onClick={() => setDetailMediaType("image")}
                      >
                        📸 Ảnh sản phẩm ({selectedProduct.images?.length || 1})
                      </button>
                      <button
                        type="button"
                        className={`shopee-media-tab ${detailMediaType === "video" ? "active" : ""}`}
                        onClick={() => setDetailMediaType("video")}
                      >
                        🎬 Video thực tế ({selectedProduct.videos?.length})
                      </button>
                    </div>
                  )}

                  {/* Khung xem ảnh / video lớn */}
                  <div className="shopee-main-frame">
                    {detailMediaType === "video" && selectedProduct.videos?.length > 0 ? (
                      <div className="shopee-video-box">
                        <video
                          key={selectedProduct.videos[detailVideoIdx] || selectedProduct.videos[0]}
                          src={selectedProduct.videos[detailVideoIdx] || selectedProduct.videos[0]}
                          poster={selectedProduct.videoPoster || selectedProduct.images?.[0]}
                          controls
                          autoPlay
                          playsInline
                          className="shopee-video-player"
                        />
                      </div>
                    ) : (
                      <div className="shopee-image-box">
                        <img
                          src={
                            selectedProduct.images?.[detailImageIdx] ||
                            selectedProduct.images?.[0] ||
                            "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80"
                          }
                          alt={selectedProduct.name}
                          className="shopee-main-img"
                        />
                        <div className="shopee-tag-overlay">
                          <span className="shopee-mall-tag">Yêu thích+</span>
                          <span className="shopee-hand-tag">✨ 100% Thủ công</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Thumbnails 5 ảnh chuẩn Shopee */}
                  <div className="shopee-thumbs-carousel">
                    {selectedProduct.images?.map((thumbUrl, idx) => (
                      <div
                        key={`shopee-thumb-img-${idx}`}
                        className={`shopee-thumb-item ${detailMediaType === "image" && detailImageIdx === idx ? "active" : ""}`}
                        onMouseEnter={() => {
                          setDetailMediaType("image");
                          setDetailImageIdx(idx);
                        }}
                        onClick={() => {
                          setDetailMediaType("image");
                          setDetailImageIdx(idx);
                        }}
                      >
                        <img src={thumbUrl} alt={`Thumbnail ${idx + 1}`} />
                      </div>
                    ))}
                    {selectedProduct.videos?.map((_, vIdx) => (
                      <div
                        key={`shopee-thumb-vid-${vIdx}`}
                        className={`shopee-thumb-item shopee-thumb-video ${detailMediaType === "video" && detailVideoIdx === vIdx ? "active" : ""}`}
                        onClick={() => {
                          setDetailMediaType("video");
                          setDetailVideoIdx(vIdx);
                        }}
                      >
                        <img
                          src={selectedProduct.videoPoster || selectedProduct.images?.[0]}
                          alt={`Video ${vIdx + 1}`}
                        />
                        <span className="shopee-play-icon">▶</span>
                      </div>
                    ))}
                  </div>

                  {/* Dải chia sẻ & thích chuẩn Shopee */}
                  <div className="shopee-share-favorite">
                    <div className="shopee-share-box">
                      <span>Chia sẻ:</span>
                      <button type="button" className="share-btn share-zalo" title="Chia sẻ qua Zalo">💬 Zalo</button>
                      <button type="button" className="share-btn share-fb" title="Chia sẻ qua Facebook">📘 Facebook</button>
                      <button
                        type="button"
                        className="share-btn share-link"
                        onClick={() => {
                          navigator.clipboard?.writeText(window.location.href);
                          setToast("Đã sao chép liên kết sản phẩm!");
                          setTimeout(() => setToast(""), 2200);
                        }}
                        title="Sao chép liên kết"
                      >
                        🔗 Sao chép link
                      </button>
                    </div>
                    <div className="shopee-favorite-box">
                      <button
                        type="button"
                        className={`fav-btn ${wishlist.includes(selectedProduct._id) ? "favorited" : ""}`}
                        onClick={() => toggleWishlist(selectedProduct._id)}
                      >
                        <span>{wishlist.includes(selectedProduct._id) ? "❤️" : "♡"}</span>
                        <span>Đã thích ({wishlist.includes(selectedProduct._id) ? "187" : "186"})</span>
                      </button>
                    </div>
                  </div>

                  {/* Cam kết đảm bảo của Shopee */}
                  <div className="shopee-guarantee-strip">
                    <span className="guarantee-shield">🛡️</span>
                    <div>
                      <strong>Sene Đảm Bảo</strong>
                      <small>3 Ngày Trả Hàng / Hoàn Tiền Miễn Phí</small>
                    </div>
                  </div>
                </div>

                {/* CỘT PHẢI: THÔNG TIN SẢN PHẨM & MUA HÀNG CHUẨN SHOPEE */}
                <div className="shopee-info-col">
                  {/* Tiêu đề sản phẩm với huy hiệu Shopee */}
                  <h1 className="shopee-product-title">
                    <span className="shopee-badge-favorite">Yêu thích+</span>
                    {selectedProduct.name}
                  </h1>

                  {/* Thanh thống kê 3 cột huyền thoại của Shopee */}
                  <div className="shopee-metrics-bar">
                    <div className="metric-item metric-rating">
                      <span className="metric-score">4.9</span>
                      <div className="metric-stars">★★★★★</div>
                    </div>
                    <span className="metric-divider">|</span>
                    <div className="metric-item metric-reviews">
                      <span className="metric-val">128</span>
                      <span className="metric-lbl">Đánh Giá</span>
                    </div>
                    <span className="metric-divider">|</span>
                    <div className="metric-item metric-sold">
                      <span className="metric-val">{selectedProduct.stock > 50 ? "420+" : "185+"}</span>
                      <span className="metric-lbl">Đã Bán</span>
                    </div>
                    <button type="button" className="shopee-report-link">Tố cáo</button>
                  </div>

                  {/* KHUNG GIÁ SHOPEE ĐẶC TRƯNG */}
                  <div className="shopee-price-panel">
                    <div className="shopee-price-row">
                      <del className="shopee-old-price">
                        ₫{(Math.round((selectedProduct.price * 1.25) / 1000) * 1000).toLocaleString("vi-VN")}
                      </del>
                      <strong className="shopee-current-price">
                        ₫{selectedProduct.price.toLocaleString("vi-VN")}
                      </strong>
                      <span className="shopee-discount-badge">-20% GIẢM</span>
                    </div>
                    <div className="shopee-price-subtext">
                      <span>⚡ GÌ CŨNG RẺ</span>
                      <small>Giá tốt nhất thị trường đồ len thủ công so với các sản phẩm cùng loại</small>
                    </div>
                  </div>

                  {/* BẢNG THÔNG TIN MUA HÀNG CHI TIẾT */}
                  <div className="shopee-spec-rows">
                    {/* Mã giảm giá Shop */}
                    <div className="shopee-spec-row">
                      <span className="spec-row-label">Mã Giảm Giá Của Shop</span>
                      <div className="shopee-voucher-tags">
                        <span className="shopee-ticket-voucher">Giảm 15k</span>
                        <span className="shopee-ticket-voucher">Giảm 30k</span>
                        <span className="shopee-ticket-voucher highlight">Freeship Xtra</span>
                      </div>
                    </div>

                    {/* Deal sốc */}
                    <div className="shopee-spec-row">
                      <span className="spec-row-label">Deal Sốc</span>
                      <div className="shopee-deal-tag">
                        <span className="deal-badge-red">Mua Kèm Deal Sốc</span>
                        <span className="deal-text">Mua thêm Bông gòn bi, Kim móc giảm đến 40%</span>
                      </div>
                    </div>

                    {/* Vận chuyển */}
                    <div className="shopee-spec-row">
                      <span className="spec-row-label">Vận Chuyển</span>
                      <div className="shopee-shipping-details">
                        <div className="shipping-line-free">
                          <span className="shipping-icon">🚚</span>
                          <span>Miễn phí vận chuyển cho đơn hàng từ <strong>200.000₫</strong></span>
                        </div>
                        <div className="shipping-line-dest">
                          <span className="shipping-sub-lbl">Gửi từ kho:</span>
                          <span className="shipping-destination">Ninh Kiều, Cần Thơ (⚡ Hỏa Tốc 2H nội thành)</span>
                        </div>
                        <div className="shipping-line-dest">
                          <span className="shipping-sub-lbl">Vận chuyển tới:</span>
                          <span className="shipping-destination">Toàn quốc (Nhận hàng sau 1-3 ngày)</span>
                        </div>
                        <div className="shipping-line-fee">
                          <span className="shipping-sub-lbl">Phí vận chuyển:</span>
                          <span className="shipping-fee-val">0₫</span>
                        </div>
                      </div>
                    </div>

                    {/* PHÂN LOẠI HÀNG: NẾU LÀ THÚ MÓC THÀNH PHẨM THÌ KHÔNG ĐỂ MÀU LEN! */}
                    {isRawYarn ? (
                      <div className="shopee-spec-row">
                        <span className="spec-row-label">Màu Sắc Len</span>
                        <div className="shopee-variation-group">
                          {YARN_COLORS.map((c) => (
                            <button
                              key={c.name}
                              type="button"
                              className={`shopee-variation-btn ${selectedColor === c.name ? "active" : ""}`}
                              onClick={() => setSelectedColor(c.name)}
                              title={c.name}
                            >
                              <span className="var-color-dot" style={{ backgroundColor: c.hex }} />
                              <span>{c.name}</span>
                              {selectedColor === c.name && <span className="shopee-checked-corner">✓</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="shopee-spec-row">
                        <span className="spec-row-label">Phân Loại</span>
                        <div className="shopee-variation-group">
                          <button type="button" className="shopee-variation-btn active">
                            <span>✨ Bản Thành Phẩm Đan Móc Tay (Hoàn Thiện)</span>
                            <span className="shopee-checked-corner">✓</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Số lượng Shopee Stepper */}
                    <div className="shopee-spec-row">
                      <span className="spec-row-label">Số Lượng</span>
                      <div className="shopee-quantity-control">
                        <div className="shopee-stepper">
                          <button
                            type="button"
                            className="stepper-btn"
                            aria-label="Giảm số lượng"
                            onClick={() => setDetailQuantity(Math.max(detailQuantity - 1, 1))}
                          >
                            −
                          </button>
                          <input
                            type="text"
                            className="stepper-input"
                            readOnly
                            value={detailQuantity}
                          />
                          <button
                            type="button"
                            className="stepper-btn"
                            aria-label="Tăng số lượng"
                            onClick={() => setDetailQuantity(Math.min(detailQuantity + 1, selectedProduct.stock))}
                          >
                            +
                          </button>
                        </div>
                        <span className="shopee-stock-text">
                          {selectedProduct.stock} sản phẩm có sẵn
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CẶP NÚT MUA HÀNG HUYỀN THOẠI SHOPEE */}
                  <div className="shopee-action-buttons">
                    <button
                      type="button"
                      className="shopee-btn-add-cart"
                      onClick={() => {
                        addToCart(selectedProduct, detailQuantity);
                        closeProductDetail();
                      }}
                    >
                      <span className="cart-btn-icon">🛒</span>
                      <span>Thêm Vào Giỏ Hàng</span>
                    </button>

                    <button
                      type="button"
                      className="shopee-btn-buy-now"
                      onClick={() => buyNow(selectedProduct, detailQuantity)}
                    >
                      Mua Ngay
                    </button>
                  </div>

                  {/* Dải cam kết phụ */}
                  <div className="shopee-perks-footer">
                    <span>🛡️ Sene Đảm Bảo</span>
                    <span>✓ Trả hàng miễn phí 3 ngày</span>
                    <span>✓ Hàng thủ công 100% đúng mô tả</span>
                    <span>✓ Đồng kiểm khi nhận</span>
                  </div>
                </div>
              </article>

              {/* THẺ PROFILE SHOP CHUẨN SHOPEE MALL */}
              <section className="shopee-shop-card">
                <div className="shop-card-left">
                  <div className="shop-avatar-wrap">
                    <div className="shop-avatar">🧶</div>
                    <span className="shop-mall-badge">Yêu thích+</span>
                  </div>
                  <div className="shop-info-meta">
                    <h3>Sene Handmade Official</h3>
                    <p className="shop-status">Online 5 phút trước</p>
                    <div className="shop-buttons">
                      <button
                        type="button"
                        className="shop-btn-chat"
                        onClick={() => window.open("https://zalo.me/0942901124", "_blank")}
                      >
                        💬 Chat Ngay
                      </button>
                      <button
                        type="button"
                        className="shop-btn-view"
                        onClick={() => {
                          closeProductDetail();
                          document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        🏪 Xem Shop
                      </button>
                    </div>
                  </div>
                </div>
                <div className="shop-card-right">
                  <div className="shop-stat-item">
                    <span>Đánh Giá</span>
                    <strong>4.9 (1.8k đánh giá)</strong>
                  </div>
                  <div className="shop-stat-item">
                    <span>Sản Phẩm</span>
                    <strong>28</strong>
                  </div>
                  <div className="shop-stat-item">
                    <span>Tỉ Lệ Phản Hồi</span>
                    <strong>100%</strong>
                  </div>
                  <div className="shop-stat-item">
                    <span>Thời Gian Phản Hồi</span>
                    <strong>trong vài phút</strong>
                  </div>
                  <div className="shop-stat-item">
                    <span>Kho Hàng</span>
                    <strong>Ninh Kiều, Cần Thơ</strong>
                  </div>
                </div>
              </section>

              {/* GỢI Ý MUA KÈM DEAL SỐC */}
              <div className="shopee-cross-sell-box">
                <div className="shopee-cross-sell-header">
                  <span className="deal-badge-pill">Deal Sốc</span>
                  <strong>Mua Kèm Deal Sốc Giảm Đến 40%</strong>
                </div>
                <div className="shopee-cross-sell-grid">
                  {CRAFT_ADDONS.slice(0, 3).map((addon) => (
                    <div key={addon.id} className="shopee-addon-item">
                      <span className="addon-icon">{addon.icon}</span>
                      <div className="addon-info">
                        <strong>{addon.name}</strong>
                        <div className="addon-pricing">
                          <b>{formatPrice(addon.price)}</b>
                          <del>{formatPrice(addon.originalPrice)}</del>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="addon-add-btn"
                        onClick={() => {
                          addToCart({
                            _id: addon.id,
                            name: addon.name,
                            price: addon.price,
                            images: addon.images,
                            stock: addon.stock,
                          }, 1);
                        }}
                      >
                        + Thêm vào giỏ
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* TABS CHI TIẾT SẢN PHẨM & ĐÁNH GIÁ SHOPEE */}
              <section className="shopee-tabs-container">
                <div className="shopee-tabs-nav">
                  <button
                    type="button"
                    className={`shopee-tab-nav-btn ${detailTab === "specs" ? "active" : ""}`}
                    onClick={() => setDetailTab("specs")}
                  >
                    CHI TIẾT SẢN PHẨM
                  </button>
                  <button
                    type="button"
                    className={`shopee-tab-nav-btn ${detailTab === "guide" ? "active" : ""}`}
                    onClick={() => setDetailTab("guide")}
                  >
                    MÔ TẢ SẢN PHẨM
                  </button>
                  <button
                    type="button"
                    className={`shopee-tab-nav-btn ${detailTab === "reviews" ? "active" : ""}`}
                    onClick={() => setDetailTab("reviews")}
                  >
                    ĐÁNH GIÁ SẢN PHẨM (128)
                  </button>
                </div>

                <div className="shopee-tab-content">
                  {detailTab === "specs" && (
                    <div className="shopee-spec-table">
                      <div className="spec-table-row">
                        <span className="spec-col-lbl">Danh Mục</span>
                        <span className="spec-col-val">Shopee &gt; Sene Handmade &gt; {selectedProduct.category?.name || "Thú len Handmade"}</span>
                      </div>
                      <div className="spec-table-row">
                        <span className="spec-col-lbl">Thương hiệu</span>
                        <span className="spec-col-val">{selectedProduct.brand || "Sene Handmade"}</span>
                      </div>
                      <div className="spec-table-row">
                        <span className="spec-col-lbl">Chất liệu sợi</span>
                        <span className="spec-col-val">Len nhung đũa cao cấp bồng bềnh / Cotton Milk se chặt không xù</span>
                      </div>
                      <div className="spec-table-row">
                        <span className="spec-col-lbl">Kích thước</span>
                        <span className="spec-col-val">Khoảng 25 - 35 cm (Phom chuẩn ôm vừa tay)</span>
                      </div>
                      <div className="spec-table-row">
                        <span className="spec-col-lbl">Xuất xứ</span>
                        <span className="spec-col-val">Thủ công Việt Nam 100% (Made with love by Sene Handmade)</span>
                      </div>
                      <div className="spec-table-row">
                        <span className="spec-col-lbl">Gửi từ</span>
                        <span className="spec-col-val">Ninh Kiều, Cần Thơ (⚡ Giao hỏa tốc 2H)</span>
                      </div>
                    </div>
                  )}

                  {detailTab === "guide" && (
                    <div className="shopee-description-box">
                      <h3>MÔ TẢ CHI TIẾT SẢN PHẨM</h3>
                      <p>{selectedProduct.description}</p>
                      <h4>✨ ĐẶC ĐIỂM NỔI BẬT:</h4>
                      <ul>
                        <li>Từng mũi móc được nghệ nhân của Sene thực hiện tỉ mỉ, phom dáng tròn trịa, chắc chắn.</li>
                        <li>Chất len cao cấp không bai dão, không xổ lông, màu sắc pastel bền đẹp sau nhiều lần giặt.</li>
                        <li>Ruột nhồi 100% bông gòn bi nhân tạo tinh khiết, đàn hồi tốt, an toàn cho trẻ nhỏ.</li>
                        <li>Sản phẩm kèm video quay cận cảnh chi tiết phom dáng và chất len trước khi đóng gói.</li>
                      </ul>
                      <h4>🧺 HƯỚNG DẪN GIẶT VÀ BẢO QUẢN THÚ LEN:</h4>
                      <ul>
                        <li>Khuyên giặt tay bằng dầu gội hoặc sữa tắm dịu nhẹ trong nước lạnh.</li>
                        <li>Không vắt xoắn mạnh, dùng khăn khô thấm bớt nước và phơi trên mặt phẳng nơi thoáng gió.</li>
                      </ul>
                    </div>
                  )}

                  {detailTab === "reviews" && (
                    <div className="shopee-reviews-box">
                      <div className="reviews-summary-card">
                        <div className="summary-left">
                          <span className="big-rating">4.9</span>
                          <span className="rating-max">trên 5</span>
                          <div className="stars-orange">★★★★★</div>
                        </div>
                        <div className="summary-filters">
                          <span className="filter-pill active">Tất Cả (128)</span>
                          <span className="filter-pill">5 Sao (119)</span>
                          <span className="filter-pill">4 Sao (8)</span>
                          <span className="filter-pill">Có Bình Luận (84)</span>
                          <span className="filter-pill">Có Hình Ảnh / Video (65)</span>
                        </div>
                      </div>

                      <div className="shopee-user-reviews-list">
                        <div className="user-review-item">
                          <div className="user-avatar">🌸</div>
                          <div className="review-main">
                            <span className="user-name">h*****t</span>
                            <div className="user-stars">★★★★★</div>
                            <span className="review-time">2026-08-15 14:22 | Phân loại hàng: Bản thành phẩm móc thủ công</span>
                            <p className="review-text">
                              "Bé thỏ đẹp xỉu luôn mn ơi! Len nhung đũa siêu siêu mềm, cầm êm tay cực kỳ. Shop đóng gói hộp cứng cáp, còn kèm thiệp cảm ơn dễ thương nữa. Chắc chắn sẽ ủng hộ shop tiếp!"
                            </p>
                            <div className="review-images">
                              <img src={selectedProduct.images?.[0]} alt="Feedback" />
                              {selectedProduct.images?.[1] && <img src={selectedProduct.images?.[1]} alt="Feedback 2" />}
                            </div>
                          </div>
                        </div>

                        <div className="user-review-item">
                          <div className="user-avatar">🧶</div>
                          <div className="review-main">
                            <span className="user-name">m*****9</span>
                            <div className="user-stars">★★★★★</div>
                            <span className="review-time">2026-09-02 09:18 | Phân loại hàng: Bản thành phẩm móc thủ công</span>
                            <p className="review-text">
                              "Sản phẩm giống y hệt hình và video shop đăng. Mũi len đều tăm tắp, bé thỏ đội mũ xinh xắn lắm. Đánh giá 10 sao cho độ tỉ mỉ của thợ nhé ạ."
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        );
      })()}

      {/* MODAL ĐỌC CẨM NANG ĐAN MÓC LEN (INTERACTIVE READER) */}
      {selectedGuide && (
        <div className="guide-modal-backdrop" onClick={() => setSelectedGuide(null)}>
          <div className="guide-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="guide-modal-header">
              <div className="guide-modal-brand">
                <span className="guide-modal-icon">{selectedGuide.icon}</span>
                <div>
                  <span className="guide-modal-tag">{selectedGuide.tag}</span>
                  <h2>{selectedGuide.title}</h2>
                </div>
              </div>
              <button
                type="button"
                className="guide-modal-close"
                onClick={() => setSelectedGuide(null)}
                title="Đóng cẩm nang"
              >
                ✕
              </button>
            </div>

            {/* TAB CHUYỂN NHANH 3 BÀI VIẾT */}
            <div className="guide-modal-tabs">
              {CRAFT_GUIDES.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={`guide-tab-btn ${selectedGuide.id === g.id ? "active" : ""}`}
                  onClick={() => setSelectedGuide(g)}
                >
                  <span className="guide-tab-icon">{g.icon}</span>
                  <span className="guide-tab-text">{g.shortTitle || g.title}</span>
                </button>
              ))}
            </div>

            <div className="guide-modal-body">
              <div className="guide-read-meta">
                <span>⏱ Thời gian đọc: <strong>{selectedGuide.readTime}</strong></span>
                <span>• Biên soạn bởi: <strong>Nghệ nhân Sene Handmade</strong></span>
                <span>• Dành riêng cho cộng đồng mê đan móc</span>
              </div>

              {selectedGuide.sections?.map((sec, idx) => (
                <div className="guide-section-block" key={idx}>
                  <h3>{sec.heading}</h3>
                  {sec.content && <p className="guide-text">{sec.content}</p>}

                  {sec.table && (
                    <div className="guide-table-wrap">
                      <table className="guide-table">
                        <thead>
                          <tr>
                            {Object.keys(sec.table[0]).map((key) => (
                              <th key={key}>
                                {key === "name"
                                  ? "Dòng Len"
                                  : key === "type"
                                    ? "Thành phần"
                                    : key === "needle"
                                      ? "Cỡ kim khuyên dùng"
                                      : key === "feature"
                                        ? "Đặc điểm"
                                        : key === "suitable"
                                          ? "Thích hợp móc"
                                          : key === "symbol"
                                            ? "Ký hiệu"
                                            : key === "en"
                                              ? "Tên Quốc Tế"
                                              : key === "vi"
                                                ? "Tên Tiếng Việt"
                                                : "Công dụng chính"}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sec.table.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {Object.values(row).map((val, cIdx) => (
                                <td key={cIdx}>
                                  {cIdx === 0 ? <b>{val}</b> : val}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {sec.needleList && (
                    <div className="needle-list-grid">
                      {sec.needleList.map((nl, nIdx) => (
                        <div className="needle-card" key={nIdx}>
                          <h4>🧶 {nl.yarn}</h4>
                          <p>🪡 <b>Kim móc:</b> {nl.hook}</p>
                          <p>🥢 <b>Kim đan:</b> {nl.knit}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {sec.tips && (
                    <ul className="guide-tips-list">
                      {sec.tips.map((tip, tIdx) => (
                        <li key={tIdx}>
                          <span className="tip-bullet">💡</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {sec.chartSteps && (
                    <div className="guide-chart-steps">
                      {sec.chartSteps.map((step, sIdx) => (
                        <div className="chart-step-row" key={sIdx}>
                          <span className="step-num">{sIdx + 1}</span>
                          <p>{step}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="guide-modal-footer">
              <button
                type="button"
                className="banner-button secondary"
                onClick={() => {
                  setSelectedGuide(null);
                  setActiveCategory("len-soi");
                  document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                🧶 Chọn mua Len phù hợp
              </button>
              <button
                type="button"
                className="banner-button"
                onClick={() => {
                  setSelectedGuide(null);
                  setActiveCategory("set-diy-tu-lam");
                  document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                ✨ Xem Kit tự làm cho người mới →
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL CHI TIẾT & TIẾN TRÌNH THEO DÕI ĐƠN HÀNG (SHOPEE STYLE) */}
      {selectedOrder && (
        <div className="order-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <div className="order-modal-title">
                <span className="order-header-icon">📦</span>
                <div>
                  <h3>Chi Tiết Đơn Hàng #{selectedOrder._id.slice(-6).toUpperCase()}</h3>
                  <small>
                    Đặt lúc: {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                  </small>
                </div>
              </div>
              <button
                type="button"
                className="order-modal-close"
                onClick={() => setSelectedOrder(null)}
                title="Đóng xem chi tiết"
              >
                ✕
              </button>
            </div>

            {/* SHOPEE EXPRESS VẬN CHUYỂN HEADER */}
            <div className="shopee-tracking-card">
              <div className="spx-header-row">
                <div className="spx-brand">
                  <span className="spx-badge">SPX Express</span>
                  <span className="spx-service-tag">⚡ Giao Hỏa Tốc Cần Thơ</span>
                </div>
                <div className="spx-tracking-code-box">
                  <span className="code-label">Mã vận đơn:</span>
                  <strong className="spx-tracking-number">
                    {selectedOrder.trackingCode || `SPX-CT${selectedOrder._id.slice(-6).toUpperCase()}VN`}
                  </strong>
                  <button
                    type="button"
                    className="copy-spx-code-btn"
                    onClick={() => {
                      const code = selectedOrder.trackingCode || `SPX-CT${selectedOrder._id.slice(-6).toUpperCase()}VN`;
                      navigator.clipboard?.writeText(code);
                      setToast(`Đã sao chép mã vận đơn: ${code}!`);
                      setTimeout(() => setToast(""), 2000);
                    }}
                    title="Sao chép mã vận đơn"
                  >
                    Sao chép
                  </button>
                </div>
              </div>

              {/* THẺ BƯU TÁ / TÀI XẾ SHOPEE XPRESS PHỤ TRÁCH GIAO HÀNG */}
              <div className="shopee-driver-card">
                <div className="driver-avatar-box">
                  <span className="driver-icon">🛵</span>
                  <span className="driver-online-dot" />
                </div>
                <div className="driver-info">
                  <div className="driver-name-row">
                    <strong>Bưu tá: {selectedOrder.shipper?.name || "Nguyễn Văn Hùng"}</strong>
                    <span className="driver-rating">⭐ {selectedOrder.shipper?.rating || 4.9} (1.240 đơn)</span>
                  </div>
                  <div className="driver-vehicle">
                    <span>Phương tiện: {selectedOrder.shipper?.vehicle || "Honda Wave (65-B1 839.21)"}</span>
                  </div>
                  <div className="driver-status-live">
                    <span className="live-pulsar" />
                    <small>
                      {selectedOrder.status === "delivered"
                        ? "🟢 Đã hoàn tất giao đơn hàng thành công"
                        : selectedOrder.status === "shipping"
                        ? "🛵 Đang di chuyển giao kiện len đến địa chỉ của bạn"
                        : "📦 Đang chờ điều phối nhận hàng từ kho Cần Thơ"}
                    </small>
                  </div>
                </div>
                <a
                  href={`tel:${selectedOrder.shipper?.phone || "0918.234.567"}`}
                  className="driver-call-btn"
                  title="Gọi điện cho bưu tá"
                >
                  <span>📞 Gọi Bưu Tá</span>
                </a>
              </div>

              {/* BẢN ĐỒ LỘ TRÌNH VẬN CHUYỂN TRỰC QUAN (SHOPEE ROUTE PROGRESS) */}
              <div className="shopee-visual-route">
                <div className="route-header">
                  <span className="route-title">🗺️ Lộ trình di chuyển kiện hàng len:</span>
                  <span className="route-eta">
                    Dự kiến giao: <b>{selectedOrder.status === "delivered" ? "Đã giao" : "Hôm nay (2 giờ)"}</b>
                  </span>
                </div>
                <div className="route-flow-bar">
                  {(() => {
                    const statusProgress = {
                      pending: 15,
                      confirmed: 40,
                      shipping: 75,
                      delivered: 100,
                      cancelled: 0,
                    };
                    const pct = statusProgress[selectedOrder.status] ?? 20;
                    return (
                      <div className="route-line-wrap">
                        <div className="route-line-bg" />
                        <div className="route-line-fill" style={{ width: `${pct}%` }} />
                        <div className="route-carrier-bike" style={{ left: `calc(${pct}% - 14px)` }}>
                          🛵💨
                        </div>
                      </div>
                    );
                  })()}
                  <div className="route-checkpoints">
                    <div className="checkpoint done">
                      <span className="cp-dot" />
                      <b>Kho Cần Thơ</b>
                      <small>124 Đ. 30/4, Ninh Kiều</small>
                    </div>
                    <div className={`checkpoint ${selectedOrder.status !== "pending" ? "done" : ""}`}>
                      <span className="cp-dot" />
                      <b>Hub SPX Ninh Kiều</b>
                      <small>Phân loại kiện len</small>
                    </div>
                    <div className={`checkpoint ${selectedOrder.status === "shipping" || selectedOrder.status === "delivered" ? "done" : ""}`}>
                      <span className="cp-dot" />
                      <b>Đang Giao Hàng</b>
                      <small>Bưu tá đang phát</small>
                    </div>
                    <div className={`checkpoint ${selectedOrder.status === "delivered" ? "done" : ""}`}>
                      <span className="cp-dot" />
                      <b>Đã Nhận Hàng</b>
                      <small>{selectedOrder.address ? selectedOrder.address.split(",")[0] : "Địa chỉ của bạn"}</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* NHẬT KÝ HÀNH TRÌNH CHI TIẾT TỪNG MỐC THỜI GIAN (SHOPEE TRACKING LOGS) */}
              <div className="shopee-tracking-logs-wrap">
                <div className="logs-header">
                  <span className="logs-title">📋 Lịch sử chi tiết hành trình vận chuyển</span>
                  <span className="logs-update-badge">Đồng bộ theo thời gian thực</span>
                </div>
                <div className="shopee-logs-timeline">
                  {(() => {
                    const logs = (selectedOrder.shippingLogs && selectedOrder.shippingLogs.length > 0)
                      ? [...selectedOrder.shippingLogs].reverse()
                      : [
                          {
                            time: selectedOrder.createdAt || new Date(),
                            title: "Đã đặt hàng thành công",
                            desc: `Đơn hàng #${selectedOrder.trackingCode || selectedOrder._id.slice(-6).toUpperCase()} đã tiếp nhận trên hệ thống.`,
                            location: "Kho Tổng Cần Thơ",
                            icon: "📝",
                          },
                        ];

                    return logs.map((log, idx) => (
                      <div className={`log-node ${idx === 0 ? "latest" : ""}`} key={idx}>
                        <div className="log-time-col">
                          <strong>{new Date(log.time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</strong>
                          <small>{new Date(log.time).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}</small>
                        </div>
                        <div className="log-icon-col">
                          <div className="log-icon-badge">
                            {log.icon || "📦"}
                          </div>
                          {idx < logs.length - 1 && <div className="log-connector" />}
                        </div>
                        <div className="log-content-col">
                          <div className="log-content-top">
                            <strong className="log-node-title">{log.title}</strong>
                            {log.location && <span className="log-location-pill">📍 {log.location}</span>}
                          </div>
                          <p className="log-node-desc">{log.desc}</p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            <div className="order-detail-grid">
              {/* CỘT TRÁI: THÔNG TIN GIAO NHẬN */}
              <div className="order-customer-card">
                <h4>📍 Thông Tin Nhận Hàng</h4>
                <div className="customer-info-row">
                  <span>Người nhận:</span>
                  <strong>{selectedOrder.customerName}</strong>
                </div>
                <div className="customer-info-row">
                  <span>Số điện thoại:</span>
                  <strong>{selectedOrder.phone}</strong>
                </div>
                <div className="customer-info-row">
                  <span>Địa chỉ nhận hàng:</span>
                  <p>{selectedOrder.address}</p>
                </div>
                {selectedOrder.note && (
                  <div className="customer-info-row">
                    <span>Ghi chú đơn:</span>
                    <p className="order-note-text">{selectedOrder.note}</p>
                  </div>
                )}
                <div className="customer-info-row">
                  <span>Thanh toán qua:</span>
                  <strong>
                    {selectedOrder.paymentMethod === "BANK_TRANSFER"
                      ? "Chuyển khoản (VietQR / MB Bank)"
                      : "Thanh toán tiền mặt khi nhận hàng (COD)"}
                  </strong>
                </div>
                <div className="customer-info-row">
                  <span>Trạng thái thanh toán:</span>
                  <span className={`payment-pill ${selectedOrder.paymentStatus === "paid" ? "paid" : "unpaid"}`}>
                    {selectedOrder.paymentStatus === "paid"
                      ? "✅ ĐÃ THANH TOÁN (MB Bank)"
                      : "⏳ CHƯA THANH TOÁN"}
                  </span>
                </div>
              </div>

              {/* CỘT PHẢI: BẢNG TÍNH TIỀN */}
              <div className="order-pricing-card">
                <h4>💵 Chi Tiết Thanh Toán</h4>
                <div className="order-calc-row">
                  <span>Tiền hàng:</span>
                  <span>{formatPrice(selectedOrder.subtotalAmount || selectedOrder.totalAmount)}</span>
                </div>
                <div className="order-calc-row">
                  <span>Phí vận chuyển:</span>
                  <span>{formatPrice(selectedOrder.totalAmount >= 300000 ? 0 : 25000)}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="order-calc-row discount">
                    <span>Giảm giá ({selectedOrder.promotionCode || "Voucher"}):</span>
                    <span>-{formatPrice(selectedOrder.discountAmount)}</span>
                  </div>
                )}
                <div className="order-calc-row total">
                  <span>TỔNG THANH TOÁN:</span>
                  <strong className="order-grand-total">
                    {formatPrice(selectedOrder.totalAmount)}
                  </strong>
                </div>
                <div className="order-status-pill-wrap">
                  <span>Tình trạng: </span>
                  <span className={`order-status-badge ${selectedOrder.status}`}>
                    {{
                      pending: "🟡 Chờ shop duyệt",
                      confirmed: "🔵 Shop đã chuẩn bị hàng",
                      shipping: "🚚 SPX đang giao hàng",
                      delivered: "🟢 Đã giao thành công",
                      cancelled: "❌ Đã hủy",
                    }[selectedOrder.status] || selectedOrder.status}
                  </span>
                </div>
              </div>
            </div>

            {/* TRẠNG THÁI THANH TOÁN VIETQR / XÁC NHẬN TỰ ĐỘNG NẾU CHƯA CK */}
            {selectedOrder.paymentMethod === "BANK_TRANSFER" && (
              selectedOrder.paymentStatus === "paid" ? (
                <div className="order-paid-banner">
                  <div className="paid-icon-box">✓</div>
                  <div className="paid-text-wrap">
                    <h4>ĐÃ THANH TOÁN THÀNH CÔNG QUA VIETQR</h4>
                    <p>
                      Tài khoản MB Bank 0942901124 (HUYNH VAN TAI) đã nhận đủ {formatPrice(selectedOrder.totalAmount)}. Shop đang tiến hành móc len và đóng gói gửi bạn.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="order-qr-payment-card">
                  <div className="qr-card-header">
                    <span className="qr-badge">⚡ QUÉT MÃ VIETQR THANH TOÁN TỰ ĐỘNG</span>
                    <p>Mở ứng dụng ngân hàng hoặc ví điện tử bất kỳ để quét mã chuyển khoản nhanh (Hệ thống tự nhận diện không cần xác nhận)</p>
                  </div>
                  <div className="qr-card-body">
                    <div className="qr-img-wrapper">
                      <div className="vietqr-box">
                        <div className="vietqr-top-bar">
                          <span className="vietqr-brand-label">Viet<b>QR</b></span>
                          <span className="napas-label">napas<b>247</b></span>
                        </div>
                        <img
                          src={`https://img.vietqr.io/image/970422-0942901124-qr_only.png?amount=${selectedOrder.totalAmount}&addInfo=DH${selectedOrder._id.slice(-6).toUpperCase()}&accountName=HUYNH%20VAN%20TAI`}
                          alt="VietQR MB Bank Sene Handmade"
                          className="vietqr-scan-img"
                        />
                        <div className="vietqr-footer-hint">MB Bank · HUYNH VAN TAI</div>
                      </div>
                      <small className="qr-scan-hint">⚡ Tự động nhận diện tiền vào</small>
                    </div>
                    <div className="qr-bank-details">
                      <div className="qr-detail-row">
                        <span>Ngân hàng:</span>
                        <strong>MB Bank (Ngân hàng Quân Đội)</strong>
                      </div>
                      <div className="qr-detail-row">
                        <span>Số tài khoản:</span>
                        <div className="copy-field">
                          <strong className="syntax-highlight">0942901124</strong>
                          <button
                            type="button"
                            className="copy-btn"
                            onClick={() => {
                              navigator.clipboard?.writeText("0942901124");
                              setToast("Đã sao chép số tài khoản MB Bank: 0942901124!");
                              setTimeout(() => setToast(""), 2000);
                            }}
                          >
                            Sao chép
                          </button>
                        </div>
                      </div>
                      <div className="qr-detail-row">
                        <span>Chủ tài khoản:</span>
                        <strong>HUYNH VAN TAI</strong>
                      </div>
                      <div className="qr-detail-row">
                        <span>Số tiền:</span>
                        <div className="copy-field">
                          <strong className="qr-amount">{formatPrice(selectedOrder.totalAmount)}</strong>
                          <button
                            type="button"
                            className="copy-btn"
                            onClick={() => {
                              navigator.clipboard?.writeText(String(selectedOrder.totalAmount));
                              setToast(`Đã sao chép số tiền: ${formatPrice(selectedOrder.totalAmount)}!`);
                              setTimeout(() => setToast(""), 2000);
                            }}
                          >
                            Sao chép
                          </button>
                        </div>
                      </div>
                      <div className="qr-detail-row">
                        <span>Nội dung CK:</span>
                        <div className="copy-field">
                          <strong className="qr-content-code">{`DH${selectedOrder._id.slice(-6).toUpperCase()}`}</strong>
                          <button
                            type="button"
                            className="copy-btn"
                            onClick={() => {
                              navigator.clipboard?.writeText(`DH${selectedOrder._id.slice(-6).toUpperCase()}`);
                              setToast("Đã sao chép nội dung chuyển khoản!");
                              setTimeout(() => setToast(""), 2000);
                            }}
                          >
                            Sao chép
                          </button>
                        </div>
                      </div>
                      <div className="order-transfer-confirm-box">
                        <p className="order-transfer-hint">
                          💡 Bạn đã chuyển khoản cho đơn này? Hãy bấm xác nhận hoặc gửi ảnh biên lai qua Zalo để tiệm gửi hàng nhanh nhất:
                        </p>
                        <div className="order-transfer-actions">
                          <button
                            type="button"
                            className="btn-order-reported-paid"
                            onClick={() => {
                              setToast("Tiệm đã ghi nhận xác nhận của bạn! Shop sẽ kiểm tra và gửi hàng sớm nhất.");
                              setTimeout(() => setToast(""), 4000);
                            }}
                          >
                            ✅ Tôi Đã Chuyển Khoản Thành Công
                          </button>
                          <a
                            href={`https://zalo.me/0942901124?text=${encodeURIComponent(
                              `Chào Shop Sene Handmade, mình đã chuyển khoản cho đơn hàng #${
                                selectedOrder.trackingCode || selectedOrder._id.slice(-6).toUpperCase()
                              } số tiền ${formatPrice(selectedOrder.totalAmount)}. Nhờ shop kiểm tra và gửi hàng sớm giúp mình nhé!`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-order-zalo-confirm"
                          >
                            💬 Gửi Biên Lai Qua Zalo (0942.901.124)
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* DANH SÁCH SẢN PHẨM TRONG ĐƠN */}
            <div className="order-items-table-wrap">
              <h4>🧶 Sản Phẩm Đã Mua ({selectedOrder.items?.length || 0} món)</h4>
              <div className="order-items-table">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div className="order-item-row" key={idx}>
                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=150&q=80"
                      }
                      alt={item.name}
                      className="order-item-img"
                    />
                    <div className="order-item-info">
                      <strong>{item.name}</strong>
                      <small>Đơn giá: {formatPrice(item.price)}</small>
                    </div>
                    <div className="order-item-qty">
                      <span>SL: <b>x{item.quantity}</b></span>
                    </div>
                    <div className="order-item-subtotal">
                      <b>{formatPrice(item.price * item.quantity)}</b>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="order-modal-footer">
              <a
                href="https://zalo.me/0942901124"
                target="_blank"
                rel="noreferrer"
                className="zalo-support-btn"
              >
                💬 Hỗ trợ Zalo: 0942 901 124
              </a>
              <button
                type="button"
                className="reorder-btn"
                onClick={() => reorder(selectedOrder)}
              >
                🔄 Mua lại đơn này
              </button>
              <button
                type="button"
                className="order-close-action"
                onClick={() => setSelectedOrder(null)}
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast">
          ✓ {toast}
          <button type="button" onClick={() => setCartOpen(true)}>
            Xem giỏ
          </button>
        </div>
      )}


      {/* SOCIAL PROOF / LIVE ORDER TOAST */}
      {currentSocialProof && !socialProofDismissed && (
        <div className="live-order-toast" role="alert">
          <button
            type="button"
            className="live-order-close"
            onClick={() => setSocialProofDismissed(true)}
            title="Đóng thông báo"
          >
            ✕
          </button>
          <div className="live-order-avatar">
            <span>{currentSocialProof.icon}</span>
          </div>
          <div className="live-order-content">
            <p className="live-order-title">
              <strong>{currentSocialProof.name}</strong> <span>({currentSocialProof.location})</span>
            </p>
            <p className="live-order-desc">
              vừa đặt <b>{currentSocialProof.product}</b>
            </p>
            <small className="live-order-time">
              ⚡ {currentSocialProof.time} · Đã xác nhận đơn
            </small>
          </div>
        </div>
      )}

      {/* CỤM NÚT NỔI THÔNG MINH (SPEED DIAL FAB) */}
      <div className={`floating-fab-container ${fabOpen ? "active" : ""}`}>
        {fabOpen && (
          <div className="fab-menu">
            <a
              href="https://zalo.me/0942901124"
              target="_blank"
              rel="noreferrer"
              className="fab-item fab-zalo"
              title="Chat Zalo tư vấn chọn len (0942.901.124)"
            >
              <span className="fab-item-icon">💬</span>
              <span className="fab-item-label">Zalo: 0942.901.124</span>
            </a>
            <a
              href="tel:0942901124"
              className="fab-item fab-hotline"
              title="Gọi hotline đặt hàng nhanh"
            >
              <span className="fab-item-icon">📞</span>
              <span className="fab-item-label">Hotline: 0942.901.124</span>
            </a>
            <button
              type="button"
              className="fab-item fab-custom"
              onClick={() => {
                setFabOpen(false);
                setCustomOrderSuccess(null);
                setCustomOrderModalOpen(true);
              }}
              title="Đặt móc len theo mẫu riêng"
            >
              <span className="fab-item-icon">🧶</span>
              <span className="fab-item-label">Đặt Móc Riêng</span>
            </button>
            <button
              type="button"
              className="fab-item fab-top"
              onClick={() => {
                setFabOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              title="Lên đầu trang"
            >
              <span className="fab-item-icon">↑</span>
              <span className="fab-item-label">Lên đầu trang</span>
            </button>
          </div>
        )}

        <button
          type="button"
          className="fab-main-btn"
          onClick={() => setFabOpen(!fabOpen)}
          title="Hỗ trợ & Tiện ích Sene Handmade"
          aria-label="Menu liên hệ nổi"
        >
          <span className="fab-main-icon">{fabOpen ? "✕" : "💬"}</span>
          {!fabOpen && <span className="fab-main-pulse"></span>}
          <span className="fab-main-text">Tư vấn</span>
        </button>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="mobile-bottom-nav" aria-label="Thanh điều hướng di động">
        <button
          type="button"
          className="mobile-nav-item"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <span className="mobile-nav-icon">🏠</span>
          <span className="mobile-nav-label">Trang chủ</span>
        </button>

        <button
          type="button"
          className="mobile-nav-item"
          onClick={() => {
            const searchInput = document.querySelector("#site-search-input");
            if (searchInput) {
              searchInput.focus();
              searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }}
        >
          <span className="mobile-nav-icon">🔍</span>
          <span className="mobile-nav-label">Tìm kiếm</span>
        </button>

        <button
          type="button"
          className="mobile-nav-item mobile-nav-highlight"
          onClick={() => {
            setCustomOrderSuccess(null);
            setCustomOrderModalOpen(true);
          }}
        >
          <span className="mobile-nav-icon">🧶</span>
          <span className="mobile-nav-label">Đặt móc</span>
        </button>

        <button
          type="button"
          className="mobile-nav-item"
          onClick={() => setCartOpen(true)}
        >
          <span className="mobile-nav-icon-wrap">
            <span className="mobile-nav-icon">🛒</span>
            {cartCount > 0 && <span className="mobile-nav-badge">{cartCount}</span>}
          </span>
          <span className="mobile-nav-label">Giỏ hàng</span>
        </button>

        <a
          href="#account"
          className="mobile-nav-item"
          onClick={() => {
            document.querySelector("#account")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <span className="mobile-nav-icon">👤</span>
          <span className="mobile-nav-label">{currentUser ? "Tôi" : "Tài khoản"}</span>
        </a>
      </nav>

      {/* MODAL: ĐẶT MÓC LEN THEO YÊU CẦU (CUSTOM CROCHET ORDER) */}
      {customOrderModalOpen && (
        <div
          className="custom-order-backdrop"
          onClick={() => setCustomOrderModalOpen(false)}
        >
          <div
            className="custom-order-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="custom-order-header">
              <div className="custom-order-header-left">
                <span className="custom-order-icon">🧶</span>
                <div>
                  <h3>Đặt Móc Len Theo Mẫu Riêng</h3>
                  <p>Tiệm Sene Handmade nhận móc thú bông, hoa, túi xách theo hình bạn gửi!</p>
                </div>
              </div>
              <button
                type="button"
                className="custom-order-close"
                onClick={() => setCustomOrderModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {customOrderSuccess ? (
              <div className="custom-order-success-view">
                <div className="success-sparkle-badge">🎉 ĐÃ TIẾP NHẬN YÊU CẦU</div>
                <h4>Cảm ơn bạn, {customOrderSuccess.customerName}!</h4>
                <p>
                  Yêu cầu móc mẫu <strong>"{customOrderSuccess.productType}"</strong> của bạn đã được gửi đến thợ móc Sene Handmade.
                </p>
                <div className="success-order-box">
                  <div><span>Mã yêu cầu:</span> <strong>#{customOrderSuccess._id?.slice(-8).toUpperCase()}</strong></div>
                  <div><span>Số điện thoại:</span> <strong>{customOrderSuccess.phone}</strong></div>
                  {customOrderSuccess.desiredDate && <div><span>Ngày cần:</span> <strong>{customOrderSuccess.desiredDate}</strong></div>}
                </div>
                <div className="success-actions">
                  <a
                    href="https://zalo.me/0942901124"
                    target="_blank"
                    rel="noreferrer"
                    className="zalo-chat-direct-btn"
                  >
                    💬 Nhắn Zalo ngay để gửi thêm ảnh chi tiết
                  </a>
                  <button
                    type="button"
                    className="custom-order-continue-btn"
                    onClick={() => {
                      setCustomOrderModalOpen(false);
                      setCustomOrderSuccess(null);
                    }}
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              </div>
            ) : (
              <form className="custom-order-form" onSubmit={handleCustomOrderSubmit}>
                <div className="custom-order-form-grid">
                  <div className="form-field">
                    <label>Họ và tên của bạn (*)</label>
                    <input
                      required
                      placeholder="VD: Nguyễn Thị Mai"
                      value={customOrderForm.customerName}
                      onChange={(e) =>
                        setCustomOrderForm({ ...customOrderForm, customerName: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label>Số điện thoại / Zalo (*)</label>
                    <input
                      required
                      placeholder="VD: 0912 345 678 (để tiệm gửi ảnh thành phẩm)"
                      value={customOrderForm.phone}
                      onChange={(e) =>
                        setCustomOrderForm({
                          ...customOrderForm,
                          phone: e.target.value,
                          zalo: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label>Loại sản phẩm bạn muốn đặt</label>
                    <select
                      value={customOrderForm.productType}
                      onChange={(e) =>
                        setCustomOrderForm({ ...customOrderForm, productType: e.target.value })
                      }
                    >
                      <option value="Hoa len handmade vĩnh cửu">🌸 Bó Hoa Len Vĩnh Cửu (Tulip, Hướng Dương, Hồng...)</option>
                      <option value="Thú bông len Amigurumi">🧸 Thú Bông Len Amigurumi (Gấu, Thỏ, Capybara, Mèo...)</option>
                      <option value="Túi xách & Balo len handmade">👜 Túi Xách / Balo / Ví Len Handmade</option>
                      <option value="Khăn len / Nón len / Áo gile">🧣 Khăn Quàng / Nón Len / Áo Gile Len</option>
                      <option value="Móc khóa len & Phụ kiện nhỏ">🔑 Móc Khóa Len / Phụ Kiện Quà Tặng</option>
                      <option value="Mẫu thiết kế riêng khác">✨ Mẫu Riêng Khác Theo Yêu Cầu</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Ngày bạn cần nhận hàng (nếu có dịp lễ/sinh nhật)</label>
                    <input
                      type="date"
                      value={customOrderForm.desiredDate}
                      onChange={(e) =>
                        setCustomOrderForm({ ...customOrderForm, desiredDate: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-field full-row">
                    <label>Mô tả chi tiết mong muốn (*)</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="VD: Em muốn móc 1 bé Capybara đội quả cam cao tầm 15cm, len mềm mịn, có thêu tên 'Minh An' ở dưới chân..."
                      value={customOrderForm.description}
                      onChange={(e) =>
                        setCustomOrderForm({ ...customOrderForm, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label>Tông màu sắc len yêu thích</label>
                    <input
                      placeholder="VD: Nâu be + cam tươi, hoặc Pastel nhẹ nhàng"
                      value={customOrderForm.colorPreference}
                      onChange={(e) =>
                        setCustomOrderForm({ ...customOrderForm, colorPreference: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label>Ngân sách dự kiến (VNĐ - tùy chọn)</label>
                    <input
                      type="number"
                      step="10000"
                      placeholder="VD: 150000"
                      value={customOrderForm.budget}
                      onChange={(e) =>
                        setCustomOrderForm({ ...customOrderForm, budget: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-field full-row">
                    <label>Tải ảnh mẫu bạn thích (từ Pinterest, TikTok, ảnh điện thoại...)</label>
                    <div className="custom-order-upload-box">
                      <input
                        type="file"
                        id="custom-order-file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleCustomOrderImageUpload}
                      />
                      <label htmlFor="custom-order-file" className="custom-order-upload-label">
                        📁 Chọn ảnh mẫu từ máy / điện thoại
                      </label>
                      {customOrderForm.referenceImages.length > 0 && (
                        <div className="custom-order-img-preview">
                          <img src={customOrderForm.referenceImages[0]} alt="Mẫu tham khảo" />
                          <button
                            type="button"
                            onClick={() =>
                              setCustomOrderForm((prev) => ({ ...prev, referenceImages: [] }))
                            }
                            className="remove-img-btn"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="custom-order-modal-footer">
                  <button
                    type="button"
                    className="custom-order-cancel-btn"
                    onClick={() => setCustomOrderModalOpen(false)}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="custom-order-submit-btn"
                    disabled={customOrderSubmitting}
                  >
                    {customOrderSubmitting ? "⏳ Đang gửi yêu cầu..." : "🌸 Gửi Yêu Cầu Đặt Móc"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}



    </main>
  );
}

export default App;
