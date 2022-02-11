import React, { useCallback, useState } from 'react'

import { IlkData } from '../../../blockchain/ilks'
import { Vault } from '../../../blockchain/vaults'
import { useAppContext } from '../../../components/AppContextProvider'
import { VaultContainerSpinner, WithLoadingIndicator } from '../../../helpers/AppSpinner'
import { WithErrorHandler } from '../../../helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from '../../../helpers/observableHook'
import { CollateralPricesWithFilters } from '../../collateralPrices/collateralPricesWithFilters'
import { AutomationFromKind } from '../common/enums/TriggersTypes'
import { TriggersData } from '../triggers/AutomationTriggersData'
import { AdjustSlFormControl } from './AdjustSlFormControl'
import { CancelSlFormControl } from './CancelSlFormControl'
import { ProtectionFormLayout } from './ProtectionFormLayout'

interface Props {
  ilkData: IlkData
  automationTriggersData: TriggersData
  collateralPrices: CollateralPricesWithFilters
  vault: Vault
}

export function ProtectionFormControl({
  ilkData,
  automationTriggersData,
  collateralPrices,
  vault,
}: Props) {
  const { txHelpers$, context$ } = useAppContext()

  const txHelpersWithError = useObservableWithError(txHelpers$)
  const contextWithError = useObservableWithError(context$)

  const [currentForm, setForm] = useState(AutomationFromKind.ADJUST)

  const toggleForms = useCallback(() => {
    setForm((prevState) =>
      prevState === AutomationFromKind.ADJUST
        ? AutomationFromKind.CANCEL
        : AutomationFromKind.ADJUST,
    )
  }, [currentForm])

  return (
    <WithErrorHandler error={[contextWithError.error]}>
      <WithLoadingIndicator
        value={[contextWithError.value]}
        customLoader={<VaultContainerSpinner />}
      >
        {([context]) => (
          <ProtectionFormLayout currentForm={currentForm} toggleForm={toggleForms}>
            {currentForm === AutomationFromKind.ADJUST ? (
              <AdjustSlFormControl
                vault={vault}
                collateralPrice={collateralPrices}
                ilkData={ilkData}
                triggerData={automationTriggersData}
                tx={txHelpersWithError.value}
                ctx={context}
              />
            ) : (
              <CancelSlFormControl
                vault={vault}
                ilkData={ilkData}
                triggerData={automationTriggersData}
                tx={txHelpersWithError.value}
                ctx={context}
              />
            )}
          </ProtectionFormLayout>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}