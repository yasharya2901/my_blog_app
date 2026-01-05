import { createRouter } from "@nanostores/router";


export const $router = createRouter({
  dashboard: '/dashboard',
  editor: '/editor/:blogId?'
})
