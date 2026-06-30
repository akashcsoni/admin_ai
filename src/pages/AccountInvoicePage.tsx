import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faPrint } from '@fortawesome/free-solid-svg-icons'
import AccountHero from '../components/AccountHero'
import SEO from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { breadcrumbJsonLd } from '../config/seo'
import { billingApi, type InvoiceRecord } from '../lib/api'
import '../styles/account.css'
import '../styles/account-invoice.css'

function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatAddress(parts: string[]): string[] {
  return parts.map((part) => part.trim()).filter(Boolean)
}

function formatProviderLabel(description: string): string | null {
  const match = description.match(/\((stripe|razorpay)\)/i)
  if (!match) return null
  return match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase()
}

function buildCompanyAddress(company: InvoiceRecord['companySnapshot']): string[] {
  return formatAddress([
    company.companyAddressLine1,
    company.companyAddressLine2,
    [company.companyCity, company.companyState, company.companyPostalCode].filter(Boolean).join(', '),
    company.companyCountry,
  ])
}

function buildCustomerAddress(customer: InvoiceRecord['customerSnapshot']): string[] {
  return formatAddress([
    customer.addressLine1,
    customer.addressLine2,
    [customer.city, customer.state, customer.postalCode].filter(Boolean).join(', '),
    customer.country,
  ])
}

export default function AccountInvoicePage() {
  const { purchaseId = '' } = useParams()
  const { token } = useAuth()
  const [invoice, setInvoice] = useState<InvoiceRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token || !purchaseId) return

    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await billingApi.getInvoice(token!, purchaseId)
        setInvoice(response.invoice)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load invoice')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [token, purchaseId])

  function handlePrint() {
    window.print()
  }

  const company = invoice?.companySnapshot
  const customer = invoice?.customerSnapshot
  const paymentProvider = invoice?.lineItems[0]
    ? formatProviderLabel(invoice.lineItems[0].description)
    : null

  return (
    <>
      <SEO
        title="Invoice | Content AI"
        description="View and print your Content AI purchase invoice."
        path={`/account/billing/invoice/${purchaseId}`}
        noindex
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Account', path: '/account' },
          { name: 'Billing', path: '/account/billing' },
          { name: 'Invoice', path: `/account/billing/invoice/${purchaseId}` },
        ])}
      />

      <div className="account-page account-invoice-page">
        <div className="no-print">
          <AccountHero
            activeTab="billing"
            eyebrow="Billing"
            title={invoice?.invoiceNumber ?? 'Invoice'}
            lead={
              invoice
                ? `Issued ${formatDate(invoice.issuedAt)} · Download or print for your records.`
                : 'Download or print this invoice for your records.'
            }
            breadcrumb={[
              { label: 'Home', to: '/' },
              { label: 'Account', to: '/account' },
              { label: 'Billing', to: '/account/billing' },
              { label: invoice?.invoiceNumber ?? 'Invoice' },
            ]}
            action={
              <div className="account-hero-actions">
                <Link to="/account/billing" className="btn btn-secondary">
                  <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
                  Back to billing
                </Link>
                {invoice && (
                  <button type="button" className="btn btn-primary" onClick={handlePrint}>
                    <FontAwesomeIcon icon={faPrint} aria-hidden="true" />
                    Print invoice
                  </button>
                )}
              </div>
            }
          />
        </div>

        <section className="account-dashboard account-invoice-dashboard" aria-label="Invoice">
          <div className="account-container account-invoice-container">
            {error && <p className="account-alert account-alert--error no-print">{error}</p>}

            {loading ? (
              <p className="account-muted no-print">Loading invoice...</p>
            ) : invoice && company && customer ? (
              <article className="account-invoice-sheet" id="invoice-print-area">
                <header className="account-invoice-top">
                  <div className="account-invoice-brand">
                    <p className="account-invoice-brand-label">From</p>
                    <h1>{company.companyName || 'Content AI'}</h1>
                    <div className="account-invoice-address">
                      {buildCompanyAddress(company).map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                      {company.companyEmail && <span>{company.companyEmail}</span>}
                      {company.companyPhone && <span>{company.companyPhone}</span>}
                      {company.taxId && <span>Tax ID: {company.taxId}</span>}
                    </div>
                  </div>

                  <div className="account-invoice-meta-panel">
                    <p className="account-invoice-title">Invoice</p>
                    <dl className="account-invoice-meta-list">
                      <div>
                        <dt>Invoice number</dt>
                        <dd>{invoice.invoiceNumber}</dd>
                      </div>
                      <div>
                        <dt>Date of issue</dt>
                        <dd>{formatDate(invoice.issuedAt)}</dd>
                      </div>
                      <div>
                        <dt>Status</dt>
                        <dd>
                          <span className="account-invoice-status">Paid</span>
                        </dd>
                      </div>
                      <div>
                        <dt>Reference</dt>
                        <dd className="account-invoice-ref">{invoice.purchaseId}</dd>
                      </div>
                      {paymentProvider && (
                        <div>
                          <dt>Payment method</dt>
                          <dd>{paymentProvider}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </header>

                <div className="account-invoice-parties">
                  <div className="account-invoice-party">
                    <h2>Bill to</h2>
                    <p className="account-invoice-party-name">{customer.billingName}</p>
                    {customer.companyName && <p>{customer.companyName}</p>}
                    {buildCustomerAddress(customer).map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                    <p>{customer.email || customer.accountEmail}</p>
                    {customer.phone && <p>{customer.phone}</p>}
                    {customer.taxId && <p>Tax ID: {customer.taxId}</p>}
                  </div>

                  <div className="account-invoice-party account-invoice-party--summary">
                    <h2>Amount due</h2>
                    <p className="account-invoice-amount-due">{formatMoney(invoice.subtotalCents, invoice.currency)}</p>
                    <p className="account-invoice-amount-note">Paid in full on {formatDate(invoice.issuedAt)}</p>
                  </div>
                </div>

                <div className="account-invoice-table-wrap">
                  <table className="account-invoice-table">
                    <thead>
                      <tr>
                        <th scope="col">Description</th>
                        <th scope="col">Qty</th>
                        <th scope="col">Unit price</th>
                        <th scope="col">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.lineItems.map((item) => (
                        <tr key={`${item.description}-${item.amountCents}`}>
                          <td>{item.description}</td>
                          <td>{item.quantity}</td>
                          <td>{formatMoney(item.unitAmountCents, invoice.currency)}</td>
                          <td>{formatMoney(item.amountCents, invoice.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="account-invoice-totals">
                  <dl>
                    <div>
                      <dt>Subtotal</dt>
                      <dd>{formatMoney(invoice.subtotalCents, invoice.currency)}</dd>
                    </div>
                    <div className="account-invoice-totals-row--grand">
                      <dt>Total paid</dt>
                      <dd>{formatMoney(invoice.subtotalCents, invoice.currency)}</dd>
                    </div>
                    <div>
                      <dt>Currency</dt>
                      <dd>{invoice.currency.toUpperCase()}</dd>
                    </div>
                  </dl>
                </div>

                {company.invoiceFooter && (
                  <footer className="account-invoice-footer">
                    <p>{company.invoiceFooter}</p>
                  </footer>
                )}
              </article>
            ) : (
              !error && <p className="account-muted no-print">Invoice not found.</p>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
