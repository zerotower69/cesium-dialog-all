<script setup></script>

<template>
  <div class="content">
    <el-descriptions :column="1">
      <el-descriptions-item label="车站名称：">滁州北站</el-descriptions-item>
      <el-descriptions-item label="车站位置：">江苏省滁州市</el-descriptions-item>
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
