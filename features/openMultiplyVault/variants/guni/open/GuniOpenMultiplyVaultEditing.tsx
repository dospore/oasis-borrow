import { VaultActionInput } from 'components/vault/VaultActionInput'
import { handleNumericInput } from 'helpers/input'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Divider, Flex, Grid, Text } from 'theme-ui'

import { OpenMultiplyVaultState } from '../../../openMultiplyVault'
import { GuniOpenMultiplyVaultChangesInformation } from './GuniOpenMultiplyVaultChangesInformation'

export function GuniOpenMultiplyVaultEditing(props: OpenMultiplyVaultState) {
  const { t } = useTranslation()

  const {
    token,
    depositAmount,
    maxDepositAmount,
    updateDeposit,
    updateDepositMax,
    ilkData: { liquidationRatio },
    inputAmountsEmpty,
  } = props

  const maxMultiple = liquidationRatio.div(liquidationRatio.minus(one)).toNumber().toFixed(0)

  return (
    <Grid gap={4}>
      <Grid gap={4}>
        <VaultActionInput
          action="Deposit"
          token="DAI"
          showMax={true}
          hasAuxiliary={false}
          onSetMax={updateDepositMax!}
          amount={depositAmount}
          onChange={handleNumericInput(updateDeposit!)}
          maxAmount={maxDepositAmount}
          maxAmountLabel={t('balance')}
          hasError={false}
        />
        <Flex
          sx={{
            border: '1px solid',
            borderColor: 'primary',
            borderRadius: 'large',
            justifyContent: 'center',
            py: '10px',
          }}
        >
          <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', color: 'primary' }}>
            {maxMultiple}x {token}
          </Text>
        </Flex>
      </Grid>
      {!inputAmountsEmpty && <Divider />}
      <GuniOpenMultiplyVaultChangesInformation {...props} />
    </Grid>
  )
}