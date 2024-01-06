<script setup>
</script>

<template>
  <div class="content">
    <el-descriptions :column="1">
      <el-descriptions-item label="医院名称：">皖东人民医院</el-descriptions-item>
      <el-descriptions-item label="医院建设年代：">2000年3月</el-descriptions-item>
      <el-descriptions-item label="医院等级：">二级综合医院</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<style scoped lang="scss">
  .content {
    padding: 40px 20px 20px 20px;
  }
  :deep(.el-descriptions) {
    .el-descriptions__body {
      color: white;
      background-color: transparent;
    }
    .el-descriptions__label,
    .el-descriptions__content {
      color: white;
    }
  }
</style>
