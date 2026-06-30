import StaticPageLayout from '../components/StaticPageLayout'
import { pageSeo } from '../config/seo'
import { staticPages, type StaticPageKey } from '../data/staticPages'

type StaticContentPageProps = {
  pageKey: StaticPageKey
}

export default function StaticContentPage({ pageKey }: StaticContentPageProps) {
  const page = staticPages[pageKey]
  const seo = pageSeo[pageKey]

  return <StaticPageLayout page={page} seo={seo} />
}
