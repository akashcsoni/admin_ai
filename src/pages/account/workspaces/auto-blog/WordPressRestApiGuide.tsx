type WordPressRestApiGuideProps = {
  siteUrl?: string
}

function buildRestApiUrl(siteUrl: string): string {
  const trimmed = siteUrl.trim().replace(/\/+$/, '')
  return trimmed ? `${trimmed}/wp-json/wp/v2/` : 'https://yourwebsite.com/wp-json/wp/v2/'
}

export default function WordPressRestApiGuide({ siteUrl = '' }: WordPressRestApiGuideProps) {
  const restApiUrl = buildRestApiUrl(siteUrl)

  return (
    <details className="service-setup-guide">
      <summary className="service-setup-guide-summary">
        <span className="service-setup-guide-title">How to connect WordPress REST API</span>
        <span className="service-setup-guide-aside">
          <span className="service-setup-guide-meta">Setup guide</span>
          <span className="service-setup-guide-chevron" aria-hidden="true" />
        </span>
      </summary>

      <div className="service-setup-guide-body">
        <p className="service-field-hint service-setup-guide-lead">
          Content AI publishes through the built-in WordPress REST API using an application password.
          No plugin is required on WordPress 5.6+. Opening{' '}
          <code>/wp-json/wp/v2/posts</code> in a browser only proves public read access — it does not
          mean your login credentials are configured.
        </p>

        <ol className="service-setup-guide-steps">
          <li>
            <strong>Confirm REST API is reachable</strong>
            <p>
              Open{' '}
              <a href={restApiUrl} target="_blank" rel="noopener noreferrer">
                {restApiUrl}
              </a>{' '}
              in your browser. You should see JSON, not a 404 or login page. A successful response here
              does not verify your application password — only the connection test does.
            </p>
          </li>
          <li>
            <strong>Use a publishing user</strong>
            <p>
              Sign in to WordPress with an account that can create posts (Editor or Administrator).
              Note the username exactly as shown under Users.
            </p>
          </li>
          <li>
            <strong>Create an application password</strong>
            <p>
              In WordPress admin go to <strong>Users → Profile</strong>, scroll to{' '}
              <strong>Application Passwords</strong>, enter a name such as <em>Content AI</em>, and
              click <strong>Add New Application Password</strong>. Copy the generated password
              immediately — it is shown only once.
            </p>
          </li>
          <li>
            <strong>Enter credentials below</strong>
            <ul className="service-setup-guide-checklist">
              <li>
                <strong>Site URL</strong> — your site root, e.g. <code>https://yourwebsite.com</code>
              </li>
              <li>
                <strong>WordPress username</strong> — the publishing user&apos;s login
              </li>
              <li>
                <strong>Application password</strong> — paste the password from step 3 (spaces are
                fine)
              </li>
            </ul>
          </li>
          <li>
            <strong>Save, then test</strong>
            <p>
              Click <strong>Test connection</strong> (settings are saved automatically first). A
              successful test confirms WordPress accepted your credentials via{' '}
              <code>/wp-json/wp/v2/users/me</code>.
            </p>
          </li>
          <li>
            <strong>Optional: category ID</strong>
            <p>
              To assign a category, open{' '}
              <a
                href={`${restApiUrl.replace(/\/$/, '')}/categories`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {restApiUrl}categories
              </a>{' '}
              and use the numeric <code>id</code> of the category you want.
            </p>
          </li>
        </ol>

        <div className="service-setup-guide-notes">
          <p className="service-setup-guide-notes-title">If the test fails</p>
          <ul>
            <li>Permalinks must not be set to Plain — use Post name or another pretty permalink.</li>
            <li>Security or firewall plugins may block REST API — allow <code>/wp-json/</code>.</li>
            <li>
              LiteSpeed, nginx, or Cloudflare may strip the <code>Authorization</code> header — your
              host must pass <code>HTTP_AUTHORIZATION</code> to PHP for application passwords to
              work.
            </li>
            <li>Use <code>https://</code> if your site redirects HTTP to HTTPS.</li>
            <li>Application passwords require WordPress 5.6+ and HTTPS (or local development).</li>
          </ul>
        </div>
      </div>
    </details>
  )
}
