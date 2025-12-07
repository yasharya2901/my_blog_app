import { e as createComponent, f as createAstro, h as addAttribute, k as renderHead, r as renderTemplate } from '../chunks/astro/server_DpsBbuWO.mjs';
import 'piccolore';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Blog = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Blog;
  return renderTemplate`<html lang="en"> <head><meta charset="utf-8"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="viewport" content="width=device-width"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>My Astro Site</title>${renderHead()}</head> <body> <h1>Astro</h1> <p>Welcome to my Blog Page.</p> </body></html>`;
}, "/home/runner/work/my_blog_app/my_blog_app/src/pages/blog.astro", void 0);

const $$file = "/home/runner/work/my_blog_app/my_blog_app/src/pages/blog.astro";
const $$url = "/blog";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Blog,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
