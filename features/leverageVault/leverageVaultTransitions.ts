import { maxUint256 } from 'blockchain/calls/erc20'
import { zero } from 'helpers/zero'

import { LeverageVaultChange, LeverageVaultState } from './leverageVault'

export type OpenVaultTransitionChange =
  | {
      kind: 'progressEditing'
    }
  | {
      kind: 'progressProxy'
    }
  | {
      kind: 'backToEditing'
    }
  | {
      kind: 'regressAllowance'
    }

export function applyOpenVaultTransition(
  change: LeverageVaultChange,
  state: LeverageVaultState,
): LeverageVaultState {
  if (change.kind === 'progressEditing') {
    const { errorMessages, proxyAddress, depositAmount, allowance } = state
    const canProgress = !errorMessages.length
    const hasProxy = !!proxyAddress

    const openingEmptyVault = depositAmount ? depositAmount.eq(zero) : true
    const depositAmountLessThanAllowance =
      allowance && depositAmount && allowance.gte(depositAmount)

    const hasAllowance =
      state.token === 'ETH' ? true : depositAmountLessThanAllowance || openingEmptyVault

    const stage = !hasProxy
      ? 'proxyWaitingForConfirmation'
      : !hasAllowance
      ? 'allowanceWaitingForConfirmation'
      : 'openWaitingForConfirmation'
    if (canProgress) {
      return {
        ...state,
        stage,
      }
    }
  }

  if (change.kind === 'progressProxy') {
    return {
      ...state,
      stage: state.token === 'ETH' ? 'editing' : 'allowanceWaitingForConfirmation',
    }
  }

  if (change.kind === 'backToEditing') {
    return {
      ...state,
      stage: 'editing',
    }
  }

  if (change.kind === 'regressAllowance') {
    return {
      ...state,
      ...(state.stage === 'allowanceFailure'
        ? { stage: 'allowanceWaitingForConfirmation' }
        : {
            stage: 'editing',
            allowanceAmount: maxUint256,
            selectedAllowanceRadio: 'unlimited',
          }),
    }
  }

  return state
}