import { dispatch } from "@balanse/api";

export const dynamic = "force-dynamic";

async function handle(request: Request): Promise<Response> {
  return dispatch(request);
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
