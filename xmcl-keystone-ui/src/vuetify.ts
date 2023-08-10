import CurseforgeIcon from '@/components/CurseforgeIcon.vue'
import FTBIcon from '@/components/FTBIcon.vue'
import FabricIcon from '@/components/FabricIcon.vue'
import ForgeIcon from '@/components/ForgeIcon.vue'
import ImageIcon from '@/components/ImageIcon.vue'
import JarFileIcon from '@/components/JarFileIcon.vue'
import MinecraftIcon from '@/components/MinecraftIcon.vue'
import ModrinthIcon from '@/components/ModrinthIcon.vue'
import PackageFileIcon from '@/components/PackageFileIcon.vue'
import QuiltIcon from '@/components/QuiltIcon.vue'
import ZipFileIcon from '@/components/ZipFileIcon.vue'
import { IconProps, IconSet, createVuetify } from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import { aliases, md } from 'vuetify/iconsets/md'
import ru from 'vuetify/src/locale/ru'
import zhHans from 'vuetify/src/locale/zh-Hans'
import NeoForgedIcon from './components/NeoForgedIcon.vue'

const custom: IconSet = {
  component: (props: IconProps) => {
    if (props.icon === 'ftb') return FTBIcon
    if (props.icon === 'curseforge') return CurseforgeIcon
    if (props.icon === 'zip') return ZipFileIcon
    if (props.icon === 'jar') return JarFileIcon
    if (props.icon === 'package') return PackageFileIcon
    if (props.icon === 'modrinth') return ModrinthIcon
    if (props.icon === 'forge') return ForgeIcon
    if (props.icon === 'fabric') return FabricIcon
    if (props.icon === 'quilt') return QuiltIcon
    if (props.icon === 'minecraft') return MinecraftIcon
    if (props.icon === 'ftb') return FTBIcon
    if (props.icon === 'neoForged') return NeoForgedIcon
    if (props.icon === 'optifine') return ImageIcon
    if (props.icon === 'iris') return ImageIcon
    return null
  },
}

export const vuetify = createVuetify({
  locale: {
    messages: {
      zhHans,
      ru,
    },
    locale: 'en',
  },
  icons: {
    // values: {
    //   optifine: {
    //     component: ImageIcon,
    //     props: {
    //       src: 'http://launcher/icons/optifine',
    //     },
    //   },
    //   iris: {
    //     component: ImageIcon,
    //     props: {
    //       src: 'http://launcher/icons/iris',
    //     },
    //   },
    //   mmc: {
    //     component: ImageIcon,
    //     props: {
    //       src: 'http://launcher/icons/mmc',
    //     },
    //   },
    defaultSet: 'md',
    aliases,
    sets: {
      md,
      custom,
    },
  },
  theme: {
    themes: {
      light: {},
      system: {},
      dark: {
        dark: true,
        colors: {
          primary: '#4caf50',
          accent: '#00e676',
        },
      },
    },
  },
})
