import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ResultView from '../views/ResultView.vue'
import WatchlistView from '../views/WatchlistView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView },
    { path: '/result/:ip', component: ResultView },
    { path: '/watchlist', component: WatchlistView },
  ],
})

export default router
