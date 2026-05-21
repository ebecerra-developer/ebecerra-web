import { cookies } from "next/headers";
import { signSession, verifySession, InvalidSessionError, getSessionTtlSeconds } from "./session";
import type { SessionPayload } from "../types";

export const SESSION_COOKIE = "ec_admin_session";

/**
 * Lee y verifica la sesión de la cookie. Devuelve null si no hay o inválida.
 */
export async function readSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return verifySession(raw);
  } catch (e) {
    if (e instanceof InvalidSessionError) return null;
    throw e;
  }
}

/**
 * Persiste una sesión nueva en cookie HttpOnly Secure SameSite=Lax.
 */
export async function setSession(
  payload: Omit<SessionPayload, "exp">
): Promise<{ exp: number }> {
  const { token, exp } = signSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: getSessionTtlSeconds(),
  });
  return { exp };
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
