import type { BrandItem } from "../types";

export const catalogData: BrandItem[] = [
  {
    id: "apple",
    index: "01",
    code: "ARCH // IOS_ECOSYSTEM",
    title: "IPHONE",
    subtitle:
      "Проприетарная архитектура, привязка компонентов, BMS-контроллеры",
    categories: [
      {
        id: "batteries",
        code: "PWR_CELL // 01",
        title: "АККУМУЛЯТОРЫ (АКБ)",
        shortDesc:
          "Литий-ионные банки, шлейфы с чипами аутентификации Texas Instruments и циклы заряда.",
        sectionsCount: 5,
      },
      {
        id: "displays",
        code: "VIS_MTX // 02",
        title: "ДИСПЛЕЙНЫЕ МОДУЛИ",
        shortDesc:
          "Super Retina XDR, структура OLED-пикселей, TrueTone, IC-микросхемы тачскрина.",
        sectionsCount: 6,
      },
      {
        id: "cables",
        code: "IO_LINK // 03",
        title: "КАБЕЛИ И РАЗЪЕМЫ",
        shortDesc:
          "Контроллеры Tristar/Hydra, распиновка Lightning и переход на стандарт USB-C.",
        sectionsCount: 4,
      },
    ],
  },
  {
    id: "android",
    index: "02",
    code: "ARCH // OHA_SYSTEMS",
    title: "ANDROID",
    subtitle:
      "Открытые платформы, быстрые протоколы зарядки, разнообразие матриц",
    categories: [
      {
        id: "batteries",
        code: "PWR_CELL // 01",
        title: "АККУМУЛЯТОРЫ (АКБ)",
        shortDesc:
          "Двухъячеечные схемы (Dual-Cell), кремний-углеродные аноды и токи до 120W+.",
        sectionsCount: 4,
      },
      {
        id: "displays",
        code: "VIS_MTX // 02",
        title: "ДИСПЛЕЙНЫЕ МОДУЛИ",
        shortDesc:
          "LTPO AMOLED, ШИМ-диммирование, ультразвуковые сканеры под экраном.",
        sectionsCount: 5,
      },
      {
        id: "cables",
        code: "IO_LINK // 03",
        title: "КАБЕЛИ И ПРОТОКОЛЫ",
        shortDesc:
          "E-Marker чипы, Power Delivery (PD), Qualcomm Quick Charge и кастомные пины.",
        sectionsCount: 4,
      },
    ],
  },
  {
    id: "other",
    index: "03",
    code: "ARCH // EXT_HARDWARE",
    title: "ДРУГИЕ БРЕНДЫ",
    subtitle:
      "Уникальные форм-факторы, кастомные решения, редкие комплектующие",
    categories: [
      {
        id: "batteries",
        code: "PWR_CELL // 01",
        title: "АККУМУЛЯТОРЫ (АКБ)",
        shortDesc:
          "Нестандартные элементы питания, модульные конструкции и промышленные стандарты.",
        sectionsCount: 3,
      },
      {
        id: "displays",
        code: "VIS_MTX // 02",
        title: "ДИСПЛЕЙНЫЕ МОДУЛИ",
        shortDesc:
          "Складные матрицы (Foldable), E-Ink панели и специализированные экраны.",
        sectionsCount: 3,
      },
    ],
  },
];
