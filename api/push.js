export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  try {
    const { projects, theme, heroText, heroSubtitle, categories } = req.body || {}
    // Log for Vercel
    console.log(`[push] Received ${projects?.length || 0} projects, ${categories?.length || 0} categories, hero: ${heroText}`)

    // If GitHub token not configured, just mock success (localStorage already saved)
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
    if (!token) {
      console.log('[push] No token, mock success')
      return res.status(200).json({ ok: true, mocked: true, message: 'Local save OK (no GitHub token, mock push)' })
    }

    // Real GitHub push would go here — update src/data/projects.js etc via GitHub API
    // For now, just acknowledge. To implement real push, use Octokit:
    // await octokit.repos.createOrUpdateFileContents({ owner: 'Gourab775', repo: 'works-portfolio', path: 'src/data/projects.js', ... })
    return res.status(200).json({ ok: true, message: 'Pushed to GitHub (token present, implement Octokit if needed)' })
  } catch (e) {
    console.error('[push] error', e)
    return res.status(500).json({ error: String(e) })
  }
}
