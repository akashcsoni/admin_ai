import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { socialContentApi } from '../../../lib/api'
import { useAuth } from '../../../context/AuthContext'
import type { Service } from '../../../data/services'
import SocialContentAddonsTab from './social-content/SocialContentAddonsTab'
import SocialContentCategoriesTab from './social-content/SocialContentCategoriesTab'
import SocialContentComposeTab from './social-content/SocialContentComposeTab'
import SocialContentListTab from './social-content/SocialContentListTab'
import SocialContentSettingsTab from './social-content/SocialContentSettingsTab'
import SocialContentTopicsTab from './social-content/SocialContentTopicsTab'
import type { SocialContentSettings } from './social-content/socialContent.types'

type SocialContentTab = 'list' | 'topics' | 'categories' | 'compose' | 'addons' | 'settings'

type SocialContentWorkspaceProps = {
  service: Service
}

export default function SocialContentWorkspace({ service }: SocialContentWorkspaceProps) {
  const { token } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab: SocialContentTab =
    tabParam === 'topics' ||
    tabParam === 'categories' ||
    tabParam === 'compose' ||
    tabParam === 'addons' ||
    tabParam === 'settings'
      ? tabParam
      : 'list'
  const [settings, setSettings] = useState<SocialContentSettings | null>(null)

  const handleSettingsSaved = useCallback((nextSettings: SocialContentSettings) => {
    setSettings(nextSettings)
  }, [])

  useEffect(() => {
    async function loadSettings() {
      if (!token) return

      try {
        const response = await socialContentApi.getSettings(token)
        setSettings(response.settings)
      } catch {
        setSettings(null)
      }
    }

    void loadSettings()
  }, [token])

  function setActiveTab(tab: SocialContentTab) {
    setSearchParams(tab === 'list' ? {} : { tab })
  }

  return (
    <div className="service-workspace-shell">
      <div
        className="service-workspace-tabs service-workspace-tabs--six"
        role="tablist"
        aria-label="Social content sections"
      >
        <button
          type="button"
          role="tab"
          id="social-content-tab-list"
          aria-selected={activeTab === 'list'}
          aria-controls="social-content-panel-list"
          className={activeTab === 'list' ? 'active' : ''}
          onClick={() => setActiveTab('list')}
        >
          Content list
        </button>
        <button
          type="button"
          role="tab"
          id="social-content-tab-topics"
          aria-selected={activeTab === 'topics'}
          aria-controls="social-content-panel-topics"
          className={activeTab === 'topics' ? 'active' : ''}
          onClick={() => setActiveTab('topics')}
        >
          Topic queue
        </button>
        <button
          type="button"
          role="tab"
          id="social-content-tab-categories"
          aria-selected={activeTab === 'categories'}
          aria-controls="social-content-panel-categories"
          className={activeTab === 'categories' ? 'active' : ''}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button
          type="button"
          role="tab"
          id="social-content-tab-compose"
          aria-selected={activeTab === 'compose'}
          aria-controls="social-content-panel-compose"
          className={activeTab === 'compose' ? 'active' : ''}
          onClick={() => setActiveTab('compose')}
        >
          Compose
        </button>
        <button
          type="button"
          role="tab"
          id="social-content-tab-addons"
          aria-selected={activeTab === 'addons'}
          aria-controls="social-content-panel-addons"
          className={activeTab === 'addons' ? 'active' : ''}
          onClick={() => setActiveTab('addons')}
        >
          Add-ons
        </button>
        <button
          type="button"
          role="tab"
          id="social-content-tab-settings"
          aria-selected={activeTab === 'settings'}
          aria-controls="social-content-panel-settings"
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      <div className="service-workspace-tabpanels">
        {activeTab === 'list' && (
          <div role="tabpanel" id="social-content-panel-list" aria-labelledby="social-content-tab-list">
            <SocialContentListTab settings={settings} />
          </div>
        )}
        {activeTab === 'topics' && (
          <div role="tabpanel" id="social-content-panel-topics" aria-labelledby="social-content-tab-topics">
            <SocialContentTopicsTab
              service={service}
              settings={settings}
              onSettingsSaved={handleSettingsSaved}
            />
          </div>
        )}
        {activeTab === 'categories' && (
          <div
            role="tabpanel"
            id="social-content-panel-categories"
            aria-labelledby="social-content-tab-categories"
          >
            <SocialContentCategoriesTab settings={settings} />
          </div>
        )}
        {activeTab === 'compose' && (
          <div role="tabpanel" id="social-content-panel-compose" aria-labelledby="social-content-tab-compose">
            <SocialContentComposeTab
              service={service}
              settings={settings}
              onSettingsSaved={handleSettingsSaved}
            />
          </div>
        )}
        {activeTab === 'addons' && (
          <div role="tabpanel" id="social-content-panel-addons" aria-labelledby="social-content-tab-addons">
            <SocialContentAddonsTab settingsEnabled={settings?.enabled ?? false} />
          </div>
        )}
        {activeTab === 'settings' && (
          <div role="tabpanel" id="social-content-panel-settings" aria-labelledby="social-content-tab-settings">
            <SocialContentSettingsTab onSettingsSaved={handleSettingsSaved} />
          </div>
        )}
      </div>
    </div>
  )
}
