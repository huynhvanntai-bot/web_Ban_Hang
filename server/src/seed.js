require("dotenv").config();

const connectDatabase = require("./config/database");
const Category = require("./models/category.model");
const Product = require("./models/product.model");

const categoryData = [
  ["Len sợi", "len-soi", "Các dòng len sợi cao cấp, len milk bò, len nhung, len baby yarn không xù."],
  ["Dụng cụ đan móc", "dung-cu-dan-moc", "Kim móc cán dẻo, kim đan vòng, kéo cắt chỉ, kim khâu len và phụ kiện."],
  ["Thú len Handmade", "thu-len-handmade", "Thú bông đan móc thủ công Amigurumi dễ thương, an toàn cho bé."],
  ["Hoa len vĩnh cửu", "hoa-len-vinh-cuu", "Bó hoa tulip, hoa hướng dương đan móc tinh tế, giữ màu sắc bền lâu."],
  ["Túi & Phụ kiện len", "tui-phu-kien-len", "Túi xách dệt, mũ bucket, khăn choàng và móc khóa len handmade."],
  ["Set DIY tự làm", "set-diy-tu-lam", "Bộ kit tự đan móc kèm đầy đủ len sợi, dụng cụ và video hướng dẫn chi tiết."],
];

const productData = [
  // Len sợi
  {
    name: "Len Milk Bò 50g Siêu Mềm",
    slug: "len-milk-bo-50g-sieu-mem",
    price: 18000,
    category: "Len sợi",
    brand: "Milk Cotton",
    featured: true,
    image: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80",
    description: "Len Milk Bò cuộn 50g với bảng màu phong phú, chất len êm mềm, không dão xù, rất thích hợp móc thú bông, khăn và mũ len.",
  },
  {
    name: "Len Nhung Đũa Cỡ Lớn 100g",
    slug: "len-nhung-dua-co-lon-100g",
    price: 35000,
    category: "Len sợi",
    brand: "Chenille Wool",
    featured: true,
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80",
    description: "Len nhung đũa sợi to bồng bềnh, bề mặt mịn màng mướt tay, chuyên dùng móc thú bông khổng lồ hoặc chăn len mùa đông.",
  },
  {
    name: "Len Baby Yarn Không Dị Ứng 40g",
    slug: "len-baby-yarn-khong-di-ung-40g",
    price: 26000,
    category: "Len sợi",
    brand: "Baby Yarn",
    featured: false,
    image: "https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=800&q=80",
    description: "Dòng len chuyên biệt an toàn cho làn da nhạy cảm của em bé, sợi nhẹ tơi, không đổ lông, màu pastel ngọt ngào.",
  },
  {
    name: "Sợi Dệt Trơn Móc Túi Xách 100g",
    slug: "soi-det-tron-moc-tui-xach-100g",
    price: 32000,
    category: "Len sợi",
    brand: "Sợi Dệt VN",
    featured: false,
    image: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80",
    description: "Sợi dệt bản 2mm chắc chắn, lên dáng túi cực chuẩn và đứng form, chịu lực tốt và giặt nhanh khô.",
  },
  {
    name: "Len Mohair Sợi Mảnh Tơ Tằm",
    slug: "len-mohair-soi-manh-to-tam",
    price: 45000,
    category: "Len sợi",
    brand: "Mohair Silk",
    featured: false,
    image: "https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=800&q=80",
    description: "Sợi len Mohair tơ mềm mịn màng, chuyên dùng đan áo len cardigan kiểu Hàn Quốc hoặc phối cùng len trơn tăng độ bồng.",
  },

  // Dụng cụ đan móc
  {
    name: "Bộ Kim Móc Cán Dẻo Silicone 9 Cỡ",
    slug: "bo-kim-moc-can-deo-silicone-9-co",
    price: 125000,
    category: "Dụng cụ đan móc",
    brand: "ErgoHook",
    featured: true,
    image: "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&w=800&q=80",
    description: "Set 9 kim móc từ 2.0mm đến 6.0mm cán bọc cao su êm ái, đầu kim mạ nhẵn bóng lướt len mượt mà, cầm lâu không mỏi tay.",
  },
  {
    name: "Kéo Cắt Chỉ Cổ Điển Vintage mạ vàng",
    slug: "keo-cat-chi-co-dien-vintage-ma-vang",
    price: 49000,
    category: "Dụng cụ đan móc",
    brand: "Vintage Craft",
    featured: false,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
    description: "Kéo cắt chỉ đan móc điêu khắc họa tiết chim hạc tinh xảo, lưỡi thép sắc bén cắt dứt khoát đầu len thừa.",
  },
  {
    name: "Hộp Kim Ghim Định Vị & Kim Khâu Len",
    slug: "hop-kim-ghim-dinh-vi-kim-khau-len",
    price: 35000,
    category: "Dụng cụ đan móc",
    brand: "Tiệm Len",
    featured: false,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    description: "Bộ gồm 20 khóa đánh dấu hàng móc chống tuột mũi + 6 kim khâu len đầu tù tiện lợi ráp thú bông.",
  },
  {
    name: "Bông Gòn Hạt Nhân Tạo Nhồi Thú 500g",
    slug: "bong-gon-hat-nhan-tao-nhoi-thu-500g",
    price: 40000,
    category: "Dụng cụ đan móc",
    brand: "EcoFiber",
    featured: false,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
    description: "Gòn hạt 100% polyester trắng tinh khiết, độ đàn hồi cao giúp thú len căng phồng và không bị xẹp vón cục khi giặt.",
  },

  // Thú len Handmade (Amigurumi)
  {
    name: "Bé Thỏ Len Tai Dài Đan Tay Pastel",
    slug: "be-tho-len-tai-dai-dan-tay-pastel",
    price: 185000,
    category: "Thú len Handmade",
    brand: "Handmade Love",
    featured: true,
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
    description: "Bé thỏ móc bằng len milk bò tỉ mỉ, mặc váy hoa vintage, kích thước 25cm, thích hợp làm quà tặng sinh nhật hoặc kỷ niệm.",
  },
  {
    name: "Gấu Capybara Đeo Balo Rùa Len",
    slug: "gau-capybara-deo-balo-rua-len",
    price: 165000,
    category: "Thú len Handmade",
    brand: "Handmade Love",
    featured: true,
    image: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=800&q=80",
    description: "Chú chuột lang nước Capybara với biểu cảm chill dễ thương, cõng balo rùa xanh tháo rời được, móc tay cực kỳ chắc chắn.",
  },
  {
    name: "Móc Khóa Khủng Long Nhí Bằng Len",
    slug: "moc-khoa-khung-long-nhi-bang-len",
    price: 55000,
    category: "Thú len Handmade",
    brand: "Handmade Love",
    featured: false,
    image: "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&w=800&q=80",
    description: "Móc khóa bé khủng long xanh tí hon kèm khoen kim loại mạ bạc không gỉ, phụ kiện treo balo hoặc chìa khóa cực xinh.",
  },

  // Hoa len vĩnh cửu
  {
    name: "Bó Hoa Hướng Dương Len Vĩnh Cửu",
    slug: "bo-hoa-huong-duong-len-vinh-cuu",
    price: 220000,
    category: "Hoa len vĩnh cửu",
    brand: "Tiệm Len Decor",
    featured: true,
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80",
    description: "Bó hoa hướng dương đan móc bằng tay phối cùng hoa cúc họa mi và lá khuynh diệp, gói giấy kraft sang trọng bền đẹp mãi mãi.",
  },
  {
    name: "Bó 5 Cành Hoa Tulip Len Tone Hồng Pastel",
    slug: "bo-5-canh-hoa-tulip-len-tone-hong-pastel",
    price: 175000,
    category: "Hoa len vĩnh cửu",
    brand: "Tiệm Len Decor",
    featured: true,
    image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80",
    description: "Bó hoa tulip len dáng chuẩn cánh hoa cúp nhẹ, màu pastel ngọt ngào làm quà tặng tốt nghiệp, ngày lễ và sinh nhật ý nghĩa.",
  },
  {
    name: "Chậu Cây Xương Rồng Len Mini Để Bàn",
    slug: "chau-cay-xuong-rong-len-mini-de-ban",
    price: 89000,
    category: "Hoa len vĩnh cửu",
    brand: "Tiệm Len Decor",
    featured: false,
    image: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80",
    description: "Chậu gốm nung nhỏ kèm cây xương rồng móc len có nụ hoa vàng, trang trí bàn làm việc không cần tưới nước mà vẫn xanh tươi.",
  },

  // Túi & Phụ kiện len
  {
    name: "Túi Tote Len Sợi Dệt Họa Tiết Hoa Cúc",
    slug: "tui-tote-len-soi-det-hoa-tiet-hoa-cuc",
    price: 260000,
    category: "Túi & Phụ kiện len",
    brand: "Handmade Boutique",
    featured: true,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    description: "Túi xách tay đan móc từ sợi dệt chắc nịch, phối họa tiết ô vuông hoa cúc phong cách vintage Hàn Quốc, đựng vừa iPad và sổ tay.",
  },
  {
    name: "Mũ Bucket Len Họa Tiết Gợn Sóng Retro",
    slug: "mu-bucket-len-hoa-tiet-gon-song-retro",
    price: 145000,
    category: "Túi & Phụ kiện len",
    brand: "Handmade Boutique",
    featured: false,
    image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=800&q=80",
    description: "Nón len vành tròn phong cách vintage, chất sợi cotton thoáng mát đội được cả 4 mùa, tôn dáng chụp ảnh dã ngoại.",
  },
  {
    name: "Khăn Choàng Cổ Len Sợi Dày Ấm Áp",
    slug: "khan-choang-co-len-soi-day-am-ap",
    price: 210000,
    category: "Túi & Phụ kiện len",
    brand: "Handmade Boutique",
    featured: false,
    image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=800&q=80",
    description: "Khăn quàng cổ đan tay mũi vặn thừng cổ điển, chiều dài 1m8 bản rộng, giữ ấm tuyệt đối trong những ngày se lạnh.",
  },

  // Set DIY tự làm
  {
    name: "Kit Tự Móc Thú Len Cho Người Mới Bắt Đầu",
    slug: "kit-tu-moc-thu-len-cho-nguoi-moi-bat-dau",
    price: 149000,
    category: "Set DIY tự làm",
    brand: "Tiệm Len DIY",
    featured: true,
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80",
    description: "Set gồm đầy đủ len đủ màu, kim móc, gòn hạt, mắt thú, kim may và mã QR quét xem video hướng dẫn từng mũi móc từ A đến Z.",
  },
  {
    name: "Kit Tự Móc Bó Hoa Tulip 3 Cành Kèm Giấy Gói",
    slug: "kit-tu-moc-bo-hoa-tulip-3-canh-kem-giay-goi",
    price: 119000,
    category: "Set DIY tự làm",
    brand: "Tiệm Len DIY",
    featured: false,
    image: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80",
    description: "Tự tay làm món quà ý nghĩa tặng người thương với bộ kit móc hoa tulip: len milk bò pastel, kẽm cành, kẽm nẹp lá, ruy băng và giấy gói.",
  },
];

async function seed() {
  await connectDatabase();
  console.log("Đang làm sạch dữ liệu cũ...");
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
      stock: 30,
      category: categoryDoc._id,
      brand: item.brand,
      featured: item.featured,
      images: [item.image],
      description: item.description,
      isActive: true,
    });
  }

  console.log(
    `Đã seed thành công ${productData.length} sản phẩm len sợi và ${categoryData.length} danh mục cho Tiệm Len!`,
  );
  process.exit(0);
}

seed().catch((error) => {
  console.error("Lỗi khi seed:", error);
  process.exit(1);
});
