require("dotenv").config();

const connectDatabase = require("./config/database");
const Category = require("./models/category.model");
const Product = require("./models/product.model");

const categoryData = [
  ["Thú len Handmade", "thu-len-handmade", "Thú bông đan móc thủ công Amigurumi dễ thương, an toàn cho bé."],
  ["Hoa len vĩnh cửu", "hoa-len-vinh-cuu", "Bó hoa tulip, hoa hướng dương, hoa hồng đan móc tinh tế, giữ màu sắc bền lâu."],
  ["Len sợi", "len-soi", "Các dòng len sợi cao cấp, len milk bò, len nhung đũa, len baby yarn không xù."],
  ["Dụng cụ đan móc", "dung-cu-dan-moc", "Kim móc cán dẻo, kim đan vòng, kéo cắt chỉ, kim khâu len và phụ kiện."],
  ["Túi & Phụ kiện len", "tui-phu-kien-len", "Túi xách dệt, mũ bucket, khăn choàng và móc khóa len handmade."],
  ["Set DIY tự làm", "set-diy-tu-lam", "Bộ kit tự đan móc kèm đầy đủ len sợi, dụng cụ và video hướng dẫn chi tiết."],
];

const productData = [
  // 1 & 2: Thỏ Len Nhung Đũa Cỡ Đại
  {
    name: "Bé Thỏ Len Nhung Đũa Cỡ Đại Váy Hồng Pastel",
    slug: "be-tho-len-nhung-dua-co-dai-vay-hong",
    price: 285000,
    costPrice: 130000,
    productType: "self_made",
    category: "Thú len Handmade",
    brand: "Sene Handmade",
    featured: true,
    stock: 25,
    images: ["/products/2.3.jpg", "/products/2.2.jpg", "/products/2.jpg", "/products/2.1.jpg"],
    videos: ["/products/1.mp4"],
    videoPoster: "/products/1_thumb.jpg",
    description: "Bé thỏ bông đan móc thủ công tỉ mỉ bằng len nhung đũa sợi lớn siêu mềm mịn bồng bềnh, mặc váy xòe tiểu thư phối ren hồng đậm, đầu đội mũ len chụp tai phong cách vintage. Kèm video quay cận cảnh chất len và phom dáng êm ái.",
  },

  // 6: Heo Bông Mũi Hồng Váy Xanh Bơ
  {
    name: "Bé Heo Bông Len Mũi Hồng Váy Xanh Bơ Cài Nơ",
    slug: "be-heo-bong-len-mui-hong-vay-xanh-bo",
    price: 165000,
    costPrice: 75000,
    productType: "self_made",
    category: "Thú len Handmade",
    brand: "Sene Handmade",
    featured: true,
    stock: 30,
    images: ["/products/6.1.jpg", "/products/6.2.jpg", "/products/6.3.jpg"],
    videos: ["/products/6.mp4"],
    videoPoster: "/products/6_thumb.jpg",
    description: "Bé heo con móc tay bằng len nhung tuyết trắng muốt, mũi nút hồng chúm chím cực yêu, diện váy yếm màu xanh bơ dịu mát và cài nơ mầm cây xinh xắn, hai tay giang rộng đòi ôm.",
  },

  // 7: Chuột Xám Váy Vàng
  {
    name: "Bé Chuột Con Xám Len Nhung Mũi Hồng Váy Vàng",
    slug: "be-chuot-con-xam-len-nhung-vay-vang",
    price: 165000,
    costPrice: 75000,
    productType: "self_made",
    category: "Thú len Handmade",
    brand: "Sene Handmade",
    featured: false,
    stock: 28,
    images: ["/products/7.1.jpg", "/products/7.2.jpg", "/products/7.3.jpg", "/products/7.4.jpg"],
    videos: ["/products/7.mp4"],
    videoPoster: "/products/7_thumb.jpg",
    description: "Bé chuột xám đáng yêu với đôi tai tròn lót hồng xinh xắn, mũi hồng và râu thêu tay tinh xảo, mặc váy xòe màu vàng hoa cúc nổi bật, sợi len êm mềm không gây ngứa ráp.",
  },

  // 5: Hươu Cao Cổ Vàng Đốm Nâu
  {
    name: "Chú Hươu Cao Cổ Len Nhung Vàng Đốm Nâu Cổ Dài",
    slug: "huou-cao-co-len-nhung-vang-dom-nau",
    price: 195000,
    costPrice: 90000,
    productType: "self_made",
    category: "Thú len Handmade",
    brand: "Sene Handmade",
    featured: true,
    stock: 20,
    images: ["/products/5.1.jpg", "/products/5.2.jpg", "/products/5.3.jpg", "/products/5.4.jpg", "/products/5.5.jpg", "/products/5.6.jpg", "/products/5.7.jpg"],
    videos: ["/products/5.mp4"],
    videoPoster: "/products/5_thumb.jpg",
    description: "Chú hươu cao cổ đan móc bằng len nhung vàng ấm áp, mõm trắng tròn xoe, có sừng nhỏ và các đốm nâu thủ công tỉ mỉ trên lưng và chân, cổ dài đứng dáng siêu ngộ nghĩnh.",
  },

  // 8: Lạc Đà Llama Alpaca Xanh Bơ
  {
    name: "Lạc Đà Llama Alpaca Len Nhung Xanh Bơ Cổ Cao",
    slug: "lac-da-alpaca-len-nhung-xanh-bo",
    price: 185000,
    costPrice: 85000,
    productType: "self_made",
    category: "Thú len Handmade",
    brand: "Sene Handmade",
    featured: true,
    stock: 22,
    images: ["/products/8.4.jpg", "/products/8.1.jpg", "/products/8.2.jpg", "/products/8.3.jpg"],
    videos: ["/products/8.mp4"],
    videoPoster: "/products/8_thumb.jpg",
    description: "Lạc đà không bướu Alpaca dáng chibi cổ cao kiêu hãnh, sắc len nhung xanh bơ pastel độc lạ, 4 chân phối móng len trắng và tai vểnh tinh nghịch, đặt bàn làm việc hay quà tặng đều siêu xinh.",
  },

  // 9: Cặp Đôi Ngựa Bông Len Bờm Xoăn
  {
    name: "Cặp Đôi Ngựa Bông Len Bờm Xoăn Mini",
    slug: "cap-doi-ngua-bong-len-bom-xoan-mini",
    price: 245000,
    costPrice: 110000,
    productType: "self_made",
    category: "Thú len Handmade",
    brand: "Sene Handmade",
    featured: true,
    stock: 18,
    images: ["/products/9.5.jpg", "/products/9.7.jpg", "/products/9.1.jpg", "/products/9.2.jpg", "/products/9.3.jpg", "/products/9.4.jpg", "/products/9.6.jpg", "/products/9.8.jpg", "/products/9.9.jpg"],
    videos: ["/products/9.mp4"],
    videoPoster: "/products/9_thumb.jpg",
    description: "Set quà cặp đôi gồm Bé Ngựa Nâu hạt dẻ bờm xoăn đậm và Bé Ngựa Hồng pastel bờm tím hồng đeo lục lạc chuông đỏ leng keng, biểu tượng tình bạn và tình yêu gắn kết ấm áp.",
  },

  // 10: Bé Gà Con Len Hồng Mông Đào Đội Mũ Trứng Ốp La
  {
    name: "Bé Gà Con Len Hồng Mông Đào Đội Mũ Trứng Ốp La",
    slug: "be-ga-con-hong-mong-dao-doi-mu-trung-op-la",
    price: 155000,
    costPrice: 70000,
    productType: "self_made",
    category: "Thú len Handmade",
    brand: "Sene Handmade",
    featured: true,
    stock: 35,
    images: ["/products/10.1_thumb.jpg", "/products/10.2.jpg", "/products/10_thumb.jpg"],
    videos: ["/products/10.mp4", "/products/10.1.mp4"],
    videoPoster: "/products/10.1_thumb.jpg",
    description: "Bé gà con tròn xoe màu hồng phấn, trên đầu đội mũ trứng ốp la lòng đào hài hước, phía sau là chiếc mông đào cong vút ửng hồng phấn cực kỳ dễ thương và xả stress khi bóp nhẹ.",
  },

  // 3: Hộp Quà Tiểu Cảnh Vịt Vàng Đội Mũ Ếch
  {
    name: "Hộp Quà Tiểu Cảnh Bé Vịt Vàng Đội Mũ Ếch & Bó Hoa Cẩm Tú Cầu",
    slug: "hop-qua-tieu-canh-vit-vang-doi-mu-ech",
    price: 220000,
    costPrice: 105000,
    productType: "self_made",
    category: "Hoa len vĩnh cửu",
    brand: "Sene Handmade",
    featured: true,
    stock: 15,
    images: ["/products/3.jpg", "/products/3.1.jpg", "/products/3.2.jpg", "/products/3.3.jpg", "/products/3.4.jpg", "/products/3.5.jpg", "/products/3.6.jpg"],
    description: "Hộp quà tiểu cảnh mica trong suốt cao cấp gồm: Chú Vịt Vàng mini đội mũ chú ếch xanh ngộ nghĩnh, bó hoa len cẩm tú cầu xanh búp trắng, suối đá pha lê ngũ sắc, nấm đỏ và bé thỏ mini trên thảm rêu xanh thiên nhiên.",
  },

  // 4: Bó Hoa Hồng Len Mini Pastel Phối Viền Ren Trắng
  {
    name: "Bó Hoa Hồng Len Mini Pastel Phối Viền Ren Trắng",
    slug: "bo-hoa-hong-len-mini-pastel-kem-ren",
    price: 145000,
    costPrice: 65000,
    productType: "self_made",
    category: "Hoa len vĩnh cửu",
    brand: "Sene Handmade",
    featured: true,
    stock: 26,
    images: ["/products/4.2.jpg", "/products/4.3.jpg", "/products/4_thumb.jpg"],
    videos: ["/products/4.mp4", "/products/4.1.mp4"],
    videoPoster: "/products/4_thumb.jpg",
    description: "Bó hoa hồng đan tay nhỏ xinh gồm các đóa hồng nhung đỏ thắm và hồng pastel ngọt ngào, gói giấy bọc len xanh coban / tím mộng mơ phối ren bèo trắng tinh tế, quà tặng ý nghĩa giữ màu bền lâu mãi mãi.",
  },

  // Hoa len khác
  {
    name: "Bó 5 Cành Hoa Tulip Len Tone Hồng Pastel",
    slug: "bo-5-canh-hoa-tulip-len-tone-hong-pastel",
    price: 175000,
    category: "Hoa len vĩnh cửu",
    brand: "Tiệm Len Decor",
    featured: false,
    stock: 20,
    images: ["https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80"],
    description: "Bó hoa tulip len dáng chuẩn cánh hoa cúp nhẹ, màu pastel ngọt ngào làm quà tặng tốt nghiệp, ngày lễ và sinh nhật ý nghĩa.",
  },
  {
    name: "Bó Hoa Hướng Dương Len Vĩnh Cửu",
    slug: "bo-hoa-huong-duong-len-vinh-cuu",
    price: 220000,
    category: "Hoa len vĩnh cửu",
    brand: "Tiệm Len Decor",
    featured: false,
    stock: 18,
    images: ["https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80"],
    description: "Bó hoa hướng dương đan móc bằng tay phối cùng hoa cúc họa mi và lá khuynh diệp, gói giấy kraft sang trọng bền đẹp mãi mãi.",
  },

  // Len sợi
  {
    name: "Len Nhung Đũa Cỡ Lớn 100g (Sợi Móc Thú Bông)",
    slug: "len-nhung-dua-co-lon-100g",
    price: 35000,
    category: "Len sợi",
    brand: "Chenille Wool",
    featured: true,
    stock: 120,
    images: ["https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80"],
    description: "Len nhung đũa sợi to bồng bềnh, bề mặt mịn màng mướt tay, dòng len chuyên dùng móc bé thỏ, bé heo, gấu bông khổng lồ.",
  },
  {
    name: "Len Milk Bò 50g Siêu Mềm Mịn",
    slug: "len-milk-bo-50g-sieu-mem-min",
    price: 18000,
    category: "Len sợi",
    brand: "Milk Cotton",
    featured: true,
    stock: 200,
    images: ["https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80"],
    description: "Len Milk Bò cuộn 50g với bảng màu phong phú, chất len êm mềm, không dão xù, rất thích hợp móc thú bông, hoa len, khăn và mũ.",
  },
  {
    name: "Len Baby Yarn Không Dị Ứng 40g",
    slug: "len-baby-yarn-khong-di-ung-40g",
    price: 26000,
    category: "Len sợi",
    brand: "Baby Yarn",
    featured: false,
    stock: 80,
    images: ["https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=800&q=80"],
    description: "Dòng len chuyên biệt an toàn cho làn da nhạy cảm của em bé, sợi nhẹ tơi, không đổ lông, màu pastel ngọt ngào.",
  },
  {
    name: "Sợi Dệt Trơn Móc Túi Xách 100g",
    slug: "soi-det-tron-moc-tui-xach-100g",
    price: 32000,
    category: "Len sợi",
    brand: "Sợi Dệt VN",
    featured: false,
    stock: 60,
    images: ["https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80"],
    description: "Sợi dệt bản 2mm chắc chắn, lên dáng túi cực chuẩn và đứng form, chịu lực tốt và giặt nhanh khô.",
  },

  // Dụng cụ đan móc
  {
    name: "Bộ Kim Móc Cán Dẻo Silicone 9 Cỡ (2.0mm - 6.0mm)",
    slug: "bo-kim-moc-can-deo-silicone-9-co",
    price: 125000,
    category: "Dụng cụ đan móc",
    brand: "ErgoHook",
    featured: true,
    stock: 45,
    images: ["https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&w=800&q=80"],
    description: "Set 9 kim móc từ 2.0mm đến 6.0mm cán bọc cao su êm ái, đầu kim mạ nhẵn bóng lướt len mượt mà, cầm lâu không mỏi tay.",
  },
  {
    name: "Bông Gòn Hạt Nhân Tạo Nhồi Thú 500g",
    slug: "bong-gon-hat-nhan-tao-nhoi-thu-500g",
    price: 40000,
    category: "Dụng cụ đan móc",
    brand: "EcoFiber",
    featured: false,
    stock: 90,
    images: ["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80"],
    description: "Gòn hạt 100% polyester trắng tinh khiết, độ đàn hồi cao giúp thú len căng phồng và không bị xẹp vón cục khi giặt.",
  },
  {
    name: "Kéo Cắt Chỉ Cổ Điển Vintage mạ vàng",
    slug: "keo-cat-chi-co-dien-vintage-ma-vang",
    price: 49000,
    category: "Dụng cụ đan móc",
    brand: "Vintage Craft",
    featured: false,
    stock: 50,
    images: ["https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80"],
    description: "Kéo cắt chỉ đan móc điêu khắc họa tiết chim hạc tinh xảo, lưỡi thép sắc bén cắt dứt khoát đầu len thừa.",
  },

  // Túi & Phụ kiện len
  {
    name: "Túi Tote Len Sợi Dệt Họa Tiết Hoa Cúc",
    slug: "tui-tote-len-soi-det-hoa-tiet-hoa-cuc",
    price: 260000,
    category: "Túi & Phụ kiện len",
    brand: "Handmade Boutique",
    featured: false,
    stock: 14,
    images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"],
    description: "Túi xách tay đan móc từ sợi dệt chắc nịch, phối họa tiết ô vuông hoa cúc phong cách vintage Hàn Quốc.",
  },

  // Set DIY tự làm
  {
    name: "Kit Tự Móc Bé Thỏ Len Nhung Kèm Video Hướng Dẫn",
    slug: "kit-tu-moc-be-tho-len-nhung-kem-video",
    price: 169000,
    category: "Set DIY tự làm",
    brand: "Tiệm Len DIY",
    featured: true,
    stock: 40,
    images: ["/products/2.2.jpg"],
    videos: ["/products/1.mp4"],
    videoPoster: "/products/1_thumb.jpg",
    description: "Bộ kit tự móc hoàn thiện bé thỏ len nhung đũa: đầy đủ cuộn len trắng + hồng pastel, kim móc 4.5mm cán dẻo, gòn hạt cao cấp, mắt thú, kim khâu và mã QR quét xem video hướng dẫn từng mũi móc từ A đến Z.",
  },
  {
    name: "Kit Tự Móc Bó Hoa Tulip 3 Cành Kèm Giấy Gói",
    slug: "kit-tu-moc-bo-hoa-tulip-3-canh-kem-giay-goi",
    price: 119000,
    category: "Set DIY tự làm",
    brand: "Tiệm Len DIY",
    featured: false,
    stock: 35,
    images: ["https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80"],
    description: "Tự tay làm món quà ý nghĩa tặng người thương với bộ kit móc hoa tulip: len milk bò pastel, kẽm cành, kẽm nẹp lá, ruy băng và giấy gói.",
  },
];

async function seed() {
  await connectDatabase();
  console.log("Đang làm sạch và cập nhật dữ liệu...");
  await Product.deleteMany({});
  await Category.deleteMany({});

  const categories = {};
  for (const [name, slug, description] of categoryData) {
    categories[name] = await Category.findOneAndUpdate(
      { slug },
      { name, slug, description },
      { upsert: true, returnDocument: "after" },
    );
  }

  for (const item of productData) {
    const categoryDoc = categories[item.category];
    if (!categoryDoc) continue;

    await Product.create({
      name: item.name,
      slug: item.slug,
      price: item.price,
      costPrice: item.costPrice || 0,
      productType: item.productType || "yarn_retail",
      stock: item.stock || 30,
      category: categoryDoc._id,
      brand: item.brand || "Sene Handmade",
      featured: Boolean(item.featured),
      images: item.images || [],
      videos: item.videos || [],
      videoPoster: item.videoPoster || "",
      description: item.description,
      isActive: true,
    });
  }

  console.log(
    `Đã seed thành công ${productData.length} sản phẩm len sợi và ${categoryData.length} danh mục cho Tiệm Len Sene Handmade!`,
  );
  process.exit(0);
}

seed().catch((error) => {
  console.error("Lỗi khi seed:", error);
  process.exit(1);
});
