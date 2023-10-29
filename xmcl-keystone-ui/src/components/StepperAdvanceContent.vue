<template>
  <v-list
    lines="two"
    subheader
    style="background: transparent; width: 100%"
  >
    <v-list-item>
      <v-layout
        row
        class="max-w-full gap-4"
      >
        <div d-flex>
          <v-select
            v-model="data.java"
            outlined
            class="java-select"
            :label="t('java.location')"
            :placeholder="t('java.allocatedLong')"
            :items="javaItems"
            :menu-props="{ origin: 'auto', /* overflowY: true */ }"
            hide-details
            required
          />
        </div>
        <div
          d-flex
          xs2
        >
          <v-text-field
            v-model="data.minMemory"
            outlined
            hide-details
            type="number"
            :label="t('java.minMemory')"
            :placeholder="t('java.allocatedShort')"
            required
          />
        </div>
        <div
          d-flex
          xs2
        >
          <v-text-field
            v-model="data.maxMemory"
            outlined
            hide-details
            type="number"
            :label="t('java.maxMemory')"
            :placeholder="t('java.allocatedShort')"
            required
          />
        </div>
      </v-layout>
    </v-list-item>

    <VersionInputMinecraft
      v-if="showMinecraft"
      class="mt-4"
<<<<<<< HEAD
      :value="data.runtime.minecraft"
      :versions="versions"
      @input="onSelectMinecraft"
    />
    <VersionInputNeoForged
      v-if="isNotSelectingLabyMod"
      :value="data.runtime.neoForged"
      :minecraft="data.runtime.minecraft"
      :versions="versions"
      @input="onSelectNeoForged"
    />
    <VersionInputForge
      v-if="isNotSelectingLabyMod"
      :value="data.runtime.forge"
      :minecraft="data.runtime.minecraft"
      :versions="versions"
      @input="onSelectForge"
    />
    <VersionInputFabric
      v-if="isNotSelectingLabyMod"
      :value="data.runtime.fabricLoader"
      :minecraft="data.runtime.minecraft"
      :versions="versions"
      @input="onSelectFabric"
    />
    <VersionInputQuilt
      v-if="isNotSelectingLabyMod"
      :value="data.runtime.quiltLoader"
      :minecraft="data.runtime.minecraft"
      :versions="versions"
      @input="onSelectQuilt"
    />
    <VersionInputOptifine
      v-if="isNotSelectingLabyMod"
      :value="data.runtime.optifine"
      :forge="data.runtime.forge || ''"
      :minecraft="data.runtime.minecraft"
      :versions="versions"
      @input="onSelectOptifine"
    />
    <VersionInputLabymod
      :value="data.runtime.labyMod"
      :minecraft="data.runtime.minecraft"
      :versions="versions"
      @input="onSelectLabyMod"
    />
    <VersionInputLocal
      :value="data.version"
      :versions="versions"
      @input="onSelectLocalVersion"
    />
=======
    >
      <v-list-item-action class="self-center">
        <img
          :src="'image://builtin/minecraft'"
          width="40"
        >
        <!-- <v-checkbox /> -->
      </v-list-item-action>
      
        <v-list-item-title>
          {{
            t('minecraftVersion.name')
          }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{
            t('instance.versionHint')
          }}
        </v-list-item-subtitle>
      
      <v-list-item-action>
        <VersionMenu
          :is-clearable="false"
          :items="minecraftItems"
          :has-snapshot="true"
          :empty-text="t('minecraftVersion.empty')"
          :snapshot.sync="showAlpha"
          :snapshot-tooltip="t('minecraftVersion.showAlpha')"
          :refreshing="refreshingMinecraft"
          @select="onSelectMinecraft"
        >
          <template #default="{ on }">
            <v-text-field
              v-model="content.runtime.minecraft"
              outlined
              append-icon="arrow_drop_down"
              persistent-hint
              hide-details
              :readonly="true"
              @click:append="on.click($event);"
              v-on="on"
            />
          </template>
        </VersionMenu>
      </v-list-item-action>
    </v-list-item>
    <v-list-item>
      <v-list-item-action class="self-center">
        <img
          :src="'image://builtin/labyMod'"
          width="40px"
        >
      </v-list-item-action>
      
        <v-list-item-title>LabyMod</v-list-item-title>
        <v-list-item-subtitle>
          <a
            target="browser"
            href="https://www.labymod.net"
          >https://www.labymod.net</a>
        </v-list-item-subtitle>
      
      <v-list-item-action>
        <VersionMenu
          :is-clearable="true"
          :items="labyModItems"
          :clear-text="t('labyMod.disable')"
          :empty-text="t('labyMod.empty')"
          :has-snapshot="false"
          :refreshing="refreshingLabyMod"
          @select="onSelectLabyMod"
        >
          <template #default="{ on }">
            <v-text-field
              :value="content.runtime.labyMod"
              outlined
              append-icon="arrow_drop_down"
              hide-details
              persistent-hint
              :readonly="true"
              @click:append="on.click($event);"
              @click="refreshLabyMod()"
              v-on="on"
            />
          </template>
        </VersionMenu>
      </v-list-item-action>
    </v-list-item>
    <v-list-item v-if="isNotSelectingLabyMod">
      <v-list-item-action class="self-center">
        <img
          :src="'image://builtin/forge'"
          width="40"
        >
      </v-list-item-action>
      
        <v-list-item-title>
          {{
            t('forgeVersion.name')
          }}
        </v-list-item-title>
        <v-list-item-subtitle>
          <a
            target="browser"
            href="https://github.com/MinecraftForge/MinecraftForge"
          >https://github.com/MinecraftForge/MinecraftForge</a>
        </v-list-item-subtitle>
      
      <v-list-item-action>
        <VersionMenu
          :is-clearable="true"
          :items="forgeItems"
          :clear-text="t('forgeVersion.disable')"
          :empty-text="t('forgeVersion.empty')"
          :has-snapshot="true"
          :snapshot.sync="canShowBuggy"
          :snapshot-tooltip="t('fabricVersion.showSnapshot')"
          :refreshing="refreshingForge"
          @select="onSelectForge"
        >
          <template #default="{ on }">
            <v-text-field
              :model-value="content.runtime.forge"
              outlined
              append-icon="arrow_drop_down"
              hide-details
              persistent-hint
              :readonly="true"
              @click:append="on.click($event);"
              @click="refreshForge()"
              v-on="on"
            />
          </template>
        </VersionMenu>
      </v-list-item-action>
    </v-list-item>
    <v-list-item v-if="isNotSelectingLabyMod">
      <v-list-item-action class="self-center">
        <img
          :src="'image://builtin/fabric'"
          width="40"
        >
      </v-list-item-action>
      
        <v-list-item-title>Fabric</v-list-item-title>
        <v-list-item-subtitle>
          <a
            target="browser"
            href="https://fabricmc.net/"
          >https://fabricmc.net/</a>
        </v-list-item-subtitle>
      
      <v-list-item-action>
        <VersionMenu
          :is-clearable="true"
          :items="fabricItems"
          :clear-text="t('fabricVersion.disable')"
          :empty-text="t('fabricVersion.empty')"
          :has-snapshot="true"
          :snapshot.sync="showStableOnly"
          :snapshot-tooltip="t('fabricVersion.showSnapshot')"
          :refreshing="refreshingFabric"
          @select="onSelectFabric"
        >
          <template #default="{ on }">
            <v-text-field
              :model-value="content.runtime.fabricLoader"
              outlined
              hide-details
              append-icon="arrow_drop_down"
              persistent-hint
              :readonly="true"
              @click:append="on.click($event);"
              v-on="on"
            />
          </template>
        </VersionMenu>
      </v-list-item-action>
    </v-list-item>
    <v-list-item v-if="isNotSelectingLabyMod">
      <v-list-item-action class="self-center">
        <img
          :src="'image://builtin/quilt'"
          style="width: 40px"
        >
      </v-list-item-action>
      
        <v-list-item-title>Quilt</v-list-item-title>
        <v-list-item-subtitle>
          <a
            target="browser"
            href="https://quiltmc.org/"
          >https://quiltmc.org/</a>
        </v-list-item-subtitle>
      
      <v-list-item-action>
        <VersionMenu
          :is-clearable="true"
          :items="quiltItems"
          :clear-text="t('quiltVersion.disable')"
          :empty-text="t('quiltVersion.empty')"
          :refreshing="refreshingQuilt"
          @select="onSelectQuilt"
        >
          <template #default="{ on }">
            <v-text-field
              :model-value="content.runtime.quiltLoader"
              outlined
              hide-details
              append-icon="arrow_drop_down"
              persistent-hint
              :readonly="true"
              @click:append="on.click($event);"
              @click="refreshQuilt()"
              v-on="on"
            />
          </template>
        </VersionMenu>
      </v-list-item-action>
    </v-list-item>
    <v-list-item v-if="isNotSelectingLabyMod">
      <v-list-item-action class="self-center">
        <img
          :src="'image://builtin/optifine'"
          width="40px"
        >
      </v-list-item-action>
      
        <v-list-item-title>Optifine</v-list-item-title>
        <v-list-item-subtitle>
          <a
            target="browser"
            href="https://www.optifine.net/home"
          >https://www.optifine.net/home</a>
        </v-list-item-subtitle>
      
      <v-list-item-action>
        <VersionMenu
          :is-clearable="true"
          :items="optifineItems"
          :clear-text="t('optifineVersion.disable')"
          :empty-text="t('optifineVersion.empty')"
          :refreshing="refreshingOptifine"
          @select="onSelectOptifine"
        >
          <template #default="{ on }">
            <v-text-field
              :model-value="content.runtime.optifine"
              outlined
              hide-details
              append-icon="arrow_drop_down"
              persistent-hint
              :readonly="true"
              @click:append="on.click($event);"
              v-on="on"
            />
          </template>
        </VersionMenu>
      </v-list-item-action>
    </v-list-item>
    <v-list-item>
      <v-list-item-action class="self-center">
        <img
          :src="'image://builtin/craftingTable'"
          width="40px"
        >
      </v-list-item-action>

      
        <v-list-item-title>{{ t('localVersion.title', 1) }}</v-list-item-title>
        <v-list-item-subtitle>
          {{ t('localVersion.hint') }}
        </v-list-item-subtitle>
      
      <v-list-item-action>
        <VersionMenu
          :items="localItems"
          :empty-text="t('localVersion.empty')"
          @select="onSelectLocalVersion"
        >
          <template #default="{ on }">
            <v-text-field
              v-model="content.version"
              outlined
              hide-details
              :placeholder="t('localVersion.auto')"
              append-icon="arrow_drop_down"
              persistent-hint
              :readonly="true"
              @click:append="on.click($event);"
              v-on="on"
            />
          </template>
        </VersionMenu>
      </v-list-item-action>
    </v-list-item>
>>>>>>> b99c4f13 (model-value 1)
  </v-list>
</template>

<script lang=ts setup>
import VersionInputFabric from '@/components/VersionInputFabric.vue'
import VersionInputForge from '@/components/VersionInputForge.vue'
import VersionInputLocal from '@/components/VersionInputLocal.vue'
import VersionInputMinecraft from '@/components/VersionInputMinecraft.vue'
import VersionInputNeoForged from '@/components/VersionInputNeoForged.vue'
import VersionInputOptifine from '@/components/VersionInputOptifine.vue'
import { kInstanceCreation } from '../composables/instanceCreation'
import { kJavaContext } from '../composables/java'
import VersionInputLabymod from './VersionInputLabymod.vue'
import VersionInputQuilt from './VersionInputQuilt.vue'

import { useInstanceEditVersions } from '@/composables/instanceEdit'
import { kLocalVersions } from '@/composables/versionLocal'
import { injection } from '@/util/inject'

defineProps({
  valid: {
    type: Boolean,
    required: true,
  },
  showMinecraft: {
    type: Boolean,
    default: true,
  },
})

const { data } = injection(kInstanceCreation)
const { t } = useI18n()
const { versions } = injection(kLocalVersions)

const {
  onSelectMinecraft,
  onSelectNeoForged,
  onSelectForge,
  onSelectFabric,
  onSelectQuilt,
  onSelectOptifine,
  onSelectLabyMod,
  onSelectLocalVersion,
} = useInstanceEditVersions(data, versions)

const { all: javas } = injection(kJavaContext)
const javaItems = computed(() => javas.value.map(java => ({
  text: `Java ${java.majorVersion} (${java.version})`,
  value: java.path,
})))

const isNotSelectingLabyMod = computed(() => {
  return !data.runtime.labyMod
})
</script>

<style>
.java-select .v-select__selection {
  white-space: nowrap;
  overflow-x: hidden;
  overflow-y: hidden;

  max-width: 240px;
}
</style>
