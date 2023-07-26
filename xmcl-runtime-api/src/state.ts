import { Saves } from './entities/save'
import { Settings } from './entities/setting'
import { LocalVersions } from './entities/version'
import { InstanceModsState } from './services/InstanceModsService'
import { GameOptionsState } from './services/InstanceOptionsService'
import { InstanceState } from './services/InstanceService'
import { InstanceVersionState } from './services/InstanceVersionService'
import { JavaState } from './services/JavaService'
import { LaunchState } from './services/LaunchService'
import { PeerState } from './services/PeerService'
import { UserState } from './services/UserService'

export type Mutations<T> = {
  [K in keyof T as T[K] extends Function ? K : never]: T[K] extends ((payload: infer P) => void) ? P : never
}

export const AllStates = [
  Settings,
  InstanceState,
  InstanceModsState,
  GameOptionsState,
  Saves,
  JavaState,
  LaunchState,
  UserState,
  LocalVersions,
  PeerState,
  InstanceVersionState,
]
