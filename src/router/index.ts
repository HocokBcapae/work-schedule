import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import BrandView from "../views/BrandView.vue";
import ArticleView from "../views/ArticleView.vue";

const router = createRouter({
  // Hash-история никогда не дает ошибку 404 при обновлении страницы на GitHub Pages
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/:brandId",
      name: "brand",
      component: BrandView,
    },
    {
      path: "/:brandId/:categoryId",
      name: "article",
      component: ArticleView,
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
