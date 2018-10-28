<template>
  <div 
  v-if="open"
  class="bsBorder p20 posAbsolute menu">
    <div class="flex flexEnd">
      <i
      v-on:click="$emit('close')"
      class="fas fa-times-circle fs20 csrPointer"></i>
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'Menu',
  props: {
    open: Boolean,
    default: false
  }
}
</script>

<style scoped>
  .menu {
    top:  0;
    left: 0;
    width:  100vw;
    height: 100vh;
  }
</style>
