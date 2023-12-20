<template>
  <transition name="track">
    <div v-if="visible" class="trackModel" :style="cssVars">
      <div class="trackModelContent">
        <div :style="contentStyle" class="content-box move-in">
          <slot name="title">
            <div class="trackModelTitle" :style="titleStyle">
              <div>{{ title }}</div>
            </div>
            <img class="titleImage" src="./img/bg_title.png" alt="title" />
          </slot>
          <div
            class="closeIcon"
            :style="closeStyle"
            @mouseover="isHover = true"
            @mouseleave="isHover = false"
            @click="handleClose"
          >
            <!--          由于这里hover事件可能比较频繁，用v-show改善性能-->
            <img v-show="!isHover" src="./img/icon_close.png" alt="closeImage" />
            <img v-show="isHover" src="./img/icon_close_click.png" alt="closeOverImage" />
          </div>
          <div class="trackModelBody">
            <slot></slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
  import { isFunction, isNumber, isString } from 'lodash-es';

  export default {
    name: 'TrackModelWrapper',
    props: {
      left: {
        type: Number,
        default: 10,
      },
      top: {
        type: Number,
        default: 10,
      },
      height: {
        type: [Number, String],
        default: 'fit-content',
      },
      width: {
        type: [Number, String],
        default: 'fit-content',
      },
      contentStyle: {
        type: Object,
        default: () => ({}),
      },
      beforeClose: {
        type: Function,
        default: () => true,
      },
      afterClose: {
        type: Function,
      },
      closeStyle: {
        type: Object,
        default: () => ({
          position: 'absolute',
          right: '5px',
          top: '5px',
          cursor: 'pointer',
        }),
      },
      title: {
        type: String,
        default: '',
      },
      titleStyle: {
        type: Object,
        default: () => ({}),
      },
      duration: {
        type: Number,
        default: 1000,
      },
    },
    data() {
      return {
        visible: true,
        isHover: false,
      };
    },
    computed: {
      //css变量
      cssVars() {
        return {
          '--top': this.getStyleValue(this.top, 10),
          '--left': this.getStyleValue(this.left, 10),
          '--width': this.getStyleValue(this.width, 'fit-content'),
          '--height': this.getStyleValue(this.height, 'fit-content'),
          '--duration': this.getAnimation(),
        };
      },
    },
    mounted() {
      //挂载后做点什么
    },
    methods: {
      //手动关闭弹窗
      handleClose() {
        if (isFunction(this.beforeClose) && this.beforeClose()) {
          this.visible = false;
          if (isFunction(this.afterClose)) {
            this.afterClose();
          }
        }
      },
      getStyleValue(value, defaultVal) {
        if (isNumber(value)) {
          return value + 'px';
        } else if (isString(value)) {
          return value;
        } else {
          return defaultVal;
        }
      },
      getAnimation() {
        if (isNumber(this.duration)) {
          if (this.duration === 0) {
            return '0s';
          } else {
            return this.duration / 1000 + 's';
          }
        } else {
          //TODO:警告参数类型错误
          return '0s';
        }
      },
    },
  };
</script>

<style scoped lang="scss">
  @import 'track-model';
  .trackModel {
    width: 100%;
    height: 100%;
    color: #fff;
    user-select: none;
  }

  .titleImage {
    position: absolute;
    top: 0;
    left: 0;
  }

  .trackModelContent {
    position: absolute;
    z-index: $model-z-index;
    //样式绑定
    top: var(--top);
    left: var(--left);
  }
  .content-box {
    //样式绑定
    width: var(--width) !important;
    height: var(--height) !important;
    min-width: 240px;
    //通过样式绑定，让动画时间可以外部控制
    animation-duration: var(--duration);
    animation-fill-mode: both;
    animation-name: moveIn;
  }

  @keyframes moveIn {
    0% {
      opacity: 0;
      transform-origin: center bottom;
      transform: scale(0.2);
    }
    100% {
      opacity: 1;
      transform-origin: center bottom;
      transform: scale(1);
    }
  }
</style>
