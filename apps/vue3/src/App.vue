<template>
  <div>
    <div ref="cesiumRef" class="cesium-container"></div>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue';
  import { CesiumWorld } from '@common/common';
  import { createTrackModel } from '@/components/TrackModel';
  import * as Cesium from 'cesium';

  const cesiumRef = ref();
  onMounted(() => {
    CesiumWorld.init(cesiumRef.value);
    setTimeout(() => {
      CesiumWorld.loadIcon();
      CesiumWorld.clickPoint((pick, coordinate) => {
        //TODO:判断点位使用弹窗等
        // console.log(pick, coordinate);
        if (pick?.id?.name === '滁州北站') {
          // console.log('点击了滁州北站');
          createTrackModel(
            {
              name: 'RailwayStation',
            },
            {
              viewer: CesiumWorld.viewer,
              coordinate: {
                longitude: coordinate.longitude,
                latitude: coordinate.latitude,
              },
              autoScale: true,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 60000),
              scaleByDistance: new Cesium.NearFarScalar(0, 1.3, 6000, 0.8),
              offset: {
                y: -65,
              },
              fly: true,
              show: 'afterFly',
              flyOffset: {
                longitude: -0.011696,
                latitude: -0.097186,
                height: 6000,
              },
              duration: 0,
            },
            {
              title: '点位详情',
            },
          );
        } else if (pick?.id?.name === '皖东人民医院') {
          createTrackModel(
            {
              name: 'Hospital',
            },
            {
              viewer: CesiumWorld.viewer,
              coordinate: {
                longitude: coordinate.longitude,
                latitude: coordinate.latitude,
              },
              autoScale: true,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 60000),
              scaleByDistance: new Cesium.NearFarScalar(0, 1.3, 6000, 0.8),
              offset: {
                y: -65,
              },
              fly: true,
              show: 'afterFly',
              flyOffset: {
                longitude: -0.011696,
                latitude: -0.097186,
                height: 6000,
              },
              duration: 0,
            },
            {
              title: '点位详情',
            },
          );
        }
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
