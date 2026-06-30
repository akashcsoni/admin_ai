function stripHtmlToPlain(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent?.replace(/\s+/g, ' ').trim() ?? ''
}

function copyViaHiddenElement(html: string): boolean {
  const container = document.createElement('div')
  container.innerHTML = html
  container.setAttribute('contenteditable', 'true')
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.style.top = '0'
  document.body.appendChild(container)

  const range = document.createRange()
  range.selectNodeContents(container)

  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)

  let copied = false
  try {
    copied = document.execCommand('copy')
  } catch {
    copied = false
  } finally {
    selection?.removeAllRanges()
    document.body.removeChild(container)
  }

  return copied
}

/** Paste into Gmail/Outlook compose with the same rendered look as the preview. */
export async function copyRenderedEmailHtml(
  html: string,
  plainText?: string,
  iframe?: HTMLIFrameElement | null,
): Promise<boolean> {
  const renderedBodyHtml = iframe?.contentDocument?.body?.innerHTML?.trim()
  const htmlForClipboard = renderedBodyHtml || html
  const plain =
    plainText?.trim() ||
    iframe?.contentDocument?.body?.innerText?.trim() ||
    stripHtmlToPlain(htmlForClipboard)

  if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([htmlForClipboard], { type: 'text/html' }),
          'text/plain': new Blob([plain], { type: 'text/plain' }),
        }),
      ])
      return true
    } catch {
      // fall through to execCommand
    }
  }

  if (copyViaHiddenElement(htmlForClipboard)) {
    return true
  }

  return false
}

/** Raw HTML source for Mailchimp, Klaviyo, SendGrid HTML blocks. */
export async function copyEmailHtmlSource(html: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(html)
    return true
  } catch {
    return false
  }
}
