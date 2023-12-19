<template>
  <div>
    <div ref="cesiumRef" class="cesium-container"></div>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue';
  import { CesiumWorld } from '@common/common';

  const cesiumRef = ref();
  onMounted(() => {
    CesiumWorld.init(cesiumRef.value);
    setTimeout(() => {
      CesiumWorld.loadIcon();
      CesiumWorld.clickPoint(() => {
        //TODO:判断点位使用弹窗等
      });
    }, 1000);
  });
</script>

<style scoped>
  div {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  p {
    font-size: 40px;
  }
</style>
