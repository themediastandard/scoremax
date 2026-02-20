const GOLD = '#b08a30'
const DARK = '#1e293b'
const GRAY_600 = '#4b5563'
const GRAY_500 = '#6b7280'
const WHITE = '#ffffff'

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://scoremaxtutoring.com'
}

export function emailLayout(options: {
  title: string
  body: string
  ctaText?: string
  ctaUrl?: string
  greeting?: string
}): string {
  const { title, body, ctaText, ctaUrl, greeting } = options
  const baseUrl = getBaseUrl()

  const ctaButton = ctaText && ctaUrl
    ? `
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 32px;">
        <tr>
          <td align="center">
            <a href="${ctaUrl}" style="display: inline-block; background-color: ${GOLD}; color: ${WHITE}; font-family: Georgia, serif; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 14px 28px; text-decoration: none;">
              ${ctaText}
            </a>
          </td>
        </tr>
      </table>
    `
    : ''

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, Helvetica, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 560px; background-color: ${WHITE};">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <a href="${baseUrl}" style="text-decoration: none;">
                <img src="${baseUrl}/Images/score-max-logo-wide.png" alt="ScoreMax" width="140" height="32" style="display: block; height: 32px; width: auto;">
              </a>
              <div style="width: 24px; height: 3px; background-color: ${GOLD}; margin-top: 20px;"></div>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <h1 style="margin: 0 0 16px 0; font-family: Georgia, serif; font-size: 24px; font-weight: 600; color: ${DARK};">
                ${title}
              </h1>
              ${greeting ? `<p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: ${GRAY_600};">${greeting}</p>` : ''}
              <div style="font-size: 16px; line-height: 1.6; color: ${GRAY_600};">
                ${body}
              </div>
              ${ctaButton}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px 32px 32px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: ${GRAY_500};">
                ScoreMax Tutoring · Expert test prep and academic tutoring
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

/** Renders a detail row (label: value) for use inside email body */
export function detailRow(label: string, value: string): string {
  return `<p style="margin: 0 0 8px 0;"><strong style="color: ${DARK};">${label}</strong> ${value}</p>`
}
