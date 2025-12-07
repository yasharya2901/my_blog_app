import { g as getService, S as Service, a as env, e as error, j as json, w as withAuthCookie } from '../../chunks/http_BPfB3_5a.mjs';
import { StatusCodes } from 'http-status-codes';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const runtime = "node";
const authservice = getService(Service.auth);
const POST = async ({ request }) => {
  try {
    if (!env.ALLOW_REGISTRATION) {
      return error("User registration is not allowed", StatusCodes.FORBIDDEN);
    }
    const body = await request.json();
    if (!body.username || !body.name || !body.email || !body.password) {
      return error("Username, name, email and password are required.", StatusCodes.BAD_REQUEST);
    }
    const { user, token } = await authservice.register(body.name, body.username, body.password, body.email);
    const res = json(user, { status: StatusCodes.CREATED });
    return withAuthCookie(res, token);
  } catch (err) {
    return error(err?.message ?? "Registration Failed", StatusCodes.BAD_REQUEST);
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
