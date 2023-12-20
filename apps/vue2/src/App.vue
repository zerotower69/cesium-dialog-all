<template>
  <div id="app">
    <div class="cesium-container" ref="cesiumRef"></div>
  </div>
</template>

<script>
  import { CesiumWorld } from '@common/common';
  import { createTrackModel } from '@/component/TrackModel';
  import * as Cesium from 'cesium';
  export default {
    name: 'App',
    mounted() {
      const container = this.$refs.cesiumRef;
      CesiumWorld.init(container, {});
      CesiumWorld.loadIcon();
      CesiumWorld.clickPoint((pick, coordinate) => {
        if (pick?.id?.name === '滁州北站') {
          createTrackModel(
            {
              name: 'RailwayStation',
              props: {},
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
    },
  };
</script>

<style lang="scss"></style>
