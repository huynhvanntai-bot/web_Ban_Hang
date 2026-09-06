require("dotenv").config();

const connectDatabase = require("./config/database");
const Category = require("./models/category.model");
const Product = require("./models/product.model");

const categoryData = [
  ["Chuột", "chuot"],
  ["Bàn phím", "ban-phim"],
  ["Tai nghe", "tai-nghe"],
  ["Webcam", "webcam"],
  ["Màn hình", "man-hinh"],
  ["USB & Hub", "usb-hub"],
  ["Phụ kiện", "phu-kien"],
];

const productData = [
  [
    "Logitech G102 Lightsync",
    "logitech-g102-lightsync",
    399000,
    "Chuột",
    "Logitech",
    true,
  ],
  [
    "Logitech G304 Lightspeed",
    "logitech-g304-lightspeed",
    799000,
    "Chuột",
    "Logitech",
    true,
  ],
  [
    "Razer DeathAdder Essential",
    "razer-deathadder-essential",
    549000,
    "Chuột",
    "Razer",
    false,
  ],
  ["DareU EK87 RGB", "dareu-ek87-rgb", 699000, "Bàn phím", "DareU", true],
  [
    "Keychron K2 Wireless",
    "keychron-k2-wireless",
    1890000,
    "Bàn phím",
    "Keychron",
    true,
  ],
  ["Akko 3068B Plus", "akko-3068b-plus", 1690000, "Bàn phím", "Akko", false],
  ["HyperX Cloud II", "hyperx-cloud-ii", 1590000, "Tai nghe", "HyperX", true],
  [
    "Logitech G435 Lightspeed",
    "logitech-g435-lightspeed",
    1290000,
    "Tai nghe",
    "Logitech",
    false,
  ],
  [
    "Razer BlackShark V2 X",
    "razer-blackshark-v2-x",
    990000,
    "Tai nghe",
    "Razer",
    false,
  ],
  [
    "Logitech C920 HD Pro",
    "logitech-c920-hd-pro",
    1790000,
    "Webcam",
    "Logitech",
    true,
  ],
  ["Rapoo C260 Webcam", "rapoo-c260-webcam", 649000, "Webcam", "Rapoo", false],
  ["LG 24MP400-B 24 inch", "lg-24mp400-b", 2790000, "Màn hình", "LG", true],
  [
    "Samsung ViewFinity S6 27 inch",
    "samsung-viewfinity-s6",
    6490000,
    "Màn hình",
    "Samsung",
    false,
  ],
  [
    "Kingston DataTraveler 64GB",
    "kingston-datatraveler-64gb",
    149000,
    "USB & Hub",
    "Kingston",
    false,
  ],
  [
    "SanDisk Ultra Flair 128GB",
    "sandisk-ultra-flair-128gb",
    229000,
    "USB & Hub",
    "SanDisk",
    false,
  ],
  [
    "Ugreen USB-C Hub 6 in 1",
    "ugreen-usb-c-hub-6-in-1",
    799000,
    "USB & Hub",
    "Ugreen",
    true,
  ],
  [
    "Baseus Metal Gleam Hub",
    "baseus-metal-gleam-hub",
    499000,
    "USB & Hub",
    "Baseus",
    false,
  ],
  [
    "Logitech Z120 Speaker",
    "logitech-z120-speaker",
    299000,
    "Phụ kiện",
    "Logitech",
    false,
  ],
  [
    "HyperX Pulsefire Mat",
    "hyperx-pulsefire-mat",
    399000,
    "Phụ kiện",
    "HyperX",
    false,
  ],
  [
    "Xiaomi Mi Computer Speaker",
    "xiaomi-computer-speaker",
    499000,
    "Phụ kiện",
    "Xiaomi",
    false,
  ],
];

const imageUrl = (index) =>
  `https://images.unsplash.com/photo-${
    [
      "1527814050087-3793815479db",
      "1615663245857-ac93bb7c39e7",
      "1527864550417-7fd91fc51a45",
      "1587829741301-dc798b83add3",
      "1595225476474-87563907a212",
      "1587825140708-dfaf72ae4b04",
      "1505740420928-5e560c06d30e",
      "1599669454699-248893623440",
      "1484704849700-f032a568e944",
      "1585771724684-38269d6639fd",
      "1587825140708-dfaf72ae4b04",
      "1488590528505-98d2b5aba04b",
      "1527443224154-c4a3942d3acf",
      "1550745165-9bc0b252726f",
      "1598791316-106c2e3c2f1c",
      "1625842268584-8f3296236761",
      "1625842268584-8f3296236761",
      "1625842268584-8f3296236761",
      "1545454675-3531b543be5d",
      "1616628182508-4a6b8a5a2a1f",
    ][index] || "1527814050087-3793815479db"
  }?auto=format&fit=crop&w=800&q=80`;

async function seed() {
  await connectDatabase();
  const categories = {};
  for (const [name, slug] of categoryData) {
    categories[name] = await Category.findOneAndUpdate(
      { slug },
      { name, slug },
      { upsert: true, new: true },
    );
  }

  for (let index = 0; index < productData.length; index += 1) {
    const [name, slug, price, category, brand, featured] = productData[index];
    await Product.findOneAndUpdate(
      { slug },
      {
        name,
        slug,
        price,
        stock: 25,
        category: categories[category]._id,
        brand,
        featured,
        images: [imageUrl(index)],
        description: `${name} chính hãng, phù hợp cho góc máy hiện đại.`,
      },
      { upsert: true, new: true },
    );
  }

  console.log(
    `Đã seed ${productData.length} sản phẩm và ${categoryData.length} danh mục`,
  );
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
