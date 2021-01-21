import BigNumber from 'bignumber.js'
import { Ilk } from 'features/ilks/ilks'
import Web3 from 'web3'

import { McdJug } from '../../../types/web3-v1-contracts/mcd-jug'
import { RAY, SECONDS_PER_YEAR } from '../../constants'
import { CallDef } from './callsHelpers'

export interface JugIlkData<Ilk> {
  stabilityFee: BigNumber
  feeLastLevied: Date
}
export const jugIlks: CallDef<Ilk, JugIlkData<Ilk>> = {
  call: (_, { contract, mcdJug }) => contract<McdJug>(mcdJug).methods.ilks,
  prepareArgs: (collateralTypeName) => [Web3.utils.utf8ToHex(collateralTypeName)],
  postprocess: ({ 0: rawFee, 1: rawLastLevied }: any) => {
    const v = new BigNumber(rawFee).dividedBy(RAY)
    BigNumber.config({ POW_PRECISION: 100 })
    const stabilityFee = v.pow(SECONDS_PER_YEAR).minus(1)
    const feeLastLevied = new Date(rawLastLevied * 1000)
    return { stabilityFee, feeLastLevied }
  },
}

// BASE_COLLATERAL_FEE
export const jugBase: CallDef<void, BigNumber> = {
  call: (_, { contract, mcdJug }) => contract<McdJug>(mcdJug).methods.base,
  prepareArgs: () => [],
  postprocess: (result: any) => new BigNumber(result),
}