import { g as getService, S as Service, e as error, j as json, w as withAuthCookie } from '../../chunks/http_BPfB3_5a.mjs';
import { StatusCodes } from 'http-status-codes';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const runtime = "node";
const authService = getService(Service.auth);
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    if (!body.password || !(body.email || body.username)) {
      return error("Email or Username, and Password is required");
    }
    let { user, token } = await authService.login(body.password, body.username, body.email);
    const res = json(user, { status: StatusCodes.OK });
    return withAuthCookie(res, token);
  } catch (err) {
    return error(err?.message ?? "Invalid Credentials", StatusCodes.UNAUTHORIZED);
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    POST,
    prerender,
    runtime
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
