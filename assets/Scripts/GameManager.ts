import { _decorator, CCInteger, Component, instantiate, Label, Node, Prefab, Vec3 } from 'cc';
import { BLOCK_SIZE, PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

// 方块类型
enum BlockType {
    BT_NONE, // 空地
    BT_STONE, // 石头
}

// 游戏状态
enum GameState {
    GS_INIT, // 初始化
    GS_PLAYING, // 游戏中
    GS_END, // 游戏结束
}

@ccclass('GameManager')
export class GameManager extends Component {
    @property({type: Node})
    public startMenu: Node | null = null; // 开始菜单

    @property({ type: PlayerController })
    public playerCtrl: PlayerController | null = null; // 角色控制器

    @property({ type: Label })
    public stepsLabel: Label | null = null; // 计步器

    @property({type: Prefab})
    public boxPrefab: Prefab | null = null; // 方块预制体

    @property({type: CCInteger})
    public roadLength = 50; // 道路总长度

    private _road: BlockType[] = [];

    // 游戏开始，设置状态为初始化
    start() {
        this.setCurState(GameState.GS_INIT);
        // this.playerCtrl.node.on('JumpEnd', this.onPlayerJumpEnd, this);
    }

    // 初始化
    init() {
        if (this.startMenu) {
            this.startMenu.active = true;
        }

        this.generateRoad();

        if (this.playerCtrl) {
            this.playerCtrl.setInputActive(false);
            this.playerCtrl.node.setPosition(Vec3.ZERO);
            this.playerCtrl.reset();
        }
    }

    // 设置当前游戏状态
    setCurState(value: GameState) {
        switch(value) {
            case GameState.GS_INIT:
                // 初始化的时候生成道路
                this.init();
                break;
            case GameState.GS_PLAYING:
                if (this.startMenu) {
                    this.startMenu.active = false;
                }
                if (this.stepsLabel) {
                    this.stepsLabel.string = '0';
                }
                setTimeout(() => {
                    if (this.playerCtrl) {
                        this.playerCtrl.setInputActive(true);
                    }
                }, 0.1)
                break;
            case GameState.GS_END:
                break;
        }
    }

    // 根据类型生成方块
    spawnBlockByType(type: BlockType) {
        if (!this.boxPrefab) {
            return null;
        }
        let block: Node | null = null;
        switch(type) {
            case BlockType.BT_NONE:
                break;
            case BlockType.BT_STONE:
                block = instantiate(this.boxPrefab);
                this.node.addChild(block);
                break;
        }
        return block;
    }

    // 生成道路
    generateRoad() {
        this.node.removeAllChildren();

        this._road = [];

        this._road.push(BlockType.BT_STONE);

        // 生成道路的数组
        for (let i = 1; i < this.roadLength; i++) {
            if (this._road[i - 1] === BlockType.BT_NONE) { // 上一个是空地，下一个必须是石头
                this._road.push(BlockType.BT_STONE);
            } else { // 上一个是石头，下一个可以是石头也可以是空地
                this._road.push(Math.floor(Math.random() * 2));
            }
        }

        // 根据道路的数组生成道路
        for (let j = 0; j < this._road.length; j++) {
            let block: Node | null = this.spawnBlockByType(this._road[j]);
            if (block) {
                this.node.addChild(block);
                block.setPosition(j * BLOCK_SIZE, 0, 0);
            }
        }
    }

    // Play按钮点击
    onStartBtnClick() {
        this.setCurState(GameState.GS_PLAYING);
    }
}

