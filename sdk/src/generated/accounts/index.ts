export * from './Dapp'
export * from './Epoch'
export * from './EpochConfig'
export * from './Group'

import { Dapp } from './Dapp'
import { EpochConfig } from './EpochConfig'
import { Epoch } from './Epoch'
import { Group } from './Group'

export const accountProviders = { Dapp, EpochConfig, Epoch, Group }
