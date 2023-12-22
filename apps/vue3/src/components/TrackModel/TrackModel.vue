<template>
  <transition name="track">
    <div v-if="visible" class="trackModel">
      <div :style="props.contentStyle" class="trackModelContent move-in">
        <slot name="title">
          <div class="trackModelTitle" :style="props.titleStyle">
            <div>{{ props.title }}</div>
          </div>
          <img class="titleImage" src="./img/bg_title.png" alt="title" />
        </slot>
        <div
          class="closeIcon"
          :style="props.closeStyle"
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
  </transition>
</template>

<script setup>
  import { computed, getCurrentInstance, onMounted, ref } from 'vue';
  import { isFunction, isNumber, isString } from 'lodash-es';
  const props = defineProps({
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
    // eslint-disable-next-line vue/require-default-prop
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
  });

  const visible = ref(true);

  const isHover = ref(false);

  onMounted(() => {});

  //关闭弹窗
  function handleClose() {
    const exposed = getCurrentInstance()?.exposed;
    if (isFunction(props.beforeClose) && props.beforeClose) {
      //beforeClose执行返回true才允许关闭弹窗
      if (exposed?.handleClose) {
        exposed.handleClose();
      } else {
        visible.value = false;
      }
      if (isFunction(props.afterClose)) {
        //弹窗关闭后执行的逻辑
        props.afterClose();
      }
    }
  }

  function handleOpen() {
    visible.value = true;
  }

  function getStyleValue(value, defaultVal) {
    if (isNumber(value)) {
      return value + 'px';
    } else if (isString(value)) {
      return value;
    } else {
      return defaultVal;
    }
  }
  const styleTop = computed(() => getStyleValue(props.top, 10));
  const styleLeft = computed(() => (props.left ? props.left + 'px' : 0));
  const styleWidth = computed(() => getStyleValue(props.width, 'fit-content'));
  const styleHeight = computed(() => getStyleValue(props.height, 'fit-content'));
  const animationDuration = computed(() => {
    if (isNumber(props.duration)) {
      if (props.duration === 0) {
        return '0s';
      } else {
        return props.duration / 1000 + 's';
      }
    } else {
      //TODO:警告参数类型错误
      return '0s';
    }
  });
  defineExpose({
    handleClose,
    handleOpen,
  });
</script>

<style lang="scss" scoped>
  @import 'track-model';
  .trackModel {
    width: fit-content;
    height: fit-content;
    color: #fff;
    user-select: none;
    position: absolute;
    z-index: $model-z-index;
    //样式绑定
    top: v-bind(styleTop);
    left: v-bind(styleLeft);
  }

  .titleImage {
    position: absolute;
    top: 0;
    left: 0;
  }

  .trackModelContent {
    //样式绑定
    width: v-bind(styleWidth) !important;
    height: v-bind(styleHeight) !important;
    min-width: 240px;
    //通过样式绑定，让动画时间可以外部控制
    animation-duration: v-bind(animationDuration);
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
