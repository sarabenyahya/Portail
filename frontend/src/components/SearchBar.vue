<template>
  <div class="mb-2">
    <input v-model="search" @input="onInput" type="text" class="form-control" :placeholder="placeholder" />
  </div>
</template>

<script>
export default {
  name: "SearchBar",
  props: {
    modelValue: {
      type: String,
      default: ""
    },
    placeholder: {
      type: String,
      default: "Rechercher..."
    }
  },
  data() {
    return {
      search: this.modelValue
    };
  },
  watch: {
    modelValue(newVal) {
      this.search = newVal;
    }
  },
  methods: {
    onInput() {
      this.$emit("update:modelValue", this.search);
    }
  }
};
</script>
