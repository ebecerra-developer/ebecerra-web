/**
 * Dispara el workflow `social-render.yml` en GitHub Actions vía workflow_dispatch.
 *
 * Requiere:
 *   GITHUB_DISPATCH_TOKEN — PAT fine-grained con permisos Actions:write + Contents:read
 *   GITHUB_SOCIAL_WORKER_REPO — "owner/repo" donde vive el workflow
 */
export async function dispatchSocialRender(jobId: string): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  const repo = process.env.GITHUB_SOCIAL_WORKER_REPO;
  if (!token || !repo) {
    return { ok: false, error: "Missing GITHUB_DISPATCH_TOKEN or GITHUB_SOCIAL_WORKER_REPO" };
  }

  const url = `https://api.github.com/repos/${repo}/actions/workflows/social-render.yml/dispatches`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ref: "main",
      inputs: { job_id: jobId },
    }),
  });

  if (res.status === 204) return { ok: true };

  const body = await res.text();
  return { ok: false, error: `GitHub API ${res.status}: ${body.slice(0, 300)}` };
}
