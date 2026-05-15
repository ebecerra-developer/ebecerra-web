import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import AdminShell from "../AdminShell";
import {
  approveCommentAction,
  deleteCommentAction,
  rejectCommentAction,
} from "../actions";

export const dynamic = "force-dynamic";

const STATUSES = ["pending", "approved", "rejected"] as const;
type Status = (typeof STATUSES)[number];

function isStatus(value: string): value is Status {
  return (STATUSES as readonly string[]).includes(value);
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function CommentsModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/admin/login");

  const params = await searchParams;
  const statusFilter: Status =
    params.status && isStatus(params.status) ? params.status : "pending";

  // Admin client bypasea RLS — para ver pending/rejected que no son públicos.
  const admin = createSupabaseAdminClient();
  const { data: comments, error } = await admin
    .from("post_comments")
    .select("id, post_slug, author_name, author_email, body, status, created_at")
    .eq("status", statusFilter)
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <AdminShell activeSection="comments" userEmail={user.email}>
      <h2>Moderación de comentarios</h2>

      <form className="admin-filters" method="get">
        <label>
          Estado
          <select name="status" defaultValue={statusFilter}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          style={{
            background: "transparent",
            border: "1px solid #44403c",
            color: "#d6d3d1",
            fontFamily: "inherit",
            fontSize: "12px",
            padding: "4px 12px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Filtrar
        </button>
      </form>

      {error && (
        <div className="admin-empty" style={{ borderColor: "#7f1d1d", color: "#fecaca" }}>
          Error al cargar: {error.message}
        </div>
      )}

      {!error && (!comments || comments.length === 0) && (
        <div className="admin-empty">
          {statusFilter === "pending"
            ? "No hay comentarios pendientes. ✨"
            : `No hay comentarios con estado "${statusFilter}".`}
        </div>
      )}

      {comments && comments.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Recibido</th>
              <th>Post</th>
              <th>Autor</th>
              <th>Comentario</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((c) => (
              <tr key={c.id}>
                <td>{formatDateTime(c.created_at)}</td>
                <td>
                  <code style={{ fontSize: 11, color: "#a8a29e" }}>{c.post_slug}</code>
                </td>
                <td>
                  <div>{c.author_name}</div>
                  {c.author_email && (
                    <div style={{ fontSize: 11, color: "#78716c" }}>
                      {c.author_email}
                    </div>
                  )}
                </td>
                <td style={{ maxWidth: 400, whiteSpace: "pre-wrap" }}>{c.body}</td>
                <td>
                  <span className="admin-pill" data-status={c.status}>
                    {c.status}
                  </span>
                </td>
                <td>
                  <div className="admin-actions">
                    {c.status !== "approved" && (
                      <form action={approveCommentAction}>
                        <input type="hidden" name="id" value={c.id} />
                        <button type="submit" data-variant="approve">
                          ✓
                        </button>
                      </form>
                    )}
                    {c.status !== "rejected" && (
                      <form action={rejectCommentAction}>
                        <input type="hidden" name="id" value={c.id} />
                        <button type="submit" data-variant="reject">
                          ✗
                        </button>
                      </form>
                    )}
                    <form action={deleteCommentAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit">🗑</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminShell>
  );
}
