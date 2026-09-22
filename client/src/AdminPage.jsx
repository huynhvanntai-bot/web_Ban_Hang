import { useEffect, useMemo, useState } from "react";
import "./admin.css";

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

const statusLabels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const statusIcons = {
  pending: "⏳",
  confirmed: "🏪",
  shipping: "🚚",
  delivered: "✅",
  cancelled: "❌",
};

const roleLabels = {
  superadmin: "👑 Super Admin",
  admin: "🛡️ Quản trị viên",
  staff: "🪡 Nhân viên",
  user: "👤 Khách hàng",
};

const roleColors = {
  superadmin: { bg: "#fee2e2", text: "#b91c1c", border: "#fca5a5" },
  admin: { bg: "#fce7f3", text: "#be123c", border: "#fbcfe8" },
  staff: { bg: "#e0f2fe", text: "#0369a1", border: "#bae6fd" },
  user: { bg: "#f3f4f6", text: "#4b5563", border: "#e5e7eb" },
};

const money = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value || 0,
  );

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-");
}

const productTypeLabels = {
  yarn_retail: "🧶 Len & Phụ kiện nhập bán",
  self_made: "🌸 Tiệm tự móc (Thành phẩm)",
  outsourced: "🪡 Thợ móc gia công (Thành phẩm)",
};

// Vietnam UTC+7 date formatting helpers
function getVnDateOnly(dateVal) {
  if (!dateVal) return "";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch (e) {
    return "";
  }
}

function formatVnDateTime(dateVal) {
  if (!dateVal) return "";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "";
  }
}

const defaultSuppliers = [
  {
    _id: "sup_1",
    name: "Tổng Kho Sợi Milk Cotton Miền Nam",
    phone: "0908 123 456",
    address: "Tân Bình, TP. Hồ Chí Minh",
    supplyItems: "Len Milk Bò 50g, Len Milk Cotton 125g, Len Nhung Đũa",
    rating: 5,
    totalImported: 18500000,
    notes: "Giao hàng hỏa tốc trong ngày, giá sỉ tốt từ 50 cuộn.",
  },
  {
    _id: "sup_2",
    name: "Xưởng Phụ Kiện Kim Móc Kim Long",
    phone: "0912 345 678",
    address: "Hoàn Kiếm, Hà Nội",
    supplyItems: "Kim móc Tulip Nhật, kim SKC, mắt thú chốt an toàn, bông gòn bi",
    rating: 5,
    totalImported: 9200000,
    notes: "Nguồn kim chuẩn chính hãng, bông bi trắng loại 1 không xẹp.",
  },
  {
    _id: "sup_3",
    name: "Đại Lý Len Sợi Nhập Khẩu Sài Gòn",
    phone: "0933 888 999",
    address: "Quận 5, TP. Hồ Chí Minh",
    supplyItems: "Len Chenille, Sợi Dệt, Sợi Cúc Tần, Len Lông Cừu",
    rating: 4,
    totalImported: 12400000,
    notes: "Màu sắc phong phú, hàng về theo đợt mỗi tháng.",
  },
];

const defaultStaff = [
  {
    _id: "stf_1",
    name: "Chị Mai (Thợ Móc Hoa Thủ Công)",
    phone: "0987 111 222",
    role: "Thợ gia công hoa len",
    pieceRate: 20000,
    completedCount: 65,
    totalPaid: 1300000,
    skills: "Hoa tulip, hoa hướng dương, hoa hồng gói giấy Hàn Quốc",
    status: "active",
    notes: "Mũi móc đều đẹp, đúng tiến độ giao hàng trước các dịp lễ.",
  },
  {
    _id: "stf_2",
    name: "Em Linh (Thợ Móc Thú Bông Amigurumi)",
    phone: "0976 333 444",
    role: "Thợ móc thú bông len",
    pieceRate: 45000,
    completedCount: 38,
    totalPaid: 1710000,
    skills: "Thỏ tai dài, gấu dâu Lotso, móc khóa capybara",
    status: "active",
    notes: "Khâu ráp mắt mũi rất có hồn, sản phẩm tinh xảo.",
  },
  {
    _id: "stf_3",
    name: "Ngọc Trâm (Nhân Viên Đóng Gói & Kho)",
    phone: "0965 555 666",
    role: "Đóng gói & Phụ kiện",
    pieceRate: 5000,
    completedCount: 120,
    totalPaid: 600000,
    skills: "Đóng gói hộp quà, thắt nơ ruy băng, dán tem nhãn shop",
    status: "active",
    notes: "Làm việc cẩn thận, không bị sót đơn.",
  },
];

const ADMIN_TAB_META = {
  overview: {
    title: "📊 Tổng Quan Kinh Doanh",
    desc: "Số liệu thống kê thời gian thực từ cửa hàng Sene Handmade",
  },
  products: {
    title: "🧶 Quản Lý Sản Phẩm & Kho Len",
    desc: "Thêm mới, sửa giá, cập nhật số lượng tồn kho và phân loại len sợi",
  },
  imports: {
    title: "📥 Quản Lý Nhập Hàng & Tồn Kho",
    desc: "Lập phiếu nhập hàng, tự động tăng số lượng tồn kho bán hàng và tính toán công nợ",
  },
  orders: {
    title: "📦 Quản Lý & Theo Dõi Đơn Hàng",
    desc: "Kiểm tra tiến trình đóng gói, lọc đơn theo thời gian, duyệt đơn và in tem giao hàng",
  },
  customers: {
    title: "👥 Danh Sách Khách Hàng Thành Viên",
    desc: "Quản lý thông tin liên hệ, xem toàn bộ lịch sử mua hàng và cấp lại mật khẩu",
  },
  suppliers: {
    title: "🏢 Quản Lý Nhà Cung Cấp Len Sợi & Phụ Kiện",
    desc: "Theo dõi danh bạ các xưởng len sợi, đại lý phụ kiện kim móc và giá nhập hàng",
  },
  staff: {
    title: "🪡 Quản Lý Thợ Móc Thủ Công & Nhân Viên",
    desc: "Quản lý thợ gia công hoa len, thú bông, tính tiền công theo từng sản phẩm hoàn thiện",
  },
  "custom-orders": {
    title: "🧶 Quản Lý Đơn Đặt Móc Len Theo Mẫu Riêng",
    desc: "Xem ảnh mẫu khách gửi, chốt màu sắc, hẹn ngày hoàn thiện và liên hệ Zalo 1 chạm với khách",
  },
  reports: {
    title: "📈 Báo Cáo Doanh Thu & Bán Chạy",
    desc: "Thống kê các mẫu len bán chạy và doanh thu từng ngày",
  },
  promotions: {
    title: "🎟️ Chương Trình Khuyến Mãi & Voucher",
    desc: "Tạo mã voucher giảm giá %, freeship cho khách hàng",
  },
  admins: {
    title: "👤 Quản Trị Viên & Phân Quyền Nhân Sự",
    desc: "Phân quyền quản trị đa tài khoản (Super Admin, Quản trị viên, Nhân viên kho)",
  },
};

function AdminClock() {
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toLocaleDateString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(
        now.toLocaleDateString("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span className="admin-clock-chip">⏰ {time}</span>;
}

function AdminPage() {
  // Authentication & session: read from tai-admin-token first, fallback to tai-shop-token if role is admin/staff
  const [token, setToken] = useState(() => {
    return (
      localStorage.getItem("tai-admin-token") ||
      localStorage.getItem("tai-shop-token") ||
      ""
    );
  });

  const [adminUser, setAdminUser] = useState(() => {
    try {
      const savedAdmin = localStorage.getItem("tai-admin-user");
      if (savedAdmin) return JSON.parse(savedAdmin);
      const savedShop = localStorage.getItem("tai-shop-user");
      if (savedShop) {
        const u = JSON.parse(savedShop);
        if (["admin", "superadmin", "staff"].includes(u.role)) return u;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [login, setLogin] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const [data, setData] = useState({
    dashboard: {},
    products: [],
    categories: [],
    orders: [],
    customers: [],
    reports: { bestSelling: [], slowSelling: [], dailyRevenue: [] },
    promotions: [],
    suppliers: [],
    staff: [],
    imports: [],
    customOrders: [],
    admins: [],
  });

  // Filters & State for Orders
  const [orderFilter, setOrderFilter] = useState("all");
  const [orderPaymentFilter, setOrderPaymentFilter] = useState("all");
  const [orderPaymentMethodFilter, setOrderPaymentMethodFilter] = useState("all");
  const [orderDatePreset, setOrderDatePreset] = useState("all");
  const [orderStartDate, setOrderStartDate] = useState("");
  const [orderEndDate, setOrderEndDate] = useState("");
  const [orderSingleDate, setOrderSingleDate] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shippingLabelOrder, setShippingLabelOrder] = useState(null);

  // Filters & State for Overview Dashboard (Xem lại ngày trước)
  const [overviewDatePreset, setOverviewDatePreset] = useState("today");
  const [overviewStartDate, setOverviewStartDate] = useState("");
  const [overviewEndDate, setOverviewEndDate] = useState("");
  const [overviewSingleDate, setOverviewSingleDate] = useState("");

  // Layout State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem("admin-sidebar-collapsed") === "true";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Products state & filters
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [profitFilter, setProfitFilter] = useState("all");
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    price: "",
    costPrice: "",
    productType: "yarn_retail",
    stock: "",
    category: "",
    brand: "",
    images: "",
    description: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  // Modals state
  const [quickStockModal, setQuickStockModal] = useState({
    open: false,
    product: null,
    addStock: 20,
  });
  const [quickPriceModal, setQuickPriceModal] = useState({
    open: false,
    product: null,
    price: "",
    costPrice: "",
  });
  const [resetPasswordModal, setResetPasswordModal] = useState({
    open: false,
    customer: null,
    newPassword: "",
    resultMsg: "",
    errorMsg: "",
  });
  const [customerHistoryModal, setCustomerHistoryModal] = useState({
    open: false,
    customer: null,
    orders: [],
    loading: false,
  });
  const [importSearch, setImportSearch] = useState("");
  const [selectedImportReceipt, setSelectedImportReceipt] = useState(null);
  const [importModal, setImportModal] = useState({
    open: false,
    form: {
      code: "",
      supplierId: "",
      supplierName: "",
      supplierPhone: "",
      importedBy: adminUser?.name || "Sene Handmade Admin",
      notes: "",
      items: [
        {
          productId: "",
          productName: "",
          quantity: 20,
          costPrice: 15000,
        },
      ],
    },
  });
  const [supplierModal, setSupplierModal] = useState({
    open: false,
    isEdit: false,
    supplierId: null,
    form: {
      name: "",
      phone: "",
      address: "",
      supplyItems: "",
      rating: 5,
      totalImported: 0,
      notes: "",
    },
  });
  const [staffModal, setStaffModal] = useState({
    open: false,
    isEdit: false,
    staffId: null,
    form: {
      name: "",
      phone: "",
      role: "Thợ gia công hoa len",
      pieceRate: 20000,
      completedCount: 0,
      totalPaid: 0,
      skills: "",
      status: "active",
      notes: "",
    },
  });
  const [promotionForm, setPromotionForm] = useState({
    title: "",
    code: "",
    type: "percent",
    value: "",
    startAt: "",
    endAt: "",
    description: "",
  });
  const [previewImageModal, setPreviewImageModal] = useState(null);

  // Admin accounts modal
  const [adminModal, setAdminModal] = useState({
    open: false,
    isEdit: false,
    targetId: null,
    form: {
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "staff",
      isActive: true,
    },
  });
  const [adminPasswordModal, setAdminPasswordModal] = useState({
    open: false,
    admin: null,
    newPassword: "",
    errorMsg: "",
    resultMsg: "",
  });

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  }

  async function request(path, options = {}) {
    const activeTk = token || localStorage.getItem("tai-admin-token") || localStorage.getItem("tai-shop-token");
    const response = await fetch(`${apiUrl}/admin/${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${activeTk}`,
        ...(options.headers || {}),
      },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Request thất bại");
    return result;
  }

  async function loginAdmin(event) {
    event.preventDefault();
    setLoginError("");
    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(login),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      if (!["admin", "superadmin", "staff"].includes(result.user.role)) {
        throw new Error("Tài khoản này không có quyền Quản trị viên (Admin/Staff)");
      }
      localStorage.setItem("tai-admin-token", result.token);
      localStorage.setItem("tai-admin-user", JSON.stringify(result.user));
      setToken(result.token);
      setAdminUser(result.user);
      showToast(`🎉 Xin chào, ${result.user.name || "Admin"}!`);
    } catch (error) {
      setLoginError(error.message);
    }
  }

  function logout() {
    localStorage.removeItem("tai-admin-token");
    localStorage.removeItem("tai-admin-user");
    setToken("");
    setAdminUser(null);
    showToast("👋 Đã đăng xuất khỏi hệ thống quản trị");
  }

  async function loadAdmin(silent = false) {
    if (!silent) setIsRefreshing(true);
    try {
      const [
        dashboard,
        products,
        categories,
        orders,
        customers,
        reports,
        promotions,
        customOrdersRes,
        suppliersRes,
        staffRes,
        importsRes,
        adminsRes,
      ] = await Promise.all([
        request("dashboard"),
        request("products"),
        request("categories"),
        request("orders"),
        request("customers"),
        request("reports"),
        request("promotions"),
        request("custom-orders").catch(() => []),
        request("suppliers").catch(() => []),
        request("staff").catch(() => []),
        request("imports").catch(() => []),
        request("admins").catch(() => []),
      ]);

      setData({
        dashboard,
        products,
        categories,
        orders,
        customers,
        reports,
        promotions,
        customOrders:
          customOrdersRes && customOrdersRes.length > 0
            ? customOrdersRes
            : JSON.parse(localStorage.getItem("sene_custom_orders") || "[]"),
        suppliers:
          suppliersRes && suppliersRes.length > 0
            ? suppliersRes
            : defaultSuppliers,
        staff: staffRes && staffRes.length > 0 ? staffRes : defaultStaff,
        imports: importsRes || [],
        admins: adminsRes || [],
      });
    } catch (error) {
      if (!silent) {
        setLoginError(error.message);
        if (error.message.includes("403") || error.message.includes("token")) {
          setToken("");
        }
      }
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }

  // Initial load and background polling every 20s
  useEffect(() => {
    if (!token) return;
    loadAdmin(false);
    const pollInterval = setInterval(() => {
      loadAdmin(true);
    }, 20000);
    return () => clearInterval(pollInterval);
  }, [token]);

  // Derived Metrics & Filters
  const pendingOrders = useMemo(
    () => (data.orders || []).filter((o) => o.status === "pending"),
    [data.orders],
  );
  const confirmedOrders = useMemo(
    () => (data.orders || []).filter((o) => o.status === "confirmed"),
    [data.orders],
  );
  const shippingOrders = useMemo(
    () => (data.orders || []).filter((o) => o.status === "shipping"),
    [data.orders],
  );
  const deliveredOrders = useMemo(
    () => (data.orders || []).filter((o) => o.status === "delivered"),
    [data.orders],
  );
  const cancelledOrders = useMemo(
    () => (data.orders || []).filter((o) => o.status === "cancelled"),
    [data.orders],
  );

  const lowStockCount = useMemo(
    () => (data.products || []).filter((p) => (p.stock || 0) < 10).length,
    [data.products],
  );
  const lowStockProducts = useMemo(
    () => (data.products || []).filter((p) => (p.stock || 0) < 10),
    [data.products],
  );

  const pendingCustomOrders = useMemo(
    () => (data.customOrders || []).filter((o) => o.status === "pending" || !o.status),
    [data.customOrders],
  );

  // Calculate Today's Stats (UTC+7 accurate)
  const todayVn = useMemo(() => getVnDateOnly(new Date()), []);
  const todayOrders = useMemo(() => {
    return (data.orders || []).filter((o) => {
      if (o.status === "cancelled") return false;
      return getVnDateOnly(o.createdAt) === todayVn;
    });
  }, [data.orders, todayVn]);

  const todayRevenue = useMemo(() => {
    if (data.dashboard?.todayRevenue !== undefined) {
      return data.dashboard.todayRevenue;
    }
    return todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [data.dashboard, todayOrders]);

  // Overview dynamic date calculations (cho phép xem lại doanh thu & đơn hàng các ngày trước)
  const overviewPeriodLabel = useMemo(() => {
    if (overviewSingleDate) {
      const parts = overviewSingleDate.split("-");
      return `ngày ${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    if (overviewDatePreset === "today") return "hôm nay";
    if (overviewDatePreset === "yesterday") return "hôm qua";
    if (overviewDatePreset === "7days") return "7 ngày qua";
    if (overviewDatePreset === "30days") return "30 ngày qua";
    if (overviewDatePreset === "thismonth") return "tháng này";
    if (overviewDatePreset === "lastmonth") return "tháng trước";
    if (overviewDatePreset === "custom") {
      if (overviewStartDate && overviewEndDate) {
        return `từ ${overviewStartDate.split("-").reverse().join("/")} đến ${overviewEndDate.split("-").reverse().join("/")}`;
      }
      if (overviewStartDate) return `từ ${overviewStartDate.split("-").reverse().join("/")}`;
      if (overviewEndDate) return `đến ${overviewEndDate.split("-").reverse().join("/")}`;
    }
    return "toàn thời gian";
  }, [overviewDatePreset, overviewSingleDate, overviewStartDate, overviewEndDate]);

  const overviewFilteredOrders = useMemo(() => {
    const todayStr = getVnDateOnly(new Date());
    return (data.orders || []).filter((order) => {
      if (order.status === "cancelled") return false;
      const orderDateVn = getVnDateOnly(order.createdAt);
      if (overviewSingleDate) {
        return orderDateVn === overviewSingleDate;
      }
      if (overviewDatePreset === "today") {
        return orderDateVn === todayStr;
      }
      if (overviewDatePreset === "yesterday") {
        const yest = new Date(Date.now() - 86400000);
        return orderDateVn === getVnDateOnly(yest);
      }
      if (overviewDatePreset === "7days") {
        const sevenAgo = new Date(Date.now() - 6 * 86400000);
        return orderDateVn >= getVnDateOnly(sevenAgo) && orderDateVn <= todayStr;
      }
      if (overviewDatePreset === "30days") {
        const thirtyAgo = new Date(Date.now() - 29 * 86400000);
        return orderDateVn >= getVnDateOnly(thirtyAgo) && orderDateVn <= todayStr;
      }
      if (overviewDatePreset === "thismonth") {
        return orderDateVn.startsWith(todayStr.slice(0, 7));
      }
      if (overviewDatePreset === "lastmonth") {
        const now = new Date();
        const lastM = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return orderDateVn.startsWith(getVnDateOnly(lastM).slice(0, 7));
      }
      if (overviewDatePreset === "custom") {
        if (overviewStartDate && orderDateVn < overviewStartDate) return false;
        if (overviewEndDate && orderDateVn > overviewEndDate) return false;
        return true;
      }
      return true;
    });
  }, [data.orders, overviewDatePreset, overviewSingleDate, overviewStartDate, overviewEndDate]);

  const overviewRevenue = useMemo(() => {
    return overviewFilteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [overviewFilteredOrders]);

  const overviewOrdersCount = overviewFilteredOrders.length;

  // Active label for orders tab filter
  const orderDateFilterLabel = useMemo(() => {
    if (orderSingleDate) {
      const parts = orderSingleDate.split("-");
      return `Ngày ${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    if (orderDatePreset === "today") return "Hôm nay";
    if (orderDatePreset === "yesterday") return "Hôm qua (Xem ngày trước)";
    if (orderDatePreset === "7days") return "7 ngày qua";
    if (orderDatePreset === "30days") return "30 ngày qua";
    if (orderDatePreset === "thismonth") return "Tháng này";
    if (orderDatePreset === "lastmonth") return "Tháng trước";
    if (orderDatePreset === "custom") {
      if (orderStartDate && orderEndDate) {
        return `Khoảng ngày từ ${orderStartDate.split("-").reverse().join("/")} đến ${orderEndDate.split("-").reverse().join("/")}`;
      }
      if (orderStartDate) return `Từ ngày ${orderStartDate.split("-").reverse().join("/")}`;
      if (orderEndDate) return `Đến ngày ${orderEndDate.split("-").reverse().join("/")}`;
    }
    return "";
  }, [orderDatePreset, orderSingleDate, orderStartDate, orderEndDate]);

  // Filtered Orders logic based on presets, dates, search, and status
  const filteredOrders = useMemo(() => {
    const q = (orderSearch || "").toLowerCase().trim();
    const todayStr = getVnDateOnly(new Date());

    return (data.orders || []).filter((order) => {
      // 1. Status Filter
      if (orderFilter !== "all" && order.status !== orderFilter) return false;

      // 2. Payment Status Filter
      if (orderPaymentFilter !== "all") {
        const pStatus = order.paymentStatus || "unpaid";
        if (pStatus !== orderPaymentFilter) return false;
      }

      // 3. Payment Method Filter
      if (orderPaymentMethodFilter !== "all") {
        if (order.paymentMethod !== orderPaymentMethodFilter) return false;
      }

      // 4. Date Filter (UTC+7 accurate)
      const orderDateVn = getVnDateOnly(order.createdAt);
      if (orderSingleDate) {
        if (orderDateVn !== orderSingleDate) return false;
      } else if (orderDatePreset === "today") {
        if (orderDateVn !== todayStr) return false;
      } else if (orderDatePreset === "yesterday") {
        const yest = new Date(Date.now() - 86400000);
        if (orderDateVn !== getVnDateOnly(yest)) return false;
      } else if (orderDatePreset === "7days") {
        const sevenAgo = new Date(Date.now() - 6 * 86400000);
        if (orderDateVn < getVnDateOnly(sevenAgo) || orderDateVn > todayStr) return false;
      } else if (orderDatePreset === "30days") {
        const thirtyAgo = new Date(Date.now() - 29 * 86400000);
        if (orderDateVn < getVnDateOnly(thirtyAgo) || orderDateVn > todayStr) return false;
      } else if (orderDatePreset === "thismonth") {
        const curMonth = todayStr.slice(0, 7);
        if (!orderDateVn.startsWith(curMonth)) return false;
      } else if (orderDatePreset === "lastmonth") {
        const now = new Date();
        const lastM = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthPrefix = getVnDateOnly(lastM).slice(0, 7);
        if (!orderDateVn.startsWith(lastMonthPrefix)) return false;
      } else if (orderDatePreset === "custom") {
        if (orderStartDate && orderDateVn < orderStartDate) return false;
        if (orderEndDate && orderDateVn > orderEndDate) return false;
      }

      // 5. Query Search
      if (q) {
        const matchId = (order._id || "").toLowerCase().includes(q);
        const matchTracking = (order.trackingCode || "").toLowerCase().includes(q);
        const matchName = (order.customerName || "").toLowerCase().includes(q);
        const matchPhone = (order.phone || "").includes(q);
        const matchAddress = (order.address || "").toLowerCase().includes(q);
        const matchItem = (order.items || []).some((i) =>
          (i.name || "").toLowerCase().includes(q),
        );
        if (!matchId && !matchTracking && !matchName && !matchPhone && !matchAddress && !matchItem) {
          return false;
        }
      }

      return true;
    });
  }, [
    data.orders,
    orderFilter,
    orderPaymentFilter,
    orderPaymentMethodFilter,
    orderDatePreset,
    orderStartDate,
    orderEndDate,
    orderSearch,
  ]);

  // Product filtering
  const filteredProducts = useMemo(() => {
    return (data.products || []).filter((product) => {
      const q = productSearch.toLowerCase().trim();
      const matchQuery =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.slug.toLowerCase().includes(q) ||
        product.brand?.toLowerCase().includes(q);
      const matchCat =
        productCategoryFilter === "all"
          ? true
          : (product.category?._id || product.category) === productCategoryFilter;

      let matchProfit = true;
      const price = Number(product.price) || 0;
      const cost = Number(product.costPrice) || 0;
      if (profitFilter === "profit") {
        matchProfit = cost > 0 && price > cost;
      } else if (profitFilter === "loss") {
        matchProfit = cost > 0 && price < cost;
      } else if (profitFilter === "breakeven") {
        matchProfit = cost > 0 && price === cost;
      } else if (profitFilter === "nocost") {
        matchProfit = !cost || cost <= 0;
      }

      return matchQuery && matchCat && matchProfit;
    });
  }, [data.products, productSearch, productCategoryFilter, profitFilter]);

  // Imports filtering
  const filteredImports = useMemo(() => {
    const term = (importSearch || "").toLowerCase().trim();
    return (data.imports || []).filter((imp) => {
      if (!term) return true;
      const codeMatch = (imp.code || "").toLowerCase().includes(term);
      const supplierMatch = (imp.supplierName || "").toLowerCase().includes(term);
      const itemsMatch = (imp.items || []).some((it) =>
        (it.productName || "").toLowerCase().includes(term),
      );
      return codeMatch || supplierMatch || itemsMatch;
    });
  }, [data.imports, importSearch]);

  // Revenue breakdown for donut chart
  const revenueBreakdown = useMemo(() => {
    let revYarn = 0;
    let revSelf = 0;
    let revOutsource = 0;
    let totalCost = 0;

    (data.products || []).forEach((p) => {
      const type = p.productType || "yarn_retail";
      const sold = p.sold || 0;
      const price = p.price || 0;
      const cost = p.costPrice || (price * 0.6);
      const productRev = sold * price;
      const productCost = sold * cost;

      totalCost += productCost;
      if (type === "yarn_retail") revYarn += productRev;
      else if (type === "self_made") revSelf += productRev;
      else revOutsource += productRev;
    });

    const total = revYarn + revSelf + revOutsource || 1;
    const netProfit = Math.max(0, total - totalCost);
    const marginPct = Math.round((netProfit / total) * 100);

    return {
      revYarn,
      revSelf,
      revOutsource,
      total: total === 1 ? 0 : total,
      totalCost,
      netProfit,
      marginPct,
      pctYarn: Math.round((revYarn / total) * 100),
      pctSelf: Math.round((revSelf / total) * 100),
      pctOutsource: Math.round((revOutsource / total) * 100),
    };
  }, [data.products]);

  // 7-day revenue trend data
  const trendData = useMemo(() => {
    if (data.dashboard?.dailyStats && data.dashboard.dailyStats.length > 0) {
      return data.dashboard.dailyStats;
    }
    // Compute fallback from last 7 days
    const stats = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dStr = getVnDateOnly(d);
      const parts = dStr.split("-");
      const dayLabel = `${parts[2]}/${parts[1]}`;
      const dayOrders = (data.orders || []).filter(
        (o) => o.status !== "cancelled" && getVnDateOnly(o.createdAt) === dStr,
      );
      const dayRev = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      stats.push({
        date: dStr,
        dayLabel,
        orderCount: dayOrders.length,
        revenue: dayRev,
      });
    }
    return stats;
  }, [data.dashboard, data.orders]);

  // Actions & API handlers
  async function updateOrderStatus(id, status, paymentStatus) {
    try {
      const payload = { status };
      if (paymentStatus) payload.paymentStatus = paymentStatus;
      await request(`orders/${id}/status`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      showToast(`✓ Đã cập nhật đơn sang: ${statusLabels[status] || status}`);
      loadAdmin(true);
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder((prev) => (prev ? { ...prev, status, ...(paymentStatus ? { paymentStatus } : {}) } : null));
      }
    } catch (err) {
      alert("Lỗi cập nhật đơn: " + err.message);
    }
  }

  async function toggleOrderPaymentStatus(order) {
    const nextStatus = order.paymentStatus === "paid" ? "unpaid" : "paid";
    try {
      await request(`orders/${order._id}/status`, {
        method: "PUT",
        body: JSON.stringify({ paymentStatus: nextStatus }),
      });
      showToast(`✓ Đã chuyển thanh toán sang: ${nextStatus === "paid" ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"}`);
      loadAdmin(true);
      if (selectedOrder && selectedOrder._id === order._id) {
        setSelectedOrder((prev) => (prev ? { ...prev, paymentStatus: nextStatus } : null));
      }
    } catch (err) {
      alert("Lỗi đổi trạng thái thanh toán: " + err.message);
    }
  }

  function showOrder(orderOrId) {
    if (!orderOrId) return;
    let orderObj = typeof orderOrId === "object" ? orderOrId : (data.orders || []).find((o) => o._id === orderOrId);
    if (orderObj) setSelectedOrder(orderObj);
    const id = typeof orderOrId === "object" ? orderOrId._id : orderOrId;
    if (id) {
      request(`orders/${id}`)
        .then((fresh) => {
          if (fresh && fresh._id) setSelectedOrder(fresh);
        })
        .catch(() => {});
    }
  }

  async function openCustomerHistory(customer) {
    setCustomerHistoryModal({ open: true, customer, orders: [], loading: true });
    try {
      const ordersRes = await request(`customers/${customer._id}/orders`);
      setCustomerHistoryModal({ open: true, customer, orders: ordersRes || [], loading: false });
    } catch (err) {
      const matched = (data.orders || []).filter(
        (o) =>
          o.user?._id === customer._id ||
          o.user === customer._id ||
          (customer.phone && o.phone === customer.phone) ||
          (customer.name && o.customerName === customer.name),
      );
      setCustomerHistoryModal({ open: true, customer, orders: matched, loading: false });
    }
  }

  // Export to CSV / Excel helpers
  function exportToCsv(filename, rows) {
    const processRow = (row) =>
      row
        .map((val) => {
          if (val === null || val === undefined) return '""';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(",");

    const csvContent = "\uFEFF" + rows.map(processRow).join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}_${getVnDateOnly(new Date())}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("📥 Đã xuất file Excel thành công!");
  }

  function exportShipperOrdersExcel() {
    const rows = [
      ["STT", "Mã Đơn / Vận Đơn", "Người Nhận", "Số Điện Thoại", "Địa Chỉ Giao Hàng", "Chi Tiết Mặt Hàng", "Hình Thức Thanh Toán", "Tiền Thu Hộ COD (VNĐ)", "Trạng Thái Đơn", "Ghi Chú Giao Hàng"],
    ];
    filteredOrders.forEach((o, index) => {
      const itemsStr = (o.items || []).map((i) => `${i.name} (x${i.quantity})`).join("; ");
      const isCod = o.paymentMethod === "COD";
      const codAmount = isCod && o.paymentStatus !== "paid" ? o.totalAmount : 0;
      rows.push([
        index + 1,
        o.trackingCode || ("#" + (o._id ? o._id.slice(-6).toUpperCase() : index + 1)),
        o.customerName || "Khách mua lẻ",
        o.phone || "",
        o.address || "",
        itemsStr,
        isCod ? "Thu hộ COD" : "Chuyển khoản VietQR",
        codAmount,
        statusLabels[o.status] || o.status,
        o.note || "",
      ]);
    });
    exportToCsv("Bang_Ke_Giao_Hang_Shipper_COD", rows);
  }

  function exportFinancialReportExcel() {
    const rows = [
      ["STT", "Mã Đơn", "Ngày Đặt", "Khách Hàng", "Doanh Thu (VNĐ)", "Giảm Giá (VNĐ)", "Chi Phí Giá Vốn (VNĐ)", "Lợi Nhuận Gộp (VNĐ)", "Phương Thức", "Trạng Thái Đơn"],
    ];
    filteredOrders.forEach((o, index) => {
      const estCost = Math.round((o.totalAmount || 0) * 0.55);
      const estProfit = (o.totalAmount || 0) - estCost;
      rows.push([
        index + 1,
        o.trackingCode || ("#" + (o._id ? o._id.slice(-6).toUpperCase() : index + 1)),
        formatVnDateTime(o.createdAt),
        o.customerName,
        o.totalAmount || 0,
        o.discountAmount || 0,
        estCost,
        estProfit,
        o.paymentMethod,
        statusLabels[o.status] || o.status,
      ]);
    });
    exportToCsv("Bao_Cao_Tai_Chinh_Doanh_Thu", rows);
  }

  function exportProductsExcel() {
    const rows = [
      ["STT", "Mã Sản Phẩm", "Tên Sản Phẩm Len", "Danh Mục", "Phân Loại", "Giá Bán (VNĐ)", "Giá Vốn (VNĐ)", "Lãi Gộp (VNĐ)", "Biên Lãi (%)", "Tồn Kho", "Đã Bán", "Trạng Thái"],
    ];
    (data.products || []).forEach((p, index) => {
      const profit = (p.price || 0) - (p.costPrice || 0);
      const margin = p.price > 0 ? ((profit / p.price) * 100).toFixed(1) + "%" : "0%";
      rows.push([
        index + 1,
        "SP-" + (p._id ? p._id.slice(-6).toUpperCase() : index + 1),
        p.name,
        p.category?.name || "Len Sợi",
        p.productType === "outsourced" ? "Thợ gia công" : p.productType === "self_made" ? "Tiệm tự móc" : "Hàng nhập sỉ",
        p.price || 0,
        p.costPrice || 0,
        profit,
        margin,
        p.stock || 0,
        p.sold || 0,
        (p.stock || 0) > 0 ? "Còn hàng" : "Hết hàng",
      ]);
    });
    exportToCsv("Danh_Sach_Kho_Len_Sene_Handmade", rows);
  }

  // Custom Orders Handlers
  async function updateCustomOrderStatus(id, status, quotedPrice, adminNotes) {
    try {
      await request(`custom-orders/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status, quotedPrice, adminNotes }),
      });
      showToast("✓ Đã cập nhật đơn đặt móc riêng!");
      loadAdmin(true);
    } catch (err) {
      alert("Lỗi cập nhật: " + err.message);
    }
  }

  async function deleteCustomOrder(id) {
    if (!window.confirm("Bạn có chắc muốn xóa yêu cầu đặt móc này?")) return;
    try {
      await request(`custom-orders/${id}`, { method: "DELETE" });
      showToast("🗑️ Đã xóa yêu cầu đặt móc");
      loadAdmin(true);
    } catch (err) {
      alert("Lỗi xóa: " + err.message);
    }
  }

  // Admin Account Handlers
  async function handleSaveAdmin(e) {
    e.preventDefault();
    try {
      const { isEdit, targetId, form } = adminModal;
      if (isEdit) {
        await request(`admins/${targetId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        showToast("✓ Đã cập nhật tài khoản quản trị!");
      } else {
        await request("admins", {
          method: "POST",
          body: JSON.stringify(form),
        });
        showToast("🎉 Đã tạo mới tài khoản quản trị thành công!");
      }
      setAdminModal({
        open: false,
        isEdit: false,
        targetId: null,
        form: { name: "", email: "", password: "", phone: "", role: "staff", isActive: true },
      });
      loadAdmin(true);
    } catch (err) {
      alert("Lỗi lưu tài khoản: " + err.message);
    }
  }

  async function handleDeleteAdmin(id, name) {
    if (String(adminUser?._id) === String(id)) {
      alert("⚠️ Bạn không thể xóa tài khoản của chính mình!");
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${name}"?`)) return;
    try {
      await request(`admins/${id}`, { method: "DELETE" });
      showToast("🗑️ Đã xóa tài khoản thành công!");
      loadAdmin(true);
    } catch (err) {
      alert("Lỗi xóa tài khoản: " + err.message);
    }
  }

  async function handleChangeAdminPassword(e) {
    e.preventDefault();
    if (!adminPasswordModal.admin) return;
    try {
      await request(`admins/${adminPasswordModal.admin._id}`, {
        method: "PUT",
        body: JSON.stringify({ password: adminPasswordModal.newPassword }),
      });
      setAdminPasswordModal((prev) => ({
        ...prev,
        resultMsg: "✓ Đã đổi mật khẩu thành công!",
        errorMsg: "",
      }));
      showToast("🔑 Đã cập nhật mật khẩu mới!");
    } catch (err) {
      setAdminPasswordModal((prev) => ({
        ...prev,
        errorMsg: err.message,
        resultMsg: "",
      }));
    }
  }

  // Product save & quick price/stock handlers
  function resetProductForm() {
    setEditingProductId(null);
    setProductForm({
      name: "",
      slug: "",
      price: "",
      costPrice: "",
      productType: "yarn_retail",
      stock: "",
      category: "",
      brand: "",
      images: "",
      description: "",
    });
    setUploadMessage("");
  }

  function editProduct(product) {
    setEditingProductId(product._id);
    setProductForm({
      name: product.name || "",
      slug: product.slug || "",
      price: product.price || "",
      costPrice: product.costPrice || "",
      productType: product.productType || "yarn_retail",
      stock: product.stock || "",
      category: product.category?._id || product.category || "",
      brand: product.brand || "",
      images: product.images?.[0] || "",
      description: product.description || "",
    });
    setActiveTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSaveProduct(e) {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        slug: productForm.slug || slugify(productForm.name),
        price: Number(productForm.price),
        costPrice: Number(productForm.costPrice) || 0,
        stock: Number(productForm.stock),
        images: productForm.images ? [productForm.images] : [],
      };
      if (editingProductId) {
        await request(`products/${editingProductId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        showToast("✓ Đã cập nhật sản phẩm!");
      } else {
        await request("products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        showToast("✓ Đã thêm sản phẩm mới vào kho!");
      }
      resetProductForm();
      loadAdmin(true);
    } catch (err) {
      alert("Lỗi lưu sản phẩm: " + err.message);
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi kho?")) return;
    try {
      await request(`products/${id}`, { method: "DELETE" });
      if (editingProductId === id) resetProductForm();
      showToast("🗑️ Đã xóa sản phẩm khỏi kho.");
      loadAdmin(true);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleQuickAddStock(e) {
    e.preventDefault();
    if (!quickStockModal.product) return;
    try {
      const newStock =
        (quickStockModal.product.stock || 0) + Number(quickStockModal.addStock || 20);
      await request(`products/${quickStockModal.product._id}`, {
        method: "PUT",
        body: JSON.stringify({ stock: newStock }),
      });
      showToast(`⚡ Đã nhập thêm +${quickStockModal.addStock} vào kho!`);
      setQuickStockModal({ open: false, product: null, addStock: 20 });
      loadAdmin(true);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleSaveQuickPrice(e) {
    e.preventDefault();
    if (!quickPriceModal.product) return;
    try {
      await request(`products/${quickPriceModal.product._id}`, {
        method: "PUT",
        body: JSON.stringify({
          price: Number(quickPriceModal.price),
          costPrice: Number(quickPriceModal.costPrice) || 0,
        }),
      });
      showToast("✓ Đã cập nhật giá bán & giá vốn!");
      setQuickPriceModal({ open: false, product: null, price: "", costPrice: "" });
      loadAdmin(true);
    } catch (err) {
      alert(err.message);
    }
  }

  async function uploadProductImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setUploadMessage("Đang xử lý và tải ảnh lên...");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch(`${apiUrl}/admin/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await response.json();
      if (response.ok && result.url) {
        setProductForm((form) => ({ ...form, images: result.url }));
        setUploadMessage("✓ Tải ảnh thành công!");
        setUploadingImage(false);
        return;
      }
      throw new Error(result.message || "Không upload được qua máy chủ");
    } catch (apiErr) {
      console.warn("API upload fallback qua canvas:", apiErr.message);
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            let w = img.width;
            let h = img.height;
            if (w > 1000) {
              h = Math.round((h * 1000) / w);
              w = 1000;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, w, h);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
            setProductForm((form) => ({ ...form, images: dataUrl }));
            setUploadMessage("✓ Đã chọn & nén ảnh trực tiếp từ máy!");
            setUploadingImage(false);
          };
          img.onerror = () => {
            setProductForm((form) => ({ ...form, images: e.target.result }));
            setUploadMessage("✓ Đã chọn ảnh từ máy!");
            setUploadingImage(false);
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setUploadMessage(`Lỗi đọc ảnh: ${err.message}`);
        setUploadingImage(false);
      }
    }
  }

  // Customer Password Reset
  async function handleResetPassword(e) {
    e.preventDefault();
    if (!resetPasswordModal.customer) return;
    try {
      const res = await request(
        `customers/${resetPasswordModal.customer._id}/reset-password`,
        {
          method: "PUT",
          body: JSON.stringify({ newPassword: resetPasswordModal.newPassword }),
        },
      );
      setResetPasswordModal((prev) => ({
        ...prev,
        resultMsg: `✓ Đã cấp lại mật khẩu mới: ${res.newPassword}`,
        errorMsg: "",
      }));
      showToast(`🔑 Đã cấp lại mật khẩu cho khách ${resetPasswordModal.customer.name}!`);
      loadAdmin(true);
    } catch (err) {
      setResetPasswordModal((prev) => ({
        ...prev,
        errorMsg: err.message,
        resultMsg: "",
      }));
    }
  }

  // Import Receipt Handlers
  function openCreateImport(preProduct = null) {
    const defaultSup = data.suppliers?.[0];
    const dateStr = getVnDateOnly(new Date()).replace(/-/g, "").slice(2);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const code = `PN-${dateStr}-${randomSuffix}`;
    const initialProduct = preProduct || data.products?.[0];

    setImportModal({
      open: true,
      form: {
        code,
        supplierId: defaultSup?._id || "",
        supplierName: defaultSup?.name || "Tổng Kho Sợi Milk Cotton Miền Nam",
        supplierPhone: defaultSup?.phone || "0908 123 456",
        importedBy: adminUser?.name || "Sene Handmade Admin",
        notes: "",
        items: initialProduct
          ? [
              {
                productId: initialProduct._id,
                productName: initialProduct.name,
                quantity: 20,
                costPrice:
                  initialProduct.costPrice ||
                  Math.round((initialProduct.price || 20000) * 0.6) ||
                  12000,
              },
            ]
          : [
              {
                productId: "",
                productName: "",
                quantity: 20,
                costPrice: 15000,
              },
            ],
      },
    });
  }

  async function handleCreateImport(e) {
    e.preventDefault();
    try {
      const { form } = importModal;
      if (!form.items || form.items.length === 0) {
        alert("Vui lòng thêm ít nhất 1 sản phẩm vào phiếu nhập!");
        return;
      }
      const totalAmount = form.items.reduce(
        (sum, item) => sum + Number(item.quantity || 0) * Number(item.costPrice || 0),
        0,
      );
      const payload = {
        code: form.code,
        supplier: form.supplierId || null,
        supplierName: form.supplierName,
        supplierPhone: form.supplierPhone,
        importedBy: form.importedBy,
        notes: form.notes,
        totalAmount,
        items: form.items.map((item) => ({
          product: item.productId || null,
          productName: item.productName,
          quantity: Number(item.quantity),
          costPrice: Number(item.costPrice),
          total: Number(item.quantity) * Number(item.costPrice),
        })),
      };

      await request("imports", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      showToast(`✓ Đã tạo phiếu nhập ${form.code} và tăng tồn kho thành công!`);
      setImportModal((prev) => ({ ...prev, open: false }));
      loadAdmin(true);
    } catch (err) {
      alert("Lỗi lập phiếu nhập: " + err.message);
    }
  }

  // Supplier handlers
  async function handleSaveSupplier(e) {
    e.preventDefault();
    try {
      const isEdit = supplierModal.isEdit;
      const url = isEdit ? `suppliers/${supplierModal.supplierId}` : "suppliers";
      const method = isEdit ? "PUT" : "POST";
      await request(url, {
        method,
        body: JSON.stringify(supplierModal.form),
      });
      showToast(`✓ Đã ${isEdit ? "cập nhật" : "thêm"} nhà cung cấp!`);
      setSupplierModal((prev) => ({ ...prev, open: false }));
      loadAdmin(true);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteSupplier(id, name) {
    if (!window.confirm(`Bạn có chắc muốn xóa nhà cung cấp "${name}"?`)) return;
    try {
      await request(`suppliers/${id}`, { method: "DELETE" });
      showToast("🗑️ Đã xóa nhà cung cấp");
      loadAdmin(true);
    } catch (err) {
      alert(err.message);
    }
  }

  // Staff handlers
  async function handleSaveStaff(e) {
    e.preventDefault();
    try {
      const isEdit = staffModal.isEdit;
      const url = isEdit ? `staff/${staffModal.staffId}` : "staff";
      const method = isEdit ? "PUT" : "POST";
      await request(url, {
        method,
        body: JSON.stringify(staffModal.form),
      });
      showToast(`✓ Đã ${isEdit ? "cập nhật" : "thêm"} thợ thủ công / nhân sự!`);
      setStaffModal((prev) => ({ ...prev, open: false }));
      loadAdmin(true);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteStaff(id, name) {
    if (!window.confirm(`Bạn có chắc muốn xóa hồ sơ của "${name}"?`)) return;
    try {
      await request(`staff/${id}`, { method: "DELETE" });
      showToast("🗑️ Đã xóa hồ sơ nhân sự");
      loadAdmin(true);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleRecordStaffPieces(member, count = 10) {
    try {
      const pieceRate = member.pieceRate || 20000;
      const addPay = count * pieceRate;
      await request(`staff/${member._id}`, {
        method: "PUT",
        body: JSON.stringify({
          completedCount: (member.completedCount || 0) + count,
          totalPaid: (member.totalPaid || 0) + addPay,
        }),
      });
      showToast(`✓ Đã ghi nhận +${count} sản phẩm cho ${member.name}!`);
      loadAdmin(true);
    } catch (err) {
      alert(err.message);
    }
  }

  // Promotion handlers
  async function addPromotion(event) {
    event.preventDefault();
    try {
      await request("promotions", {
        method: "POST",
        body: JSON.stringify(promotionForm),
      });
      showToast("🎉 Đã tạo mã khuyến mãi mới!");
      setPromotionForm({
        title: "",
        code: "",
        type: "percent",
        value: "",
        startAt: "",
        endAt: "",
        description: "",
      });
      loadAdmin(true);
    } catch (error) {
      alert(error.message);
    }
  }

  // Login Screen
  if (!token) {
    return (
      <main className="admin-login-screen">
        <div className="admin-login-card">
          <div className="admin-login-brand">
            <span style={{ fontSize: "36px" }}>🌸</span>
            <h1>Sene Handmade</h1>
            <p>Hệ Thống Quản Trị Cửa Hàng & Kho Len Sợi</p>
          </div>

          <form onSubmit={loginAdmin}>
            {loginError && <div className="admin-login-error">{loginError}</div>}
            <div className="admin-form-group">
              <label>Email Quản Trị / Nhân Viên</label>
              <input
                required
                type="email"
                placeholder="admin@senehandmade.vn"
                value={login.email}
                onChange={(e) => setLogin({ ...login, email: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label>Mật Khẩu</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                value={login.password}
                onChange={(e) => setLogin({ ...login, password: e.target.value })}
              />
            </div>
            <button className="admin-btn-primary" type="submit" style={{ width: "100%", padding: "12px", fontSize: "15px" }}>
              🔑 Đăng Nhập Quản Trị
            </button>
          </form>
          <div style={{ marginTop: "18px", textAlign: "center", fontSize: "13px" }}>
            <a href="/" style={{ color: "#be123c", textDecoration: "none", fontWeight: 700 }}>
              ← Quay lại cửa hàng Sene Handmade
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`admin-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* SIDEBAR NAVIGATION */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? "collapsed" : ""} ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="admin-sidebar-header">
          <a className="admin-brand" href="/" target="_blank" rel="noreferrer" title="Sene Handmade Admin Center">
            <span>🌸</span>
            {(!sidebarCollapsed || mobileMenuOpen) && (
              <>
                <strong>Sene Handmade</strong>
                <span className="admin-brand-tag">ADMIN</span>
              </>
            )}
          </a>
          <button
            type="button"
            className="admin-sidebar-collapse-btn desktop-only"
            onClick={() => {
              const next = !sidebarCollapsed;
              setSidebarCollapsed(next);
              localStorage.setItem("admin-sidebar-collapsed", String(next));
            }}
            title={sidebarCollapsed ? "Mở rộng thanh menu" : "Thu gọn thanh menu"}
          >
            {sidebarCollapsed ? "▶" : "◀"}
          </button>
        </div>

        {/* Current Admin User Profile Chip */}
        {adminUser && (!sidebarCollapsed || mobileMenuOpen) && (
          <div className="admin-profile-chip" style={{ marginTop: "12px" }}>
            <div className="admin-profile-avatar">
              {adminUser.name ? adminUser.name[0].toUpperCase() : "A"}
            </div>
            <div className="admin-profile-info">
              <strong>{adminUser.name || "Admin"}</strong>
              <small style={{ color: roleColors[adminUser.role]?.text || "#be123c", fontWeight: 700 }}>
                {roleLabels[adminUser.role] || "Quản trị viên"}
              </small>
            </div>
          </div>
        )}

        <nav className="admin-sidebar-nav" style={{ marginTop: "16px" }}>
          {[
            { key: "overview", label: "Tổng quan", icon: "📊" },
            {
              key: "products",
              label: "Sản phẩm & Kho",
              icon: "📦",
              badge: (data.products || []).length,
            },
            {
              key: "imports",
              label: "Nhập Hàng & Tồn Kho",
              icon: "📥",
              badge: (data.imports || []).length,
            },
            {
              key: "orders",
              label: "Quản lý đơn hàng",
              icon: "🛒",
              badge: pendingOrders.length > 0 ? pendingOrders.length : null,
              badgeColor: "#f43f5e",
            },
            {
              key: "customers",
              label: "Khách hàng",
              icon: "👥",
              badge: (data.customers || []).length,
            },
            {
              key: "suppliers",
              label: "Nhà Cung Cấp",
              icon: "🏢",
              badge: (data.suppliers || []).length,
            },
            {
              key: "staff",
              label: "Thợ & Nhân Sự",
              icon: "🪡",
              badge: (data.staff || []).length,
            },
            {
              key: "custom-orders",
              label: "Đơn Móc Theo Mẫu",
              icon: "🧶",
              badge: pendingCustomOrders.length > 0 ? pendingCustomOrders.length : null,
              badgeColor: "#ec4899",
            },
            { key: "reports", label: "Báo cáo doanh thu", icon: "📈" },
            {
              key: "promotions",
              label: "Mã khuyến mãi",
              icon: "🎟️",
              badge: (data.promotions || []).length,
            },
            {
              key: "admins",
              label: "Tài khoản Quản trị",
              icon: "👤",
              badge: (data.admins || []).length,
            },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              className={`admin-nav-item ${activeTab === item.key ? "active" : ""}`}
              onClick={() => {
                setActiveTab(item.key);
                setMobileMenuOpen(false);
              }}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="admin-nav-left">
                <span className="admin-nav-icon">{item.icon}</span>
                {(!sidebarCollapsed || mobileMenuOpen) && <span className="admin-nav-label">{item.label}</span>}
              </span>
              {item.badge !== null && item.badge !== undefined && (
                <span
                  className="admin-nav-badge"
                  style={item.badgeColor ? { background: item.badgeColor } : {}}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-toggle-full-btn desktop-only"
            onClick={() => {
              const next = !sidebarCollapsed;
              setSidebarCollapsed(next);
              localStorage.setItem("admin-sidebar-collapsed", String(next));
            }}
          >
            {sidebarCollapsed ? "▶" : "◀ Thu gọn menu"}
          </button>
          <a className="admin-store-link" href="/" target="_blank" rel="noreferrer">
            🛍️ {(!sidebarCollapsed || mobileMenuOpen) && "Xem cửa hàng ↗"}
          </a>
          <button className="admin-logout-btn" type="button" onClick={logout}>
            🚪 {(!sidebarCollapsed || mobileMenuOpen) && "Đăng xuất"}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <section className="admin-content">
        <div className="admin-content-inner">
          {/* TOPBAR */}
          <header className="admin-topbar">
            <div className="admin-topbar-title">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="admin-menu-toggle-btn"
                  onClick={() => {
                    if (window.innerWidth <= 768) {
                      setMobileMenuOpen((prev) => !prev);
                    } else {
                      const next = !sidebarCollapsed;
                      setSidebarCollapsed(next);
                      localStorage.setItem("admin-sidebar-collapsed", String(next));
                    }
                  }}
                >
                  ☰ <span className="admin-menu-btn-text">Menu</span>
                </button>
                <h1>
                  <span>{ADMIN_TAB_META[activeTab]?.title || "Sene Handmade Quản Trị"}</span>
                </h1>
              </div>
              <p>
                <span>{ADMIN_TAB_META[activeTab]?.desc || ""}</span>
              </p>
            </div>

            <div className="admin-topbar-actions">
              <AdminClock />
              <button
                type="button"
                className="admin-refresh-btn"
                onClick={() => loadAdmin(false)}
                disabled={isRefreshing}
                title="Cập nhật toàn bộ dữ liệu đơn hàng và kho"
              >
                {isRefreshing ? "⏳ Đang tải..." : "🔄 Cập nhật dữ liệu"}
              </button>
            </div>
          </header>

          {/* TOAST ALERT */}
          {toast && <div className="toast">{toast}</div>}

          {/* ========================================================
              TAB 1: TỔNG QUAN (OVERVIEW)
          ======================================================== */}
          {activeTab === "overview" && (
            <>
              {/* THANH LỌC THỜI GIAN KINH DOANH (XEM LẠI NGÀY TRƯỚC) */}
              <div className="admin-overview-date-bar">
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "14.5px", fontWeight: 800, color: "#831843", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>📅</span> Xem số liệu theo ngày:
                  </span>
                  {[
                    { id: "today", label: "⭐ Hôm nay" },
                    { id: "yesterday", label: "⏪ Hôm qua" },
                    { id: "7days", label: "📊 7 ngày qua" },
                    { id: "30days", label: "🗓️ 30 ngày qua" },
                    { id: "thismonth", label: "📅 Tháng này" },
                    { id: "lastmonth", label: "⏮️ Tháng trước" },
                    { id: "all", label: "Toàn bộ" },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`admin-overview-date-btn ${overviewDatePreset === preset.id && !overviewSingleDate ? "active" : ""}`}
                      onClick={() => {
                        setOverviewDatePreset(preset.id);
                        setOverviewSingleDate("");
                        setOverviewStartDate("");
                        setOverviewEndDate("");
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Chọn ngày cụ thể hoặc khoảng ngày */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <label style={{ fontSize: "13.5px", color: "#831843", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                    Chọn 1 ngày cụ thể:
                    <input
                      type="date"
                      className="admin-date-input"
                      value={overviewSingleDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOverviewSingleDate(val);
                        if (val) {
                          setOverviewDatePreset("single");
                          setOverviewStartDate("");
                          setOverviewEndDate("");
                        }
                      }}
                      title="Chọn một ngày cụ thể bất kỳ trong quá khứ để xem doanh thu & đơn hàng"
                    />
                  </label>

                  <label style={{ fontSize: "13.5px", color: "#831843", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                    Hoặc từ:
                    <input
                      type="date"
                      className="admin-date-input"
                      value={overviewStartDate}
                      onChange={(e) => {
                        setOverviewStartDate(e.target.value);
                        setOverviewDatePreset("custom");
                        setOverviewSingleDate("");
                      }}
                    />
                    đến:
                    <input
                      type="date"
                      className="admin-date-input"
                      value={overviewEndDate}
                      onChange={(e) => {
                        setOverviewEndDate(e.target.value);
                        setOverviewDatePreset("custom");
                        setOverviewSingleDate("");
                      }}
                    />
                  </label>

                  {(overviewDatePreset !== "today" || overviewSingleDate || overviewStartDate || overviewEndDate) && (
                    <button
                      type="button"
                      className="admin-btn-outline"
                      style={{ fontSize: "13px", padding: "6px 12px" }}
                      onClick={() => {
                        setOverviewDatePreset("today");
                        setOverviewSingleDate("");
                        setOverviewStartDate("");
                        setOverviewEndDate("");
                      }}
                    >
                      ✕ Về hôm nay
                    </button>
                  )}
                </div>
              </div>

              {/* 5 KPI Cards (Doanh thu theo mốc đã chọn, Đơn hàng theo mốc đã chọn, Đơn chờ duyệt, Khách hàng, Cảnh báo tồn kho) */}
              <div className="admin-kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
                {/* 1. DOANH THU */}
                <div
                  className="admin-kpi-card"
                  onClick={() => {
                    setActiveTab("orders");
                    if (overviewSingleDate) {
                      setOrderSingleDate(overviewSingleDate);
                      setOrderDatePreset("single");
                    } else if (overviewDatePreset === "custom") {
                      setOrderDatePreset("custom");
                      setOrderStartDate(overviewStartDate);
                      setOrderEndDate(overviewEndDate);
                    } else {
                      setOrderDatePreset(overviewDatePreset);
                      setOrderSingleDate("");
                      setOrderStartDate("");
                      setOrderEndDate("");
                    }
                  }}
                  style={{ cursor: "pointer" }}
                  title="Bấm để xem danh sách đơn hàng tương ứng trong mục Quản Lý Đơn Hàng"
                >
                  <div className="kpi-top">
                    <div className="kpi-icon">💰</div>
                    <span className="kpi-trend" style={{ background: "#ecfdf5", color: "#047857", textTransform: "capitalize" }}>
                      {overviewPeriodLabel}
                    </span>
                  </div>
                  <div className="kpi-title">Doanh thu ({overviewPeriodLabel})</div>
                  <div className="kpi-val" style={{ color: "#e11d48", fontWeight: 900 }}>
                    {money(overviewRevenue)}
                  </div>
                </div>

                {/* 2. ĐƠN HÀNG */}
                <div
                  className="admin-kpi-card"
                  onClick={() => {
                    setActiveTab("orders");
                    if (overviewSingleDate) {
                      setOrderSingleDate(overviewSingleDate);
                      setOrderDatePreset("single");
                    } else if (overviewDatePreset === "custom") {
                      setOrderDatePreset("custom");
                      setOrderStartDate(overviewStartDate);
                      setOrderEndDate(overviewEndDate);
                    } else {
                      setOrderDatePreset(overviewDatePreset);
                      setOrderSingleDate("");
                      setOrderStartDate("");
                      setOrderEndDate("");
                    }
                  }}
                  style={{ cursor: "pointer" }}
                  title="Bấm để lọc đơn hàng phát sinh trong khoảng thời gian này"
                >
                  <div className="kpi-top">
                    <div className="kpi-icon">📦</div>
                    <span className="kpi-trend">Đã phát sinh</span>
                  </div>
                  <div className="kpi-title">Đơn hàng ({overviewPeriodLabel})</div>
                  <div className="kpi-val">{overviewOrdersCount} đơn</div>
                </div>

                {/* 3. ĐƠN CHỜ XỬ LÝ */}
                <div
                  className="admin-kpi-card"
                  onClick={() => {
                    setActiveTab("orders");
                    setOrderFilter("pending");
                  }}
                  style={{ cursor: "pointer" }}
                  title="Bấm để lọc các đơn chờ duyệt"
                >
                  <div className="kpi-top">
                    <div className="kpi-icon">⏳</div>
                    {pendingOrders.length > 0 ? (
                      <span className="kpi-trend" style={{ background: "#fef2f2", color: "#e11d48", fontWeight: 800 }}>
                        {pendingOrders.length} cần duyệt gấp
                      </span>
                    ) : (
                      <span className="kpi-trend">Đã xử lý hết</span>
                    )}
                  </div>
                  <div className="kpi-title">Đơn chờ xử lý</div>
                  <div className="kpi-val" style={{ color: pendingOrders.length > 0 ? "#e11d48" : "inherit" }}>
                    {pendingOrders.length} đơn
                  </div>
                </div>

                {/* 4. KHÁCH HÀNG */}
                <div
                  className="admin-kpi-card"
                  onClick={() => setActiveTab("customers")}
                  style={{ cursor: "pointer" }}
                  title="Bấm để xem danh sách khách hàng"
                >
                  <div className="kpi-top">
                    <div className="kpi-icon">👥</div>
                    <span className="kpi-trend">Thành viên shop</span>
                  </div>
                  <div className="kpi-title">Tổng khách hàng</div>
                  <div className="kpi-val">{(data.customers || []).length}</div>
                </div>

                {/* 5. TỒN KHO CẢNH BÁO */}
                <div
                  className="admin-kpi-card"
                  onClick={() => setActiveTab("products")}
                  style={{ cursor: "pointer" }}
                  title="Bấm để xem các sản phẩm sắp hết hàng"
                >
                  <div className="kpi-top">
                    <div className="kpi-icon">⚠️</div>
                    {lowStockCount > 0 ? (
                      <span className="kpi-trend" style={{ background: "#fee2e2", color: "#b91c1c" }}>
                        Cần nhập thêm
                      </span>
                    ) : (
                      <span className="kpi-trend">Đủ hàng bán</span>
                    )}
                  </div>
                  <div className="kpi-title">Tồn kho thấp (&lt;10)</div>
                  <div className="kpi-val" style={{ color: lowStockCount > 0 ? "#b91c1c" : "inherit" }}>
                    {lowStockCount} sản phẩm
                  </div>
                </div>
              </div>

              {/* Pipeline Status Bar */}
              <div className="order-pipeline-bar">
                <div
                  className={`pipeline-step-pill ${orderFilter === "pending" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("orders");
                    setOrderFilter("pending");
                  }}
                >
                  <span>⏳ Chờ xác nhận</span>
                  <b>{pendingOrders.length}</b>
                </div>
                <div
                  className={`pipeline-step-pill ${orderFilter === "confirmed" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("orders");
                    setOrderFilter("confirmed");
                  }}
                >
                  <span>🏪 Đã xác nhận</span>
                  <b>{confirmedOrders.length}</b>
                </div>
                <div
                  className={`pipeline-step-pill ${orderFilter === "shipping" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("orders");
                    setOrderFilter("shipping");
                  }}
                >
                  <span>🚚 Đang giao hàng</span>
                  <b>{shippingOrders.length}</b>
                </div>
                <div
                  className={`pipeline-step-pill ${orderFilter === "delivered" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("orders");
                    setOrderFilter("delivered");
                  }}
                >
                  <span>✅ Đã hoàn thành</span>
                  <b>{deliveredOrders.length}</b>
                </div>
                {lowStockCount > 0 && (
                  <div
                    className="pipeline-step-pill"
                    style={{ background: "#fff1f2", borderColor: "#fecdd3" }}
                    onClick={() => setActiveTab("products")}
                  >
                    <span style={{ color: "#e11d48" }}>⚠️ Tồn kho thấp (&lt;10)</span>
                    <b style={{ background: "#e11d48" }}>{lowStockCount}</b>
                  </div>
                )}
              </div>

              {/* 7-DAY REVENUE & ORDER TREND CHART (SVG) */}
              <div className="admin-card" style={{ marginBottom: "24px" }}>
                <div className="admin-card-header">
                  <div>
                    <h2>📈 Biểu Đồ Doanh Thu & Đơn Hàng 7 Ngày Qua</h2>
                    <p style={{ margin: "4px 0 0", color: "#8d6271", fontSize: "13px" }}>
                      Số liệu thực tế theo múi giờ Việt Nam (UTC+7), tự động cập nhật liên tục.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="admin-btn-outline"
                    onClick={() => setActiveTab("reports")}
                    style={{ fontSize: "12.5px" }}
                  >
                    Xem chi tiết báo cáo ↗
                  </button>
                </div>

                <div style={{ padding: "16px 8px 0" }}>
                  {/* SVG Bar Chart */}
                  <div style={{ width: "100%", overflowX: "auto" }}>
                    <div style={{ minWidth: "600px", height: "220px", position: "relative", display: "flex", alignItems: "flex-end", gap: "20px", padding: "0 10px 40px 10px", borderBottom: "2px solid #fce7f3" }}>
                      {(() => {
                        const maxRev = Math.max(...trendData.map((d) => d.revenue), 100000);
                        return trendData.map((day, idx) => {
                          const heightPct = Math.max(10, Math.round((day.revenue / maxRev) * 160));
                          return (
                            <div
                              key={idx}
                              style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                position: "relative",
                                height: "100%",
                                justifyContent: "flex-end",
                              }}
                            >
                              {/* Amount Tooltip / Label */}
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  color: day.revenue > 0 ? "#be123c" : "#9ca3af",
                                  marginBottom: "6px",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {day.revenue > 0 ? `${Math.round(day.revenue / 1000)}k` : "0đ"}
                              </span>

                              {/* Bar */}
                              <div
                                style={{
                                  width: "70%",
                                  maxWidth: "44px",
                                  height: `${heightPct}px`,
                                  background:
                                    day.revenue > 0
                                      ? "linear-gradient(180deg, #f43f5e 0%, #fda4af 100%)"
                                      : "#f3f4f6",
                                  borderRadius: "8px 8px 3px 3px",
                                  boxShadow: day.revenue > 0 ? "0 4px 10px rgba(244, 63, 94, 0.2)" : "none",
                                  transition: "all 0.3s ease",
                                }}
                                title={`${day.dayLabel} (${day.date}): ${money(day.revenue)} - ${day.orderCount} đơn`}
                              />

                              {/* Day Label & Order count */}
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: "-32px",
                                  textAlign: "center",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <strong style={{ fontSize: "12px", display: "block", color: "#475569" }}>
                                  {day.dayLabel}
                                </strong>
                                <span style={{ fontSize: "10.5px", color: "#8d6271", fontWeight: 600 }}>
                                  {day.orderCount} đơn
                                </span>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* RECENT ORDERS & TOP SELLING GRID */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: "24px", marginBottom: "24px" }}>
                {/* Đơn hàng mới nhất */}
                <div className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <h2>🛒 Đơn Hàng Mới Nhất</h2>
                      <p style={{ margin: "2px 0 0", color: "#8d6271", fontSize: "12.5px" }}>
                        Các đơn khách vừa đặt trên trang cửa hàng
                      </p>
                    </div>
                    <button
                      type="button"
                      className="admin-btn-outline"
                      onClick={() => setActiveTab("orders")}
                      style={{ fontSize: "12px", padding: "4px 10px" }}
                    >
                      Xem tất cả ({data.orders.length}) →
                    </button>
                  </div>

                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Mã đơn</th>
                          <th>Khách hàng</th>
                          <th>Tổng tiền</th>
                          <th>Trạng thái</th>
                          <th>Xem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(data.orders || []).slice(0, 6).map((ord) => (
                          <tr key={ord._id}>
                            <td>
                              <strong>{ord.trackingCode || `#${ord._id.slice(-6).toUpperCase()}`}</strong>
                              <small style={{ display: "block", color: "#94a3b8", fontSize: "11px" }}>
                                {formatVnDateTime(ord.createdAt)}
                              </small>
                            </td>
                            <td>
                              <strong>{ord.customerName}</strong>
                              <small style={{ display: "block", color: "#8d6271", fontSize: "11px" }}>
                                📱 {ord.phone}
                              </small>
                            </td>
                            <td>
                              <strong style={{ color: "#e11d48" }}>{money(ord.totalAmount)}</strong>
                            </td>
                            <td>
                              <span
                                className="status-pill-badge"
                                style={{
                                  background: ord.status === "delivered" ? "#ecfdf5" : ord.status === "pending" ? "#fff1f2" : "#fdf2f8",
                                  color: ord.status === "delivered" ? "#047857" : ord.status === "pending" ? "#e11d48" : "#be123c",
                                }}
                              >
                                {statusIcons[ord.status]} {statusLabels[ord.status] || ord.status}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="admin-btn-outline"
                                style={{ padding: "4px 8px", fontSize: "11.5px" }}
                                onClick={() => showOrder(ord)}
                              >
                                👁️ Chi tiết
                              </button>
                            </td>
                          </tr>
                        ))}
                        {(data.orders || []).length === 0 && (
                          <tr>
                            <td colSpan="5" style={{ textAlign: "center", padding: "28px" }}>
                              Chưa có đơn hàng nào phát sinh.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sản phẩm bán chạy */}
                <div className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <h2>🔥 Top Sản Phẩm Bán Chạy</h2>
                      <p style={{ margin: "2px 0 0", color: "#8d6271", fontSize: "12.5px" }}>
                        Mẫu len & thành phẩm được yêu thích nhất
                      </p>
                    </div>
                    <button
                      type="button"
                      className="admin-btn-outline"
                      onClick={() => setActiveTab("products")}
                      style={{ fontSize: "12px", padding: "4px 10px" }}
                    >
                      Kho hàng ({data.products.length}) →
                    </button>
                  </div>

                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Sản phẩm</th>
                          <th>Giá bán</th>
                          <th>Đã bán</th>
                          <th>Tồn kho</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...(data.products || [])]
                          .sort((a, b) => (b.sold || 0) - (a.sold || 0))
                          .slice(0, 6)
                          .map((p) => (
                            <tr key={p._id}>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  <img
                                    src={p.images?.[0] || "/placeholder.jpg"}
                                    alt=""
                                    style={{ width: "34px", height: "34px", borderRadius: "6px", objectFit: "cover" }}
                                  />
                                  <div>
                                    <strong>{p.name}</strong>
                                    <small style={{ display: "block", color: "#8d6271" }}>
                                      {p.category?.name || "Len sợi"}
                                    </small>
                                  </div>
                                </div>
                              </td>
                              <td>{money(p.price)}</td>
                              <td>
                                <strong style={{ color: "#059669" }}>{p.sold || 0}</strong>
                              </td>
                              <td>
                                <span style={{ color: (p.stock || 0) < 10 ? "#e11d48" : "inherit", fontWeight: (p.stock || 0) < 10 ? 800 : 500 }}>
                                  {p.stock || 0} cuộn
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* DONUT CHART & STRATEGIC ADVISORY (Preserved & Enhanced) */}
              <div className="admin-card" style={{ marginBottom: "24px" }}>
                <div className="admin-card-header">
                  <div>
                    <h2>📊 Biểu Đồ Tròn Nguồn Doanh Thu & Biên Lãi</h2>
                    <p style={{ margin: "4px 0 0", color: "#8d6271", fontSize: "13.5px" }}>
                      Tách bạch 3 nguồn doanh thu: Len cuộn nhập sỉ, Sản phẩm tiệm tự móc và Nhờ thợ móc gia công.
                    </p>
                  </div>
                  <span className="profit-margin-pill">
                    ✨ Tỷ suất Lãi ròng: {revenueBreakdown.marginPct}%
                  </span>
                </div>

                <div className="profit-analysis-box">
                  <div>
                    <div className="profit-stats-summary">
                      <div className="profit-stat-item revenue">
                        <span>💰 Tổng Doanh Thu Ước Tính</span>
                        <strong>{money(revenueBreakdown.total)}</strong>
                        <small style={{ color: "#8d6271", display: "block", marginTop: "4px", fontSize: "12.5px" }}>
                          (Cả 3 nguồn sản phẩm)
                        </small>
                      </div>
                      <div className="profit-stat-item cogs">
                        <span>📦 Chi Phí Vốn & Tiền Công</span>
                        <strong>{money(revenueBreakdown.totalCost)}</strong>
                        <small style={{ color: "#8d6271", display: "block", marginTop: "4px", fontSize: "12.5px" }}>
                          (Giá vốn len + Công thợ)
                        </small>
                      </div>
                      <div className="profit-stat-item net-profit">
                        <span>📈 Lợi Nhuận Ròng (LÃI LỜI)</span>
                        <strong>{money(revenueBreakdown.netProfit)}</strong>
                        <small style={{ color: "#059669", display: "block", marginTop: "4px", fontSize: "12.5px", fontWeight: 700 }}>
                          Biên lãi: {revenueBreakdown.marginPct}%
                        </small>
                      </div>
                    </div>

                    <div className="strategy-advice-card">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <span style={{ fontSize: "18px" }}>💡</span>
                        <strong style={{ fontSize: "13.5px" }}>
                          CHIẾN LƯỢC KINH DOANH CHO SHOP LEN HANDMADE:
                        </strong>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px" }}>
                        <div>
                          <strong>1. Len cuộn & phụ kiện nhập bán ({revenueBreakdown.pctYarn}% DT):</strong> Giúp tiệm xoay vòng vốn cực nhanh, phát sinh đơn đều đặn mỗi ngày vì người đan móc luôn mua thêm sợi và phụ kiện đi kèm.
                        </div>
                        <div>
                          <strong>2. Tiệm tự móc thành phẩm ({revenueBreakdown.pctSelf}% DT):</strong> Tỷ suất lợi nhuận cao nhất (~75%), dùng để chụp ảnh, quay video TikTok/Reels khẳng định tay nghề của Tiệm.
                        </div>
                        <div>
                          <strong>3. Nhờ thợ móc gia công ({revenueBreakdown.pctOutsource}% DT):</strong> Đòn bẩy mở rộng quy mô vào các dịp lễ (20/10, Valentine, 8/3, Giáng sinh) trả công thợ theo sản phẩm mà không lo quá tải.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SVG Donut Chart */}
                  <div className="donut-container">
                    <div className="donut-svg-wrap">
                      <svg viewBox="0 0 160 160" width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="80" cy="80" r="60" fill="transparent" stroke="#ffe4e6" strokeWidth="22" />
                        <circle
                          cx="80"
                          cy="80"
                          r="60"
                          fill="transparent"
                          stroke="#f43f5e"
                          strokeWidth="22"
                          strokeDasharray={`${(revenueBreakdown.pctYarn * 377) / 100} 377`}
                          strokeDashoffset="0"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="60"
                          fill="transparent"
                          stroke="#ec4899"
                          strokeWidth="22"
                          strokeDasharray={`${(revenueBreakdown.pctSelf * 377) / 100} 377`}
                          strokeDashoffset={`-${(revenueBreakdown.pctYarn * 377) / 100}`}
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="60"
                          fill="transparent"
                          stroke="#8b5cf6"
                          strokeWidth="22"
                          strokeDasharray={`${(revenueBreakdown.pctOutsource * 377) / 100} 377`}
                          strokeDashoffset={`-${((revenueBreakdown.pctYarn + revenueBreakdown.pctSelf) * 377) / 100}`}
                        />
                      </svg>
                      <div className="donut-center-label">
                        <strong>{revenueBreakdown.marginPct}%</strong>
                        <small>Lãi ròng</small>
                      </div>
                    </div>

                    <div className="donut-legend">
                      <div className="legend-item">
                        <span className="legend-color" style={{ background: "#f43f5e" }} />
                        <span>Len cuộn nhập sỉ: <strong>{revenueBreakdown.pctYarn}%</strong></span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color" style={{ background: "#ec4899" }} />
                        <span>Tiệm tự móc mẫu: <strong>{revenueBreakdown.pctSelf}%</strong></span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color" style={{ background: "#8b5cf6" }} />
                        <span>Thợ gia công: <strong>{revenueBreakdown.pctOutsource}%</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ========================================================
              TAB 2: QUẢN LÝ ĐƠN HÀNG (ORDERS) - ENHANCED
          ======================================================== */}
          {activeTab === "orders" && (
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>📦 Quản Lý {filteredOrders.length} / {data.orders.length} Đơn Hàng</h2>
                  <p style={{ margin: "3px 0 0", color: "#8d6271", fontSize: "12.5px" }}>
                    Thời gian chuẩn Việt Nam (UTC+7), kiểm tra tiến trình đóng gói và xuất phiếu giao shipper
                  </p>
                </div>
                <div className="admin-card-actions" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="admin-btn-outline"
                    onClick={exportShipperOrdersExcel}
                    style={{ background: "#ecfdf5", color: "#065f46", borderColor: "#a7f3d0", fontWeight: 700 }}
                    title="Xuất bảng kê danh sách giao hàng cho bưu tá COD"
                  >
                    📥 Bảng Kê Shipper COD
                  </button>
                  <button
                    type="button"
                    className="admin-btn-outline"
                    onClick={exportFinancialReportExcel}
                    style={{ background: "#fdf2f8", color: "#be123c", borderColor: "#fbcfe8", fontWeight: 700 }}
                  >
                    📊 Báo Cáo Doanh Thu
                  </button>
                  <button
                    type="button"
                    className="admin-btn-primary"
                    onClick={() => loadAdmin(false)}
                  >
                    🔄 Làm Mới
                  </button>
                </div>
              </div>

              {/* DEDICATED DATE FILTER PANEL (XEM LẠI CÁC NGÀY TRƯỚC) */}
              <div className="admin-date-filter-panel">
                <div className="admin-date-filter-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "20px" }}>📅</span>
                    <div>
                      <strong style={{ fontSize: "16px", color: "#831843", display: "block" }}>
                        BỘ LỌC THỜI GIAN & NGÀY ĐẶT HÀNG (XEM LẠI CÁC NGÀY TRƯỚC)
                      </strong>
                      <span style={{ fontSize: "13.5px", color: "#9d174d" }}>
                        Bấm các nút mốc nhanh hoặc chọn trực tiếp ngày bất kỳ bên dưới để tra cứu đơn cũ
                      </span>
                    </div>
                  </div>

                  {(orderDatePreset !== "all" || orderSingleDate || orderStartDate || orderEndDate) && (
                    <button
                      type="button"
                      className="admin-btn-outline"
                      style={{ fontSize: "13.5px", padding: "6px 16px", color: "#be123c", borderColor: "#fecdd3", background: "#ffffff", fontWeight: 700 }}
                      onClick={() => {
                        setOrderDatePreset("all");
                        setOrderSingleDate("");
                        setOrderStartDate("");
                        setOrderEndDate("");
                      }}
                    >
                      ✕ Xóa lọc ngày (Xem tất cả)
                    </button>
                  )}
                </div>

                {/* Hàng 1: Các nút mốc nhanh 1 chạm */}
                <div className="admin-date-preset-chips">
                  {[
                    { id: "all", label: "📅 Tất cả ngày" },
                    { id: "today", label: "⭐ Hôm nay" },
                    { id: "yesterday", label: "⏪ Hôm qua (Xem ngày trước)" },
                    { id: "7days", label: "📊 7 ngày qua" },
                    { id: "30days", label: "🗓️ 30 ngày qua" },
                    { id: "thismonth", label: "📅 Tháng này" },
                    { id: "lastmonth", label: "⏮️ Tháng trước" },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`admin-date-chip ${orderDatePreset === preset.id && !orderSingleDate ? "active" : ""}`}
                      onClick={() => {
                        setOrderDatePreset(preset.id);
                        setOrderSingleDate("");
                        setOrderStartDate("");
                        setOrderEndDate("");
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Hàng 2: Chọn ngày cụ thể hoặc khoảng ngày (Luôn hiển thị rõ ràng) */}
                <div className="admin-date-picker-row">
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <label style={{ fontSize: "14px", fontWeight: 800, color: "#831843", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>🔍</span> Xem riêng 1 ngày cụ thể:
                      <input
                        type="date"
                        className="admin-date-input"
                        value={orderSingleDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOrderSingleDate(val);
                          if (val) {
                            setOrderDatePreset("single");
                            setOrderStartDate("");
                            setOrderEndDate("");
                          }
                        }}
                        title="Chọn ngày cụ thể bất kỳ trong quá khứ để xem các đơn đã đặt"
                      />
                    </label>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: "#831843" }}>
                      Hoặc xem khoảng ngày:
                    </span>
                    <label style={{ fontSize: "13.5px", display: "flex", alignItems: "center", gap: "8px" }}>
                      Từ ngày:
                      <input
                        type="date"
                        className="admin-date-input"
                        value={orderStartDate}
                        onChange={(e) => {
                          setOrderStartDate(e.target.value);
                          setOrderDatePreset("custom");
                          setOrderSingleDate("");
                        }}
                      />
                    </label>
                    <label style={{ fontSize: "13.5px", display: "flex", alignItems: "center", gap: "8px" }}>
                      Đến ngày:
                      <input
                        type="date"
                        className="admin-date-input"
                        value={orderEndDate}
                        onChange={(e) => {
                          setOrderEndDate(e.target.value);
                          setOrderDatePreset("custom");
                          setOrderSingleDate("");
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Banner hiển thị trạng thái lọc ngày đang kích hoạt */}
              {(orderDateFilterLabel || orderDatePreset !== "all") && (
                <div className="admin-date-active-banner">
                  <div>
                    <span>🔔 Đang lọc đơn hàng: </span>
                    <strong style={{ fontSize: "15px", textDecoration: "underline" }}>
                      {orderDateFilterLabel || "Theo mốc đã chọn"}
                    </strong>
                    <span style={{ marginLeft: "14px", color: "#475569", fontWeight: 600 }}>
                      (Tìm thấy: <strong>{filteredOrders.length}</strong> đơn • Doanh thu:{" "}
                      <strong style={{ color: "#e11d48" }}>
                        {money(filteredOrders.reduce((s, o) => s + (o.status !== "cancelled" ? o.totalAmount : 0), 0))}
                      </strong>)
                    </span>
                  </div>
                  <button
                    type="button"
                    className="admin-btn-outline"
                    style={{ fontSize: "13px", padding: "6px 14px", background: "#ffffff" }}
                    onClick={() => {
                      setOrderDatePreset("all");
                      setOrderSingleDate("");
                      setOrderStartDate("");
                      setOrderEndDate("");
                    }}
                  >
                    ✕ Đặt lại (Xem tất cả)
                  </button>
                </div>
              )}

              {/* Secondary Filter: Search, Payment Status, Payment Method, Status Pills */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #fce7f3",
                  borderRadius: "12px",
                  padding: "14px",
                  marginBottom: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {/* Search & Payment Dropdowns */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
                  <input
                    className="admin-search-input"
                    style={{ width: "100%" }}
                    placeholder="🔍 Tìm mã đơn, mã vận đơn, tên khách, SĐT..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />

                  {/* Payment status filter */}
                  <select
                    className="order-status-select"
                    style={{ width: "100%", padding: "8px 12px", background: "#fff", borderColor: "#fbcfe8" }}
                    value={orderPaymentFilter}
                    onChange={(e) => setOrderPaymentFilter(e.target.value)}
                  >
                    <option value="all">💳 Tất cả trạng thái thanh toán</option>
                    <option value="paid">✅ Đã thanh toán</option>
                    <option value="unpaid">⏳ Chưa thanh toán</option>
                  </select>

                  {/* Payment method filter */}
                  <select
                    className="order-status-select"
                    style={{ width: "100%", padding: "8px 12px", background: "#fff", borderColor: "#fbcfe8" }}
                    value={orderPaymentMethodFilter}
                    onChange={(e) => setOrderPaymentMethodFilter(e.target.value)}
                  >
                    <option value="all">💵 Tất cả phương thức thanh toán</option>
                    <option value="COD">💵 Thu hộ COD</option>
                    <option value="VIETQR">💳 Chuyển khoản VietQR</option>
                  </select>
                </div>

                {/* Status Pills */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingTop: "6px", borderTop: "1px solid #fce7f3" }}>
                  {[
                    { id: "all", label: "Tất cả", count: data.orders.length },
                    { id: "pending", label: "⏳ Chờ xác nhận", count: pendingOrders.length },
                    { id: "confirmed", label: "🏪 Đã xác nhận", count: confirmedOrders.length },
                    { id: "shipping", label: "🚚 Đang giao", count: shippingOrders.length },
                    { id: "delivered", label: "✅ Đã giao", count: deliveredOrders.length },
                    { id: "cancelled", label: "❌ Đã hủy", count: cancelledOrders.length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setOrderFilter(tab.id)}
                      style={{
                        border: "0",
                        background: orderFilter === tab.id ? "#f43f5e" : "#fff1f5",
                        color: orderFilter === tab.id ? "#fff" : "#be123c",
                        padding: "6px 14px",
                        borderRadius: "16px",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã đơn & Vận đơn</th>
                      <th>Khách hàng & SĐT</th>
                      <th>Ngày đặt (UTC+7)</th>
                      <th>Mặt hàng</th>
                      <th>Tổng tiền</th>
                      <th>Thanh toán</th>
                      <th>Trạng thái đơn</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const isPaid = order.paymentStatus === "paid";
                      return (
                        <tr key={order._id}>
                          <td>
                            <strong style={{ fontSize: "15.5px" }}>{order.trackingCode || `#${order._id.slice(-6).toUpperCase()}`}</strong>
                            <small style={{ display: "block", color: "#94a3b8", fontSize: "12px", marginTop: "2px" }}>
                              ID: {order._id.slice(-6)}
                            </small>
                          </td>
                          <td>
                            <strong style={{ fontSize: "15.5px" }}>{order.customerName}</strong>
                            <small style={{ display: "block", color: "#8d6271", fontSize: "13px", marginTop: "2px" }}>
                              📱 {order.phone}
                            </small>
                            <small
                              style={{
                                display: "block",
                                color: "#8d6271",
                                maxWidth: "260px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontSize: "13px",
                                marginTop: "2px",
                              }}
                              title={order.address}
                            >
                              📍 {order.address}
                            </small>
                          </td>
                          <td>
                            <strong style={{ fontSize: "14.5px" }}>{formatVnDateTime(order.createdAt)}</strong>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, fontSize: "15px" }}>{order.items?.length || 0} món</span>
                            <small
                              style={{
                                display: "block",
                                color: "#64748b",
                                maxWidth: "240px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontSize: "13px",
                                marginTop: "2px",
                              }}
                            >
                              {(order.items || []).map((i) => i.name).join(", ")}
                            </small>
                          </td>
                          <td>
                            <strong style={{ color: "#e11d48", fontSize: "16.5px" }}>
                              {money(order.totalAmount)}
                            </strong>
                          </td>
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span
                                className="status-pill-badge"
                                style={{
                                  background: order.paymentMethod === "COD" ? "#fdf2f8" : "#eff6ff",
                                  color: order.paymentMethod === "COD" ? "#be123c" : "#1d4ed8",
                                  fontSize: "13px",
                                  padding: "6px 12px",
                                }}
                              >
                                {order.paymentMethod === "COD" ? "💵 Thu hộ COD" : "💳 VietQR"}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleOrderPaymentStatus(order)}
                                style={{
                                  border: "1.5px solid",
                                  borderRadius: "10px",
                                  padding: "5px 10px",
                                  fontSize: "12.5px",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  background: isPaid ? "#ecfdf5" : "#fff1f2",
                                  borderColor: isPaid ? "#a7f3d0" : "#fecdd3",
                                  color: isPaid ? "#047857" : "#be123c",
                                }}
                                title="Bấm để chuyển đổi giữa Đã thanh toán / Chưa thanh toán"
                              >
                                {isPaid ? "✅ Đã thanh toán" : "⏳ Chưa thanh toán"}
                              </button>
                            </div>
                          </td>
                          <td>
                            <select
                              className="order-status-select"
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            >
                              {Object.entries(statusLabels).map(([key, label]) => (
                                <option key={key} value={key}>
                                  {statusIcons[key]} {label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                type="button"
                                className="admin-btn-outline"
                                onClick={() => showOrder(order)}
                              >
                                👁️ Chi tiết
                              </button>
                              <button
                                type="button"
                                className="admin-btn-outline"
                                onClick={() => setShippingLabelOrder(order)}
                                style={{ background: "#fff1f2", color: "#e11d48", borderColor: "#fecdd3", fontWeight: 700 }}
                                title="In phiếu gửi hàng chuẩn bưu tá COD"
                              >
                                🏷️ Tem
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan="8" style={{ textAlign: "center", padding: "40px" }}>
                          Không có đơn hàng nào khớp với bộ lọc hiện tại.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: SẢN PHẨM & KHO (PRODUCTS)
          ======================================================== */}
          {activeTab === "products" && (
            <>
              {/* Product Form */}
              <div className="admin-card" style={{ marginBottom: "24px" }}>
                <div className="admin-card-header">
                  <div>
                    <h2>{editingProductId ? "✏️ Sửa Thông Tin Sản Phẩm Len" : "✨ Thêm Mới Sản Phẩm Vào Kho Len"}</h2>
                    <p style={{ margin: "4px 0 0", color: "#8d6271", fontSize: "14.5px" }}>
                      Cập nhật giá bán, giá vốn nhập hàng, tồn kho và danh mục hiển thị
                    </p>
                  </div>
                  {editingProductId && (
                    <button type="button" className="admin-btn-outline" onClick={resetProductForm}>
                      ✕ Hủy chỉnh sửa
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveProduct} className="admin-product-grid-form">
                  <div className="admin-form-group">
                    <label>Tên sản phẩm len / dụng cụ (*)</label>
                    <input
                      required
                      placeholder="VD: Len Milk Cotton 50g Bò Cuộn Nhập Khẩu"
                      value={productForm.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProductForm((prev) => ({
                          ...prev,
                          name: val,
                          slug: editingProductId ? prev.slug : slugify(val),
                        }));
                      }}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Đường dẫn thân thiện (Slug)</label>
                    <input
                      placeholder="len-milk-cotton-50g-bo"
                      value={productForm.slug}
                      onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Giá bán niêm yết (VNĐ) (*)</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="VD: 35000"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Giá vốn nhập hàng (VNĐ)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="VD: 18000"
                      value={productForm.costPrice}
                      onChange={(e) => setProductForm({ ...productForm, costPrice: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Số lượng tồn kho (Cuộn/Bộ/Cành) (*)</label>
                    <input
                      required
                      type="number"
                      min="0"
                      placeholder="VD: 100"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Nguồn gốc & Phân loại sản phẩm</label>
                    <select
                      value={productForm.productType}
                      onChange={(e) => setProductForm({ ...productForm, productType: e.target.value })}
                    >
                      <option value="yarn_retail">🧶 Len cuộn & Phụ kiện (Nhập bán sỉ/lẻ)</option>
                      <option value="self_made">🌸 Tiệm tự móc (Thành phẩm)</option>
                      <option value="outsourced">🪡 Nhờ thợ móc gia công (Thành phẩm)</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Danh mục</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {(data.categories || []).map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Thương hiệu / Xuất xứ</label>
                    <input
                      placeholder="VD: Milk Bò, Tulip Japan, Sene Handmade"
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Hình ảnh sản phẩm</label>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                      <input
                        style={{ flex: 1 }}
                        placeholder="Dán link ảnh https://... hoặc tải ảnh từ máy tính bên cạnh"
                        value={productForm.images}
                        onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                      />
                      <label className="admin-btn-outline" style={{ cursor: "pointer", margin: 0 }}>
                        📁 Chọn ảnh từ máy
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={uploadProductImage}
                        />
                      </label>
                    </div>
                    {uploadingImage && <small style={{ color: "#be123c" }}>⏳ {uploadMessage}</small>}
                    {productForm.images && (
                      <div style={{ marginTop: "14px" }}>
                        <img
                          src={productForm.images}
                          alt="preview"
                          style={{ width: "96px", height: "96px", borderRadius: "14px", objectFit: "cover", border: "2px solid #fbcfe8", boxShadow: "0 4px 14px rgba(244, 114, 182, 0.15)" }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Mô tả chi tiết sản phẩm</label>
                    <textarea
                      rows="3"
                      placeholder="Thông tin sợi, trọng lượng cuộn len, kích thước kim móc phù hợp..."
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    />
                  </div>

                  <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "6px" }}>
                    {editingProductId && (
                      <button type="button" className="admin-btn-outline" onClick={resetProductForm}>
                        ✕ Hủy
                      </button>
                    )}
                    <button type="submit" className="admin-btn-primary">
                      {editingProductId ? "💾 Lưu Cập Nhật Sản Phẩm" : "✨ Thêm Vào Kho Bán Hàng"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Products List & Inventory Management */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h2>📦 Quản Lý Kho Hàng ({(filteredProducts || []).length} sản phẩm)</h2>
                    <p style={{ margin: "4px 0 0", color: "#8d6271", fontSize: "14.5px" }}>
                      Kiểm soát tồn kho, cập nhật giá nhanh và cảnh báo biên lợi nhuận
                    </p>
                  </div>
                  <div className="admin-card-actions">
                    <button
                      type="button"
                      className="admin-btn-outline"
                      onClick={exportProductsExcel}
                      style={{ background: "#ecfdf5", color: "#065f46", borderColor: "#a7f3d0", fontWeight: 700 }}
                    >
                      📥 Xuất File Kho Excel
                    </button>
                    <button
                      type="button"
                      className="admin-btn-primary"
                      onClick={() => openCreateImport()}
                    >
                      📥 Lập Phiếu Nhập Hàng
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "22px" }}>
                  <input
                    className="admin-search-input"
                    placeholder="🔍 Tìm tên sản phẩm, thương hiệu..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    style={{ flex: 1, minWidth: "260px" }}
                  />
                  <select
                    className="order-status-select"
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    style={{ minWidth: "200px" }}
                  >
                    <option value="all">Tất cả danh mục</option>
                    {(data.categories || []).map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="order-status-select"
                    value={profitFilter}
                    onChange={(e) => setProfitFilter(e.target.value)}
                    style={{ minWidth: "210px" }}
                  >
                    <option value="all">Tất cả lợi nhuận</option>
                    <option value="profit">📈 Đang có lãi</option>
                    <option value="loss">📉 Cảnh báo bán lỗ</option>
                    <option value="nocost">⚠️ Chưa nhập giá vốn</option>
                  </select>
                </div>

                {/* Table */}
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Danh mục & Phân loại</th>
                        <th>Giá bán</th>
                        <th>Giá vốn</th>
                        <th>Lãi gộp</th>
                        <th>Tồn kho</th>
                        <th>Đã bán</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p) => {
                        const price = p.price || 0;
                        const cost = p.costPrice || 0;
                        const profit = price - cost;
                        const margin = price > 0 && cost > 0 ? Math.round((profit / price) * 100) : 0;
                        const isLow = (p.stock || 0) < 10;

                        return (
                          <tr key={p._id}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                <img
                                  src={p.images?.[0] || "/placeholder.jpg"}
                                  alt=""
                                  className="admin-product-thumb"
                                  style={{
                                    width: "58px",
                                    height: "58px",
                                    borderRadius: "12px",
                                    objectFit: "cover",
                                    border: isLow ? "2.5px solid #f43f5e" : "1.5px solid #fce7f3",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => p.images?.[0] && setPreviewImageModal(p.images[0])}
                                />
                                <div>
                                  <strong style={{ fontSize: "15.5px", color: "#2c0e17" }}>{p.name}</strong>
                                  <small style={{ display: "block", color: "#94a3b8", fontSize: "12.5px", marginTop: "3px" }}>
                                    Slug: {p.slug}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, fontSize: "15px" }}>{p.category?.name || "Len sợi"}</span>
                              <small style={{ display: "block", color: "#8d6271", fontSize: "13px", marginTop: "3px" }}>
                                {productTypeLabels[p.productType] || "Nhập bán"}
                              </small>
                            </td>
                            <td>
                              <strong style={{ color: "#be123c", fontSize: "16.5px" }}>{money(price)}</strong>
                            </td>
                            <td>{cost > 0 ? <span style={{ fontSize: "15px", fontWeight: 700 }}>{money(cost)}</span> : <em style={{ color: "#9ca3af", fontSize: "14px" }}>Chưa nhập</em>}</td>
                            <td>
                              {cost > 0 ? (
                                <span style={{ color: profit >= 0 ? "#059669" : "#dc2626", fontWeight: 800, fontSize: "15px" }}>
                                  {profit >= 0 ? `+${money(profit)}` : `-${money(Math.abs(profit))}`}
                                  <small style={{ display: "block", fontSize: "12px", marginTop: "2px" }}>({margin}%)</small>
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td>
                              <span
                                className="status-pill-badge"
                                style={{
                                  background: isLow ? "#fee2e2" : "#ecfdf5",
                                  color: isLow ? "#b91c1c" : "#047857",
                                  fontWeight: 800,
                                  fontSize: "13.5px",
                                  padding: "7px 14px",
                                }}
                              >
                                {isLow && "⚠️ "}
                                {p.stock || 0} cuộn
                              </span>
                            </td>
                            <td>
                              <strong style={{ color: "#047857", fontSize: "16px" }}>{p.sold || 0}</strong>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                <button
                                  type="button"
                                  className="admin-btn-outline"
                                  style={{ padding: "6px 12px", fontSize: "13.5px" }}
                                  onClick={() =>
                                    setQuickPriceModal({
                                      open: true,
                                      product: p,
                                      price: String(p.price || ""),
                                      costPrice: String(p.costPrice || ""),
                                    })
                                  }
                                  title="Cập nhật nhanh giá bán & giá vốn"
                                >
                                  💰 Giá
                                </button>
                                <button
                                  type="button"
                                  className="admin-btn-outline"
                                  style={{ padding: "6px 12px", fontSize: "13.5px", color: "#047857", borderColor: "#a7f3d0" }}
                                  onClick={() =>
                                    setQuickStockModal({
                                      open: true,
                                      product: p,
                                      addStock: 20,
                                    })
                                  }
                                  title="Nhập thêm hàng nhanh"
                                >
                                  ⚡ +Kho
                                </button>
                                <button
                                  type="button"
                                  className="admin-btn-outline"
                                  style={{ padding: "6px 12px", fontSize: "13.5px" }}
                                  onClick={() => editProduct(p)}
                                >
                                  ✏️ Sửa
                                </button>
                                <button
                                  type="button"
                                  className="admin-btn-outline"
                                  style={{ padding: "6px 12px", fontSize: "13.5px", color: "#dc2626", borderColor: "#fca5a5" }}
                                  onClick={() => deleteProduct(p._id)}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredProducts.length === 0 && (
                        <tr>
                          <td colSpan="8" style={{ textAlign: "center", padding: "40px" }}>
                            Không tìm thấy sản phẩm nào phù hợp.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ========================================================
              TAB 4: NHẬP HÀNG & TỒN KHO (IMPORTS)
          ======================================================== */}
          {activeTab === "imports" && (
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>📥 Lịch Sử Nhập Hàng & Phiếu Nhập Kho ({(data.imports || []).length})</h2>
                  <p style={{ margin: "2px 0 0", color: "#8d6271", fontSize: "12.5px" }}>
                    Theo dõi các lần nhập len, tự động cộng tồn kho và in chứng từ giao nhận
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => openCreateImport()}
                >
                  ➕ Lập Phiếu Nhập Kho Mới
                </button>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <input
                  className="admin-search-input"
                  style={{ maxWidth: "400px" }}
                  placeholder="🔍 Tìm mã phiếu nhập, nhà cung cấp..."
                  value={importSearch}
                  onChange={(e) => setImportSearch(e.target.value)}
                />
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã phiếu</th>
                      <th>Nhà cung cấp & SĐT</th>
                      <th>Ngày lập (UTC+7)</th>
                      <th>Sản phẩm nhập</th>
                      <th>Tổng tiền vốn</th>
                      <th>Người lập</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredImports.map((imp) => (
                      <tr key={imp._id}>
                        <td>
                          <strong>#{imp.code}</strong>
                        </td>
                        <td>
                          <strong>{imp.supplierName}</strong>
                          <small style={{ display: "block", color: "#8d6271" }}>
                            📱 {imp.supplierPhone || "—"}
                          </small>
                        </td>
                        <td>{formatVnDateTime(imp.createdAt)}</td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{imp.items?.length || 0} mặt hàng</span>
                          <small style={{ display: "block", color: "#64748b" }}>
                            +{(imp.items || []).reduce((s, i) => s + (i.quantity || 0), 0)} sản phẩm
                          </small>
                        </td>
                        <td>
                          <strong style={{ color: "#047857", fontSize: "14px" }}>
                            {money(imp.totalAmount)}
                          </strong>
                        </td>
                        <td>{imp.importedBy || "Admin"}</td>
                        <td>
                          <button
                            type="button"
                            className="admin-btn-outline"
                            onClick={() => setSelectedImportReceipt(imp)}
                          >
                            👁️ Xem & In Phiếu
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredImports.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                          Chưa có phiếu nhập hàng nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 5: KHÁCH HÀNG (CUSTOMERS) - WITH ORDER HISTORY
          ======================================================== */}
          {activeTab === "customers" && (
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>👥 Danh Sách Khách Hàng Thành Viên ({(data.customers || []).length})</h2>
                  <p style={{ margin: "2px 0 0", color: "#8d6271", fontSize: "12.5px" }}>
                    Xem chi tiết lịch sử mua hàng, tổng chi tiêu và hỗ trợ khôi phục mật khẩu
                  </p>
                </div>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Khách hàng</th>
                      <th>Email</th>
                      <th>Số điện thoại</th>
                      <th>Số đơn đã mua</th>
                      <th>Tổng chi tiêu</th>
                      <th>Đơn gần nhất</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.customers || []).map((c) => (
                      <tr key={c._id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div
                              style={{
                                width: "34px",
                                height: "34px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #f43f5e, #fb7185)",
                                color: "#fff",
                                display: "grid",
                                placeItems: "center",
                                fontWeight: 800,
                                fontSize: "12px",
                              }}
                            >
                              {c.name ? c.name[0].toUpperCase() : "U"}
                            </div>
                            <strong>{c.name}</strong>
                          </div>
                        </td>
                        <td>{c.email}</td>
                        <td>{c.phone || <em>(Chưa có)</em>}</td>
                        <td>
                          <span
                            className="status-pill-badge"
                            style={{ background: "#ecfdf5", color: "#047857", fontWeight: 700 }}
                          >
                            {c.orderCount || 0} đơn
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: "#e11d48", fontSize: "14px" }}>
                            {money(c.totalSpent)}
                          </strong>
                        </td>
                        <td>
                          {c.lastOrderAt ? formatVnDateTime(c.lastOrderAt) : "Chưa đặt"}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              type="button"
                              className="admin-btn-outline"
                              style={{ fontSize: "12px", padding: "4px 10px", color: "#047857", borderColor: "#a7f3d0", whiteSpace: "nowrap" }}
                              onClick={() => openCustomerHistory(c)}
                            >
                              👁️ Lịch sử mua
                            </button>
                            <button
                              type="button"
                              className="admin-btn-outline"
                              style={{ fontSize: "12px", padding: "4px 10px", color: "#be123c", borderColor: "#fecdd3", whiteSpace: "nowrap" }}
                              onClick={() =>
                                setResetPasswordModal({
                                  open: true,
                                  customer: c,
                                  newPassword: "LenXinh@" + Math.floor(1000 + Math.random() * 9000),
                                  resultMsg: "",
                                  errorMsg: "",
                                })
                              }
                            >
                              🔑 Cấp lại MK
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(data.customers || []).length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                          Chưa có khách hàng nào đăng ký.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 6: NHÀ CUNG CẤP (SUPPLIERS)
          ======================================================== */}
          {activeTab === "suppliers" && (
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>🏢 Danh Sách Nhà Cung Cấp Len & Phụ Kiện ({(data.suppliers || []).length})</h2>
                  <p style={{ margin: "2px 0 0", color: "#8d6271", fontSize: "12.5px" }}>
                    Quản lý nguồn sỉ len sợi, xưởng kim móc và công nợ mua hàng
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() =>
                    setSupplierModal({
                      open: true,
                      isEdit: false,
                      supplierId: null,
                      form: {
                        name: "",
                        phone: "",
                        address: "",
                        supplyItems: "",
                        rating: 5,
                        totalImported: 0,
                        notes: "",
                      },
                    })
                  }
                >
                  ➕ Thêm Nhà Cung Cấp Mới
                </button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nhà cung cấp</th>
                      <th>Số điện thoại</th>
                      <th>Địa chỉ</th>
                      <th>Mặt hàng chuyên sỉ</th>
                      <th>Tổng tiền đã nhập</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.suppliers || []).map((sup) => (
                      <tr key={sup._id}>
                        <td>
                          <strong>{sup.name}</strong>
                          <div style={{ fontSize: "12px", color: "#f59e0b" }}>
                            {"★".repeat(sup.rating || 5)}
                          </div>
                        </td>
                        <td>📱 {sup.phone}</td>
                        <td>{sup.address}</td>
                        <td>
                          <span style={{ fontSize: "12.5px", color: "#475569" }}>
                            {sup.supplyItems}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: "#047857" }}>{money(sup.totalImported)}</strong>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              type="button"
                              className="admin-btn-outline"
                              style={{ padding: "4px 8px", fontSize: "11.5px" }}
                              onClick={() =>
                                setSupplierModal({
                                  open: true,
                                  isEdit: true,
                                  supplierId: sup._id,
                                  form: { ...sup },
                                })
                              }
                            >
                              ✏️ Sửa
                            </button>
                            <button
                              type="button"
                              className="admin-btn-outline"
                              style={{ padding: "4px 8px", fontSize: "11.5px", color: "#dc2626" }}
                              onClick={() => handleDeleteSupplier(sup._id, sup.name)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 7: THỢ MÓC & NHÂN SỰ (STAFF)
          ======================================================== */}
          {activeTab === "staff" && (
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>🪡 Thợ Móc Thủ Công & Nhân Viên ({(data.staff || []).length})</h2>
                  <p style={{ margin: "2px 0 0", color: "#8d6271", fontSize: "12.5px" }}>
                    Tính tiền công theo sản phẩm hoàn thiện (hoa len, thú bông, đóng gói)
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() =>
                    setStaffModal({
                      open: true,
                      isEdit: false,
                      staffId: null,
                      form: {
                        name: "",
                        phone: "",
                        role: "Thợ gia công hoa len",
                        pieceRate: 20000,
                        completedCount: 0,
                        totalPaid: 0,
                        skills: "",
                        status: "active",
                        notes: "",
                      },
                    })
                  }
                >
                  ➕ Thêm Thợ / Nhân Viên Mới
                </button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Họ tên & SĐT</th>
                      <th>Chức vụ / Chuyên môn</th>
                      <th>Tiền công / SP</th>
                      <th>Đã hoàn thành</th>
                      <th>Đã thanh toán công</th>
                      <th>Ghi nhận nhanh</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.staff || []).map((st) => (
                      <tr key={st._id}>
                        <td>
                          <strong>{st.name}</strong>
                          <small style={{ display: "block", color: "#8d6271" }}>
                            📱 {st.phone}
                          </small>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{st.role}</span>
                          <small style={{ display: "block", color: "#64748b" }}>
                            {st.skills}
                          </small>
                        </td>
                        <td>
                          <strong style={{ color: "#be123c" }}>{money(st.pieceRate)}/món</strong>
                        </td>
                        <td>
                          <span className="status-pill-badge" style={{ background: "#ecfdf5", color: "#047857", fontWeight: 700 }}>
                            {st.completedCount || 0} sản phẩm
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: "#047857" }}>{money(st.totalPaid)}</strong>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button
                              type="button"
                              className="admin-btn-outline"
                              style={{ padding: "3px 7px", fontSize: "11px", color: "#047857" }}
                              onClick={() => handleRecordStaffPieces(st, 5)}
                            >
                              +5 món
                            </button>
                            <button
                              type="button"
                              className="admin-btn-outline"
                              style={{ padding: "3px 7px", fontSize: "11px", color: "#047857" }}
                              onClick={() => handleRecordStaffPieces(st, 10)}
                            >
                              +10 món
                            </button>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              type="button"
                              className="admin-btn-outline"
                              style={{ padding: "3px 8px", fontSize: "11.5px" }}
                              onClick={() =>
                                setStaffModal({
                                  open: true,
                                  isEdit: true,
                                  staffId: st._id,
                                  form: { ...st },
                                })
                              }
                            >
                              ✏️ Sửa
                            </button>
                            <button
                              type="button"
                              className="admin-btn-outline"
                              style={{ padding: "3px 8px", fontSize: "11.5px", color: "#dc2626" }}
                              onClick={() => handleDeleteStaff(st._id, st.name)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 8: ĐƠN MÓC THEO MẪU (CUSTOM-ORDERS) - COMPLETED
          ======================================================== */}
          {activeTab === "custom-orders" && (
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>🧶 Đơn Đặt Móc Theo Mẫu Riêng ({(data.customOrders || []).length})</h2>
                  <p style={{ margin: "2px 0 0", color: "#8d6271", fontSize: "12.5px" }}>
                    Khách gửi ảnh mẫu thú bông, bó hoa len; xem ảnh mẫu, chốt giá và liên hệ Zalo 1 chạm
                  </p>
                </div>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ảnh mẫu</th>
                      <th>Khách hàng & SĐT</th>
                      <th>Yêu cầu & Màu sắc</th>
                      <th>Hạn nhận hàng</th>
                      <th>Báo giá (VNĐ)</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.customOrders || []).map((co) => (
                      <tr key={co._id}>
                        <td>
                          {co.sampleImage ? (
                            <img
                              src={co.sampleImage}
                              alt=""
                              style={{ width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover", cursor: "pointer", border: "1.5px solid #fbcfe8" }}
                              onClick={() => setPreviewImageModal(co.sampleImage)}
                              title="Bấm để xem ảnh mẫu phóng to"
                            />
                          ) : (
                            <span style={{ color: "#9ca3af" }}>Không có ảnh</span>
                          )}
                        </td>
                        <td>
                          <strong>{co.customerName}</strong>
                          <small style={{ display: "block", color: "#8d6271" }}>
                            📱 {co.phone}
                          </small>
                          <small style={{ display: "block", color: "#64748b", maxWidth: "160px" }}>
                            📍 {co.address || "—"}
                          </small>
                        </td>
                        <td>
                          <div style={{ maxWidth: "200px" }}>
                            <strong>{co.description || co.productName || "Đơn móc len riêng"}</strong>
                            {co.colorPreference && (
                              <small style={{ display: "block", color: "#be123c", marginTop: "2px" }}>
                                🎨 Màu: {co.colorPreference}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>{co.expectedDate ? formatVnDateTime(co.expectedDate) : "Càng sớm càng tốt"}</td>
                        <td>
                          <strong style={{ color: "#e11d48", fontSize: "14px" }}>
                            {co.quotedPrice ? money(co.quotedPrice) : "Chưa báo giá"}
                          </strong>
                        </td>
                        <td>
                          <select
                            className="order-status-select"
                            value={co.status || "pending"}
                            onChange={(e) => updateCustomOrderStatus(co._id, e.target.value, co.quotedPrice, co.adminNotes)}
                          >
                            <option value="pending">⏳ Chờ duyệt</option>
                            <option value="quoted">💬 Đã báo giá</option>
                            <option value="crafting">🪡 Đang đan móc</option>
                            <option value="completed">✅ Đã hoàn thành</option>
                            <option value="cancelled">❌ Đã hủy</option>
                          </select>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            {co.phone && (
                              <a
                                href={`https://zalo.me/${co.phone.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="admin-btn-outline"
                                style={{ background: "#eff6ff", color: "#1d4ed8", borderColor: "#bfdbfe", textDecoration: "none", fontSize: "12px", padding: "4px 8px" }}
                              >
                                💬 Zalo
                              </a>
                            )}
                            <button
                              type="button"
                              className="admin-btn-outline"
                              style={{ color: "#dc2626", borderColor: "#fca5a5", fontSize: "12px", padding: "4px 8px" }}
                              onClick={() => deleteCustomOrder(co._id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(data.customOrders || []).length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                          Chưa có yêu cầu đặt móc len theo mẫu nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 9: BÁO CÁO DOANH THU (REPORTS)
          ======================================================== */}
          {activeTab === "reports" && (
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>📈 Báo Cáo Doanh Thu Theo Ngày & Mặt Hàng</h2>
                  <p style={{ margin: "2px 0 0", color: "#8d6271", fontSize: "12.5px" }}>
                    Đối soát thu chi, xuất file excel và kiểm tra hiệu quả bán hàng
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={exportFinancialReportExcel}
                  style={{ background: "#ecfdf5", color: "#065f46", borderColor: "#a7f3d0", fontWeight: 700 }}
                >
                  📥 Xuất Báo Cáo Doanh Thu Excel
                </button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ngày</th>
                      <th>Số đơn phát sinh</th>
                      <th>Doanh thu (VNĐ)</th>
                      <th>Hiệu suất</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trendData.map((d, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong>{d.dayLabel}</strong>
                          <small style={{ display: "block", color: "#94a3b8" }}>{d.date}</small>
                        </td>
                        <td>
                          <span className="status-pill-badge" style={{ background: "#fdf2f8", color: "#be123c", fontWeight: 700 }}>
                            {d.orderCount} đơn
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: "#e11d48", fontSize: "14px" }}>
                            {money(d.revenue)}
                          </strong>
                        </td>
                        <td>
                          <span style={{ color: d.revenue > 0 ? "#059669" : "#9ca3af", fontWeight: 700 }}>
                            {d.revenue > 0 ? "✓ Đạt doanh số" : "Chưa có phát sinh"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 10: MÃ KHUYẾN MÃI (PROMOTIONS)
          ======================================================== */}
          {activeTab === "promotions" && (
            <>
              <div className="admin-card" style={{ marginBottom: "24px" }}>
                <div className="admin-card-header">
                  <h2>🎟️ Tạo Mã Giảm Giá / Voucher Mới</h2>
                </div>
                <form onSubmit={addPromotion}>
                  <div className="admin-product-grid-form">
                    <div className="admin-form-group">
                      <label>Tên chương trình ưu đãi (*)</label>
                      <input
                        required
                        placeholder="VD: Tri Ân Khách Mới Mua Len"
                        value={promotionForm.title}
                        onChange={(e) => setPromotionForm({ ...promotionForm, title: e.target.value })}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Mã Voucher (Viết hoa) (*)</label>
                      <input
                        required
                        placeholder="VD: LENMOI15"
                        value={promotionForm.code}
                        onChange={(e) => setPromotionForm({ ...promotionForm, code: e.target.value.toUpperCase() })}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Loại giảm giá</label>
                      <select
                        value={promotionForm.type}
                        onChange={(e) => setPromotionForm({ ...promotionForm, type: e.target.value })}
                      >
                        <option value="percent">Giảm theo phần trăm (%)</option>
                        <option value="fixed">Giảm số tiền cố định (VNĐ)</option>
                      </select>
                    </div>
                    <div className="admin-form-group">
                      <label>Giá trị giảm (*)</label>
                      <input
                        required
                        type="number"
                        min="0"
                        placeholder="15 (cho 15%) hoặc 30000 (cho 30k)"
                        value={promotionForm.value}
                        onChange={(e) => setPromotionForm({ ...promotionForm, value: e.target.value })}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Thời gian bắt đầu</label>
                      <input
                        required
                        type="datetime-local"
                        value={promotionForm.startAt}
                        onChange={(e) => setPromotionForm({ ...promotionForm, startAt: e.target.value })}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Thời gian kết thúc</label>
                      <input
                        required
                        type="datetime-local"
                        value={promotionForm.endAt}
                        onChange={(e) => setPromotionForm({ ...promotionForm, endAt: e.target.value })}
                      />
                    </div>
                    <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
                      <label>Mô tả ưu đãi</label>
                      <input
                        placeholder="VD: Giảm 15% tối đa 50k cho đơn từ 200k"
                        value={promotionForm.description}
                        onChange={(e) => setPromotionForm({ ...promotionForm, description: e.target.value })}
                      />
                    </div>
                    <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
                      <button type="submit" className="admin-btn-primary">
                        🎟️ Kích Hoạt Mã Ưu Đãi
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Promotions List */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h2>🎟️ Các Mã Voucher Đang Áp Dụng ({(data.promotions || []).length})</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                  {(data.promotions || []).map((p) => (
                    <div
                      key={p._id}
                      style={{
                        background: "#fffafc",
                        border: "1.5px dashed #f43f5e",
                        borderRadius: "16px",
                        padding: "16px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <strong style={{ fontSize: "16px", color: "#e11d48" }}>{p.code}</strong>
                        <span className="status-pill-badge" style={{ background: p.isActive ? "#ecfdf5" : "#f3f4f6", color: p.isActive ? "#047857" : "#6b7280" }}>
                          {p.isActive ? "✓ Đang chạy" : "Tạm ngưng"}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "13.5px", marginBottom: "4px" }}>{p.title}</div>
                      <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#8d6271" }}>{p.description || "Ưu đãi khách mua hàng"}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", paddingTop: "8px", borderTop: "1px solid #fce7f3" }}>
                        <span>
                          Giảm: <strong style={{ color: "#e11d48" }}>{p.type === "percent" ? `${p.value}%` : money(p.value)}</strong>
                        </span>
                        <button
                          type="button"
                          className="admin-btn-outline"
                          style={{ padding: "3px 8px", fontSize: "11px" }}
                          onClick={() => {
                            navigator.clipboard.writeText(p.code);
                            showToast(`✓ Đã sao chép mã: ${p.code}`);
                          }}
                        >
                          📋 Sao chép
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ========================================================
              TAB 11: TÀI KHOẢN QUẢN TRỊ & PHÂN QUYỀN (ADMINS) - NEW
          ======================================================== */}
          {activeTab === "admins" && (
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>👤 Quản Lý Quản Trị Viên & Nhân Viên Shop ({(data.admins || []).length})</h2>
                  <p style={{ margin: "2px 0 0", color: "#8d6271", fontSize: "12.5px" }}>
                    Hệ thống quản trị đa tài khoản: Super Admin (toàn quyền), Quản trị viên (quản lý đơn & hàng), Nhân viên kho
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() =>
                    setAdminModal({
                      open: true,
                      isEdit: false,
                      targetId: null,
                      form: { name: "", email: "", password: "", phone: "", role: "staff", isActive: true },
                    })
                  }
                >
                  ➕ Thêm Tài Khoản Quản Trị Mới
                </button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Họ tên & Tài khoản</th>
                      <th>Email đăng nhập</th>
                      <th>Số điện thoại</th>
                      <th>Phân quyền</th>
                      <th>Trạng thái</th>
                      <th>Ngày cấp</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.admins || []).map((adm) => {
                      const isMe = String(adminUser?._id) === String(adm._id);
                      const rColor = roleColors[adm.role] || roleColors.staff;
                      return (
                        <tr key={adm._id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  background: rColor.bg,
                                  color: rColor.text,
                                  display: "grid",
                                  placeItems: "center",
                                  fontWeight: 800,
                                  fontSize: "12px",
                                  border: `1px solid ${rColor.border}`,
                                }}
                              >
                                {adm.name ? adm.name[0].toUpperCase() : "A"}
                              </div>
                              <div>
                                <strong>{adm.name}</strong>
                                {isMe && (
                                  <span style={{ marginLeft: "6px", fontSize: "10px", background: "#f43f5e", color: "#fff", padding: "2px 6px", borderRadius: "10px", fontWeight: 800 }}>
                                    BẠN
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>{adm.email}</td>
                          <td>{adm.phone || "—"}</td>
                          <td>
                            <span
                              className="status-pill-badge"
                              style={{
                                background: rColor.bg,
                                color: rColor.text,
                                border: `1px solid ${rColor.border}`,
                                fontWeight: 800,
                              }}
                            >
                              {roleLabels[adm.role] || adm.role}
                            </span>
                          </td>
                          <td>
                            <span
                              className="status-pill-badge"
                              style={{
                                background: adm.isActive !== false ? "#ecfdf5" : "#fee2e2",
                                color: adm.isActive !== false ? "#047857" : "#b91c1c",
                              }}
                            >
                              {adm.isActive !== false ? "🟢 Hoạt động" : "🔴 Đã khóa"}
                            </span>
                          </td>
                          <td>{formatVnDateTime(adm.createdAt)}</td>
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                type="button"
                                className="admin-btn-outline"
                                style={{ padding: "4px 8px", fontSize: "11.5px" }}
                                onClick={() =>
                                  setAdminModal({
                                    open: true,
                                    isEdit: true,
                                    targetId: adm._id,
                                    form: {
                                      name: adm.name || "",
                                      email: adm.email || "",
                                      password: "",
                                      phone: adm.phone || "",
                                      role: adm.role || "staff",
                                      isActive: adm.isActive !== false,
                                    },
                                  })
                                }
                              >
                                ✏️ Sửa
                              </button>
                              <button
                                type="button"
                                className="admin-btn-outline"
                                style={{ padding: "4px 8px", fontSize: "11.5px", color: "#be123c", borderColor: "#fecdd3" }}
                                onClick={() =>
                                  setAdminPasswordModal({
                                    open: true,
                                    admin: adm,
                                    newPassword: "",
                                    resultMsg: "",
                                    errorMsg: "",
                                  })
                                }
                              >
                                🔑 Đổi MK
                              </button>
                              {!isMe && (
                                <button
                                  type="button"
                                  className="admin-btn-outline"
                                  style={{ padding: "4px 8px", fontSize: "11.5px", color: "#dc2626", borderColor: "#fca5a5" }}
                                  onClick={() => handleDeleteAdmin(adm._id, adm.name)}
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div> {/* end of admin-content-inner */}
      </section>

      {/* ========================================================
          MODALS & POPUPS REGION
      ======================================================== */}

      {/* MODAL 1: ORDER DETAILS MODAL (HÓA ĐƠN & THEO DÕI) */}
      {selectedOrder && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="admin-invoice-paper" onClick={(e) => e.stopPropagation()}>
            <div className="invoice-brand-header">
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#f43f5e", letterSpacing: "1px" }}>
                  CHI TIẾT ĐƠN HÀNG SENE HANDMADE
                </span>
                <h2>{selectedOrder.trackingCode || `#${selectedOrder._id.slice(-6).toUpperCase()}`}</h2>
                <p>Ngày đặt: {formatVnDateTime(selectedOrder.createdAt)}</p>
              </div>
              <button type="button" className="admin-btn-outline" onClick={() => setSelectedOrder(null)}>
                ✕ Đóng
              </button>
            </div>

            {/* Customer info card */}
            <div className="invoice-customer-card">
              <div>
                <strong style={{ display: "block", color: "#be123c", marginBottom: "4px" }}>
                  👤 NGƯỜI NHẬN HÀNG:
                </strong>
                <div><strong>{selectedOrder.customerName}</strong></div>
                <div>📱 Số điện thoại: {selectedOrder.phone}</div>
                {selectedOrder.user?.email && <div>✉️ Email: {selectedOrder.user.email}</div>}
              </div>
              <div>
                <strong style={{ display: "block", color: "#be123c", marginBottom: "4px" }}>
                  📍 ĐỊA CHỈ PHÁT HÀNG:
                </strong>
                <div>{selectedOrder.address}</div>
                <div style={{ marginTop: "4px" }}>
                  Hình thức: <strong>{selectedOrder.paymentMethod === "COD" ? "Thu hộ COD" : "Chuyển khoản VietQR"}</strong>
                </div>
              </div>
            </div>

            {selectedOrder.note && (
              <div
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                  fontSize: "12.5px",
                  color: "#b45309",
                }}
              >
                🎁 <strong>Ghi chú của khách:</strong> {selectedOrder.note}
              </div>
            )}

            {/* Items Table */}
            <table className="invoice-items-table">
              <thead>
                <tr>
                  <th>Sản phẩm len</th>
                  <th style={{ textAlign: "center" }}>Số lượng</th>
                  <th style={{ textAlign: "right" }}>Đơn giá</th>
                  <th style={{ textAlign: "right" }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {item.image && (
                          <img
                            src={item.image}
                            alt=""
                            style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover" }}
                          />
                        )}
                        <strong>{item.name}</strong>
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>x{item.quantity}</td>
                    <td style={{ textAlign: "right" }}>{money(item.price)}</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>{money(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Financial Summary */}
            <div className="invoice-total-summary">
              <div>
                Tạm tính: <strong>{money(selectedOrder.subtotalAmount || selectedOrder.totalAmount)}</strong>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div style={{ color: "#059669" }}>
                  Giảm giá voucher ({selectedOrder.promotionCode}): -{money(selectedOrder.discountAmount)}
                </div>
              )}
              {selectedOrder.shippingFee > 0 && (
                <div>Phí vận chuyển: +{money(selectedOrder.shippingFee)}</div>
              )}
              <div style={{ fontSize: "16px", marginTop: "4px" }}>
                Tổng thu thực tế:{" "}
                <strong style={{ color: "#e11d48", fontSize: "22px" }}>
                  {money(selectedOrder.totalAmount)}
                </strong>
              </div>
            </div>

            {/* Payment & Status Control Panel */}
            <div
              style={{
                background: "#fff1f5",
                border: "1px solid #fce7f3",
                borderRadius: "12px",
                padding: "14px 18px",
                marginTop: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700 }}>Thanh toán:</span>
                <button
                  type="button"
                  onClick={() => toggleOrderPaymentStatus(selectedOrder)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "1px solid",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 800,
                    background: selectedOrder.paymentStatus === "paid" ? "#ecfdf5" : "#fee2e2",
                    borderColor: selectedOrder.paymentStatus === "paid" ? "#a7f3d0" : "#fca5a5",
                    color: selectedOrder.paymentStatus === "paid" ? "#047857" : "#b91c1c",
                  }}
                >
                  {selectedOrder.paymentStatus === "paid" ? "✅ ĐÃ THANH TOÁN" : "⏳ CHƯA THANH TOÁN (Click để đổi)"}
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700 }}>Trạng thái đơn:</span>
                <select
                  className="order-status-select"
                  value={selectedOrder.status}
                  onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
                  style={{ padding: "6px 12px", fontSize: "13px" }}
                >
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {statusIcons[key]} {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tracking Logs / Timeline */}
            {selectedOrder.trackingLogs && selectedOrder.trackingLogs.length > 0 && (
              <div style={{ marginTop: "16px", padding: "12px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <strong style={{ fontSize: "12.5px", color: "#475569", display: "block", marginBottom: "8px" }}>
                  📜 Lịch Sử Xử Lý Đơn Hàng:
                </strong>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px" }}>
                  {selectedOrder.trackingLogs.map((log, lIdx) => (
                    <div key={lIdx} style={{ display: "flex", gap: "10px" }}>
                      <span style={{ color: "#94a3b8", minWidth: "120px" }}>{formatVnDateTime(log.timestamp)}</span>
                      <span>
                        Chuyển sang: <strong style={{ color: "#be123c" }}>{statusLabels[log.status] || log.status}</strong>
                        {log.note && <em> ({log.note})</em>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Footer */}
            <div className="invoice-actions-footer">
              <button
                type="button"
                className="admin-btn-outline"
                onClick={() => setShippingLabelOrder(selectedOrder)}
                style={{ background: "#fff1f2", color: "#e11d48", borderColor: "#fecdd3" }}
              >
                🏷️ In Tem Gửi Hàng Bưu Tá
              </button>
              <button type="button" className="admin-btn-outline" onClick={() => window.print()}>
                🖨️ In Hóa Đơn & Đóng Gói
              </button>
              <button type="button" className="admin-btn-primary" onClick={() => setSelectedOrder(null)}>
                Xong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: IN TEM PHIẾU GỬI HÀNG (SHIPPING LABEL) */}
      {shippingLabelOrder && (
        <div className="admin-modal-backdrop" onClick={() => setShippingLabelOrder(null)}>
          <div
            className="shipping-label-paper"
            style={{ maxWidth: "560px", background: "#fff", padding: "24px", borderRadius: "14px", border: "2px dashed #e11d48" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ borderBottom: "2px solid #000", paddingBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", color: "#e11d48", fontWeight: 900 }}>🌸 SENE HANDMADE</h3>
                <small style={{ color: "#475569" }}>Hotline: 0908 123 456 • Website: senehandmade.vn</small>
              </div>
              <div style={{ textAlign: "right" }}>
                <strong style={{ fontSize: "15px" }}>{shippingLabelOrder.trackingCode || `#${shippingLabelOrder._id.slice(-6).toUpperCase()}`}</strong>
                <small style={{ display: "block", color: "#64748b" }}>{formatVnDateTime(shippingLabelOrder.createdAt)}</small>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", padding: "14px 0", borderBottom: "1.5px solid #e2e8f0" }}>
              <div>
                <small style={{ fontWeight: 800, color: "#64748b" }}>NGƯỜI GỬI:</small>
                <div style={{ fontWeight: 700, fontSize: "14px" }}>Tiệm Len Sene Handmade</div>
                <div style={{ fontSize: "12px", color: "#334155" }}>TP. Hồ Chí Minh</div>
                <div style={{ fontSize: "12px", color: "#334155" }}>SĐT: 0908 123 456</div>
              </div>
              <div>
                <small style={{ fontWeight: 800, color: "#e11d48" }}>NGƯỜI NHẬN:</small>
                <div style={{ fontWeight: 800, fontSize: "15px", color: "#0f172a" }}>{shippingLabelOrder.customerName}</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>📱 {shippingLabelOrder.phone}</div>
                <div style={{ fontSize: "12.5px", color: "#334155", marginTop: "2px" }}>📍 {shippingLabelOrder.address}</div>
              </div>
            </div>

            {/* Package contents & COD amount */}
            <div style={{ padding: "12px 0", borderBottom: "2px solid #000" }}>
              <div style={{ fontSize: "12.5px", marginBottom: "8px" }}>
                <strong>Nội dung hàng: </strong>
                {(shippingLabelOrder.items || []).map((i) => `${i.name} (x${i.quantity})`).join(", ")}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "10px 14px", borderRadius: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700 }}>
                  Tiền thu hộ COD:
                </span>
                <strong style={{ fontSize: "20px", color: shippingLabelOrder.paymentMethod === "COD" && shippingLabelOrder.paymentStatus !== "paid" ? "#e11d48" : "#047857" }}>
                  {shippingLabelOrder.paymentMethod === "COD" && shippingLabelOrder.paymentStatus !== "paid"
                    ? money(shippingLabelOrder.totalAmount)
                    : "0 VNĐ (ĐÃ THANH TOÁN)"}
                </strong>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
              <button type="button" className="admin-btn-primary" onClick={() => window.print()}>
                🖨️ In Tem Này
              </button>
              <button type="button" className="admin-btn-outline" onClick={() => setShippingLabelOrder(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CUSTOMER PURCHASE HISTORY MODAL */}
      {customerHistoryModal.open && (
        <div className="admin-modal-backdrop" onClick={() => setCustomerHistoryModal({ open: false, customer: null, orders: [], loading: false })}>
          <div className="admin-dialog-card" style={{ maxWidth: "760px", width: "95%" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-dialog-header">
              <div>
                <h3>🛍️ Lịch Sử Mua Hàng Của {customerHistoryModal.customer?.name}</h3>
                <small style={{ color: "#8d6271" }}>
                  📱 {customerHistoryModal.customer?.phone || "Chưa có SĐT"} • ✉️ {customerHistoryModal.customer?.email}
                </small>
              </div>
              <button
                type="button"
                className="admin-btn-outline"
                style={{ padding: "3px 8px" }}
                onClick={() => setCustomerHistoryModal({ open: false, customer: null, orders: [], loading: false })}
              >
                ✕
              </button>
            </div>

            <div className="admin-dialog-body" style={{ maxHeight: "65vh", overflowY: "auto" }}>
              {/* Customer Stats Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div style={{ background: "#fff1f5", padding: "12px", borderRadius: "10px", border: "1px solid #fce7f3" }}>
                  <small style={{ color: "#8d6271", fontWeight: 700 }}>TỔNG ĐƠN ĐÃ ĐẶT</small>
                  <div style={{ fontSize: "18px", fontWeight: 900, color: "#be123c", marginTop: "4px" }}>
                    {customerHistoryModal.orders.length} đơn hàng
                  </div>
                </div>
                <div style={{ background: "#ecfdf5", padding: "12px", borderRadius: "10px", border: "1px solid #a7f3d0" }}>
                  <small style={{ color: "#047857", fontWeight: 700 }}>TỔNG CHI TIÊU</small>
                  <div style={{ fontSize: "18px", fontWeight: 900, color: "#047857", marginTop: "4px" }}>
                    {money(customerHistoryModal.orders.reduce((s, o) => s + (o.status !== "cancelled" ? o.totalAmount : 0), 0))}
                  </div>
                </div>
              </div>

              {customerHistoryModal.loading ? (
                <div style={{ textAlign: "center", padding: "30px" }}>⏳ Đang tải lịch sử đơn hàng...</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Ngày đặt</th>
                      <th>Sản phẩm</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th>Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerHistoryModal.orders.map((ord) => (
                      <tr key={ord._id}>
                        <td>
                          <strong>{ord.trackingCode || `#${ord._id.slice(-6).toUpperCase()}`}</strong>
                        </td>
                        <td>{formatVnDateTime(ord.createdAt)}</td>
                        <td>
                          <span style={{ fontSize: "12px" }}>
                            {(ord.items || []).map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: "#e11d48" }}>{money(ord.totalAmount)}</strong>
                        </td>
                        <td>
                          <span
                            className="status-pill-badge"
                            style={{
                              background: ord.status === "delivered" ? "#ecfdf5" : ord.status === "pending" ? "#fff1f2" : "#fdf2f8",
                              color: ord.status === "delivered" ? "#047857" : ord.status === "pending" ? "#e11d48" : "#be123c",
                            }}
                          >
                            {statusLabels[ord.status] || ord.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="admin-btn-outline"
                            style={{ padding: "3px 8px", fontSize: "11px" }}
                            onClick={() => {
                              setCustomerHistoryModal((prev) => ({ ...prev, open: false }));
                              showOrder(ord);
                            }}
                          >
                            👁️ Xem
                          </button>
                        </td>
                      </tr>
                    ))}
                    {customerHistoryModal.orders.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", padding: "30px" }}>
                          Khách hàng này chưa có đơn hàng nào được ghi nhận.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ADMIN ACCOUNTS FORM (TẠO / SỬA TÀI KHOẢN) */}
      {adminModal.open && (
        <div className="admin-modal-backdrop" onClick={() => setAdminModal((prev) => ({ ...prev, open: false }))}>
          <div className="admin-dialog-card" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-dialog-header">
              <h3>{adminModal.isEdit ? "✏️ Cập Nhật Tài Khoản Quản Trị" : "👤 Thêm Quản Trị Viên / Nhân Viên"}</h3>
              <button
                type="button"
                className="admin-btn-outline"
                style={{ padding: "2px 8px" }}
                onClick={() => setAdminModal((prev) => ({ ...prev, open: false }))}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAdmin}>
              <div className="admin-dialog-body">
                <div className="admin-form-group">
                  <label>Họ và tên (*)</label>
                  <input
                    required
                    placeholder="VD: Nguyễn Văn Tài"
                    value={adminModal.form.name}
                    onChange={(e) => setAdminModal((prev) => ({ ...prev, form: { ...prev.form, name: e.target.value } }))}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Email đăng nhập (*)</label>
                  <input
                    required
                    type="email"
                    placeholder="admin@senehandmade.vn"
                    disabled={adminModal.isEdit}
                    value={adminModal.form.email}
                    onChange={(e) => setAdminModal((prev) => ({ ...prev, form: { ...prev.form, email: e.target.value } }))}
                  />
                </div>

                {!adminModal.isEdit && (
                  <div className="admin-form-group">
                    <label>Mật khẩu khởi tạo (*)</label>
                    <input
                      required
                      type="password"
                      placeholder="Ít nhất 6 ký tự"
                      value={adminModal.form.password}
                      onChange={(e) => setAdminModal((prev) => ({ ...prev, form: { ...prev.form, password: e.target.value } }))}
                    />
                  </div>
                )}

                <div className="admin-form-group">
                  <label>Số điện thoại</label>
                  <input
                    placeholder="0908 xxx xxx"
                    value={adminModal.form.phone}
                    onChange={(e) => setAdminModal((prev) => ({ ...prev, form: { ...prev.form, phone: e.target.value } }))}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Phân quyền vai trò (*)</label>
                  <select
                    value={adminModal.form.role}
                    onChange={(e) => setAdminModal((prev) => ({ ...prev, form: { ...prev.form, role: e.target.value } }))}
                  >
                    <option value="staff">🪡 Nhân viên (Xem đơn, kho hàng)</option>
                    <option value="admin">🛡️ Quản trị viên (Toàn quyền quản lý)</option>
                    <option value="superadmin">👑 Super Admin (Toàn quyền hệ thống & phân quyền)</option>
                  </select>
                </div>

                {adminModal.isEdit && (
                  <div className="admin-form-group">
                    <label>Trạng thái tài khoản</label>
                    <select
                      value={adminModal.form.isActive ? "true" : "false"}
                      onChange={(e) => setAdminModal((prev) => ({ ...prev, form: { ...prev.form, isActive: e.target.value === "true" } }))}
                    >
                      <option value="true">🟢 Đang hoạt động</option>
                      <option value="false">🔴 Đã khóa (Không cho đăng nhập)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="admin-dialog-footer">
                <button type="button" className="admin-btn-outline" onClick={() => setAdminModal((prev) => ({ ...prev, open: false }))}>
                  Hủy
                </button>
                <button type="submit" className="admin-btn-primary">
                  💾 {adminModal.isEdit ? "Lưu Cập Nhật" : "Tạo Tài Khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: CHANGE ADMIN PASSWORD */}
      {adminPasswordModal.open && (
        <div className="admin-modal-backdrop" onClick={() => setAdminPasswordModal({ open: false, admin: null, newPassword: "", resultMsg: "", errorMsg: "" })}>
          <div className="admin-dialog-card" style={{ maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-dialog-header">
              <h3>🔑 Đổi Mật Khẩu Cho {adminPasswordModal.admin?.name}</h3>
              <button
                type="button"
                className="admin-btn-outline"
                style={{ padding: "2px 8px" }}
                onClick={() => setAdminPasswordModal({ open: false, admin: null, newPassword: "", resultMsg: "", errorMsg: "" })}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangeAdminPassword}>
              <div className="admin-dialog-body">
                {adminPasswordModal.resultMsg && <div style={{ color: "#047857", fontWeight: 700, marginBottom: "10px" }}>{adminPasswordModal.resultMsg}</div>}
                {adminPasswordModal.errorMsg && <div style={{ color: "#b91c1c", fontWeight: 700, marginBottom: "10px" }}>{adminPasswordModal.errorMsg}</div>}

                <div className="admin-form-group">
                  <label>Mật khẩu mới (*)</label>
                  <input
                    required
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={adminPasswordModal.newPassword}
                    onChange={(e) => setAdminPasswordModal((prev) => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>
              </div>

              <div className="admin-dialog-footer">
                <button type="button" className="admin-btn-outline" onClick={() => setAdminPasswordModal({ open: false, admin: null, newPassword: "", resultMsg: "", errorMsg: "" })}>
                  Đóng
                </button>
                <button type="submit" className="admin-btn-primary">
                  Lưu Mật Khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: QUICK ADD STOCK */}
      {quickStockModal.open && (
        <div className="admin-modal-backdrop" onClick={() => setQuickStockModal({ open: false, product: null, addStock: 20 })}>
          <div className="admin-dialog-card" style={{ maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-dialog-header">
              <h3>⚡ Nhập Nhanh Tồn Kho Bán Hàng</h3>
              <button type="button" className="admin-btn-outline" style={{ padding: "2px 8px" }} onClick={() => setQuickStockModal({ open: false, product: null, addStock: 20 })}>
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickAddStock}>
              <div className="admin-dialog-body">
                <div style={{ background: "#fff1f5", padding: "12px", borderRadius: "10px", marginBottom: "14px" }}>
                  <strong>{quickStockModal.product?.name}</strong>
                  <div style={{ fontSize: "12.5px", color: "#8d6271", marginTop: "4px" }}>
                    Tồn kho hiện tại: <strong style={{ color: "#e11d48" }}>{quickStockModal.product?.stock || 0} cuộn</strong>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Số lượng cuộn/bó cần cộng thêm vào kho (*)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={quickStockModal.addStock}
                    onChange={(e) => setQuickStockModal({ ...quickStockModal, addStock: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-dialog-footer">
                <button type="button" className="admin-btn-outline" onClick={() => setQuickStockModal({ open: false, product: null, addStock: 20 })}>
                  Hủy
                </button>
                <button type="submit" className="admin-btn-primary">
                  ⚡ Cộng Tồn Kho Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: QUICK PRICE */}
      {quickPriceModal.open && (
        <div className="admin-modal-backdrop" onClick={() => setQuickPriceModal({ open: false, product: null, price: "", costPrice: "" })}>
          <div className="admin-dialog-card" style={{ maxWidth: "440px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-dialog-header">
              <h3>💰 Cập Nhật Nhanh Giá Bán & Giá Vốn</h3>
              <button type="button" className="admin-btn-outline" style={{ padding: "2px 8px" }} onClick={() => setQuickPriceModal({ open: false, product: null, price: "", costPrice: "" })}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuickPrice}>
              <div className="admin-dialog-body">
                <div style={{ background: "#fff1f5", padding: "12px", borderRadius: "10px", marginBottom: "14px" }}>
                  <strong>{quickPriceModal.product?.name}</strong>
                  <div style={{ fontSize: "12.5px", color: "#8d6271", marginTop: "4px" }}>
                    Tồn kho hiện tại: {quickPriceModal.product?.stock || 0} cuộn
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Giá bán niêm yết (VNĐ) (*)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1000"
                    value={quickPriceModal.price}
                    onChange={(e) => setQuickPriceModal({ ...quickPriceModal, price: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Giá vốn nhập sỉ (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={quickPriceModal.costPrice}
                    onChange={(e) => setQuickPriceModal({ ...quickPriceModal, costPrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-dialog-footer">
                <button type="button" className="admin-btn-outline" onClick={() => setQuickPriceModal({ open: false, product: null, price: "", costPrice: "" })}>
                  Hủy
                </button>
                <button type="submit" className="admin-btn-primary">
                  💾 Lưu Giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 8: RESET CUSTOMER PASSWORD */}
      {resetPasswordModal.open && (
        <div className="admin-modal-backdrop" onClick={() => setResetPasswordModal({ open: false, customer: null, newPassword: "", resultMsg: "", errorMsg: "" })}>
          <div className="admin-dialog-card" style={{ maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-dialog-header">
              <h3>🔑 Cấp Lại Mật Khẩu Khách Hàng</h3>
              <button type="button" className="admin-btn-outline" style={{ padding: "2px 8px" }} onClick={() => setResetPasswordModal({ open: false, customer: null, newPassword: "", resultMsg: "", errorMsg: "" })}>
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPassword}>
              <div className="admin-dialog-body">
                {resetPasswordModal.resultMsg && <div style={{ color: "#047857", fontWeight: 700, marginBottom: "10px" }}>{resetPasswordModal.resultMsg}</div>}
                {resetPasswordModal.errorMsg && <div style={{ color: "#b91c1c", fontWeight: 700, marginBottom: "10px" }}>{resetPasswordModal.errorMsg}</div>}

                <div style={{ marginBottom: "12px", fontSize: "13px" }}>
                  Khách hàng: <strong>{resetPasswordModal.customer?.name}</strong> ({resetPasswordModal.customer?.email})
                </div>

                <div className="admin-form-group">
                  <label>Mật khẩu mới cấp cho khách (*)</label>
                  <input
                    required
                    value={resetPasswordModal.newPassword}
                    onChange={(e) => setResetPasswordModal({ ...resetPasswordModal, newPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-dialog-footer">
                <button type="button" className="admin-btn-outline" onClick={() => setResetPasswordModal({ open: false, customer: null, newPassword: "", resultMsg: "", errorMsg: "" })}>
                  Đóng
                </button>
                <button type="submit" className="admin-btn-primary">
                  Cập Nhật Mật Khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 9: VIEW & PRINT IMPORT RECEIPT */}
      {selectedImportReceipt && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedImportReceipt(null)}>
          <div className="admin-import-paper" onClick={(e) => e.stopPropagation()}>
            <div className="invoice-brand-header">
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669", letterSpacing: "1px" }}>
                  PHIẾU NHẬP KHO SENE HANDMADE
                </span>
                <h2>#{selectedImportReceipt.code}</h2>
                <p>Thời gian lập: {formatVnDateTime(selectedImportReceipt.createdAt)}</p>
              </div>
              <button type="button" className="admin-btn-outline" onClick={() => setSelectedImportReceipt(null)}>
                ✕ Đóng
              </button>
            </div>

            <div className="invoice-customer-card" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
              <div>
                <strong style={{ display: "block", color: "#047857", marginBottom: "4px" }}>
                  🏢 ĐƠN VỊ CUNG CẤP:
                </strong>
                <div><strong>{selectedImportReceipt.supplierName}</strong></div>
                {selectedImportReceipt.supplierPhone && <div>📱 SĐT: {selectedImportReceipt.supplierPhone}</div>}
              </div>
              <div>
                <strong style={{ display: "block", color: "#047857", marginBottom: "4px" }}>
                  📦 THÔNG TIN NHẬP KHO:
                </strong>
                <div>Người lập: <strong>{selectedImportReceipt.importedBy || "Admin Kho"}</strong></div>
                <div>Trạng thái: <strong style={{ color: "#047857" }}>Đã cộng vào kho bán hàng</strong></div>
              </div>
            </div>

            <table className="invoice-items-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>STT</th>
                  <th>Mặt hàng len / phụ kiện</th>
                  <th style={{ textAlign: "center" }}>Số lượng</th>
                  <th style={{ textAlign: "right" }}>Giá vốn</th>
                  <th style={{ textAlign: "right" }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {selectedImportReceipt.items?.map((it, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td><strong>{it.productName}</strong></td>
                    <td style={{ textAlign: "center", fontWeight: 700, color: "#be123c" }}>+{it.quantity}</td>
                    <td style={{ textAlign: "right" }}>{money(it.costPrice)}</td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "#047857" }}>{money(it.total || it.quantity * it.costPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="invoice-total-summary">
              <div>
                Tổng sản phẩm nhập: <strong>{(selectedImportReceipt.items || []).reduce((s, i) => s + (i.quantity || 0), 0)} món</strong>
              </div>
              <div style={{ fontSize: "16px", marginTop: "4px" }}>
                Tổng tiền thanh toán NCC: <strong style={{ color: "#047857", fontSize: "22px" }}>{money(selectedImportReceipt.totalAmount)}</strong>
              </div>
            </div>

            <div className="invoice-actions-footer">
              <button type="button" className="admin-btn-outline" onClick={() => window.print()}>
                🖨️ In Phiếu Nhập Kho
              </button>
              <button type="button" className="admin-btn-primary" style={{ background: "#059669" }} onClick={() => setSelectedImportReceipt(null)}>
                Xong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 10: CREATE IMPORT RECEIPT */}
      {importModal.open && (
        <div className="admin-modal-backdrop" onClick={() => setImportModal((prev) => ({ ...prev, open: false }))}>
          <div className="admin-dialog-card" style={{ maxWidth: "860px", width: "95%" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-dialog-header">
              <div>
                <h3>📥 Lập Phiếu Nhập Hàng & Tự Động Tăng Tồn Kho</h3>
                <small style={{ color: "#8d6271" }}>Khi hoàn tất, tồn kho sản phẩm sẽ được tự động cộng dồn ngay lập tức.</small>
              </div>
              <button type="button" className="admin-btn-outline" style={{ padding: "3px 8px" }} onClick={() => setImportModal((prev) => ({ ...prev, open: false }))}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateImport}>
              <div className="admin-dialog-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                  <div className="admin-form-group">
                    <label>Mã phiếu nhập (*)</label>
                    <input
                      required
                      value={importModal.form.code}
                      onChange={(e) => setImportModal((prev) => ({ ...prev, form: { ...prev.form, code: e.target.value } }))}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Nhà cung cấp (*)</label>
                    <select
                      value={importModal.form.supplierId}
                      onChange={(e) => {
                        const supId = e.target.value;
                        const found = (data.suppliers || []).find((s) => s._id === supId);
                        setImportModal((prev) => ({
                          ...prev,
                          form: {
                            ...prev.form,
                            supplierId: supId,
                            supplierName: found ? found.name : prev.form.supplierName,
                            supplierPhone: found ? found.phone : prev.form.supplierPhone,
                          },
                        }));
                      }}
                    >
                      {(data.suppliers || []).map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.phone})
                        </option>
                      ))}
                      <option value="">-- Nhà cung cấp khác (Nhập tay) --</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group" style={{ marginBottom: "16px" }}>
                  <label>Ghi chú nhập hàng</label>
                  <input
                    placeholder="VD: Nhập thêm đợt hàng len Milk cotton phục vụ lễ 20/10"
                    value={importModal.form.notes}
                    onChange={(e) => setImportModal((prev) => ({ ...prev, form: { ...prev.form, notes: e.target.value } }))}
                  />
                </div>

                {/* Items in Receipt */}
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <strong style={{ fontSize: "14px" }}>Danh sách sản phẩm nhập vào kho:</strong>
                    <button
                      type="button"
                      className="admin-btn-outline"
                      style={{ fontSize: "12px", padding: "3px 8px" }}
                      onClick={() => {
                        setImportModal((prev) => ({
                          ...prev,
                          form: {
                            ...prev.form,
                            items: [
                              ...prev.form.items,
                              { productId: "", productName: "", quantity: 20, costPrice: 15000 },
                            ],
                          },
                        }));
                      }}
                    >
                      ➕ Thêm sản phẩm
                    </button>
                  </div>

                  {importModal.form.items.map((it, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1fr auto",
                        gap: "10px",
                        alignItems: "center",
                        background: "#fffafc",
                        padding: "10px",
                        borderRadius: "8px",
                        marginBottom: "8px",
                        border: "1px solid #fce7f3",
                      }}
                    >
                      <select
                        value={it.productId}
                        onChange={(e) => {
                          const pId = e.target.value;
                          const pr = (data.products || []).find((p) => p._id === pId);
                          const newItems = [...importModal.form.items];
                          newItems[idx] = {
                            ...newItems[idx],
                            productId: pId,
                            productName: pr ? pr.name : "",
                            costPrice: pr?.costPrice || Math.round((pr?.price || 20000) * 0.6),
                          };
                          setImportModal((prev) => ({ ...prev, form: { ...prev.form, items: newItems } }));
                        }}
                      >
                        <option value="">-- Chọn sản phẩm có sẵn --</option>
                        {(data.products || []).map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} (Tồn hiện tại: {p.stock || 0})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        placeholder="Số lượng"
                        value={it.quantity}
                        onChange={(e) => {
                          const newItems = [...importModal.form.items];
                          newItems[idx].quantity = Number(e.target.value);
                          setImportModal((prev) => ({ ...prev, form: { ...prev.form, items: newItems } }));
                        }}
                      />

                      <input
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="Giá vốn"
                        value={it.costPrice}
                        onChange={(e) => {
                          const newItems = [...importModal.form.items];
                          newItems[idx].costPrice = Number(e.target.value);
                          setImportModal((prev) => ({ ...prev, form: { ...prev.form, items: newItems } }));
                        }}
                      />

                      {importModal.form.items.length > 1 && (
                        <button
                          type="button"
                          className="admin-btn-outline"
                          style={{ color: "#dc2626", borderColor: "#fca5a5", padding: "4px 8px" }}
                          onClick={() => {
                            const newItems = importModal.form.items.filter((_, i) => i !== idx);
                            setImportModal((prev) => ({ ...prev, form: { ...prev.form, items: newItems } }));
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-dialog-footer">
                <button type="button" className="admin-btn-outline" onClick={() => setImportModal((prev) => ({ ...prev, open: false }))}>
                  Hủy
                </button>
                <button type="submit" className="admin-btn-primary">
                  📥 Hoàn Tất Nhập Kho & Tăng Tồn Hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 11: SUPPLIER MODAL */}
      {supplierModal.open && (
        <div className="admin-modal-backdrop" onClick={() => setSupplierModal((prev) => ({ ...prev, open: false }))}>
          <div className="admin-dialog-card" style={{ maxWidth: "500px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-dialog-header">
              <h3>{supplierModal.isEdit ? "✏️ Sửa Nhà Cung Cấp" : "🏢 Thêm Nhà Cung Cấp Mới"}</h3>
              <button type="button" className="admin-btn-outline" style={{ padding: "2px 8px" }} onClick={() => setSupplierModal((prev) => ({ ...prev, open: false }))}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSupplier}>
              <div className="admin-dialog-body">
                <div className="admin-form-group">
                  <label>Tên nhà cung cấp (*)</label>
                  <input
                    required
                    value={supplierModal.form.name}
                    onChange={(e) => setSupplierModal((prev) => ({ ...prev, form: { ...prev.form, name: e.target.value } }))}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Số điện thoại (*)</label>
                  <input
                    required
                    value={supplierModal.form.phone}
                    onChange={(e) => setSupplierModal((prev) => ({ ...prev, form: { ...prev.form, phone: e.target.value } }))}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Địa chỉ</label>
                  <input
                    value={supplierModal.form.address}
                    onChange={(e) => setSupplierModal((prev) => ({ ...prev, form: { ...prev.form, address: e.target.value } }))}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Mặt hàng cung cấp</label>
                  <input
                    placeholder="VD: Len milk cotton, kim móc, bông gòn"
                    value={supplierModal.form.supplyItems}
                    onChange={(e) => setSupplierModal((prev) => ({ ...prev, form: { ...prev.form, supplyItems: e.target.value } }))}
                  />
                </div>
              </div>

              <div className="admin-dialog-footer">
                <button type="button" className="admin-btn-outline" onClick={() => setSupplierModal((prev) => ({ ...prev, open: false }))}>
                  Hủy
                </button>
                <button type="submit" className="admin-btn-primary">
                  💾 Lưu Nhà Cung Cấp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 12: STAFF MODAL */}
      {staffModal.open && (
        <div className="admin-modal-backdrop" onClick={() => setStaffModal((prev) => ({ ...prev, open: false }))}>
          <div className="admin-dialog-card" style={{ maxWidth: "500px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-dialog-header">
              <h3>{staffModal.isEdit ? "✏️ Sửa Hồ Sơ Thợ / Nhân Viên" : "🪡 Thêm Thợ Thủ Công Mới"}</h3>
              <button type="button" className="admin-btn-outline" style={{ padding: "2px 8px" }} onClick={() => setStaffModal((prev) => ({ ...prev, open: false }))}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStaff}>
              <div className="admin-dialog-body">
                <div className="admin-form-group">
                  <label>Họ tên (*)</label>
                  <input
                    required
                    value={staffModal.form.name}
                    onChange={(e) => setStaffModal((prev) => ({ ...prev, form: { ...prev.form, name: e.target.value } }))}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Số điện thoại (*)</label>
                  <input
                    required
                    value={staffModal.form.phone}
                    onChange={(e) => setStaffModal((prev) => ({ ...prev, form: { ...prev.form, phone: e.target.value } }))}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Chức vụ / Chuyên môn</label>
                  <input
                    value={staffModal.form.role}
                    onChange={(e) => setStaffModal((prev) => ({ ...prev, form: { ...prev.form, role: e.target.value } }))}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Tiền công / sản phẩm hoàn thiện (VNĐ) (*)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1000"
                    value={staffModal.form.pieceRate}
                    onChange={(e) => setStaffModal((prev) => ({ ...prev, form: { ...prev.form, pieceRate: Number(e.target.value) } }))}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Kỹ năng đan móc</label>
                  <input
                    placeholder="VD: Hoa tulip, hoa hồng, móc thú bông"
                    value={staffModal.form.skills}
                    onChange={(e) => setStaffModal((prev) => ({ ...prev, form: { ...prev.form, skills: e.target.value } }))}
                  />
                </div>
              </div>

              <div className="admin-dialog-footer">
                <button type="button" className="admin-btn-outline" onClick={() => setStaffModal((prev) => ({ ...prev, open: false }))}>
                  Hủy
                </button>
                <button type="submit" className="admin-btn-primary">
                  💾 Lưu Hồ Sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 13: PREVIEW IMAGE MODAL */}
      {previewImageModal && (
        <div className="admin-modal-backdrop" onClick={() => setPreviewImageModal(null)}>
          <div style={{ maxWidth: "600px", padding: "12px", background: "#fff", borderRadius: "12px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <img src={previewImageModal} alt="Preview" style={{ maxWidth: "100%", maxHeight: "75vh", borderRadius: "8px", objectFit: "contain" }} />
            <div style={{ marginTop: "12px" }}>
              <button type="button" className="admin-btn-primary" onClick={() => setPreviewImageModal(null)}>
                ✕ Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminPage;
