<template>
  <transition name="track">
    <div v-if="visible" class="trackModel">
      <div class="trackModelContent">
        <div :style="props.contentStyle" class="content-box move-in">
          <slot name="title">
            <div class="trackModelTitle" :style="props.titleStyle">
              <div>{{ props.title }}</div>
            </div>
            <img class="titleImage" :src="props.titleImage" alt="title" />
          </slot>
          <div
            class="closeIcon"
            :style="props.closeStyle"
            @mouseover="isHover = true"
            @mouseleave="isHover = false"
            @click="handleClose"
          >
            <!--          由于这里hover事件可能比较频繁，用v-show改善性能-->
            <img v-show="!isHover" :src="props.closeImage" alt="closeImage" />
            <img v-show="isHover" :src="props.closeOverImage" alt="closeOverImage" />
          </div>
          <div class="trackModelBody">
            <slot></slot>
          </div>
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
    afterClose: {
      type: Function,
    },
    closeImage: {
      type: String,
      default: require('./img/icon_guanbi.png'),
    },
    closeOverImage: {
      type: String,
      default: require('./img/icon_guanbi_click.png'),
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
    titleImage: {
      type: String,
      default: require('./img/bg_tanchuangtitle.png'),
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
  defineExpose({
    handleClose,
    handleOpen,
  });
</script>

<style lang="scss" scoped>
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
    top: v-bind(styleTop);
    left: v-bind(styleLeft);
  }
  .content-box {
    //样式绑定
    width: v-bind(styleWidth) !important;
    height: v-bind(styleHeight) !important;
    //animation-duration: 1.5s;
    //animation-fill-mode: both;
    //animation-name: moveIn;
  }

  @keyframes moveIn {
    0% {
      opacity: 0;
      transform-origin: 0 100%;
      transform: scale(0.2);
    }
    100% {
      opacity: 1;
      transform-origin: 0 100%;
      transform: scale(1);
    }
  }
</style>
