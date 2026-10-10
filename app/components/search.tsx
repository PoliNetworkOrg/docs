import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search'
import { useStaticSearch } from 'fumadocs-core/search/client'
import { useI18n } from 'fumadocs-ui/contexts/i18n'
import { withBase } from '@/lib/base-url'

export default function DefaultSearchDialog(props: SharedProps) {
  const { locale } = useI18n()
  const search = useStaticSearch({
    locale,
    // the index is prerendered under the base path in PR previews
    from: withBase('/api/search'),
  })

  return (
    <SearchDialog {...search} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList />
      </SearchDialogContent>
    </SearchDialog>
  )
}
