import { App, Module } from '@/App';
import { LEAVES_NUMBER } from '@/defaults';
import LeavesPlayer from '@/module/leaves/LeavesPlayer';
import { Renderer } from '@pixi/core';
import { Loader } from '@pixi/loaders';
import { ParticleRenderer } from '@pixi/particles';
import { SpritesheetLoader } from '@pixi/spritesheet';
import debounce from 'lodash/debounce';

Renderer.registerPlugin('particle', ParticleRenderer as any);
Loader.registerPlugin(SpritesheetLoader);

export interface Config {
    leaves: {
        enabled?: boolean;
        number?: number;
    };
}

export default class LeavesModule implements Module {
    name = 'Leaves';

    player?: LeavesPlayer;

    number = LEAVES_NUMBER;

    constructor(readonly app: App) {
        app.on('config:leaves.enabled', (enabled: boolean) => {
                if (enabled) this.setup();

                if (enabled) app.mka.enablePlayer('leaves');
                else app.mka.disablePlayer('leaves');
            })
            .on(
                'config:leaves.number',
                debounce((value: number) => {
                    this.number = value;

                    this.player && (this.player.number = value);
                }, 200),
            )
            .on('configReady', (config: Config) => {
                app.emit('config', 'leaves.enabled', false, true);
                app.emit('config', 'leaves.number', this.number, true);
            });
    }

    private setup() {
        if (!this.player) {
            this.player = new LeavesPlayer();
            this.player.number = this.number;

            this.app.mka.addPlayer('leaves', this.player);
        }
    }
}