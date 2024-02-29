export * from './Epoch'
export * from './EpochConfig'
export * from './Group'

import { EpochConfig } from './EpochConfig'
import { Epoch } from './Epoch'
import { Group } from './Group'

export const accountProviders = { EpochConfig, Epoch, Group }
