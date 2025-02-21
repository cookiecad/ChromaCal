import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: 'ChromaCal',
    executableName: 'chromacal',
    appBundleId: 'com.cookiecad.chromacal',
    appCategoryType: 'public.app-category.productivity',
    appCopyright: 'Copyright © 2024 Cookiecad',
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: 'ChromaCal',
      authors: 'Cookiecad',
      description: 'A color coded agenda for people with time-blindness'
    }), 
    new MakerZIP({}, ['linux', 'win32']),
    new MakerDeb({
      options: {
        productName: 'ChromaCal',
        maintainer: 'Cookiecad',
        homepage: 'https://github.com/cookiecad/ChromaCal'
      }
    })
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
