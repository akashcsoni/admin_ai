import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { emailNewsletterApi } from '../../../lib/api'
import { useAuth } from '../../../context/AuthContext'
import type { Service } from '../../../data/services'
import EmailNewsletterCategoriesTab from './email-newsletter/EmailNewsletterCategoriesTab'
import EmailNewsletterComposeTab from './email-newsletter/EmailNewsletterComposeTab'
import EmailNewsletterListTab from './email-newsletter/EmailNewsletterListTab'
import EmailNewsletterSettingsTab from './email-newsletter/EmailNewsletterSettingsTab'
import EmailNewsletterTopicsTab from './email-newsletter/EmailNewsletterTopicsTab'
import type { EmailNewsletterSettings } from './email-newsletter/emailNewsletter.types'

type EmailNewsletterTab = 'list' | 'topics' | 'categories' | 'compose' | 'settings'

type EmailNewsletterWorkspaceProps = {
  service: Service
}

export default function EmailNewsletterWorkspace({ service }: EmailNewsletterWorkspaceProps) {
  const { token } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab: EmailNewsletterTab =
    tabParam === 'topics' ||
    tabParam === 'categories' ||
    tabParam === 'compose' ||
    tabParam === 'settings'
      ? tabParam
      : 'list'
  const [settings, setSettings] = useState<EmailNewsletterSettings | null>(null)

  const handleSettingsSaved = useCallback((nextSettings: EmailNewsletterSettings) => {
    setSettings(nextSettings)
  }, [])

  useEffect(() => {
    async function loadSettings() {
      if (!token) return

      try {
        const response = await emailNewsletterApi.getSettings(token)
        setSettings(response.settings)
      } catch {
        setSettings(null)
      }
    }

    void loadSettings()
  }, [token])

  function setActiveTab(tab: EmailNewsletterTab) {
    setSearchParams(tab === 'list' ? {} : { tab })
  }

  return (
    <div className="service-workspace-shell">
      <div
        className="service-workspace-tabs service-workspace-tabs--five"
        role="tablist"
        aria-label="Email newsletter sections"
      >
        <button
          type="button"
          role="tab"
          id="email-newsletter-tab-list"
          aria-selected={activeTab === 'list'}
          aria-controls="email-newsletter-panel-list"
          className={activeTab === 'list' ? 'active' : ''}
          onClick={() => setActiveTab('list')}
        >
          Newsletter list
        </button>
        <button
          type="button"
          role="tab"
          id="email-newsletter-tab-topics"
          aria-selected={activeTab === 'topics'}
          aria-controls="email-newsletter-panel-topics"
          className={activeTab === 'topics' ? 'active' : ''}
          onClick={() => setActiveTab('topics')}
        >
          Topic queue
        </button>
        <button
          type="button"
          role="tab"
          id="email-newsletter-tab-categories"
          aria-selected={activeTab === 'categories'}
          aria-controls="email-newsletter-panel-categories"
          className={activeTab === 'categories' ? 'active' : ''}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button
          type="button"
          role="tab"
          id="email-newsletter-tab-compose"
          aria-selected={activeTab === 'compose'}
          aria-controls="email-newsletter-panel-compose"
          className={activeTab === 'compose' ? 'active' : ''}
          onClick={() => setActiveTab('compose')}
        >
          Compose
        </button>
        <button
          type="button"
          role="tab"
          id="email-newsletter-tab-settings"
          aria-selected={activeTab === 'settings'}
          aria-controls="email-newsletter-panel-settings"
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      <div className="service-workspace-tabpanels">
        {activeTab === 'list' && (
          <div role="tabpanel" id="email-newsletter-panel-list" aria-labelledby="email-newsletter-tab-list">
            <EmailNewsletterListTab settings={settings} />
          </div>
        )}
        {activeTab === 'topics' && (
          <div role="tabpanel" id="email-newsletter-panel-topics" aria-labelledby="email-newsletter-tab-topics">
            <EmailNewsletterTopicsTab
              service={service}
              settings={settings}
              onSettingsSaved={handleSettingsSaved}
            />
          </div>
        )}
        {activeTab === 'categories' && (
          <div
            role="tabpanel"
            id="email-newsletter-panel-categories"
            aria-labelledby="email-newsletter-tab-categories"
          >
            <EmailNewsletterCategoriesTab settings={settings} />
          </div>
        )}
        {activeTab === 'compose' && (
          <div role="tabpanel" id="email-newsletter-panel-compose" aria-labelledby="email-newsletter-tab-compose">
            <EmailNewsletterComposeTab
              service={service}
              settings={settings}
              onSettingsSaved={handleSettingsSaved}
            />
          </div>
        )}
        {activeTab === 'settings' && (
          <div role="tabpanel" id="email-newsletter-panel-settings" aria-labelledby="email-newsletter-tab-settings">
            <EmailNewsletterSettingsTab onSettingsSaved={handleSettingsSaved} />
          </div>
        )}
      </div>
    </div>
  )
}
