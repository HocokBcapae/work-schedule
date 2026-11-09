export interface CategoryItem {
  id: string; // например: 'batteries'
  code: string; // например: 'SYS_PWR // 01'
  title: string; // например: 'АККУМУЛЯТОРЫ (АКБ)'
  shortDesc: string; // краткое описание для карточки в каталоге
  sectionsCount: number;
}

export interface BrandItem {
  id: string; // 'apple' | 'android' | 'other'
  index: string; // '01' | '02' | '03'
  code: string; // 'IOS_HW'
  title: string; // 'IPHONE / APPLE'
  subtitle: string; // краткая подпись на кнопке главной страницы
  categories: CategoryItem[];
}
