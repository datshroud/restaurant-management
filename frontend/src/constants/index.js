import phoBo from "../assets/images/phoBo.jpg"
import bunBoHue from "../assets/images/bunBoHue.jpg"
import comTam from "../assets/images/comTam.png"
import banhMi from "../assets/images/banhMi.jpg"
import bunCha from "../assets/images/bunCha.jpg"
import huTieu from "../assets/images/huTieu.jpg"
import goiCuon from "../assets/images/goiCuon.jpg"
import cheBaMau from "../assets/images/cheBaMau.jpg"
import bunRieu from "../assets/images/bunRieu.jpeg"
import boKho from "../assets/images/boKhoBanhMi.jpg"
import nemRan from "../assets/images/nemRan.jpg"
import chaGio from "../assets/images/chaGio.jpg"
import dauHuChien from "../assets/images/dauHuChien.jpg"
import comGaXoiMo from "../assets/images/comGaXoiMo.jpg"
import caPheSuaDa from "../assets/images/caPheSuaDa.jpg"
import bacXiu from "../assets/images/bacXiu.jpg"
import traDao from "../assets/images/traDao.jpg"
import nuocMia from "../assets/images/nuocMia.jpg"
import canhChuaCa from "../assets/images/canhChuaCa.jpg"
import canhKhoQua from "../assets/images/canhKhoQua.jpg"
import canhRongBien from "../assets/images/canhRongBien.jpg"
import banhFlan from "../assets/images/banhFlan.jpg"
import rauCauDua from "../assets/images/rauCauDua.jpg"
import tauHuNuocDuong from "../assets/images/tauHuNuocDuong.jpg"



export const popularDishes = [
  {
    id: 1,
    image: phoBo,
    name: 'Phở bò',
    numberOfOrders: 250,
  },
  {
    id: 2,
    image: bunBoHue,
    name: 'Bún bò Huế',
    numberOfOrders: 190,
  },
  {
    id: 3,
    image: comTam,
    name: 'Cơm tấm sườn bì chả',
    numberOfOrders: 300,
  },
  {
    id: 4,
    image: banhMi,
    name: 'Bánh mì thịt',
    numberOfOrders: 220,
  },
  {
    id: 5,
    image: bunCha,
    name: 'Bún chả Hà Nội',
    numberOfOrders: 270,
  },
  {
    id: 6,
    image: huTieu,
    name: 'Hủ tiếu Nam Vang',
    numberOfOrders: 180,
  },
  {
    id: 7,
    image: goiCuon,
    name: 'Gỏi cuốn',
    numberOfOrders: 210,
  },
  {
    id: 8,
    image: cheBaMau,
    name: 'Chè ba màu',
    numberOfOrders: 310,
  },
  {
    id: 9,
    image: bunRieu,
    name: 'Bún riêu cua',
    numberOfOrders: 140,
  },
  {
    id: 10,
    image: boKho,
    name: 'Bò kho bánh mì',
    numberOfOrders: 160,
  },
];

export const tables = [
    { id: 1, name: "Bàn 1", status: "Đã đặt", initial: "AM", seats: 4 },
    { id: 2, name: "Bàn 2", status: "Có sẵn", initial: "MB", seats: 6 },
    { id: 3, name: "Bàn 3", status: "Đã đặt", initial: "JS", seats: 2 },
    { id: 4, name: "Bàn 4", status: "Có sẵn", initial: "HR", seats: 4 },
    { id: 5, name: "Bàn 5", status: "Đã đặt", initial: "PL", seats: 3 },
    { id: 6, name: "Bàn 6", status: "Có sẵn", initial: "RT", seats: 4 },
    { id: 7, name: "Bàn 7", status: "Đã đặt", initial: "LC", seats: 5 },
    { id: 8, name: "Bàn 8", status: "Có sẵn", initial: "DP", seats: 5 },
    { id: 9, name: "Bàn 9", status: "Đã đặt", initial: "NK", seats: 6 },
    { id: 10, name: "Bàn 10", status: "Có sẵn", initial: "SB", seats: 6 },
    { id: 11, name: "Bàn 11", status: "Đã đặt", initial: "GT", seats: 4 },
    { id: 12, name: "Bàn 12", status: "Có sẵn", initial: "JS", seats: 6 },
    { id: 13, name: "Bàn 13", status: "Đã đặt", initial: "EK", seats: 2 },
    { id: 14, name: "Bàn 14", status: "Có sẵn", initial: "QN", seats: 6 },
    { id: 15, name: "Bàn 15", status: "Đã đặt", initial: "TW", seats: 3 }
  ];

export const startersItem = [
  {
    id: 1,
    name: "Gỏi cuốn",
    price: 30000,
    image: goiCuon,
    description: "Cuốn tươi, rau sống và tôm thịt."
  },
  {
    id: 2,
    name: "Nem rán",
    price: 35000,
    image: nemRan,
    description: "Giòn rụm, nhân thịt thơm."
  },
  {
    id: 3,
    name: "Chả giò",
    price: 40000,
    image: chaGio,
    description: "Vàng giòn, ăn kèm rau sống."
  },
  {
    id: 4,
    name: "Đậu hũ chiên",
    price: 25000,
    image: dauHuChien,
    description: "Đậu hũ béo, chiên giòn."
  },
];

export const mainCourse = [
  {
    id: 1,
    name: "Cơm tấm sườn",
    price: 55000,
    image: comTam,
    description: "Sườn nướng đậm vị, cơm tấm mềm."
  },
  {
    id: 2,
    name: "Phở bò",
    price: 60000,
    image: phoBo,
    description: "Nước dùng trong, bò mềm thơm."
  },
  {
    id: 3,
    name: "Bún bò Huế",
    price: 60000,
    image: bunBoHue,
    description: "Đậm vị cay, giò bò hấp dẫn."
  },
  {
    id: 4,
    name: "Cơm gà xối mỡ",
    price: 50000,
    image: comGaXoiMo,
    description: "Gà giòn da, cơm vàng thơm."
  },
];

export const beverages = [
  {
    id: 1,
    name: "Cà phê sữa đá",
    price: 25000,
    image: caPheSuaDa,
    description: "Cà phê đậm, sữa ngọt dịu."
  },
  {
    id: 2,
    name: "Bạc xỉu",
    price: 30000,
    image: bacXiu,
    description: "Sữa nhiều, vị cà phê nhẹ."
  },
  {
    id: 3,
    name: "Trà đào",
    price: 30000,
    image: traDao,
    description: "Trà thơm, đào giòn mát."
  },
  {
    id: 4,
    name: "Nước mía",
    price: 20000,
    image: nuocMia,
    description: "Ngọt mát tự nhiên, giải khát."
  },
];

export const soups = [
  {
    id: 1,
    name: "Canh chua cá",
    price: 45000,
    image: canhChuaCa,
    description: "Chua thanh, cá tươi và rau."
  },
  {
    id: 2,
    name: "Canh khổ qua",
    price: 40000,
    image: canhKhoQua,
    description: "Khổ qua nhồi thịt, vị thanh."
  },
  {
    id: 3,
    name: "Canh rong biển",
    price: 35000,
    image: canhRongBien,
    description: "Nhẹ nhàng, rong biển thơm dịu."
  },
];

export const desserts = [
  {
    id: 1,
    name: "Chè ba màu",
    price: 20000,
    image: cheBaMau,
    description: "Mát lạnh, nhiều tầng hương vị."
  },
  {
    id: 2,
    name: "Bánh flan",
    price: 25000,
    image: banhFlan,
    description: "Mềm mịn, caramel thơm ngọt."
  },
  {
    id: 3,
    name: "Rau câu dừa",
    price: 20000,
    image: rauCauDua,
    description: "Thạch dừa giòn, mát lạnh."
  },
  {
    id: 4,
    name: "Tàu hũ nước đường",
    price: 18000,
    image: tauHuNuocDuong,
    description: "Tàu hũ mềm, nước đường gừng."
  },
];

export const pizzas = [
  {
    id: 1,
    name: "Bánh khọt",
    price: 40000,
    image: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Banh_khot.jpg",
    description: "Vỏ giòn, tôm thơm béo."
  },
  {
    id: 2,
    name: "Bánh xèo",
    price: 50000,
    image: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Banh_xeo.jpg",
    description: "Vỏ vàng giòn, nhân tôm thịt."
  },
  {
    id: 3,
    name: "Bánh cuốn",
    price: 35000,
    image: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Banh_cuon.jpg",
    description: "Bánh mỏng mềm, nhân thơm."
  },
];

export const alcoholicDrinks = [
  {
    id: 1,
    name: "Bia Sài Gòn",
    price: 20000,
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Saigon_beer.jpg",
    description: "Bia nhẹ, dễ uống, mát lạnh."
  },
  {
    id: 2,
    name: "Bia Hà Nội",
    price: 20000,
    image: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Hanoi_beer.jpg",
    description: "Hương vị truyền thống, đậm vừa."
  },
  {
    id: 3,
    name: "Rượu nếp",
    price: 40000,
    image: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Ruou_nep.jpg",
    description: "Thơm nếp, vị ngọt hậu."
  },
];

export const salads = [
  {
    id: 1,
    name: "Gỏi gà",
    price: 45000,
    image: "https://upload.wikimedia.org/wikipedia/commons/6/64/Goi_ga.jpg",
    description: "Gà xé trộn rau thơm, chua ngọt."
  },
  {
    id: 2,
    name: "Gỏi bò",
    price: 50000,
    image: "https://upload.wikimedia.org/wikipedia/commons/8/89/Goi_bo.jpg",
    description: "Bò mềm, rau giòn, vị đậm đà."
  },
  {
    id: 3,
    name: "Gỏi đu đủ",
    price: 35000,
    image: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Goi_du_du.jpg",
    description: "Đu đủ bào giòn, chua cay nhẹ."
  },
];

export const menus = [
  { id: 1, name: "Khai vị", icon: "🥟", items: startersItem, bgColor: "#FDE68A" },
  { id: 2, name: "Món chính", icon: "🍚", items: mainCourse, bgColor: "#BFDBFE" },
  { id: 3, name: "Đồ uống", icon: "🥤", items: beverages, bgColor: "#A7F3D0" },
  { id: 4, name: "Canh", icon: "🥣", items: soups, bgColor: "#FBCFE8" },
  { id: 5, name: "Tráng miệng", icon: "🍰", items: desserts, bgColor: "#DDD6FE" },
  { id: 6, name: "Bánh", icon: "🥞", items: pizzas, bgColor: "#FECACA" },
  { id: 7, name: "Đồ uống có cồn", icon: "🍺", items: alcoholicDrinks, bgColor: "#FCD34D" },
  { id: 8, name: "Gỏi", icon: "🥗", items: salads, bgColor: "#BBF7D0" },
];