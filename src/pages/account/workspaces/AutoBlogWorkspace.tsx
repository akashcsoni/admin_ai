import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { autoBlogApi } from '../../../lib/api'
import { useAuth } from '../../../context/AuthContext'
import type { Service } from '../../../data/services'
import AutoBlogAddonsTab from './auto-blog/AutoBlogAddonsTab'
import AutoBlogCategoriesTab from './auto-blog/AutoBlogCategoriesTab'
import AutoBlogListTab from './auto-blog/AutoBlogListTab'
import AutoBlogSettingsTab from './auto-blog/AutoBlogSettingsTab'
import AutoBlogTopicsTab from './auto-blog/AutoBlogTopicsTab'
import type { AutoBlogSettings } from './auto-blog/autoBlog.types'

type AutoBlogTab = 'list' | 'topics' | 'categories' | 'addons' | 'settings'

type AutoBlogWorkspaceProps = {
  service: Service
}

export default function AutoBlogWorkspace({ service }: AutoBlogWorkspaceProps) {
  const { token } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab: AutoBlogTab =
    tabParam === 'topics' ||
    tabParam === 'categories' ||
    tabParam === 'addons' ||
    tabParam === 'settings'
      ? tabParam
      : 'list'
  const [settings, setSettings] = useState<AutoBlogSettings | null>(null)

  const handleSettingsSaved = useCallback((nextSettings: AutoBlogSettings) => {
    setSettings(nextSettings)
  }, [])

  useEffect(() => {
    async function loadSettings() {
      if (!token) return

      try {
        const response = await autoBlogApi.getSettings(token)
        setSettings(response.settings)
      } catch {
        setSettings(null)
      }
    }

    void loadSettings()
  }, [token])

  function setActiveTab(tab: AutoBlogTab) {
    setSearchParams(tab === 'list' ? {} : { tab })
  }

  return (
    <div className="service-workspace-shell">
      <div
        className="service-workspace-tabs service-workspace-tabs--five"
        role="tablist"
        aria-label="Auto blog sections"
      >
        <button
          type="button"
          role="tab"
          id="auto-blog-tab-list"
          aria-selected={activeTab === 'list'}
          aria-controls="auto-blog-panel-list"
          className={activeTab === 'list' ? 'active' : ''}
          onClick={() => setActiveTab('list')}
        >
          Blog list
        </button>
        <button
          type="button"
          role="tab"
          id="auto-blog-tab-topics"
          aria-selected={activeTab === 'topics'}
          aria-controls="auto-blog-panel-topics"
          className={activeTab === 'topics' ? 'active' : ''}
          onClick={() => setActiveTab('topics')}
        >
          Topic queue
        </button>
        <button
          type="button"
          role="tab"
          id="auto-blog-tab-categories"
          aria-selected={activeTab === 'categories'}
          aria-controls="auto-blog-panel-categories"
          className={activeTab === 'categories' ? 'active' : ''}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button
          type="button"
          role="tab"
          id="auto-blog-tab-addons"
          aria-selected={activeTab === 'addons'}
          aria-controls="auto-blog-panel-addons"
          className={activeTab === 'addons' ? 'active' : ''}
          onClick={() => setActiveTab('addons')}
        >
          Add-ons
        </button>
        <button
          type="button"
          role="tab"
          id="auto-blog-tab-settings"
          aria-selected={activeTab === 'settings'}
          aria-controls="auto-blog-panel-settings"
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      <div className="service-workspace-tabpanels">
        {activeTab === 'list' && (
          <div role="tabpanel" id="auto-blog-panel-list" aria-labelledby="auto-blog-tab-list">
            <AutoBlogListTab
              service={service}
              settings={settings}
              onSettingsSaved={handleSettingsSaved}
            />
          </div>
        )}
        {activeTab === 'topics' && (
          <div role="tabpanel" id="auto-blog-panel-topics" aria-labelledby="auto-blog-tab-topics">
            <AutoBlogTopicsTab
              service={service}
              settings={settings}
              onSettingsSaved={handleSettingsSaved}
            />
          </div>
        )}
        {activeTab === 'categories' && (
          <div role="tabpanel" id="auto-blog-panel-categories" aria-labelledby="auto-blog-tab-categories">
            <AutoBlogCategoriesTab settings={settings} />
          </div>
        )}
        {activeTab === 'addons' && (
          <div role="tabpanel" id="auto-blog-panel-addons" aria-labelledby="auto-blog-tab-addons">
            <AutoBlogAddonsTab settingsEnabled={settings?.enabled ?? false} />
          </div>
        )}
        {activeTab === 'settings' && (
          <div role="tabpanel" id="auto-blog-panel-settings" aria-labelledby="auto-blog-tab-settings">
            <AutoBlogSettingsTab onSettingsSaved={handleSettingsSaved} />
          </div>
        )}
      </div>
    </div>
  )
}
