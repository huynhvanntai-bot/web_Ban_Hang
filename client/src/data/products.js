/**
 * Sene Handmade - Centralized Product Data Architecture & Taxonomies
 * Nơi quản lý dữ liệu sản phẩm, danh mục, cấu trúc phân cấp và bộ lọc tập trung
 */

export const CATEGORIES = [
  {
    id: "c-len-soi",
    name: "Len sợi",
    slug: "len-soi",
    icon: "🧶",
    banner: "/images/banners/banner-len-soi.jpg",
    description: "Các dòng len sợi chất lượng cao: Len Milk Cotton 50g mềm mịn không tưa sợi, len nhung đũa êm mượt bồng bềnh, len baby yarn không gây ngứa ráp cho làn da nhạy cảm.",
    subcategories: [
      { id: "sub-milk-cotton", name: "Len Milk Cotton", slug: "milk-cotton" },
      { id: "sub-len-nhung", name: "Len nhung đũa", slug: "len-nhung" },
      { id: "sub-len-pastel", name: "Len pastel ngọt ngào", slug: "len-pastel" },
      { id: "sub-len-cotton", name: "Len cotton chải kỹ", slug: "len-cotton" },
      { id: "sub-soi-det", name: "Sợi dệt móc túi xách", slug: "soi-det" },
    ],
  },
  {
    id: "c-kim-moc",
    name: "Kim móc & dụng cụ",
    slug: "kim-moc-dung-cu",
    icon: "🪡",
    banner: "/images/banners/banner-kim-moc-dung-cu.jpg",
    description: "Bộ kim móc cán dẻo công thái học chống mỏi tay, kéo cắt chỉ vintage mạ vàng sắc bén, kim khâu len và bông gòn bi đàn hồi cao cấp nhồi thú chuẩn phom.",
    subcategories: [
      { id: "sub-kim-moc-can-deo", name: "Kim móc cán dẻo", slug: "kim-moc" },
      { id: "sub-keo-cat-chi", name: "Kéo cắt chỉ vintage", slug: "keo" },
      { id: "sub-kim-khau-len", name: "Kim khâu len & ghim định vị", slug: "kim-khau-len" },
      { id: "sub-dung-cu-danh-dau", name: "Dụng cụ đánh dấu mũi móc", slug: "dung-cu-danh-dau" },
      { id: "sub-phu-kien-dan-moc", name: "Bông gòn bi & phụ kiện", slug: "phu-kien-dan-moc" },
    ],
  },
  {
    id: "c-set-diy",
    name: "Set DIY",
    slug: "set-diy",
    icon: "🎁",
    banner: "/images/banners/banner-set-diy.jpg",
    description: "Trọn bộ Kit tự làm cho người mới: Đầy đủ cuộn len, kim móc, phụ kiện và thẻ quét mã QR xem video hướng dẫn cầm tay chỉ việc từng mũi từ A đến Z.",
    subcategories: [
      { id: "sub-diy-thu-len", name: "Set DIY thú len", slug: "set-diy-thu-len" },
      { id: "sub-diy-hoa", name: "Set DIY hoa len", slug: "set-diy-hoa" },
      { id: "sub-diy-moc-khoa", name: "Set DIY móc khóa", slug: "set-diy-moc-khoa" },
      { id: "sub-diy-nguoi-moi", name: "Set DIY cho người mới", slug: "set-diy-cho-nguoi-moi" },
      { id: "sub-diy-kem-video", name: "Set DIY kèm video hướng dẫn", slug: "set-diy-co-video" },
    ],
  },
  {
    id: "c-hoa-len",
    name: "Hoa len",
    slug: "hoa-len",
    icon: "🌸",
    banner: "/images/banners/banner-hoa-len.jpg",
    description: "Bó hoa tulip len pastel, hoa hồng nhung đỏ thắm, hoa hướng dương đan móc thủ công tinh tế, giữ màu sắc tươi tắn mãi mãi làm quà tặng ý nghĩa.",
    subcategories: [
      { id: "sub-hoa-hong", name: "Hoa hồng len", slug: "hoa-hong" },
      { id: "sub-hoa-tulip", name: "Hoa tulip pastel", slug: "hoa-tulip" },
      { id: "sub-bo-hoa-len", name: "Bó hoa len phối sẵn", slug: "bo-hoa-len" },
      { id: "sub-hoa-mini", name: "Hoa len mini để bàn", slug: "hoa-len-mini" },
      { id: "sub-hoa-theo-mau", name: "Hộp quà hoa len tiểu cảnh", slug: "hoa-len-theo-mau" },
    ],
  },
  {
    id: "c-thu-len",
    name: "Thú len handmade",
    slug: "thu-len-handmade",
    icon: "🐰",
    banner: "/images/banners/banner-thu-len-handmade.jpg",
    description: "Thú bông Amigurumi đan tay tỉ mỉ bằng len nhung đũa bồng bềnh: bé thỏ váy hồng, heo mũi hồng, hươu cao cổ đốm nâu, lạc đà Alpaca, gà con mông đào.",
    subcategories: [
      { id: "sub-tho-len", name: "Thỏ len nhung", slug: "tho-len" },
      { id: "sub-gau-len", name: "Gấu & heo bông len", slug: "gau-len" },
      { id: "sub-meo-len", name: "Chuột & mèo len", slug: "meo-len" },
      { id: "sub-alpaca-llama", name: "Alpaca & Llama cổ cao", slug: "alpaca-llama" },
      { id: "sub-thu-theo-mau", name: "Cặp đôi thú len & Gà mông đào", slug: "thu-len-theo-mau" },
    ],
  },
  {
    id: "c-phu-kien",
    name: "Phụ kiện handmade",
    slug: "phu-kien-handmade",
    icon: "🎀",
    banner: "/images/banners/banner-phu-kien-handmade.jpg",
    description: "Túi xách dệt canvas đứng dáng vintage, móc khóa len handmade xinh xắn, charm lục lạc chuông đỏ và phụ kiện trang trí thời trang.",
    subcategories: [
      { id: "sub-mat-mui-thu", name: "Mắt mũi thú an toàn", slug: "mat-mui-thu" },
      { id: "sub-moc-khoa-pk", name: "Móc khóa len", slug: "moc-khoa" },
      { id: "sub-tui-len-pk", name: "Túi len sợi dệt", slug: "tui-len" },
      { id: "sub-charm-pk", name: "Charm & chuông lục lạc", slug: "charm" },
      { id: "sub-trang-tri-pk", name: "Phụ kiện trang trí", slug: "phu-kien-trang-tri" },
    ],
  },
  {
    id: "c-combo",
    name: "Combo nguyên liệu",
    slug: "combo-nguyen-lieu",
    icon: "📦",
    banner: "/images/banners/banner-combo-nguyen-lieu.jpg",
    description: "Combo trọn gói theo món dự án: Mua trọn bộ len + cỡ kim khuyên dùng, tối ưu chi phí và không lo thiếu sợi giữa chừng.",
    subcategories: [
      { id: "sub-combo-nguoi-moi", name: "Combo tập móc cho người mới", slug: "combo-nguoi-moi" },
      { id: "sub-combo-10-hoa", name: "Combo 10 đóa hoa vĩnh cửu", slug: "combo-10-hoa" },
      { id: "sub-combo-len-kim", name: "Combo len + kim móc", slug: "combo-len-kim" },
      { id: "sub-combo-len-pk", name: "Combo len + phụ kiện", slug: "combo-len-phu-kien" },
      { id: "sub-combo-theo-mau", name: "Combo theo món dự án", slug: "combo-theo-mau" },
    ],
  },
  {
    id: "c-ban-chay",
    name: "Sản phẩm bán chạy",
    slug: "san-pham-ban-chay",
    icon: "🔥",
    banner: "/images/banners/banner-san-pham-ban-chay.jpg",
    description: "Top các dòng len bán chạy, kit tự làm và mẫu thú bông được khách hàng đánh giá cao nhất tại Sene Handmade.",
    subcategories: [],
  },
  {
    id: "c-san-pham-moi",
    name: "Sản phẩm mới",
    slug: "san-pham-moi",
    icon: "✨",
    banner: "/images/banners/banner-san-pham-moi.jpg",
    description: "Những màu len pastel mới về, dòng sợi chải kỹ cao cấp và các mẫu thú bông đan tay sáng tạo mới nhất.",
    subcategories: [],
  },
  {
    id: "c-khuyen-mai",
    name: "Khuyến mãi",
    slug: "khuyen-mai",
    icon: "🏷️",
    banner: "/images/banners/banner-khuyen-mai.jpg",
    description: "Ưu đãi trợ giá đặc biệt: Deal chớp nhoáng giảm 20%-35%, voucher quà tặng trừ tiền trực tiếp trên giỏ hàng.",
    subcategories: [],
  },
];

export const PRODUCTS = [
  // 1. Len Milk Cotton 50g
  {
    id: "len-milk-cotton-50g",
    name: "Len Milk Cotton 50g Siêu Mềm Mịn (Bảng Màu 80+ Mã Pastel)",
    slug: "len-milk-cotton-50g-sieu-mem-min",
    price: 18000,
    oldPrice: 22000,
    costPrice: 8000,
    category: { id: "c-len-soi", name: "Len sợi", slug: "len-soi" },
    subCategory: "milk-cotton",
    brand: "Sene Yarn",
    featured: true,
    isNew: false,
    isSale: true,
    stock: 500,
    soldCount: 1420,
    rating: 4.95,
    reviewCount: 312,
    images: [
      "/images/products/len-soi/len-milk-cotton-50g-01.jpg",
      "/images/products/len-soi/len-milk-cotton-50g-02.jpg",
      "/images/products/len-soi/len-milk-cotton-50g-03.jpg",
    ],
    videos: [],
    videoPoster: "",
    colors: [
      { name: "Hồng Phấn Pastel", hex: "#fbcfe8", inStock: true },
      { name: "Trắng Sữa", hex: "#ffffff", inStock: true },
      { name: "Xanh Bơ", hex: "#d9f99d", inStock: true },
      { name: "Vàng Bơ Nhạt", hex: "#fef08a", inStock: true },
      { name: "Xanh Dương Baby", hex: "#bae6fd", inStock: true },
      { name: "Tím Mộng Mơ", hex: "#e9d5ff", inStock: true },
    ],
    specs: {
      material: "80% Cotton chải kỹ, 20% Milk Acrylic",
      weight: "50g / cuộn (±2g)",
      needleSize: "Kim móc 2.5mm - 3.0mm; Kim đan 3.0mm - 4.0mm",
      difficulty: "Dễ móc (Dành cho người mới bắt đầu)",
      origin: "Công nghệ Đài Loan - Đóng gói tại Việt Nam",
      hasVideo: false,
    },
    tags: ["len sợi", "len milk cotton", "len hồng", "len pastel", "milk cotton 50g", "len bán lẻ", "móc thú", "móc hoa"],
    description: "Len Milk Cotton 50g là dòng len 'quốc dân' chuẩn chỉnh nhất dành cho các bạn mới bước chân vào thế giới đan móc thủ công. Sợi len se chặt không bị tưa tách mũi khi luồn kim, chất sợi mềm mịn êm dịu không xù lông và cực kỳ dễ đếm chân mũi.",
    usageGuide: "Dùng kim móc 2.5mm đối với thú bông để mũi len khít không lộ gòn; Dùng kim 3.0mm đối với hoa len hoặc khăn choàng để phom bồng bềnh mềm mại. Giặt tay nhẹ nhàng trong nước mát dưới 30°C.",
  },

  // 2. Len Nhung Đũa 100g
  {
    id: "len-nhung-dua-100g",
    name: "Len Nhung Đũa Cỡ Đại 100g Siêu Bồng Bềnh Mềm Mượt",
    slug: "len-nhung-dua-co-dai-100g",
    price: 35000,
    oldPrice: 42000,
    costPrice: 16000,
    category: { id: "c-len-soi", name: "Len sợi", slug: "len-soi" },
    subCategory: "len-nhung",
    brand: "Sene Yarn",
    featured: true,
    isNew: false,
    isSale: true,
    stock: 350,
    soldCount: 890,
    rating: 4.9,
    reviewCount: 178,
    images: [
      "/images/products/len-soi/len-nhung-dua-co-dai-100g-01.jpg",
      "/images/products/len-soi/len-nhung-dua-co-dai-100g-02.jpg",
      "/images/products/len-soi/len-nhung-dua-co-dai-100g-03.jpg",
    ],
    videos: ["/images/products/thu-len-handmade/be-tho-len-nhung-dua-co-dai-video.mp4"],
    videoPoster: "/images/products/thu-len-handmade/be-tho-len-nhung-dua-co-dai-video-thumb.jpg",
    colors: [
      { name: "Hồng Nhung Pastel", hex: "#f472b6", inStock: true },
      { name: "Trắng Tuyết", hex: "#ffffff", inStock: true },
      { name: "Xanh Bơ Bạc", hex: "#a7f3d0", inStock: true },
      { name: "Vàng Hạt Dẻ", hex: "#fde047", inStock: true },
      { name: "Nâu Đốm", hex: "#a16207", inStock: true },
    ],
    specs: {
      material: "100% Microfiber Chenille Polyester",
      weight: "100g / cuộn (±3g)",
      needleSize: "Kim móc 4.5mm - 6.0mm",
      difficulty: "Dễ (Hoàn thành sản phẩm cực nhanh)",
      origin: "Nhập khẩu chọn lọc",
      hasVideo: true,
    },
    tags: ["len nhung", "len đũa", "len nhung đũa", "len sợi to", "móc thú khổng lồ", "len hồng nhung"],
    description: "Len nhung đũa sợi lớn đường kính 6-8mm mềm mịn như bông tuyết. Sợi len êm ru mướt tay, khi móc tạo cảm giác bồng bềnh đàn hồi, tốc độ móc cực nhanh: chỉ mất 1-2 tiếng là bạn có thể tự tay làm xong một bé thú bông béo múp.",
    usageGuide: "Khuyên dùng kim móc 5.0mm cho thú nhồi bông để ôm vừa tay. Giặt máy với túi giặt hoặc giặt tay, phơi khô trên mặt phẳng bóng râm để giữ độ xốp mịn tự nhiên.",
  },

  // 3. Len Baby Yarn 40g
  {
    id: "len-baby-yarn-40g",
    name: "Len Baby Yarn 40g Chải Kỹ Không Kích Ứng Da Cho Bé",
    slug: "len-baby-yarn-40g-chai-ky",
    price: 24000,
    oldPrice: 28000,
    costPrice: 11000,
    category: { id: "c-len-soi", name: "Len sợi", slug: "len-soi" },
    subCategory: "len-cotton",
    brand: "Baby Yarn",
    featured: false,
    isNew: true,
    isSale: false,
    stock: 220,
    soldCount: 340,
    rating: 4.88,
    reviewCount: 65,
    images: [
      "/images/products/len-soi/len-baby-yarn-40g-01.jpg",
      "/images/products/len-soi/len-baby-yarn-40g-02.jpg",
    ],
    videos: [],
    videoPoster: "",
    colors: [
      { name: "Hồng Baby", hex: "#fed7aa", inStock: true },
      { name: "Xanh Lơ", hex: "#e0e7ff", inStock: true },
      { name: "Kem Vani", hex: "#fef9c3", inStock: true },
    ],
    specs: {
      material: "60% Cotton chải mượt, 40% Acrylic sợi mịn",
      weight: "40g / cuộn",
      needleSize: "Kim móc 2.0mm - 2.5mm",
      difficulty: "Trung bình",
      origin: "Chính hãng Baby Yarn",
      hasVideo: false,
    },
    tags: ["len baby", "len cho bé", "baby yarn", "len không dị ứng", "móc giày len", "len cotton"],
    description: "Sợi len cao cấp chuyên dụng cho trẻ sơ sinh và làn da nhạy cảm. Sợi mảnh 1.5mm chải mịn kỹ lưỡng, không rụng bụi lông, màu sắc pastel nhẹ nhàng trong trẻo.",
    usageGuide: "Thích hợp móc mũ sơ sinh, giày len, yếm ăn và lục lạc cầm tay cho trẻ nhỏ.",
  },

  // 4. Sợi Dệt Trơn 2mm Móc Túi
  {
    id: "soi-det-tron-2mm",
    name: "Sợi Dệt Trơn 2mm Móc Túi Xách & Mũ Bucket Đứng Phom",
    slug: "soi-det-tron-2mm-moc-tui-xach",
    price: 32000,
    oldPrice: 38000,
    costPrice: 15000,
    category: { id: "c-len-soi", name: "Len sợi", slug: "len-soi" },
    subCategory: "soi-det",
    brand: "Sene Yarn",
    featured: false,
    isNew: false,
    isSale: false,
    stock: 180,
    soldCount: 420,
    rating: 4.85,
    reviewCount: 92,
    images: [
      "/images/products/len-soi/soi-det-tron-2mm-01.jpg",
      "/images/products/len-soi/soi-det-tron-2mm-02.jpg",
    ],
    videos: [],
    videoPoster: "",
    colors: [
      { name: "Be Cát Vintage", hex: "#f3e8dc", inStock: true },
      { name: "Nâu Cà Phê", hex: "#78350f", inStock: true },
      { name: "Đen Tuyền", hex: "#1f2937", inStock: true },
    ],
    specs: {
      material: "Polyester dệt trơn bản dẹt 2mm",
      weight: "100g / cuộn",
      needleSize: "Kim móc 2.5mm - 3.5mm",
      difficulty: "Trung bình",
      origin: "Việt Nam",
      hasVideo: false,
    },
    tags: ["sợi dệt", "móc túi xách", "mũ bucket", "sợi bản dẹt", "túi canvas"],
    description: "Sợi dệt trơn bản dẹt 2mm bóng nhẹ, độ chịu lực cao và không bai dão khi đựng đồ nặng. Giúp túi xách và nón bucket lên dáng đứng phom tuyệt đối.",
    usageGuide: "Dùng kim móc 3.0mm để mũi móc chắc chắn. Vệ sinh bằng khăn ẩm hoặc giặt tay nhẹ.",
  },

  // 5. Bộ Kim Móc Cán Dẻo Silicone SKC 8 Cỡ
  {
    id: "bo-kim-moc-can-deo-skc",
    name: "Bộ Kim Móc Cán Dẻo Công Thái Học Cao Cấp SKC 8 Cỡ (2.5mm - 6.0mm)",
    slug: "bo-kim-moc-can-deo-cong-thai-hoc-8-co",
    price: 85000,
    oldPrice: 110000,
    costPrice: 40000,
    category: { id: "c-kim-moc", name: "Kim móc & dụng cụ", slug: "kim-moc-dung-cu" },
    subCategory: "kim-moc",
    brand: "SKC Tools",
    featured: true,
    isNew: false,
    isSale: true,
    stock: 120,
    soldCount: 810,
    rating: 4.96,
    reviewCount: 204,
    images: [
      "/images/products/kim-moc-dung-cu/bo-kim-moc-can-deo-skc-01.jpg",
      "/images/products/kim-moc-dung-cu/bo-kim-moc-can-deo-skc-02.jpg",
    ],
    videos: [],
    videoPoster: "",
    colors: [],
    specs: {
      material: "Đầu kim nhôm mạ tĩnh điện nhẵn bóng, Cán silicon mềm",
      sizes: "8 cỡ: 2.5mm, 3.0mm, 3.5mm, 4.0mm, 4.5mm, 5.0mm, 5.5mm, 6.0mm",
      needleSize: "2.5mm - 6.0mm",
      difficulty: "Phù hợp mọi trình độ",
      origin: "SKC Chính Hãng",
      hasVideo: false,
    },
    tags: ["kim móc", "dụng cụ đan móc", "kim cán dẻo", "kim móc skc", "kim móc silicon"],
    description: "Bộ kim móc cán dẻo SKC cao cấp thiết kế tay cầm công thái học lượn sóng, nâng đỡ đốt ngón tay giúp bạn móc liên tục hàng giờ liền mà không bị chai hay mỏi khớp. Đầu kim phủ bóng chống rít len tuyệt đối.",
    usageGuide: "Vệ sinh bằng khăn mềm, tránh để đầu kim tiếp xúc vật sắc nhọn gây trầy xước.",
  },

  // 6. Bông Gòn Bi 200g
  {
    id: "bong-gon-bi-200g",
    name: "Túi Bông Gòn Bi Trắng Tinh 200g Nhồi Thú Bông & Gối Len",
    slug: "tui-bong-gon-bi-trang-tinh-200g",
    price: 22000,
    oldPrice: 28000,
    costPrice: 9000,
    category: { id: "c-kim-moc", name: "Kim móc & dụng cụ", slug: "kim-moc-dung-cu" },
    subCategory: "phu-kien-dan-moc",
    brand: "Sene Tools",
    featured: false,
    isNew: false,
    isSale: false,
    stock: 250,
    soldCount: 650,
    rating: 4.9,
    reviewCount: 110,
    images: [
      "/images/products/kim-moc-dung-cu/tui-bong-gon-bi-200g-01.jpg",
    ],
    videos: [],
    videoPoster: "",
    colors: [],
    specs: {
      material: "100% Polyester nguyên sinh dạng hạt bi",
      weight: "200g / túi hút chân không",
      needleSize: "Không áp dụng",
      origin: "Việt Nam",
      hasVideo: false,
    },
    tags: ["gòn bi", "bông nhồi thú", "gòn nhồi thú bông", "bông polyester"],
    description: "Gòn hạt loại 1 tròn xoe đàn hồi siêu tốt, không lẫn tạp chất, trắng tinh và không vón cục. Khi nhồi vào thú bông giúp phom dáng căng tròn êm ái, giặt nước phơi khô không lo xẹp lún.",
    usageGuide: "Xé tơi từng nhúm nhỏ trước khi nhồi để gòn phân bổ đều vào từng chi tiết tai, chân thú.",
  },

  // 7. Kéo Cắt Chỉ Vintage Mạ Vàng
  {
    id: "keo-cat-chi-vintage",
    name: "Kéo Cắt Chỉ Cổ Điển Vintage Chim Hạc Mạ Vàng",
    slug: "keo-cat-chi-co-dien-vintage-ma-vang",
    price: 49000,
    oldPrice: 65000,
    costPrice: 20000,
    category: { id: "c-kim-moc", name: "Kim móc & dụng cụ", slug: "kim-moc-dung-cu" },
    subCategory: "keo",
    brand: "Vintage Craft",
    featured: false,
    isNew: false,
    isSale: true,
    stock: 50,
    soldCount: 310,
    rating: 4.92,
    reviewCount: 75,
    images: [
      "/images/products/kim-moc-dung-cu/keo-cat-chi-vintage-ma-vang-01.jpg",
    ],
    videos: [],
    videoPoster: "",
    colors: [],
    specs: {
      material: "Thép không gỉ mạ titan ánh kim",
      dimensions: "Chiều dài 11.5cm, lưỡi kéo 3.5cm",
      origin: "Đài Loan",
      hasVideo: false,
    },
    tags: ["kéo cắt chỉ", "kéo vintage", "kéo chim hạc", "dụng cụ đan móc"],
    description: "Kéo bấm cắt chỉ điêu khắc họa tiết chim hạc tinh xảo phong cách Châu Âu cổ điển. Lưỡi kéo thép tôi cao tần sắc bén, cắt ngọt sợi len thừa chỉ bằng một nhát bấm nhẹ.",
    usageGuide: "Chuyên dùng cắt chỉ, len sợi; tránh dùng cắt vật cứng như kẽm cành để giữ độ bén.",
  },

  // 8. Combo Nhập Môn Tự Học Móc Len Trọn Gói
  {
    id: "combo-nhap-mon-tu-hoc-moc-len",
    name: "Combo Nhập Môn Tự Học Móc Len Trọn Gói Cho Người Mới A-Z",
    slug: "combo-nhap-mon-tu-hoc-moc-len-tron-goi",
    price: 135000,
    oldPrice: 185000,
    costPrice: 65000,
    category: { id: "c-set-diy", name: "Set DIY", slug: "set-diy" },
    subCategory: "set-diy-nguoi-moi",
    brand: "Sene DIY Kit",
    featured: true,
    isNew: false,
    isSale: true,
    stock: 85,
    soldCount: 940,
    rating: 4.98,
    reviewCount: 289,
    images: [
      "/images/products/set-diy/combo-nhap-mon-tu-hoc-moc-len-01.jpg",
      "/images/products/set-diy/combo-nhap-mon-tu-hoc-moc-len-02.jpg",
    ],
    videos: [],
    videoPoster: "",
    colors: [
      { name: "Set Tone Hồng Ngọt Ngào", hex: "#fbcfe8", inStock: true },
      { name: "Set Tone Xanh Bơ Pastel", hex: "#d9f99d", inStock: true },
    ],
    specs: {
      material: "4 cuộn len Milk Cotton 50g + Bộ dụng cụ đầy đủ",
      needleSize: "Kèm sẵn 2 kim móc 2.5mm & 3.0mm",
      difficulty: "Người mới bắt đầu (100% tự học thành công)",
      hasVideo: true,
      origin: "Set quà đóng gói tại Sene Handmade",
    },
    tags: ["combo móc len", "set diy", "kit tự học móc len", "tự học móc len", "combo người mới"],
    description: "Bộ combo trọn gói giải pháp đầy đủ nhất cho bạn chưa từng cầm kim móc: Gồm 4 cuộn len Milk Cotton pastel tự chọn + 2 kim móc cán dẻo SKC + 10 kẹp định vị + 2 kim khâu len + 1 kéo bấm chỉ + Thẻ QR quét video khóa học móc cơ bản từng mũi từ số 0.",
    usageGuide: "Quét mã QR trên thẻ bảo hành đính kèm để mở ngay danh sách video hướng dẫn HD.",
  },

  // 9. Set Kit Tự Móc Bó Hoa Tulip 5 Cành
  {
    id: "set-kit-hoa-tulip-5-canh",
    name: "Set Kit Tự Móc Bó Hoa Tulip Pastel 5 Cành Vĩnh Cửu Kèm Giấy Gói",
    slug: "set-kit-tu-moc-bo-hoa-tulip-5-canh",
    price: 69000,
    oldPrice: 89000,
    costPrice: 32000,
    category: { id: "c-set-diy", name: "Set DIY", slug: "set-diy" },
    subCategory: "set-diy-hoa",
    brand: "Sene DIY Kit",
    featured: true,
    isNew: false,
    isSale: true,
    stock: 95,
    soldCount: 560,
    rating: 4.93,
    reviewCount: 140,
    images: [
      "/images/products/set-diy/set-kit-tu-moc-bo-hoa-tulip-5-canh-01.jpg",
      "/images/products/set-diy/set-kit-tu-moc-bo-hoa-tulip-5-canh-02.jpg",
    ],
    videos: ["/images/products/hoa-len/bo-hoa-hong-len-mini-pastel-video.mp4"],
    videoPoster: "/images/products/hoa-len/bo-hoa-hong-len-mini-pastel-video-thumb.jpg",
    colors: [
      { name: "Tone Hồng Kem", hex: "#fce7f3", inStock: true },
      { name: "Tone Tím Pastel", hex: "#ede9fe", inStock: true },
      { name: "Tone Vàng Nắng", hex: "#fef08a", inStock: true },
    ],
    specs: {
      material: "Len Milk Cotton, kẽm cành bọc nhựa, kẽm nẹp lá",
      difficulty: "Dễ (2 giờ hoàn thành)",
      hasVideo: true,
      origin: "Sene Handmade",
    },
    tags: ["set kit hoa tulip", "tự móc hoa len", "hoa tulip vĩnh cửu", "kit hoa len"],
    description: "Bộ kit tự làm bó hoa tulip 5 cành ngọt ngào: Đầy đủ len màu hoa và màu lá, kẽm cành, lá hoa, ruy băng ren thắt nơ, giấy gói cao cấp và video quay chậm từng cánh hoa.",
    usageGuide: "Xem video quét mã QR, uốn kẽm nẹp theo mép lá để cành hoa đứng thẳng đứng phom đẹp.",
  },

  // 10. Kit Tự Móc Bé Thỏ Len Nhung
  {
    id: "kit-tu-moc-be-tho-len-nhung",
    name: "Kit Tự Móc Bé Thỏ Len Nhung Đũa Kèm Video Hướng Dẫn Từng Mũi",
    slug: "kit-tu-moc-be-tho-len-nhung-kem-video",
    price: 169000,
    oldPrice: 210000,
    costPrice: 75000,
    category: { id: "c-set-diy", name: "Set DIY", slug: "set-diy" },
    subCategory: "set-diy-thu-len",
    brand: "Sene DIY Kit",
    featured: true,
    isNew: false,
    isSale: true,
    stock: 40,
    soldCount: 380,
    rating: 4.95,
    reviewCount: 96,
    images: [
      "/images/products/set-diy/kit-tu-moc-be-tho-len-nhung-01.jpg",
      "/images/products/set-diy/kit-tu-moc-be-tho-len-nhung-02.jpg",
    ],
    videos: ["/images/products/set-diy/kit-tu-moc-be-tho-len-nhung-video.mp4"],
    videoPoster: "/images/products/set-diy/kit-tu-moc-be-tho-len-nhung-video-thumb.jpg",
    colors: [
      { name: "Thỏ Váy Hồng", hex: "#f472b6", inStock: true },
    ],
    specs: {
      material: "Len nhung đũa sợi to bồng bềnh, gòn bi đàn hồi, mắt thú chốt an toàn",
      difficulty: "Trung bình (Có video cầm tay chỉ việc)",
      hasVideo: true,
      origin: "Sene Handmade",
    },
    tags: ["kit móc thỏ", "set diy thú len", "kit tự móc thú bông", "thỏ len nhung"],
    description: "Bộ kit tự hoàn thiện bé thỏ bông len nhung cỡ đại: 2 cuộn len nhung đũa trắng + hồng, kim móc 4.5mm cán dẻo, bông gòn hạt cao cấp, mắt thú chốt an toàn, kim khâu và mã QR xem video kèm cặp.",
    usageGuide: "Đếm đúng số lượng mũi đơn (X) và mũi tăng (V) theo hướng dẫn trên video để bé thỏ tròn trĩnh đều tay.",
  },

  // 11. Bé Thỏ Len Nhung Đũa Cỡ Đại Váy Hồng (Thú len handmade)
  {
    id: "be-tho-len-nhung-dua-co-dai",
    name: "Bé Thỏ Len Nhung Đũa Cỡ Đại Váy Hồng Pastel",
    slug: "be-tho-len-nhung-dua-co-dai-vay-hong",
    price: 285000,
    oldPrice: 330000,
    costPrice: 130000,
    category: { id: "c-thu-len", name: "Thú len handmade", slug: "thu-len-handmade" },
    subCategory: "tho-len",
    brand: "Sene Handmade",
    featured: true,
    isNew: false,
    isSale: false,
    stock: 25,
    soldCount: 420,
    rating: 5.0,
    reviewCount: 185,
    images: [
      "/images/products/thu-len-handmade/be-tho-len-nhung-dua-co-dai-01.jpg",
      "/images/products/thu-len-handmade/be-tho-len-nhung-dua-co-dai-02.jpg",
      "/images/products/thu-len-handmade/be-tho-len-nhung-dua-co-dai-03.jpg",
      "/images/products/thu-len-handmade/be-tho-len-nhung-dua-co-dai-04.jpg",
    ],
    videos: ["/images/products/thu-len-handmade/be-tho-len-nhung-dua-co-dai-video.mp4"],
    videoPoster: "/images/products/thu-len-handmade/be-tho-len-nhung-dua-co-dai-video-thumb.jpg",
    colors: [
      { name: "Váy Hồng Pastel", hex: "#f472b6", inStock: true },
    ],
    specs: {
      material: "Len nhung đũa loại 1, Gòn bi nguyên sinh đàn hồi",
      dimensions: "Chiều cao 38cm (tính cả tai thỏ)",
      weight: "350g",
      origin: "Đan móc thủ công tại Cần Thơ, Việt Nam",
      hasVideo: true,
    },
    tags: ["thú len", "thỏ len nhung", "thú len handmade", "quà tặng sinh nhật", "thỏ hồng"],
    description: "Bé thỏ bông đan móc thủ công tỉ mỉ bằng len nhung đũa sợi lớn siêu mềm mịn bồng bềnh, mặc váy xòe tiểu thư phối ren hồng đậm, đầu đội mũ len chụp tai phong cách vintage ấm áp. Sản phẩm hoàn thiện cầm đầm tay, ôm ngủ siêu thích.",
    usageGuide: "Giặt tay nhẹ với dầu gội em bé, bóp ráo nước nhẹ nhàng và phơi khô trên mặt phẳng bóng râm.",
  },

  // 12. Bé Heo Bông Len Mũi Hồng Váy Xanh Bơ
  {
    id: "be-heo-bong-len-mui-hong",
    name: "Bé Heo Bông Len Mũi Hồng Váy Xanh Bơ Cài Nơ",
    slug: "be-heo-bong-len-mui-hong-vay-xanh-bo",
    price: 165000,
    oldPrice: 195000,
    costPrice: 75000,
    category: { id: "c-thu-len", name: "Thú len handmade", slug: "thu-len-handmade" },
    subCategory: "gau-len",
    brand: "Sene Handmade",
    featured: true,
    isNew: false,
    isSale: true,
    stock: 30,
    soldCount: 280,
    rating: 4.95,
    reviewCount: 88,
    images: [
      "/images/products/thu-len-handmade/be-heo-bong-len-mui-hong-01.jpg",
      "/images/products/thu-len-handmade/be-heo-bong-len-mui-hong-02.jpg",
      "/images/products/thu-len-handmade/be-heo-bong-len-mui-hong-03.jpg",
    ],
    videos: ["/images/products/thu-len-handmade/be-heo-bong-len-mui-hong-video.mp4"],
    videoPoster: "/images/products/thu-len-handmade/be-heo-bong-len-mui-hong-video-thumb.jpg",
    colors: [
      { name: "Váy Xanh Bơ", hex: "#d9f99d", inStock: true },
    ],
    specs: {
      material: "Len nhung tuyết mịn mượt, mũi nút hồng chúm chím",
      dimensions: "Chiều cao 22cm, bụng béo 18cm",
      weight: "200g",
      origin: "Đan móc thủ công tại Sene Handmade",
      hasVideo: true,
    },
    tags: ["heo bông len", "thú len", "heo mũi hồng", "heo váy xanh", "quà tặng bạn gái"],
    description: "Bé heo con móc tay bằng len nhung tuyết trắng muốt, mũi nút hồng chúm chím cực yêu, diện váy yếm màu xanh bơ dịu mát và cài nơ mầm cây xinh xắn, hai tay giang rộng đòi ôm.",
    usageGuide: "Vệ sinh nhẹ nhàng bằng khăn ẩm hoặc giặt tay với sữa tắm em bé.",
  },

  // 13. Bé Chuột Con Xám Len Nhung Mũi Hồng Váy Vàng
  {
    id: "be-chuot-con-xam-len-nhung",
    name: "Bé Chuột Con Xám Len Nhung Mũi Hồng Váy Vàng",
    slug: "be-chuot-con-xam-len-nhung-vay-vang",
    price: 165000,
    oldPrice: 190000,
    costPrice: 75000,
    category: { id: "c-thu-len", name: "Thú len handmade", slug: "thu-len-handmade" },
    subCategory: "meo-len",
    brand: "Sene Handmade",
    featured: false,
    isNew: false,
    isSale: false,
    stock: 28,
    soldCount: 190,
    rating: 4.9,
    reviewCount: 52,
    images: [
      "/images/products/thu-len-handmade/be-chuot-con-xam-len-nhung-01.jpg",
      "/images/products/thu-len-handmade/be-chuot-con-xam-len-nhung-02.jpg",
      "/images/products/thu-len-handmade/be-chuot-con-xam-len-nhung-03.jpg",
      "/images/products/thu-len-handmade/be-chuot-con-xam-len-nhung-04.jpg",
    ],
    videos: ["/images/products/thu-len-handmade/be-chuot-con-xam-len-nhung-video.mp4"],
    videoPoster: "/images/products/thu-len-handmade/be-chuot-con-xam-len-nhung-video-thumb.jpg",
    colors: [
      { name: "Váy Vàng Cúc", hex: "#fde047", inStock: true },
    ],
    specs: {
      material: "Len nhung xám khói phối tai hồng, len vàng hoa cúc",
      dimensions: "Chiều cao 24cm",
      weight: "210g",
      origin: "Sene Handmade",
      hasVideo: true,
    },
    tags: ["chuột len", "chuột nhung", "thú len handmade", "quà lưu niệm"],
    description: "Bé chuột xám đáng yêu với đôi tai tròn lót hồng xinh xắn, mũi hồng và râu thêu tay tinh xảo, mặc váy xòe màu vàng hoa cúc nổi bật, sợi len êm mềm không gây ngứa ráp.",
    usageGuide: "Để nơi khô ráo, tránh ẩm mốc để bé chuột luôn sạch đẹp thơm tho.",
  },

  // 14. Chú Hươu Cao Cổ Len Nhung Vàng Đốm Nâu
  {
    id: "huou-cao-co-len-nhung",
    name: "Chú Hươu Cao Cổ Len Nhung Vàng Đốm Nâu Cổ Dài",
    slug: "huou-cao-co-len-nhung-vang-dom-nau",
    price: 195000,
    oldPrice: 235000,
    costPrice: 90000,
    category: { id: "c-thu-len", name: "Thú len handmade", slug: "thu-len-handmade" },
    subCategory: "alpaca-huou",
    brand: "Sene Handmade",
    featured: true,
    isNew: false,
    isSale: false,
    stock: 20,
    soldCount: 310,
    rating: 4.95,
    reviewCount: 95,
    images: [
      "/images/products/thu-len-handmade/huou-cao-co-len-nhung-01.jpg",
      "/images/products/thu-len-handmade/huou-cao-co-len-nhung-02.jpg",
      "/images/products/thu-len-handmade/huou-cao-co-len-nhung-03.jpg",
      "/images/products/thu-len-handmade/huou-cao-co-len-nhung-04.jpg",
      "/images/products/thu-len-handmade/huou-cao-co-len-nhung-05.jpg",
      "/images/products/thu-len-handmade/huou-cao-co-len-nhung-06.jpg",
      "/images/products/thu-len-handmade/huou-cao-co-len-nhung-07.jpg",
    ],
    videos: ["/images/products/thu-len-handmade/huou-cao-co-len-nhung-video.mp4"],
    videoPoster: "/images/products/thu-len-handmade/huou-cao-co-len-nhung-video-thumb.jpg",
    colors: [
      { name: "Vàng Hươu Đốm Nâu", hex: "#eab308", inStock: true },
    ],
    specs: {
      material: "Len nhung vàng óng phối đốm nâu thủ công",
      dimensions: "Chiều cao 32cm (cổ cao đứng dáng)",
      weight: "260g",
      origin: "Sene Handmade",
      hasVideo: true,
    },
    tags: ["hươu cao cổ", "hươu len nhung", "thú len", "đồ chơi an toàn cho bé"],
    description: "Chú hươu cao cổ đan móc bằng len nhung vàng ấm áp, mõm trắng tròn xoe, có sừng nhỏ và các đốm nâu thủ công tỉ mỉ trên lưng và chân, cổ dài đứng dáng siêu ngộ nghĩnh.",
    usageGuide: "Phom đứng chắc chắn, thích hợp đặt trang trí bàn học hoặc kệ đầu giường.",
  },

  // 15. Lạc Đà Llama Alpaca Xanh Bơ
  {
    id: "lac-da-alpaca-len-nhung",
    name: "Lạc Đà Llama Alpaca Len Nhung Xanh Bơ Cổ Cao Kiêu Hãnh",
    slug: "lac-da-alpaca-len-nhung-xanh-bo",
    price: 185000,
    oldPrice: 220000,
    costPrice: 85000,
    category: { id: "c-thu-len", name: "Thú len handmade", slug: "thu-len-handmade" },
    subCategory: "alpaca-huou",
    brand: "Sene Handmade",
    featured: true,
    isNew: false,
    isSale: false,
    stock: 22,
    soldCount: 260,
    rating: 4.96,
    reviewCount: 78,
    images: [
      "/images/products/thu-len-handmade/lac-da-alpaca-len-nhung-01.jpg",
      "/images/products/thu-len-handmade/lac-da-alpaca-len-nhung-02.jpg",
      "/images/products/thu-len-handmade/lac-da-alpaca-len-nhung-03.jpg",
      "/images/products/thu-len-handmade/lac-da-alpaca-len-nhung-04.jpg",
    ],
    videos: ["/images/products/thu-len-handmade/lac-da-alpaca-len-nhung-video.mp4"],
    videoPoster: "/images/products/thu-len-handmade/lac-da-alpaca-len-nhung-video-thumb.jpg",
    colors: [
      { name: "Xanh Bơ Pastel", hex: "#a7f3d0", inStock: true },
    ],
    specs: {
      material: "Len nhung tuyết xanh bơ phối móng len trắng",
      dimensions: "Chiều cao 28cm",
      weight: "240g",
      origin: "Sene Handmade",
      hasVideo: true,
    },
    tags: ["alpaca len", "llama len nhung", "thú len", "lạc đà len"],
    description: "Lạc đà không bướu Alpaca dáng chibi cổ cao kiêu hãnh, sắc len nhung xanh bơ pastel độc lạ, 4 chân phối móng len trắng và tai vểnh tinh nghịch, đặt bàn làm việc hay quà tặng đều siêu xinh.",
    usageGuide: "Hạn chế vặn xoắn cổ, vuốt nhẹ lông xuôi theo chiều đan móc.",
  },

  // 16. Cặp Đôi Ngựa Bông Len Bờm Xoăn Mini
  {
    id: "cap-doi-ngua-bong-len",
    name: "Cặp Đôi Ngựa Bông Len Bờm Xoăn Mini Tình Bạn Tình Yêu",
    slug: "cap-doi-ngua-bong-len-bom-xoan-mini",
    price: 245000,
    oldPrice: 290000,
    costPrice: 110000,
    category: { id: "c-thu-len", name: "Thú len handmade", slug: "thu-len-handmade" },
    subCategory: "thu-len-theo-mau",
    brand: "Sene Handmade",
    featured: true,
    isNew: false,
    isSale: true,
    stock: 18,
    soldCount: 210,
    rating: 4.97,
    reviewCount: 64,
    images: [
      "/images/products/thu-len-handmade/cap-doi-ngua-bong-len-01.jpg",
      "/images/products/thu-len-handmade/cap-doi-ngua-bong-len-02.jpg",
      "/images/products/thu-len-handmade/cap-doi-ngua-bong-len-03.jpg",
      "/images/products/thu-len-handmade/cap-doi-ngua-bong-len-04.jpg",
      "/images/products/thu-len-handmade/cap-doi-ngua-bong-len-05.jpg",
      "/images/products/thu-len-handmade/cap-doi-ngua-bong-len-06.jpg",
      "/images/products/thu-len-handmade/cap-doi-ngua-bong-len-07.jpg",
      "/images/products/thu-len-handmade/cap-doi-ngua-bong-len-08.jpg",
      "/images/products/thu-len-handmade/cap-doi-ngua-bong-len-09.jpg",
    ],
    videos: ["/images/products/thu-len-handmade/cap-doi-ngua-bong-len-video.mp4"],
    videoPoster: "/images/products/thu-len-handmade/cap-doi-ngua-bong-len-video-thumb.jpg",
    colors: [
      { name: "Cặp Đôi Hồng & Nâu", hex: "#fbcfe8", inStock: true },
    ],
    specs: {
      material: "Set 2 bé ngựa len: Bé Ngựa Nâu bờm xoăn & Bé Ngựa Hồng đeo chuông",
      dimensions: "Chiều cao 18cm / bé",
      weight: "280g / cặp",
      origin: "Sene Handmade",
      hasVideo: true,
    },
    tags: ["cặp đôi ngựa bông", "thú len cặp đôi", "quà tặng tình nhân", "quà kỷ niệm"],
    description: "Set quà cặp đôi gồm Bé Ngựa Nâu hạt dẻ bờm xoăn đậm và Bé Ngựa Hồng pastel bờm tím hồng đeo lục lạc chuông đỏ leng keng, biểu tượng tình bạn và tình yêu gắn kết ấm áp.",
    usageGuide: "Đóng hộp quà kèm thiệp và ruy băng thắt nơ miễn phí.",
  },

  // 17. Bé Gà Con Len Hồng Mông Đào
  {
    id: "be-ga-con-hong-mong-dao",
    name: "Bé Gà Con Len Hồng Mông Đào Đội Mũ Trứng Ốp La",
    slug: "be-ga-con-hong-mong-dao-doi-mu-trung-op-la",
    price: 155000,
    oldPrice: 180000,
    costPrice: 70000,
    category: { id: "c-thu-len", name: "Thú len handmade", slug: "thu-len-handmade" },
    subCategory: "thu-len-theo-mau",
    brand: "Sene Handmade",
    featured: true,
    isNew: true,
    isSale: false,
    stock: 35,
    soldCount: 450,
    rating: 4.98,
    reviewCount: 135,
    images: [
      "/images/products/thu-len-handmade/be-ga-con-hong-mong-dao-01.jpg",
      "/images/products/thu-len-handmade/be-ga-con-hong-mong-dao-02.jpg",
      "/images/products/thu-len-handmade/be-ga-con-hong-mong-dao-03.jpg",
    ],
    videos: ["/images/products/thu-len-handmade/be-ga-con-hong-mong-dao-video.mp4"],
    videoPoster: "/images/products/thu-len-handmade/be-ga-con-hong-mong-dao-video-thumb.jpg",
    colors: [
      { name: "Hồng Mông Đào", hex: "#fda4af", inStock: true },
    ],
    specs: {
      material: "Len nhung mềm mịn, mông đào độn bông xả stress",
      dimensions: "Chiều cao 17cm",
      weight: "160g",
      origin: "Sene Handmade",
      hasVideo: true,
    },
    tags: ["gà mông đào", "gà con len", "thú len xả stress", "mũ trứng ốp la"],
    description: "Bé gà con tròn xoe màu hồng phấn, trên đầu đội chiếc mũ trứng ốp la lòng đào hài hước, phía sau là bờ mông đào cong vút ửng hồng phấn cực kỳ dễ thương và xả stress khi bóp nhẹ.",
    usageGuide: "Bóp nhẹ mông đào xả stress thoải mái không lo biến dạng bông.",
  },

  // 18. Hộp Quà Tiểu Cảnh Vịt Vàng
  {
    id: "hop-qua-tieu-canh-vit-vang",
    name: "Hộp Quà Tiểu Cảnh Bé Vịt Vàng Đội Mũ Ếch & Bó Hoa Cẩm Tú Cầu",
    slug: "hop-qua-tieu-canh-vit-vang-doi-mu-ech",
    price: 220000,
    oldPrice: 260000,
    costPrice: 105000,
    category: { id: "c-hoa-len", name: "Hoa len", slug: "hoa-len" },
    subCategory: "hoa-len-theo-mau",
    brand: "Sene Handmade",
    featured: true,
    isNew: false,
    isSale: false,
    stock: 15,
    soldCount: 180,
    rating: 5.0,
    reviewCount: 72,
    images: [
      "/images/products/hoa-len/hop-qua-tieu-canh-vit-vang-01.jpg",
      "/images/products/hoa-len/hop-qua-tieu-canh-vit-vang-02.jpg",
      "/images/products/hoa-len/hop-qua-tieu-canh-vit-vang-03.jpg",
      "/images/products/hoa-len/hop-qua-tieu-canh-vit-vang-04.jpg",
      "/images/products/hoa-len/hop-qua-tieu-canh-vit-vang-05.jpg",
      "/images/products/hoa-len/hop-qua-tieu-canh-vit-vang-06.jpg",
      "/images/products/hoa-len/hop-qua-tieu-canh-vit-vang-07.jpg",
    ],
    videos: [],
    videoPoster: "",
    colors: [
      { name: "Vịt Vàng Mũ Ếch Xanh", hex: "#fde047", inStock: true },
    ],
    specs: {
      material: "Hộp mica trong suốt, vịt len, hoa cẩm tú cầu, suối đá ngũ sắc",
      dimensions: "Hộp vuông 18cm x 18cm x 22cm",
      origin: "Sene Handmade Studio",
      hasVideo: false,
    },
    tags: ["tiểu cảnh len", "hộp quà mica", "vịt vàng mũ ếch", "hoa cẩm tú cầu len"],
    description: "Hộp quà tiểu cảnh mica trong suốt cao cấp gồm: Chú Vịt Vàng mini đội mũ chú ếch xanh ngộ nghĩnh, bó hoa len cẩm tú cầu xanh búp trắng, suối đá pha lê ngũ sắc, nấm đỏ và bé thỏ mini trên thảm rêu xanh thiên nhiên.",
    usageGuide: "Trưng bày bàn làm việc hoặc làm quà sinh nhật, tặng lễ tốt nghiệp sang trọng.",
  },

  // 19. Bó Hoa Hồng Len Mini Pastel Phối Viền Ren Trắng
  {
    id: "bo-hoa-hong-len-mini",
    name: "Bó Hoa Hồng Len Mini Pastel Phối Viền Ren Trắng Tinh Tế",
    slug: "bo-hoa-hong-len-mini-pastel-kem-ren",
    price: 145000,
    oldPrice: 175000,
    costPrice: 65000,
    category: { id: "c-hoa-len", name: "Hoa len", slug: "hoa-len" },
    subCategory: "hoa-hong",
    brand: "Sene Handmade",
    featured: true,
    isNew: false,
    isSale: true,
    stock: 26,
    soldCount: 390,
    rating: 4.96,
    reviewCount: 112,
    images: [
      "/images/products/hoa-len/bo-hoa-hong-len-mini-pastel-01.jpg",
      "/images/products/hoa-len/bo-hoa-hong-len-mini-pastel-02.jpg",
      "/images/products/hoa-len/bo-hoa-hong-len-mini-pastel-03.jpg",
    ],
    videos: ["/images/products/hoa-len/bo-hoa-hong-len-mini-pastel-video.mp4"],
    videoPoster: "/images/products/hoa-len/bo-hoa-hong-len-mini-pastel-video-thumb.jpg",
    colors: [
      { name: "Hồng Nhung & Đỏ Pastel", hex: "#f43f5e", inStock: true },
    ],
    specs: {
      material: "Len Milk Cotton, ren bèo trắng Hàn Quốc, giấy gói cao cấp",
      dimensions: "Chiều dài 30cm, đường kính bó hoa 20cm",
      origin: "Sene Handmade",
      hasVideo: true,
    },
    tags: ["bó hoa hồng len", "hoa len vĩnh cửu", "quà 8/3", "quà 20/10", "hoa hồng pastel"],
    description: "Bó hoa hồng đan tay nhỏ xinh gồm các đóa hồng nhung đỏ thắm và hồng pastel ngọt ngào, gói giấy bọc len xanh coban / tím mộng mơ phối ren bèo trắng tinh tế, món quà ý nghĩa giữ màu tươi tắn mãi mãi.",
    usageGuide: "Bảo quản nơi khô ráo, tránh ánh nắng gắt chiếu trực tiếp trong thời gian dài.",
  },

  // 20. Bó 5 Cành Hoa Tulip Len Tone Hồng Pastel
  {
    id: "bo-5-canh-hoa-tulip",
    name: "Bó 5 Cành Hoa Tulip Len Tone Hồng Pastel Tinh Khôi",
    slug: "bo-5-canh-hoa-tulip-len-tone-hong-pastel",
    price: 175000,
    oldPrice: 210000,
    costPrice: 80000,
    category: { id: "c-hoa-len", name: "Hoa len", slug: "hoa-len" },
    subCategory: "hoa-tulip",
    brand: "Sene Handmade",
    featured: false,
    isNew: true,
    isSale: false,
    stock: 20,
    soldCount: 220,
    rating: 4.92,
    reviewCount: 68,
    images: [
      "/images/products/hoa-len/bo-5-canh-hoa-tulip-len-01.jpg",
    ],
    videos: [],
    videoPoster: "",
    colors: [
      { name: "Hồng Phấn Tulip", hex: "#fbcfe8", inStock: true },
    ],
    specs: {
      material: "Len Milk Cotton pastel, cành kẽm nẹp chắc chắn",
      dimensions: "Chiều dài bó hoa 35cm",
      origin: "Sene Handmade",
      hasVideo: false,
    },
    tags: ["hoa tulip len", "bó tulip pastel", "hoa len", "quà tốt nghiệp"],
    description: "Bó hoa tulip len dáng chuẩn cánh hoa cúp nhẹ tự nhiên, sắc hồng pastel thanh lịch phối cùng lá xanh mát mắt làm quà tặng ngày lễ, tốt nghiệp và sinh nhật.",
    usageGuide: "Có thể tháo giấy gói để cắm vào bình hoa thủy tinh trang trí bàn phòng khách.",
  },

  // 21. Bó Hoa Hướng Dương Len Vĩnh Cửu
  {
    id: "bo-hoa-huong-duong-len",
    name: "Bó Hoa Hướng Dương Len Vĩnh Cửu Năng Lượng Tươi Sáng",
    slug: "bo-hoa-huong-duong-len-vinh-cuu",
    price: 220000,
    oldPrice: 250000,
    costPrice: 100000,
    category: { id: "c-hoa-len", name: "Hoa len", slug: "hoa-len" },
    subCategory: "bo-hoa-len",
    brand: "Sene Handmade",
    featured: false,
    isNew: false,
    isSale: false,
    stock: 18,
    soldCount: 160,
    rating: 4.9,
    reviewCount: 45,
    images: [
      "/images/products/hoa-len/bo-hoa-huong-duong-len-vinh-cuu-01.jpg",
    ],
    videos: [],
    videoPoster: "",
    colors: [
      { name: "Vàng Hướng Dương", hex: "#eab308", inStock: true },
    ],
    specs: {
      material: "Len Milk Cotton, hoa cúc họa mi điểm xuyết, giấy gói kraft",
      dimensions: "Chiều dài 40cm, bông hoa 12cm",
      origin: "Sene Handmade",
      hasVideo: false,
    },
    tags: ["hoa hướng dương len", "bó hoa tốt nghiệp", "hoa len vĩnh cửu"],
    description: "Bó hoa hướng dương đan móc thủ công tỉ mỉ từng cánh hoa vàng óng, nhụy hoa nâu hạt dẻ phối hoa cúc họa mi trắng và cành khuynh diệp sang trọng, thông điệp hướng về tương lai rực rỡ.",
    usageGuide: "Thích hợp làm quà tặng lễ tốt nghiệp, khai trương hay chúc mừng thăng chức.",
  },

  // 22. Túi Tote Len Sợi Dệt
  {
    id: "tui-tote-len-soi-det",
    name: "Túi Tote Len Sợi Dệt Họa Tiết Hoa Cúc Phong Cách Vintage",
    slug: "tui-tote-len-soi-det-hoa-tiet-hoa-cuc",
    price: 260000,
    oldPrice: 310000,
    costPrice: 120000,
    category: { id: "c-phu-kien", name: "Phụ kiện handmade", slug: "phu-kien" },
    subCategory: "tui-len",
    brand: "Sene Handmade",
    featured: false,
    isNew: true,
    isSale: false,
    stock: 14,
    soldCount: 110,
    rating: 4.88,
    reviewCount: 36,
    images: [
      "/images/products/phu-kien-handmade/tui-tote-len-soi-det-hoa-cuc-01.jpg",
    ],
    videos: [],
    videoPoster: "",
    colors: [
      { name: "Be Ô Vuông Hoa Cúc", hex: "#f3e8dc", inStock: true },
    ],
    specs: {
      material: "Sợi dệt 2mm bền chắc, quai xách may nẹp chịu lực 5kg",
      dimensions: "Ngang 32cm x Cao 36cm",
      origin: "Sene Handmade",
      hasVideo: false,
    },
    tags: ["túi len", "túi tote", "túi hoa cúc", "phụ kiện len handmade", "túi dệt"],
    description: "Túi xách tay đan móc từ sợi dệt chắc nịch, phối họa tiết ô vuông hoa cúc phong cách vintage Hàn Quốc. Đựng vừa sổ tay A4, iPad, điện thoại và mỹ phẩm tiện lợi khi đi chơi, dạo phố.",
    usageGuide: "Giặt tay nhẹ với xà phòng pha loãng, phơi phẳng để giữ phom dáng túi.",
  },

  // 23. Combo 5 Cuộn Len Milk Cotton 50g + Bộ Kim SKC
  {
    id: "combo-len-milk-cotton-skc",
    name: "Combo 5 Cuộn Len Milk Cotton 50g + Kim Móc SKC Cán Dẻo Tặng Kèm Bộ Kẹp Định Vị",
    slug: "combo-len-milk-cotton-skc-dinh-vi",
    price: 119000,
    oldPrice: 145000,
    costPrice: 58000,
    category: { id: "c-combo", name: "Combo nguyên liệu", slug: "combo-nguyen-lieu" },
    subCategory: "combo-nguoi-moi",
    brand: "Sene Handmade",
    featured: true,
    isNew: false,
    isSale: true,
    stock: 65,
    soldCount: 520,
    rating: 4.96,
    reviewCount: 142,
    images: [
      "/images/products/combo-nguyen-lieu/combo-len-milk-cotton-skc-01.jpg",
      "/images/products/combo-nguyen-lieu/combo-len-milk-cotton-skc-02.jpg",
    ],
    videos: [],
    videoPoster: "",
    colors: [
      { name: "Tone Pastel Ngọt Ngào", hex: "#fbcfe8", inStock: true },
      { name: "Tone Trà Sữa Vintage", hex: "#e2d1c3", inStock: true },
    ],
    specs: {
      material: "5 cuộn len Milk Cotton 50g + 1 kim móc SKC 2.5mm + 10 kẹp định vị + 2 kim khâu len",
      origin: "Sene Handmade",
      hasVideo: true,
    },
    tags: ["combo nguyên liệu", "combo tập móc", "combo len skc", "len milk cotton", "tiết kiệm"],
    description: "Bộ combo nguyên liệu tối ưu cho người mới bắt đầu đan móc: Gồm 5 cuộn len Milk Cotton 50g phối màu cực xinh, 1 kim móc cán dẻo SKC êm tay, kèm phụ kiện kẹp định vị và kim khâu nhựa an toàn.",
    usageGuide: "Thích hợp móc thú mini, móc hoa tulip, đan khăn và mũ len đơn giản.",
  },

  // 24. Combo 10 Đóa Hoa Len Vĩnh Cửu Tự Ráp
  {
    id: "combo-10-doa-hoa-len-vinh-cuu",
    name: "Combo 10 Đóa Hoa Len Vĩnh Cửu Tự Ráp Kèm Giấy Gói & Ruy Băng Vintage",
    slug: "combo-10-doa-hoa-len-vinh-cuu-tu-rap",
    price: 235000,
    oldPrice: 280000,
    costPrice: 110000,
    category: { id: "c-combo", name: "Combo nguyên liệu", slug: "combo-nguyen-lieu" },
    subCategory: "combo-10-hoa",
    brand: "Sene Handmade",
    featured: true,
    isNew: true,
    isSale: false,
    stock: 45,
    soldCount: 310,
    rating: 4.94,
    reviewCount: 78,
    images: [
      "/images/products/combo-nguyen-lieu/combo-10-doa-hoa-len-vinh-cuu-01.jpg",
      "/images/products/combo-nguyen-lieu/combo-10-doa-hoa-len-vinh-cuu-02.jpg",
    ],
    videos: [],
    videoPoster: "",
    colors: [
      { name: "Tone Hồng Tulip & Trắng", hex: "#f472b6", inStock: true },
      { name: "Tone Hướng Dương Rực Rỡ", hex: "#eab308", inStock: true },
    ],
    specs: {
      material: "10 đóa hoa len thành phẩm + cành kẽm + giấy gói Hàn Quốc + ruy băng nơ",
      origin: "Sene Handmade",
      hasVideo: false,
    },
    tags: ["combo hoa len", "hoa len vĩnh cửu", "quà tặng", "bó hoa tự ráp"],
    description: "Combo 10 cành hoa len móc sẵn để bạn tự tay bó thành bó hoa nghệ thuật theo ý thích. Tặng kèm giấy gói cao cấp phong cách Hàn Quốc và thiệp chúc mừng vintage.",
    usageGuide: "Phối xen kẽ các cành hoa, dùng băng dính cố định phần cuống rồi quấn giấy gói bên ngoài.",
  },
];

/**
 * Cấu hình các bộ lọc đặc thù theo từng danh mục sản phẩm (Category-Specific Filters)
 */
export const CATEGORY_FILTER_CONFIGS = {
  "len-soi": [
    {
      key: "subCategory",
      label: "Loại len sợi",
      options: [
        { label: "Tất cả", value: "all" },
        { label: "Len Milk Cotton", value: "milk-cotton" },
        { label: "Len nhung đũa", value: "len-nhung" },
        { label: "Len pastel dịu mắt", value: "len-pastel" },
        { label: "Len cotton chải kỹ", value: "len-cotton" },
        { label: "Sợi dệt móc túi", value: "soi-det" },
      ],
    },
    {
      key: "weight",
      label: "Khối lượng cuộn",
      options: [
        { label: "Tất cả", value: "all" },
        { label: "40g / cuộn", value: "40g" },
        { label: "50g / cuộn", value: "50g" },
        { label: "100g / cuộn", value: "100g" },
      ],
    },
    {
      key: "price",
      label: "Mức giá",
      options: [
        { label: "Tất cả", value: "all" },
        { label: "Dưới 25.000đ", value: "<25k" },
        { label: "25.000đ - 50.000đ", value: "25k-50k" },
        { label: "Trên 50.000đ", value: ">50k" },
      ],
    },
  ],
  "kim-moc-dung-cu": [
    {
      key: "subCategory",
      label: "Loại dụng cụ",
      options: [
        { label: "Tất cả", value: "all" },
        { label: "Kim móc cán dẻo", value: "kim-moc" },
        { label: "Kéo cắt chỉ vintage", value: "keo" },
        { label: "Kim khâu len & ghim", value: "kim-khau-len" },
        { label: "Bông gòn bi nhồi thú", value: "phu-kien-dan-moc" },
      ],
    },
    {
      key: "price",
      label: "Mức giá",
      options: [
        { label: "Tất cả", value: "all" },
        { label: "Dưới 50.000đ", value: "<50k" },
        { label: "50.000đ - 100.000đ", value: "50k-100k" },
        { label: "Trên 100.000đ", value: ">100k" },
      ],
    },
  ],
  "set-diy": [
    {
      key: "subCategory",
      label: "Chủ đề Kit",
      options: [
        { label: "Tất cả", value: "all" },
        { label: "Set DIY thú len", value: "set-diy-thu-len" },
        { label: "Set DIY hoa len", value: "set-diy-hoa" },
        { label: "Set DIY cho người mới", value: "set-diy-cho-nguoi-moi" },
      ],
    },
    {
      key: "hasVideo",
      label: "Video hướng dẫn",
      options: [
        { label: "Tất cả", value: "all" },
        { label: "Có video hướng dẫn chi tiết", value: "yes" },
      ],
    },
    {
      key: "price",
      label: "Mức giá",
      options: [
        { label: "Tất cả", value: "all" },
        { label: "Dưới 100.000đ", value: "<100k" },
        { label: "100.000đ - 150.000đ", value: "100k-150k" },
        { label: "Trên 150.000đ", value: ">150k" },
      ],
    },
  ],
  "thu-len-handmade": [
    {
      key: "subCategory",
      label: "Loại con vật",
      options: [
        { label: "Tất cả", value: "all" },
        { label: "Bé thỏ len nhung", value: "tho-len" },
        { label: "Gấu & Heo bông", value: "gau-len" },
        { label: "Chuột & Mèo len", value: "meo-len" },
        { label: "Hươu & Alpaca", value: "alpaca-huou" },
        { label: "Cặp đôi & Gà mông đào", value: "thu-len-theo-mau" },
      ],
    },
    {
      key: "price",
      label: "Mức giá",
      options: [
        { label: "Tất cả", value: "all" },
        { label: "Dưới 180.000đ", value: "<180k" },
        { label: "180.000đ - 250.000đ", value: "180k-250k" },
        { label: "Trên 250.000đ", value: ">250k" },
      ],
    },
  ],
  "hoa-len": [
    {
      key: "subCategory",
      label: "Loại hoa",
      options: [
        { label: "Tất cả", value: "all" },
        { label: "Hoa hồng len", value: "hoa-hong" },
        { label: "Hoa tulip pastel", value: "hoa-tulip" },
        { label: "Bó hoa phối sẵn", value: "bo-hoa-len" },
        { label: "Tiểu cảnh mica", value: "hoa-len-theo-mau" },
      ],
    },
    {
      key: "price",
      label: "Mức giá",
      options: [
        { label: "Tất cả", value: "all" },
        { label: "Dưới 150.000đ", value: "<150k" },
        { label: "150.000đ - 200.000đ", value: "150k-200k" },
        { label: "Trên 200.000đ", value: ">200k" },
      ],
    },
  ],
};

// Category Slug Aliases Map
const SLUG_ALIASES = {
  "phu-kien": "phu-kien-handmade",
  "phu-kien-handmade": "phu-kien-handmade",
  "ban-chay": "san-pham-ban-chay",
  "san-pham-ban-chay": "san-pham-ban-chay",
  "combo": "combo-nguyen-lieu",
  "combo-nguyen-lieu": "combo-nguyen-lieu",
  "thu-len": "thu-len-handmade",
  "thu-len-handmade": "thu-len-handmade",
  "kim-moc": "kim-moc-dung-cu",
  "kim-moc-dung-cu": "kim-moc-dung-cu",
  "len-soi": "len-soi",
  "set-diy": "set-diy",
  "hoa-len": "hoa-len",
  "san-pham-moi": "san-pham-moi",
  "khuyen-mai": "khuyen-mai",
};

// Helper Functions
export function getProductBySlug(slug) {
  if (!slug) return null;
  return PRODUCTS.find((p) => p.slug === slug || p.id === slug) || null;
}

export function getCategoryBySlug(slug) {
  if (!slug) return null;
  const clean = String(slug).toLowerCase().trim();
  const canonical = SLUG_ALIASES[clean] || clean;
  return (
    CATEGORIES.find((c) => c.slug === canonical || c.slug === clean) ||
    CATEGORIES.find((c) => c.id === clean || c.id === `c-${clean}`) ||
    null
  );
}

export function getProductsByCategory(categorySlug, filters = {}, sortBy = "default") {
  let list = PRODUCTS.slice();
  const clean = String(categorySlug || "").toLowerCase().trim();
  const canonical = SLUG_ALIASES[clean] || clean;

  if (canonical === "san-pham-ban-chay") {
    list = list.filter((p) => p.featured || p.soldCount >= 400);
  } else if (canonical === "san-pham-moi") {
    list = list.filter((p) => p.isNew);
  } else if (canonical === "khuyen-mai") {
    list = list.filter((p) => p.isSale || (p.oldPrice && p.oldPrice > p.price));
  } else if (canonical && canonical !== "all") {
    list = list.filter((p) => {
      const pSlug = p.category?.slug || "";
      const pCanonical = SLUG_ALIASES[pSlug] || pSlug;
      return pCanonical === canonical || pSlug === clean;
    });
  }

  // Apply subcategory filter if chosen
  if (filters.subCategory && filters.subCategory !== "all") {
    list = list.filter((p) => p.subCategory === filters.subCategory);
  }

  // Apply weight filter
  if (filters.weight && filters.weight !== "all") {
    list = list.filter((p) => p.specs?.weight && p.specs.weight.includes(filters.weight));
  }

  // Apply video filter
  if (filters.hasVideo === "yes") {
    list = list.filter((p) => p.specs?.hasVideo || (p.videos && p.videos.length > 0));
  }

  // Apply price filter
  if (filters.price && filters.price !== "all") {
    if (filters.price === "<25k") list = list.filter((p) => p.price < 25000);
    else if (filters.price === "25k-50k") list = list.filter((p) => p.price >= 25000 && p.price <= 50000);
    else if (filters.price === ">50k") list = list.filter((p) => p.price > 50000);
    else if (filters.price === "<50k") list = list.filter((p) => p.price < 50000);
    else if (filters.price === "50k-100k") list = list.filter((p) => p.price >= 50000 && p.price <= 100000);
    else if (filters.price === ">100k") list = list.filter((p) => p.price > 100000);
    else if (filters.price === "<100k") list = list.filter((p) => p.price < 100000);
    else if (filters.price === "100k-150k") list = list.filter((p) => p.price >= 100000 && p.price <= 150000);
    else if (filters.price === ">150k") list = list.filter((p) => p.price > 150000);
    else if (filters.price === "<180k") list = list.filter((p) => p.price < 180000);
    else if (filters.price === "180k-250k") list = list.filter((p) => p.price >= 180000 && p.price <= 250000);
    else if (filters.price === ">250k") list = list.filter((p) => p.price > 250000);
    else if (filters.price === "<150k") list = list.filter((p) => p.price < 150000);
    else if (filters.price === "150k-200k") list = list.filter((p) => p.price >= 150000 && p.price <= 200000);
    else if (filters.price === ">200k") list = list.filter((p) => p.price > 200000);
  }

  // Sorting
  if (sortBy === "price-asc") {
    list.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    list.sort((a, b) => b.price - a.price);
  } else if (sortBy === "name-asc") {
    list.sort((a, b) => a.name.localeCompare(b.name, "vi"));
  } else if (sortBy === "sold-desc") {
    list.sort((a, b) => b.soldCount - a.soldCount);
  } else {
    // Default: featured first, then best sold
    list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.soldCount - a.soldCount);
  }

  return list;
}

export function searchProducts(query) {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();
  return PRODUCTS.filter((p) => {
    const matchName = p.name.toLowerCase().includes(q);
    const matchCat = p.category?.name?.toLowerCase().includes(q) || p.category?.slug?.includes(q);
    const matchBrand = p.brand?.toLowerCase().includes(q);
    const matchTags = p.tags?.some((t) => t.toLowerCase().includes(q));
    const matchColor = p.colors?.some((c) => c.name.toLowerCase().includes(q));
    return matchName || matchCat || matchBrand || matchTags || matchColor;
  });
}

export function getBestSellers(limit = 8) {
  return PRODUCTS.slice()
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, limit);
}

export function getSaleProducts(limit = 8) {
  return PRODUCTS.filter((p) => p.isSale || (p.oldPrice && p.oldPrice > p.price)).slice(0, limit);
}

export function getNewProducts(limit = 8) {
  return PRODUCTS.filter((p) => p.isNew || p.featured).slice(0, limit);
}

export function getRelatedProducts(productId, categorySlug, limit = 4) {
  return PRODUCTS.filter((p) => p.id !== productId && (!categorySlug || p.category?.slug === categorySlug)).slice(0, limit);
}

export function getFrequentlyBoughtTogether(product) {
  if (!product) return [];
  if (product.category?.slug === "len-soi") {
    // Frequently bought with hooks or stuffing
    return PRODUCTS.filter((p) => p.category?.slug === "kim-moc-dung-cu").slice(0, 2);
  }
  if (product.category?.slug === "kim-moc-dung-cu") {
    // Frequently bought with yarn
    return PRODUCTS.filter((p) => p.category?.slug === "len-soi").slice(0, 2);
  }
  if (product.category?.slug === "set-diy") {
    // Frequently bought with beginner combo or extra hooks
    return PRODUCTS.filter((p) => p.slug === "bo-kim-moc-can-deo-cong-thai-hoc-8-co" || p.slug === "len-milk-cotton-50g-sieu-mem-min");
  }
  return PRODUCTS.filter((p) => p.id !== product.id && p.featured).slice(0, 2);
}
