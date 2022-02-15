import { trackingEvents } from 'analytics/analytics'
import { useAppContext } from 'components/AppContextProvider'

import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { VaultHistoryView } from 'features/vaultHistory/VaultHistoryView'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Grid } from 'theme-ui'

import { ManageVaultState } from 'features/borrow/manage/pipes/manageVault'
import { createManageVaultAnalytics$ } from 'features/borrow/manage/pipes/manageVaultAnalytics'
import { ManageInstiVaultDetails } from './ManageInstiVaultDetails'
import { ManageInstiVaultForm } from './ManageInstiVaultForm'
import { DefaultVaultHeader } from 'components/vault/DefaultVaultHeader'
import { VaultIlkDetailsItem } from 'components/vault/VaultHeader'
import { formatPercent } from 'helpers/formatters/format'
import { BigNumber } from 'bignumber.js'


export function ManageInstiVaultContainer({
  manageVault,
  vaultHistory
}: {
  manageVault: ManageVaultState
  vaultHistory: VaultHistoryEvent[]
}) {
  const { manageVault$, context$ } = useAppContext()
  const {
    vault: { id, ilk },
    clear,
    ilkData
  } = manageVault
   
  const { t } = useTranslation()

  //mocked insti vault values
  // to get from vault object when pipeline is ready
  const originationFee = new BigNumber(0.01)
  const activeCollRatio = new BigNumber(1.4)
  const debtCeiling = new BigNumber(500000)

  useEffect(() => {
    const subscription = createManageVaultAnalytics$(
      manageVault$(id),
      context$,
      trackingEvents,
    ).subscribe()

    return () => {
      clear()
      subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      <DefaultVaultHeader header={t('vault.insti-header', { ilk, id })} ilkData={ilkData} id={id}>
        <VaultIlkDetailsItem
            label={t('manage-vault.stability-fee')}
            value={`${formatPercent(originationFee.times(100), { precision: 2 })}`}
            tooltipContent={t('manage-multiply-vault.tooltip.dust-limit')}
            styles={{
              tooltip: {
                left: ['-80px', 'auto'],
                right: ['auto', '-32px'],
              },
            }}
          />
      </DefaultVaultHeader>
      <Grid variant="vaultContainer">
        <Grid gap={5} mb={[0, 5]}>
          <ManageInstiVaultDetails {...manageVault} />
          <VaultHistoryView vaultHistory={vaultHistory} />
        </Grid>
        <Box>
          <ManageInstiVaultForm {...manageVault} />
        </Box>
      </Grid>
    </>
  )
}