import Mka from '@/core/mka/Mka';
import Player from '@/core/mka/Player';
import { clamp } from '@/core/utils/math';
import Live2DSprite from '@/module/live2d/Live2DSprite';
import MouseHandler from '@/module/live2d/MouseHandler';
import { Container } from '@pixi/display';

const MOUSE_HANDLING_ELEMENT = document.documentElement;

interface DraggableLive2DSprite extends Live2DSprite {
    dragging?: boolean;
}

export default class Live2DPlayer extends Player {
    gl: WebGLRenderingContext;

    readonly container = new Container();
    readonly sprites: Live2DSprite[] = [];

    mouseHandler: MouseHandler;

    constructor(mka: Mka) {
        super();

        this.gl = mka.gl;

        Live2D.setGL(this.gl);

        const self = this;

        this.mouseHandler = new class extends MouseHandler {
            focus(x: number, y: number) {
                self.sprites.forEach(sprite =>
                    sprite.model.focusController.focus(
                        clamp(((x - sprite.x) / sprite.width) * 2 - 1, -1, 1),
                        -clamp(((y - sprite.y) / sprite.height) * 2 - 1, -1, 1),
                    ),
                );
            }

            clearFocus() {
                super.clearFocus();

                self.sprites.forEach(sprite => sprite.model.focusController.focus(0, 0));
            }

            click(x: number, y: number) {
                // TODO: Don't do this here!
                if (self.mka) self.mka.pixiApp.stage.emit('hit', x, y);

                self.sprites.forEach(sprite => sprite.hit(x, y));
            }

            dragStart(x: number, y: number) {
                // start hit testing by the z order, from top to bottom
                for (let i = self.container.children.length - 1; i >= 0; i--) {
                    // need to ensure the container only contains Live2DSprites
                    const sprite = self.container.children[i] as DraggableLive2DSprite;

                    if (sprite.getBounds().contains(x, y)) {
                        sprite.dragging = true;

                        // break it so only one sprite will be dragged
                        break;
                    }
                }
            }

            dragMove(x: number, y: number, dx: number, dy: number) {
                for (const sprite of self.container.children as DraggableLive2DSprite[]) {
                    if (sprite.dragging) {
                        sprite.x += dx;
                        sprite.y += dy;
                        break;
                    }
                }
            }

            dragEnd() {
                for (const sprite of self.container.children as DraggableLive2DSprite[]) {
                    if (sprite.dragging) {
                        sprite.dragging = false;
                        self.dragEnded(sprite);
                        break;
                    }
                }
            }
        }(MOUSE_HANDLING_ELEMENT);

        mka.pixiApp.stage.addChild(this.container);
    }

    async addSprite(modelSettingsFile: string) {
        const sprite = await Live2DSprite.create(modelSettingsFile);
        this.sprites.push(sprite);
        this.container.addChild(sprite);

        return sprite;
    }

    removeSprite(sprite: Live2DSprite) {
        this.container.removeChild(sprite);
        this.sprites.splice(this.sprites.indexOf(sprite), 1);
        sprite.destroy();
    }

    /** @override */
    update() {
        return true;
    }

    destroy() {
        this.mouseHandler.destroy();
        super.destroy();
    }

    // to be overridden
    dragEnded(sprite: Live2DSprite) {}
}
