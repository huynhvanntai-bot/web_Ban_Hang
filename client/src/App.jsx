import { Component, useEffect, useMemo, useState } from "react";
import "./App.css";
import AdminPage from "./AdminPage.jsx";

const apiUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

const locationData = {
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
  "len-soi": { icon: "🧶", desc: "Len Milk, Nhung, Baby Yarn" },
  "dung-cu-dan-moc": { icon: "🪡", desc: "Kim móc, kim đan & phụ kiện" },
  "thu-len-handmade": { icon: "🧸", desc: "Thú bông Amigurumi đan tay" },
  "hoa-len-vinh-cuu": { icon: "💐", desc: "Hoa tulip, hoa hướng dương" },
  "tui-phu-kien-len": { icon: "👜", desc: "Túi xách dệt, mũ & khăn choàng" },
  "set-diy-tu-lam": { icon: "🎁", desc: "Kit tự làm kèm video HD" },
};

const YARN_COLORS = [
  { name: "Trắng kem", hex: "#fffdfa", border: "#ded5ca" },
  { name: "Hồng pastel", hex: "#fcd5ce", border: "#e8b4ab" },
  { name: "Vàng bơ", hex: "#fde2a7", border: "#e4c688" },
  { name: "Xanh mint", hex: "#d8f3dc", border: "#b7e4c7" },
  { name: "Tím lilac", hex: "#e2d4f0", border: "#c8b6dc" },
  { name: "Nâu cacao", hex: "#b08968", border: "#936639" },
];

const CUSTOMER_REVIEWS = [
  {
    id: 1,
    name: "Minh Anh",
    location: "Quận 1, TP.HCM",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
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
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
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
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80",
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
    recommendedYarn: "Len Milk Bò 50g Siêu Mềm",
    amount: "3 cuộn (150g)",
    needle: "Kim móc 3.5mm - 4.0mm",
    tip: "Mũi nửa kép (HDC) giúp khăn xốp nhẹ và giữ ấm tốt",
    estimatedPrice: 54000,
    productName: "Len Milk Bò 50g Siêu Mềm",
    quantity: 3,
  },
  {
    id: "preset-beanie",
    name: "Mũ Len Beanie / Beret",
    icon: "🧢",
    recommendedYarn: "Len Nhung Đũa Cỡ Lớn",
    amount: "2 cuộn (200g)",
    needle: "Kim móc 5.0mm - 6.0mm",
    tip: "Móc xoắn ốc đều tay, sợi nhung mềm mịn mướt tay",
    estimatedPrice: 70000,
    productName: "Len Nhung Đũa Cỡ Lớn 100g",
    quantity: 2,
  },
  {
    id: "preset-tulip",
    name: "Bó 5 Cành Hoa Tulip",
    icon: "🌷",
    recommendedYarn: "Set Hoa Tulip Tự Làm",
    amount: "1 trọn bộ kit đầy đủ",
    needle: "Kèm sẵn kim móc & kẽm cành",
    tip: "Kèm video quét mã QR hướng dẫn từng cánh hoa",
    estimatedPrice: 175000,
    productName: "Bó 5 Cánh Hoa Tulip Len Tone Hồng Pastel",
    quantity: 1,
  },
  {
    id: "preset-tote",
    name: "Túi Tote Dệt Hoa Cúc",
    icon: "👜",
    recommendedYarn: "Sợi Dệt Trơn 2mm",
    amount: "2 cuộn (200g)",
    needle: "Kim móc 2.5mm - 3.0mm",
    tip: "Sợi dệt đứng form, quai túi chắc chắn không dão",
    estimatedPrice: 64000,
    productName: "Sợi Dệt Trơn Móc Túi Xách 100g",
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

function App() {
  if (window.location.pathname === "/admin") {
    return (
      <ErrorBoundary>
        <AdminPage />
      </ErrorBoundary>
    );
  }
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
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
  const [checkoutForm, setCheckoutForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    ward: "",
    note: "",
    promoCode: "",
  });
  const [orderMessage, setOrderMessage] = useState("");
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
    const handleBack = () => setSelectedProduct(null);
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, []);

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
      .catch(() => {});
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
        if (!categoryResponse.ok || !productResponse.ok)
          throw new Error("API không phản hồi");
        setCategories(await categoryResponse.json());
        const loadedProducts = (await productResponse.json()).products;
        setProducts(loadedProducts);
        if (promotionResponse.ok)
          setActivePromotions(await promotionResponse.json());
        const detailSlug = window.location.pathname.startsWith("/san-pham/")
          ? window.location.pathname.replace("/san-pham/", "")
          : "";
        const directProduct = loadedProducts.find(
          (product) => product.slug === detailSlug,
        );
        if (directProduct) setSelectedProduct(directProduct);
      } catch (loadError) {
        setError("Chưa tải được sản phẩm. Hãy kiểm tra backend đang chạy.");
        console.error(loadError);
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
  function openProductDetail(product) {
    setSelectedProduct(product);
    setDetailQuantity(1);
    setDetailTab("specs");
    setDetailImageIdx(0);
    window.history.pushState({}, "", `/san-pham/${product.slug}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function closeProductDetail() {
    setSelectedProduct(null);
    if (window.location.pathname.startsWith("/san-pham/"))
      window.history.pushState({}, "", "/");
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

  function applyVoucher(codeToApply) {
    const code = (codeToApply || promoInput).trim().toUpperCase();
    setVoucherError("");
    if (!code) return;
    if (code === "TIEMLEN10") {
      setAppliedVoucher({
        code: "TIEMLEN10",
        label: "Giảm 10% tổng đơn hàng",
        type: "percent",
        value: 0.1,
      });
      setToast("Đã áp dụng mã TIEMLEN10: Giảm 10% ♡");
    } else if (code === "FREESHIP") {
      setAppliedVoucher({
        code: "FREESHIP",
        label: "Miễn phí vận chuyển tiêu chuẩn",
        type: "shipping",
        value: 25000,
      });
      setToast("Đã áp dụng mã FREESHIP: Miễn phí ship ♡");
    } else if (code === "LENXINH30") {
      if (cartTotal < 100000) {
        setVoucherError("Mã LENXINH30 chỉ áp dụng cho đơn từ 100.000đ trở lên");
        return;
      }
      setAppliedVoucher({
        code: "LENXINH30",
        label: "Giảm ngay 30.000đ",
        type: "fixed",
        value: 30000,
      });
      setToast("Đã áp dụng mã LENXINH30: Giảm 30.000đ ♡");
    } else {
      setVoucherError("Mã giảm giá không hợp lệ hoặc đã hết lượt dùng");
    }
    setTimeout(() => setToast(""), 2200);
  }

  const shippingFee =
    shippingMethod === "EXPRESS" ? 45000 : cartTotal >= 300000 ? 0 : 25000;
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
    event.preventDefault();
    try {
      const token = localStorage.getItem("tai-shop-token");
      const orderNote = [
        checkoutForm.note,
        shippingMethod === "EXPRESS" ? "[Giao Hỏa Tốc 2H]" : "[Giao Tiêu Chuẩn]",
        isGiftWrap
          ? `[Gói quà & Thiệp: "${giftMessage || "Thiệp viết tay handmade chúc mừng"}" ]`
          : "",
        appliedVoucher
          ? `[Voucher: ${appliedVoucher.code} -${formatPrice(discountAmount)}]`
          : "",
      ]
        .filter(Boolean)
        .join(" | ");

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
            product: item.product,
            quantity: item.quantity,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setCartItems([]);
      setCheckoutForm({
        customerName: "",
        phone: "",
        address: "",
        province: "",
        district: "",
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
        data.order,
        ...savedLocal.filter((o) => o._id !== data.order._id),
      ];
      localStorage.setItem(
        "tai-shop-placed-orders",
        JSON.stringify(updatedLocal)
      );
      setOrderHistory(updatedLocal);
      setSelectedOrder(data.order);
      setToast(`🎉 Đặt hàng thành công! Mã đơn: #${data.order._id.slice(-6).toUpperCase()}`);
      setTimeout(() => setToast(""), 4500);
    } catch (orderError) {
      setOrderMessage(orderError.message);
    }
  }

  const heroProducts = products.slice(0, 3);
  const flashSaleProducts = products.filter((p) => p.featured).slice(0, 4);
  const freeshipRemaining = Math.max(0, FREESHIP_THRESHOLD - cartTotal);
  const freeshipPercent = Math.min(
    100,
    Math.round((cartTotal / FREESHIP_THRESHOLD) * 100),
  );
  const wishlistProducts = products.filter((p) => wishlist.includes(p._id));

  return (
    <main className="storefront">
      <div className="promo-bar">
        <div className="promo-ticker">
          <span>🧶 <strong>Sene Handmade:</strong> Tặng bộ kẹp định vị & kim khâu cho đơn từ 150k</span>
          <span className="promo-sep">•</span>
          <span>🚚 <strong>Freeship:</strong> Miễn phí giao hàng toàn quốc từ 200.000đ</span>
          <span className="promo-sep">•</span>
          <span>✨ <strong>Hotline/Zalo:</strong> 0942.901.124 hỗ trợ chọn len 24/7</span>
        </div>
      </div>

      <header className="site-header">
        <div className="header-main">
          <a className="brand" href="/">
            <span className="brand-icon">🧶</span>
            <div className="brand-text">
              SENE <span>HANDMADE</span>
              <small className="brand-slogan">Yarn & Crochet Boutique</small>
            </div>
          </a>

          <form
            className="search-box"
            onSubmit={(event) => {
              event.preventDefault();
              document
                .querySelector("#products")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span className="search-icon">⌕</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm kiếm len milk bò, kim móc, thú bông, hoa len..."
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                type="button"
                onClick={() => setSearchQuery("")}
              >
                ×
              </button>
            )}
            <button type="submit" className="search-submit-btn">
              Tìm kiếm
            </button>
          </form>

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
              <a className="header-orders-link" href="#orders">
                Đơn hàng
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

        <nav className="quick-nav">
          <button
            type="button"
            className={`nav-pill ${!activeCategory ? "active" : ""}`}
            onClick={() => {
              setActiveCategory("");
              document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            ✨ Tất cả sản phẩm
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              type="button"
              className={`nav-pill ${activeCategory === category.slug ? "active" : ""}`}
              onClick={() => {
                setActiveCategory(category.slug);
                document
                  .querySelector("#products")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <span>{CATEGORY_META[category.slug]?.icon || "🧶"}</span>
              {category.name}
            </button>
          ))}
          <button
            type="button"
            className="nav-pill nav-guide"
            onClick={() => setSelectedGuide(CRAFT_GUIDES[0])}
          >
            📖 Cẩm nang móc len
          </button>
          <button
            type="button"
            className="nav-pill nav-custom-order-pill"
            onClick={() => {
              setCustomOrderSuccess(null);
              setCustomOrderModalOpen(true);
            }}
          >
            🧶 Đặt Móc Theo Mẫu
          </button>
        </nav>
      </header>

      <section className="hero-banner">
        <div className="banner-copy">
          <div className="banner-badge-top">
            <span>♡ SENE HANDMADE THỦ CÔNG CHẤT LƯỢNG CAO</span>
          </div>
          <h1>
            Dệt yêu thương,
            <br />
            <em>trao trọn ấm áp.</em>
          </h1>
          <p>
            Từng cuộn len mềm mịn, bộ kim móc êm ái và những món quà thủ công
            được đan móc chỉn chu từng đường kim mũi chỉ dành cho bạn.
          </p>
          <div className="banner-cta-group">
            <a className="banner-button primary-cta" href="#products">
              Khám phá len xinh <span>→</span>
            </a>
            <button
              className="banner-button secondary-cta"
              type="button"
              onClick={() => {
                setActiveCategory("set-diy-tu-lam");
                document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Set Kit tự làm cho người mới ✨
            </button>
          </div>
          <div className="banner-trust-badges">
            <span>✓ 100% Sợi êm da, không xù</span>
            <span>✓ Đổi trả miễn phí 7 ngày</span>
            <span>✓ Kèm video & chart móc</span>
          </div>
        </div>

        <div className="banner-products">
          {heroProducts.map((product, index) => (
            <button
              key={product._id}
              type="button"
              className={`banner-product banner-product-${index + 1}`}
              onClick={() => openProductDetail(product)}
            >
              <img src={product.images?.[0]} alt={product.name} />
              <div className="banner-product-tag">{product.name}</div>
            </button>
          ))}
        </div>

        <div className="banner-sticker">
          100%
          <br />
          <span>
            HANDMADE
            <br />
            WITH LOVE ♡
          </span>
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

      {/* DANH MỤC TRỰC QUAN VỚI ICON */}
      <section className="categories-showcase">
        <div className="section-title-wrap">
          <p className="section-kicker">BỘ SƯU TẬP</p>
          <h2>Khám Phá Theo Danh Mục</h2>
          <p>Lựa chọn những chất liệu len và phụ kiện tốt nhất cho dự án của bạn</p>
        </div>
        <div className="categories-grid">
          {categories.map((category) => {
            const meta = CATEGORY_META[category.slug] || { icon: "🧶", desc: "Sản phẩm chất lượng" };
            return (
              <div
                key={category._id}
                className={`category-card ${activeCategory === category.slug ? "active" : ""}`}
                onClick={() => {
                  setActiveCategory(category.slug);
                  document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <div className="category-icon-wrap">{meta.icon}</div>
                <h3>{category.name}</h3>
                <p>{meta.desc}</p>
                <span className="category-link">Xem sản phẩm →</span>
              </div>
            );
          })}
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
            <article className="product-card" key={product._id}>
              <div className="product-image-wrap">
                <button
                  className="product-image"
                  type="button"
                  onClick={() => openProductDetail(product)}
                >
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    loading="lazy"
                  />
                  {product.featured && (
                    <span className="product-badge">Bán chạy ★</span>
                  )}
                </button>
                <button
                  className={`card-wishlist-btn ${wishlist.includes(product._id) ? "active" : ""}`}
                  onClick={(e) => toggleWishlist(product, e)}
                  title={wishlist.includes(product._id) ? "Bỏ thích" : "Yêu thích"}
                  aria-label="Yêu thích"
                >
                  {wishlist.includes(product._id) ? "♥" : "♡"}
                </button>
              </div>

              <div className="product-info">
                <div className="product-meta-row">
                  <span className="product-category-tag">
                    {product.category?.name}
                  </span>
                  <div className="color-swatches-mini" title="Nhiều màu sắc đa dạng">
                    <span style={{ backgroundColor: "#fcd5ce" }}></span>
                    <span style={{ backgroundColor: "#d8f3dc" }}></span>
                    <span style={{ backgroundColor: "#fde2a7" }}></span>
                  </div>
                </div>

                <button
                  className="product-name"
                  type="button"
                  onClick={() => openProductDetail(product)}
                >
                  {product.name}
                </button>

                <div className="rating">
                  ★★★★★ <span>4.9 (đã bán 120+)</span>
                </div>

                <div className="product-footer">
                  <div className="price-block">
                    <strong>{formatPrice(product.price)}</strong>
                    <small className="product-brand-tag">{product.brand}</small>
                  </div>
                  <div className="product-actions">
                    <button
                      className="detail-button"
                      type="button"
                      onClick={() => openProductDetail(product)}
                    >
                      Xem chi tiết
                    </button>
                    <button
                      className="add-button"
                      type="button"
                      onClick={() => addToCart(product)}
                      aria-label={`Thêm ${product.name}`}
                      title="Thêm vào giỏ hàng"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </article>
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

      <footer>
        <div className="footer-top">
          <div className="footer-brand-col">
            <a className="brand" href="/">
              <span className="brand-icon">🧶</span>
              SENE <span>HANDMADE</span>
            </a>
            <p>Len sợi mịn màng, phụ kiện đan móc cao cấp & quà tặng handmade đan tay tỉ mỉ gửi gắm trọn vẹn yêu thương.</p>
            <div className="footer-contacts">
              <span>📍 Địa chỉ: 124 Đường Len Sợi, TP. Hồ Chí Minh</span>
              <span>📞 Hotline: 0942.901.124 (Zalo 24/7)</span>
              <span>✉ Email: huynhvanntai@gmail.com</span>
            </div>
          </div>
          <div className="footer-links-col">
            <h4>Danh mục len</h4>
            <a href="#products" onClick={() => setActiveCategory("len-soi")}>Len Milk Bò & Nhung</a>
            <a href="#products" onClick={() => setActiveCategory("dung-cu-dan-moc")}>Kim móc & Dụng cụ</a>
            <a href="#products" onClick={() => setActiveCategory("thu-len-handmade")}>Thú bông Amigurumi</a>
            <a href="#products" onClick={() => setActiveCategory("hoa-len-vinh-cuu")}>Bó hoa len vĩnh cửu</a>
          </div>
          <div className="footer-links-col">
            <h4>Chăm sóc khách hàng</h4>
            <a href="#guides">Hướng dẫn chọn len cho người mới</a>
            <a href="#guides">Chính sách bảo hành & Đổi trả 7 ngày</a>
            <a href="#guides">Phương thức giao hàng & Thanh toán COD</a>
            <a href="#account">Kiểm tra lịch sử đơn hàng</a>
            <a href="/admin" style={{ color: "#db2777", fontWeight: 700 }}>⚙️ Trang Quản Trị (Admin Studio)</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Sene Handmade · Dệt yêu thương, trao ấm áp · COD toàn quốc</span>
          <div className="footer-badges">
            <span>✓ 100% Sợi chọn lọc</span>
            <span>✓ Đóng gói hộp quà</span>
            <span>✓ Giao hàng hỏa tốc</span>
          </div>
        </div>
      </footer>

      {/* SHOPEE-STYLE CART DRAWER & BACKDROP */}
      {cartOpen && (
        <div className="cart-backdrop" onClick={() => setCartOpen(false)}>
          <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-drawer-header">
              <div className="cart-drawer-title">
                <span className="cart-header-icon">🛒</span>
                <div>
                  <h3>Giỏ Hàng Của Bạn</h3>
                  <small>{cartItems.length} loại sản phẩm ({cartCount} món)</small>
                </div>
              </div>
              <button
                className="cart-close-btn"
                type="button"
                onClick={() => setCartOpen(false)}
                title="Đóng giỏ hàng"
              >
                ✕
              </button>
            </div>

            {/* FREESHIP PROGRESS BAR */}
            {cartItems.length > 0 && (
              <div className="cart-freeship-banner">
                <div className="freeship-header">
                  {freeshipRemaining <= 0 ? (
                    <span className="freeship-won">
                      🎉 <b>Đã đủ điều kiện FREESHIP</b> toàn quốc!
                    </span>
                  ) : (
                    <span>
                      🚚 Mua thêm <b>{formatPrice(freeshipRemaining)}</b> để nhận <b>FREESHIP</b>
                    </span>
                  )}
                  <small>{freeshipPercent}%</small>
                </div>
                <div className="freeship-track">
                  <div
                    className="freeship-fill"
                    style={{ width: `${freeshipPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* CART ITEMS LIST */}
            <div className="cart-items-scroll">
              {cartItems.length === 0 ? (
                <div className="cart-empty-state">
                  <span className="empty-cart-emoji">🧶</span>
                  <h4>Giỏ hàng đang trống</h4>
                  <p>Chưa có cuộn len hay bộ kit nào trong giỏ của bạn.</p>
                  <button
                    className="shop-now-btn"
                    type="button"
                    onClick={() => {
                      setCartOpen(false);
                      document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Dạo tiệm chọn len ngay →
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div className="cart-drawer-item" key={item.product}>
                    <img src={item.image} alt={item.name} className="cart-item-thumb" />
                    <div className="cart-item-details">
                      <h4 className="cart-item-title">{item.name}</h4>
                      <div className="cart-item-price-row">
                        <span className="cart-item-unit-price">{formatPrice(item.price)}</span>
                      </div>
                      <div className="cart-item-controls">
                        <div className="shopee-quantity-box">
                          <button
                            type="button"
                            onClick={() => changeQuantity(item.product, -1)}
                            title="Giảm số lượng"
                          >
                            −
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => changeQuantity(item.product, 1)}
                            title="Tăng số lượng"
                          >
                            +
                          </button>
                        </div>
                        <span className="cart-item-subtotal">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          type="button"
                          className="cart-item-del-btn"
                          onClick={() => changeQuantity(item.product, -item.quantity)}
                          title="Xóa sản phẩm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            
            {/* GỢI Ý MUA KÈM COMBO DỤNG CỤ TIẾT KIỆM (CROSS-SELL) */}
            <div className="cart-addons-box">
              <div className="cart-addons-header">
                <span className="cart-addons-badge">🎁 COMBO TIẾT KIỆM</span>
                <h4>Dụng Cụ Thiết Yếu Cho Người Mới</h4>
              </div>
              <div className="cart-addons-scroll">
                {CRAFT_ADDONS.map((addon) => {
                  const alreadyInCart = cartItems.some((c) => c.product === addon.id);
                  return (
                    <div key={addon.id} className="cart-addon-card">
                      <div className="cart-addon-icon">{addon.icon}</div>
                      <div className="cart-addon-info">
                        <strong className="cart-addon-name">{addon.name}</strong>
                        <div className="cart-addon-price-row">
                          <span className="cart-addon-price">{formatPrice(addon.price)}</span>
                          <span className="cart-addon-old-price">{formatPrice(addon.originalPrice)}</span>
                        </div>
                        <small className="cart-addon-desc">{addon.desc}</small>
                      </div>
                      <button
                        type="button"
                        className={`cart-addon-add-btn ${alreadyInCart ? "added" : ""}`}
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
                        {alreadyInCart ? "✓ Đã thêm" : "+ Thêm"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CART FOOTER (SHOPEE STYLE) */}
            {cartItems.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="cart-summary-row">
                  <span>Tạm tính ({cartCount} sản phẩm):</span>
                  <strong className="cart-subtotal-val">{formatPrice(cartTotal)}</strong>
                </div>
                <div className="cart-summary-row ship-note">
                  <span>Ưu đãi vận chuyển:</span>
                  <small>{cartTotal >= 200000 ? "✓ Miễn phí ship toàn quốc" : "Phí ship tính ở bước thanh toán"}</small>
                </div>
                <div className="cart-total-highlight">
                  <span>Tổng thanh toán:</span>
                  <b className="grand-total-val">{formatPrice(cartTotal)}</b>
                </div>

                <button
                  type="button"
                  className="shopee-checkout-btn"
                  onClick={() => {
                    setCartOpen(false);
                    setCheckoutOpen(true);
                  }}
                >
                  <span>MUA HÀNG ({cartCount} món)</span>
                  <span>→</span>
                </button>
                <small className="cart-guarantee-note">
                  🛡️ Đồng kiểm khi nhận hàng · 100% len mềm êm không xù
                </small>
              </div>
            )}
          </aside>
        </div>
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
                        <strong>⚡ Giao hàng hỏa tốc trong 2H</strong>
                        <small>Áp dụng nội thành TP.HCM & Hà Nội (giao qua Grab / Ahamove)</small>
                      </div>
                      <span className="shipping-fee-badge">45.000đ</span>
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
                          <p>Ngân hàng: <strong>MB Bank (Ngân hàng Quân Đội)</strong></p>
                          <p>Số tài khoản: <strong>0942901124</strong></p>
                          <p>Chủ tài khoản: <strong>HUYNH VAN TAI</strong></p>
                          <p>
                            Số tiền: <strong className="highlight-price">{formatPrice(finalOrderTotal)}</strong>
                          </p>
                          <p>
                            Nội dung chuyển khoản:{" "}
                            <strong className="syntax-highlight">
                              {checkoutForm.phone ? `${checkoutForm.phone} - TiemLen` : "SDT - TiemLen"}
                            </strong>
                          </p>
                        </div>
                        <div className="bank-qr-mockup">
                          <img
                            src="https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=https://me.mbbank.com.vn"
                            alt="Mã QR Chuyển khoản"
                          />
                          <small>Quét mã bằng app ngân hàng</small>
                        </div>
                      </div>
                      <small className="bank-note">
                        ⚠️ Sau khi chuyển khoản, bạn chỉ cần bấm "Hoàn tất đặt hàng" bên dưới. Tiệm sẽ liên hệ xác nhận qua điện thoại/Zalo.
                      </small>
                    </div>
                  )}

                  <button
                    className="banner-button checkout-submit"
                    type="submit"
                  >
                    <span>Hoàn tất đặt hàng • {formatPrice(finalOrderTotal)}</span>
                    <span>→</span>
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

                {/* MÃ GIẢM GIÁ / VOUCHER */}
                <div className="checkout-voucher-box">
                  <div className="voucher-input-group">
                    <input
                      placeholder="Nhập mã ưu đãi..."
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    />
                    <button
                      type="button"
                      onClick={() => applyVoucher()}
                      className="voucher-apply-btn"
                    >
                      Áp dụng
                    </button>
                  </div>
                  {voucherError && <small className="voucher-error">{voucherError}</small>}

                  {appliedVoucher && (
                    <div className="applied-voucher-badge">
                      <span>✓ {appliedVoucher.code}: {appliedVoucher.label}</span>
                      <button type="button" onClick={() => setAppliedVoucher(null)}>✕</button>
                    </div>
                  )}

                  <div className="quick-vouchers-list">
                    <small>Mã gợi ý cho bạn:</small>
                    <div className="quick-vouchers-chips">
                      <button
                        type="button"
                        className="voucher-chip"
                        onClick={() => applyVoucher("TIEMLEN10")}
                      >
                        TIEMLEN10 (-10%)
                      </button>
                      <button
                        type="button"
                        className="voucher-chip"
                        onClick={() => applyVoucher("FREESHIP")}
                      >
                        FREESHIP (-25k)
                      </button>
                      <button
                        type="button"
                        className="voucher-chip"
                        onClick={() => applyVoucher("LENXINH30")}
                      >
                        LENXINH30 (-30k)
                      </button>
                    </div>
                  </div>
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

      {/* CHI TIẾT SẢN PHẨM (PRODUCT DETAIL MODAL) */}
      {selectedProduct && (
        <div className="detail-backdrop" onClick={closeProductDetail}>
          <div className="detail-page" onClick={(e) => e.stopPropagation()}>
            <div className="detail-nav-bar">
              <div className="detail-breadcrumb">
                <button type="button" onClick={closeProductDetail}>
                  ← Quay lại cửa hàng
                </button>
                <span>
                  Trang chủ / {selectedProduct.category?.name} /{" "}
                  <strong>{selectedProduct.name}</strong>
                </span>
              </div>
              <button
                type="button"
                className="detail-close-btn"
                onClick={closeProductDetail}
                title="Đóng xem chi tiết (Esc)"
              >
                ✕ Đóng lại
              </button>
            </div>

            <article className="detail-modal" role="main">
              {/* CỘT TRÁI: HÌNH ẢNH & GALLERY THUMBNAILS */}
              <div className="detail-gallery-col">
                <div className="detail-main-image-wrap">
                  <img
                    src={
                      detailImageIdx === 0
                        ? selectedProduct.images?.[0]
                        : detailImageIdx === 1
                        ? "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80"
                        : detailImageIdx === 2
                        ? "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80"
                        : "https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={selectedProduct.name}
                    className="detail-main-img"
                  />
                  <div className="detail-badges-overlay">
                    <span className="overlay-badge">✨ 100% Sợi chọn lọc</span>
                    <span className="overlay-badge warm">🌿 Không ngứa da</span>
                  </div>
                </div>

                {/* THUMBNAILS HÀNG DƯỚI */}
                <div className="detail-thumbs-list">
                  {[
                    selectedProduct.images?.[0],
                    "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=300&q=80",
                    "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=300&q=80",
                    "https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=300&q=80",
                  ].map((thumbUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`detail-thumb-btn ${detailImageIdx === idx ? "active" : ""}`}
                      onClick={() => setDetailImageIdx(idx)}
                    >
                      <img src={thumbUrl} alt={`Góc nhìn ${idx + 1}`} />
                    </button>
                  ))}
                </div>

                <div className="detail-trust-points">
                  <span>✓ Bao đổi trả miễn phí 7 ngày</span>
                  <span>✓ Tặng kèm mã QR video hướng dẫn</span>
                </div>
              </div>

              {/* CỘT PHẢI: THÔNG TIN & HÀNH ĐỘNG MUA */}
              <div className="detail-content">
                <div className="detail-top-tags">
                  <span className="product-category-pill">
                    {selectedProduct.category?.name}
                  </span>
                  <span className="product-brand-pill">
                    Thương hiệu: {selectedProduct.brand || "Sene Handmade"}
                  </span>
                </div>

                <h1>{selectedProduct.name}</h1>

                <div className="detail-rating-row">
                  <div className="stars">★★★★★</div>
                  <span className="rating-num">4.9 / 5.0</span>
                  <span className="rating-sep">•</span>
                  <span className="sold-count">
                    Đã bán {selectedProduct.stock > 50 ? "420+" : "185+"} sản phẩm
                  </span>
                </div>

                <div className="detail-price-box">
                  <strong className="detail-price">
                    {formatPrice(selectedProduct.price)}
                  </strong>
                  <del className="detail-old-price">
                    {formatPrice(Math.round((selectedProduct.price * 1.25) / 1000) * 1000)}
                  </del>
                  <span className="discount-tag">-20% Tiết kiệm</span>
                </div>

                <p className="detail-description">
                  {selectedProduct.description ||
                    "Dòng len sợi cao cấp, se tròn mềm mại, không gây ngứa hay kích ứng da. Màu sắc pastel ngọt ngào, độ bền cao, thích hợp đan móc cả thú bông và phụ kiện quà tặng."}
                </p>

                {/* BỘ CHỌN MÀU SẮC LEN */}
                <div className="detail-color-selector">
                  <div className="color-selector-label">
                    <span>Màu sắc đang chọn:</span> <b>{selectedColor}</b>
                  </div>
                  <div className="color-swatches-list">
                    {YARN_COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        className={`color-swatch-btn ${selectedColor === c.name ? "active" : ""}`}
                        style={{ backgroundColor: c.hex, borderColor: c.border }}
                        title={c.name}
                        onClick={() => setSelectedColor(c.name)}
                      >
                        {selectedColor === c.name && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="detail-rule" />

                <div className="detail-delivery-perks">
                  <p className="stock-label">
                    <span className="pulsing-dot" /> Còn {selectedProduct.stock} sản phẩm sẵn có trong kho
                  </p>
                  <p className="delivery-note">
                    🚚 Giao hàng toàn quốc · Miễn phí ship cho đơn từ 300.000đ
                  </p>
                  <p className="gift-bonus-note">
                    🎁 Tặng kèm: 1 bộ chart móc len PDF độc quyền + video hướng dẫn
                  </p>
                </div>

                <div className="detail-actions">
                  <div className="quantity">
                    <button
                      type="button"
                      aria-label="Giảm số lượng"
                      onClick={() =>
                        setDetailQuantity(Math.max(detailQuantity - 1, 1))
                      }
                    >
                      −
                    </button>
                    <span>{detailQuantity}</span>
                    <button
                      type="button"
                      aria-label="Tăng số lượng"
                      onClick={() =>
                        setDetailQuantity(
                          Math.min(detailQuantity + 1, selectedProduct.stock),
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="banner-button secondary add-cart-large"
                    type="button"
                    onClick={() => {
                      addToCart(selectedProduct, detailQuantity);
                      closeProductDetail();
                    }}
                  >
                    Thêm vào giỏ hàng <span>🛒</span>
                  </button>
                </div>

                <button
                  className="buy-now"
                  type="button"
                  onClick={() => buyNow(selectedProduct, detailQuantity)}
                >
                  Mua ngay ({selectedColor}) • {formatPrice(selectedProduct.price * detailQuantity)} <span>→</span>
                </button>
              </div>
            </article>

            
            {/* GỢI Ý DỤNG CỤ MUA KÈM KHI XEM CHI TIẾT */}
            <div className="detail-cross-sell-section">
              <div className="detail-cross-sell-title">
                <span className="cross-sell-sparkle">✨</span>
                <strong>Gợi ý dụng cụ đan móc mua kèm tiết kiệm:</strong>
              </div>
              <div className="detail-cross-sell-grid">
                {CRAFT_ADDONS.slice(0, 3).map((addon) => (
                  <div key={addon.id} className="detail-addon-pill">
                    <span className="addon-icon">{addon.icon}</span>
                    <div className="addon-text">
                      <b>{addon.name}</b>
                      <small>{formatPrice(addon.price)} <del>{formatPrice(addon.originalPrice)}</del></small>
                    </div>
                    <button
                      type="button"
                      className="addon-quick-btn"
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
                      + Thêm
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* TAB CHI TIẾT THÔNG SỐ & HƯỚNG DẪN */}
            <section className="detail-tabs-section">
              <div className="detail-tabs-nav">
                <button
                  type="button"
                  className={`detail-tab-btn ${detailTab === "specs" ? "active" : ""}`}
                  onClick={() => setDetailTab("specs")}
                >
                  🧶 Đặc tính sợi & Thông số
                </button>
                <button
                  type="button"
                  className={`detail-tab-btn ${detailTab === "guide" ? "active" : ""}`}
                  onClick={() => setDetailTab("guide")}
                >
                  🪡 Hướng dẫn móc & Video QR
                </button>
                <button
                  type="button"
                  className={`detail-tab-btn ${detailTab === "policy" ? "active" : ""}`}
                  onClick={() => setDetailTab("policy")}
                >
                  🛡 Chính sách đổi trả 7 ngày
                </button>
                <button
                  type="button"
                  className={`detail-tab-btn ${detailTab === "reviews" ? "active" : ""}`}
                  onClick={() => setDetailTab("reviews")}
                >
                  ⭐ Đánh giá khách hàng (128)
                </button>
              </div>

              <div className="detail-tab-pane">
                {detailTab === "specs" && (
                  <div className="detail-specs-content">
                    <h3>Thông số kỹ thuật & Đặc tính dòng sợi</h3>
                    <div className="detail-specs-grid">
                      <div className="spec-card">
                        <span>Chất liệu sợi</span>
                        <strong>{selectedProduct.brand || "Cotton Milk cao cấp"}</strong>
                      </div>
                      <div className="spec-card">
                        <span>Kim móc khuyên dùng</span>
                        <strong>2.5mm - 3.5mm (êm tay)</strong>
                      </div>
                      <div className="spec-card">
                        <span>Kim đan khuyên dùng</span>
                        <strong>3.0mm - 4.5mm</strong>
                      </div>
                      <div className="spec-card">
                        <span>Trọng lượng cuộn</span>
                        <strong>50g ± 3g / cuộn</strong>
                      </div>
                      <div className="spec-card">
                        <span>Chiều dài sợi</span>
                        <strong>Khoảng 130 mét / cuộn</strong>
                      </div>
                      <div className="spec-card">
                        <span>Độ bền màu</span>
                        <strong>Cấp độ 4 (không phai khi giặt)</strong>
                      </div>
                    </div>
                    <div className="detail-desc-box">
                      <h4>Cam kết chất lượng từ Sene Handmade</h4>
                      <p>
                        Sản phẩm được dệt từ nguồn sợi bông chọn lọc, se tròn đều đặn giúp hạn chế tối đa việc sợi bị bung tách khi kéo kim. Len không đổ lông xơ xù, mềm mại ôm ấp làn da, an toàn tuyệt đối cho người lớn lẫn các bé nhỏ tuổi.
                      </p>
                    </div>
                  </div>
                )}

                {detailTab === "guide" && (
                  <div className="detail-guide-content">
                    <h3>Hướng dẫn sử dụng & Khởi đầu đan móc</h3>
                    <div className="guide-steps-grid">
                      <div className="step-box">
                        <span className="step-badge">Bước 1</span>
                        <h4>Quét mã QR trên tem len</h4>
                        <p>Dùng điện thoại quét mã QR dán trên cuộn len để xem video cận cảnh từng bước móc từ thợ lành nghề.</p>
                      </div>
                      <div className="step-box">
                        <span className="step-badge">Bước 2</span>
                        <h4>Lấy sợi len từ tim trong</h4>
                        <p>Rút sợi từ tâm giữa ruột cuộn len ra để khi đan móc cuộn len đứng yên, không bị lăn tròn rơi xuống sàn.</p>
                      </div>
                      <div className="step-box">
                        <span className="step-badge">Bước 3</span>
                        <h4>Tham gia nhóm hỗ trợ</h4>
                        <p>Nhắn tin Zalo 0942.901.124 bất cứ lúc nào nếu bạn gặp khó khăn ở các bước tăng giảm mũi móc.</p>
                      </div>
                    </div>
                  </div>
                )}

                {detailTab === "policy" && (
                  <div className="detail-policy-content">
                    <h3>Chính sách chăm sóc & Đổi trả an tâm</h3>
                    <ul className="policy-list">
                      <li>
                        <strong>✓ Đổi trả miễn phí trong 7 ngày:</strong> Nếu sản phẩm bị lỗi do sợi đứt đoạn, lem màu hoặc thiếu phụ kiện, Tiệm đổi mới 100% không mất phí vận chuyển.
                      </li>
                      <li>
                        <strong>✓ Đổi màu sắc nếu chưa vừa ý:</strong> Khách được hỗ trợ đổi màu len khác trong vòng 7 ngày nếu cuộn len chưa qua sử dụng và còn nguyên tem mác.
                      </li>
                      <li>
                        <strong>✓ Đồng kiểm trước khi nhận hàng:</strong> Khách hàng được quyền bóc hộp kiểm tra màu len và số lượng trước khi gửi tiền cho nhân viên giao hàng.
                      </li>
                    </ul>
                  </div>
                )}

                {detailTab === "reviews" && (
                  <div className="detail-reviews-content">
                    <h3>Đánh giá từ các bạn thợ móc len</h3>
                    <div className="mini-reviews-list">
                      <div className="mini-review">
                        <div className="mini-review-top">
                          <strong>Thu Thảo (TP.HCM)</strong>
                          <span className="review-stars">★★★★★</span>
                        </div>
                        <p>"Len mềm mướt tay cực kỳ, móc thú bông lên phom rất căng tròn mà không hề bị lộ gòn. Đã mua lần thứ 4 của Tiệm rồi!"</p>
                      </div>
                      <div className="mini-review">
                        <div className="mini-review-top">
                          <strong>Ngọc Hân (Đà Nẵng)</strong>
                          <span className="review-stars">★★★★★</span>
                        </div>
                        <p>"Đóng gói hộp siêu cẩn thận kèm thiệp viết tay xinh xỉu. Bộ kit tự móc hoa tulip có video hướng dẫn cực kỳ dễ hiểu cho người mới."</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

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

            {/* SHOPEE-STYLE STATUS STEPPER */}
            <div className="order-stepper-wrap">
              <p className="stepper-title">🚚 TIẾN ĐỘ VẬN CHUYỂN & GIAO HÀNG</p>
              <div className="order-stepper">
                {(() => {
                  const statusMap = {
                    pending: 1,
                    confirmed: 2,
                    shipping: 4,
                    delivered: 5,
                    cancelled: 0,
                  };
                  const currentStep = statusMap[selectedOrder.status] ?? 1;
                  const steps = [
                    { step: 1, icon: "📝", label: "Đã đặt đơn", desc: "Hệ thống tiếp nhận" },
                    { step: 2, icon: "🏪", label: "Shop xác nhận", desc: "Chuẩn bị kiện len" },
                    { step: 3, icon: "🎁", label: "Đóng gói xong", desc: "Bàn giao bưu cục" },
                    { step: 4, icon: "🚚", label: "Đang giao hàng", desc: "Bưu tá đang phát" },
                    { step: 5, icon: "🎉", label: "Giao thành công", desc: "Đã nhận hàng" },
                  ];

                  if (selectedOrder.status === "cancelled") {
                    return (
                      <div className="order-cancelled-banner">
                        <span>❌ Đơn hàng này đã bị hủy</span>
                      </div>
                    );
                  }

                  return (
                    <div className="stepper-track">
                      {steps.map((s, idx) => {
                        const isDone = currentStep >= s.step;
                        const isCurrent = currentStep === s.step;
                        return (
                          <div
                            key={s.step}
                            className={`stepper-node ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}
                          >
                            <div className="node-icon-circle">
                              {isDone && !isCurrent ? "✓" : s.icon}
                            </div>
                            <b className="node-label">{s.label}</b>
                            <small className="node-desc">{s.desc}</small>
                            {idx < steps.length - 1 && (
                              <div
                                className={`node-connector ${currentStep > s.step ? "done" : ""}`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
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
                      confirmed: "🔵 Shop đã duyệt",
                      shipping: "🚚 Đang giao hàng",
                      delivered: "🟢 Giao thành công",
                      cancelled: "❌ Đã hủy",
                    }[selectedOrder.status] || selectedOrder.status}
                  </span>
                </div>
              </div>
            </div>

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

      
      {/* FLOATING QUICK CONTACT & ACTION BAR */}
      <div className="floating-actions">
        <a
          href="https://zalo.me/0942901124"
          target="_blank"
          rel="noreferrer"
          className="floating-btn floating-zalo pulse-glow"
          title="Chat Zalo tư vấn chọn len trực tiếp với Sene Handmade (0942.901.124)"
        >
          <span className="floating-zalo-logo">Zalo</span>
          <span className="floating-btn-text">Chat Zalo</span>
        </a>

        <a
          href="tel:0942901124"
          className="floating-btn floating-hotline"
          title="Gọi Hotline đặt hàng nhanh: 0942.901.124"
        >
          <span className="floating-hotline-icon">📞</span>
          <span className="floating-btn-text">Hotline: 0942.901.124</span>
        </a>

        <button
          type="button"
          className="floating-btn floating-custom-order"
          onClick={() => {
            setCustomOrderSuccess(null);
            setCustomOrderModalOpen(true);
          }}
          title="Gửi yêu cầu móc thú bông, hoa len, túi xách theo ý bạn"
        >
          <span>🧶</span>
          <span className="floating-btn-text">Đặt Móc Riêng</span>
        </button>

        <button
          type="button"
          className="floating-btn floating-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          title="Lên đầu trang"
        >
          ↑
        </button>
      </div>

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
