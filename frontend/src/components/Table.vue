<template>
  <div class="table-responsive shadow-sm rounded bg-white p-3">
    <table class="table table-hover table-bordered align-middle">
      <thead class="table-light">
        <tr>
          <th v-for="header in headers" :key="header.value" class="text-uppercase fw-bold">
            {{ header.label }}
          </th>
          <th v-if="showActions" class="text-uppercase fw-bold">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, idx) in data" :key="row._id || idx">
          <td v-for="header in headers" :key="header.value">
            <slot :name="`cell-${header.value}`" :row="row">
              {{ row[header.value] }}
            </slot>
          </td>
          <td v-if="showActions">
            <slot name="actions" :row="row">

            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'DataTable',
  props: {
    headers: Array,
    data: Array,
    showActions: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedIndex: null,
    };
  },
  methods: {


    handleDelete(index) {
      this.$emit('onDelete', index);
    },
  },
  mounted() {
    if (this.data && this.data.length > 0) {
      console.log("Structure des données dans Table:", this.data[0]);
      console.log("Propriétés disponibles:", Object.keys(this.data[0]));
    }
  }
};
</script>
