type WebhookPayloadGuideProps = {
  platform: 'custom_webhook' | 'nextjs'
}

export default function WebhookPayloadGuide({ platform }: WebhookPayloadGuideProps) {
  const isNextJs = platform === 'nextjs'

  return (
    <details className="service-setup-guide">
      <summary className="service-setup-guide-summary">
        <span className="service-setup-guide-title">Webhook payload format & example</span>
        <span className="service-setup-guide-aside">
          <span className="service-setup-guide-meta">JSON reference</span>
          <span className="service-setup-guide-chevron" aria-hidden="true" />
        </span>
      </summary>

      <div className="service-setup-guide-body">
        <p className="service-field-hint service-setup-guide-lead">
          Content AI sends a <strong>POST</strong> request with{' '}
          <code>Content-Type: application/json</code>. If you set an API secret, it is sent as{' '}
          <code>X-Content-AI-Secret</code>.
        </p>

        <div className="service-setup-guide-notes">
          <p className="service-setup-guide-notes-title">Headers</p>
          <pre className="service-setup-guide-code">{`Content-Type: application/json
X-Content-AI-Secret: your-secret-here   // optional`}</pre>
        </div>

        <div className="service-setup-guide-notes">
          <p className="service-setup-guide-notes-title">1. Connection test (Test connection button)</p>
          <pre className="service-setup-guide-code">{isNextJs
            ? `{
  "event": "connection_test",
  "platform": "nextjs",
  "message": "Content AI headless publish connection test",
  "timestamp": "2026-06-29T10:30:00.000Z"
}`
            : `{
  "event": "connection_test",
  "message": "Content AI auto blog live publish connection test",
  "timestamp": "2026-06-29T10:30:00.000Z"
}`}</pre>
          <p className="service-field-hint">Return HTTP 200 to pass the test.</p>
        </div>

        <div className="service-setup-guide-notes">
          <p className="service-setup-guide-notes-title">2. Publish blog (after a post is generated)</p>
          <pre className="service-setup-guide-code">{isNextJs
            ? `{
  "event": "auto_blog_publish",
  "platform": "nextjs",
  "postId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "remoteStatus": "publish",
  "publishedAt": "2026-06-29T10:35:00.000Z",
  "post": {
    "title": "10 Tips for Better Email Newsletters",
    "slug": "10-tips-for-better-email-newsletters",
    "excerpt": "Short summary shown in listings…",
    "content": "<p>Full HTML article body…</p>",
    "status": "published",
    "focusKeyword": "email newsletters",
    "metaDescription": "SEO meta description…",
    "seoTitle": "10 Tips for Better Email Newsletters | Your Brand",
    "featuredImage": "https://cdn.example.com/hero.jpg"
  }
}`
            : `{
  "event": "auto_blog_publish",
  "postId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "remoteStatus": "publish",
  "publishedAt": "2026-06-29T10:35:00.000Z",
  "post": {
    "title": "10 Tips for Better Email Newsletters",
    "slug": "10-tips-for-better-email-newsletters",
    "excerpt": "Short summary shown in listings…",
    "content": "<p>Full HTML article body…</p>",
    "status": "published",
    "focusKeyword": "email newsletters",
    "metaDescription": "SEO meta description…",
    "seoTitle": "10 Tips for Better Email Newsletters | Your Brand",
    "featuredImage": "https://cdn.example.com/hero.jpg"
  }
}`}</pre>
          <p className="service-field-hint">
            <code>remoteStatus</code> is <code>publish</code> or <code>draft</code> (from your
            add-on setting). <code>post.content</code> is HTML.
          </p>
        </div>

        <div className="service-setup-guide-notes">
          <p className="service-setup-guide-notes-title">3. Response your endpoint should return</p>
          <pre className="service-setup-guide-code">{`HTTP 200 OK

{
  "remotePostId": "cms-item-123",
  "remotePostUrl": "https://yourwebsite.com/blog/10-tips-for-better-email-newsletters"
}`}</pre>
          <p className="service-field-hint">
            You may also use <code>id</code> and <code>url</code> instead of{' '}
            <code>remotePostId</code> and <code>remotePostUrl</code>. On error, return a non-200
            status and optionally <code>{`{ "message": "Why it failed" }`}</code>.
          </p>
        </div>
      </div>
    </details>
  )
}
