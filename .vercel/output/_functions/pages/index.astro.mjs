import { e as createComponent, m as maybeRenderHead, r as renderTemplate, f as createAstro, h as addAttribute, k as renderHead, l as renderSlot, n as renderComponent } from '../chunks/astro/server_DpsBbuWO.mjs';
import 'piccolore';
import 'clsx';
/* empty css                                 */
import { jsx } from 'react/jsx-runtime';
export { renderers } from '../renderers.mjs';

const $$Menu = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<button class="bg-blue-400" aria-expanded="true" aria-controls="main-menu" class="menu">
Menu
</button>`;
}, "/home/runner/work/my_blog_app/my_blog_app/src/components/Menu.astro", void 0);

const Saturday = () => {
  return /* @__PURE__ */ jsx("div", { className: "", children: /* @__PURE__ */ jsx("h1", { children: "This is my react component" }) });
};

const $$Astro = createAstro();
const $$App = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$App;
  return renderTemplate`<html lang="en"> <head><meta charset="utf-8"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="viewport" content="width=device-width"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>My Astro Site</title>${renderHead()}</head> <body> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "/home/runner/work/my_blog_app/my_blog_app/src/layout/app.astro", void 0);

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "App", $$App, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Menu", $$Menu, {})} ${renderComponent($$result2, "Saturday", Saturday, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/runner/work/my_blog_app/my_blog_app/src/components/Saturday.jsx", "client:component-export": "Saturday" })} ` })}`;
}, "/home/runner/work/my_blog_app/my_blog_app/src/pages/index.astro", void 0);

const $$file = "/home/runner/work/my_blog_app/my_blog_app/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
