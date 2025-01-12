import { _decorator, Component, EventMouse, input, Input, Node, Vec3, Animation } from 'cc';
const { ccclass, property } = _decorator;

export const BLOCK_SIZE = 40; // 放大比

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property(Animation)
    BodyAnim: Animation = null;

    private _startJump = false; // 是否正在跳跃
    private _jumpStep = 0; // 跳跃的格子数
    private _curJumpTime = 0; // 当前跳跃时间
    private _jumpTime = 0.1; // 跳跃时间
    private _curJumpSpeed = 0; // 当前跳跃速度
    private _curPos = new Vec3(); // 当前位置
    private _deltaPos = new Vec3(); // 位置差
    private _targetPos = new Vec3(); // 目标位置
    private _curMoveIndex = 0; // 当前移动的索引
    start() {
    }

    // 设置是否监听鼠标输入
    setInputActive(active: boolean) {
        if (active) {
            input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        } else {
            input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        }
    }

    reset() {
        this._curMoveIndex = 0;
        this.node.getPosition(this._curPos);
        this._targetPos.set(Vec3.ZERO);
    }

    update(deltaTime: number) {
        if (this._startJump) {
            this._curJumpTime += deltaTime;
            if (this._curJumpTime > this._jumpTime) { // 跳跃结束
                this.node.setPosition(this._targetPos);
                this._startJump = false;
                this.onOnceJumpEnd();
            } else {
                this.node.getPosition(this._curPos); // 获取角色当前位置
                this._deltaPos.x = this._curJumpSpeed * deltaTime; // 计算当前帧的位置差
                Vec3.add(this._curPos, this._curPos, this._deltaPos); // 计算当前帧的位置
                this.node.setPosition(this._curPos); // 设置当前帧的位置
            }
        }
    }

    /**
     * 左键跳1格，右键跳2格
     * @param event 
     */
    onMouseUp(event: EventMouse) {
        switch (event.getButton()) {
            case EventMouse.BUTTON_LEFT:
                this.jumpByStep(1);
                break;
            case EventMouse.BUTTON_RIGHT:
                this.jumpByStep(2);
                break;
        }
    }


    /**
     * 跳跃
     * @param step 跳跃的格子数
     */
    jumpByStep(step: number) {
        if (this._startJump) {
            return;
        }
        this._startJump = true; // 设置开始跳跃状态
        this._jumpStep = step; // 设置跳跃的格子数
        this._curJumpTime = 0; // 重置开始跳跃的时间

        const clipName = step === 1 ? 'oneStep' : 'twoStep';
        const state = this.BodyAnim.getState(clipName);
        this._jumpTime = state.duration; // 获取跳跃时间

        const realJumpStep = this._jumpStep * BLOCK_SIZE; // 计算跳跃的距离
        this._curJumpSpeed = realJumpStep / this._jumpTime; // 计算跳跃速度
        this.node.getPosition(this._curPos); // 获取角色当前位置
        Vec3.add(this._targetPos, this._curPos, new Vec3(realJumpStep, 0, 0)); // 计算目标位置
        if (this.BodyAnim) {
            if (step === 1) {
                this.BodyAnim.play('oneStep');
            } else {
                this.BodyAnim.play('twoStep');
            }
        }
        this._curMoveIndex += step; // 更新当前移动的索引
    }

    /**
     * 跳跃结束
     */
    onOnceJumpEnd() {
        this.node.emit('JumpEnd', this._curMoveIndex);
    }
}

