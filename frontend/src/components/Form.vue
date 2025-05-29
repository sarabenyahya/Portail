<template>
  <form class="bg-white border rounded shadow p-4">
    <div v-for="(input, index) in fields" :key="index" class="mb-3">
      <label :for="input.name" class="form-label">{{ input.label }}</label>
      <input v-if="['text', 'email', 'number', 'password'].includes(input.type)"
        :type="input.type" :id="input.name" v-model="formData[input.name]"
        :placeholder="input.placeholder" class="form-control"
        :class="{ 'is-invalid': errors[input.name] }" @blur="validateField(input)" />
      <input v-else-if="input.type === 'date'" type="date" :id="input.name" v-model="formData[input.name]"
        class="form-control" :class="{ 'is-invalid': errors[input.name] }" @blur="validateField(input)" />
      <div v-else-if="input.type === 'file'" class="mt-2">
        <input type="file" :id="input.name" accept="image/*" @change="handleFileChange($event, input.name)"
          class="form-control" :class="{ 'is-invalid': errors[input.name] }" />
        <img v-if="imagePreviews[input.name]" :src="imagePreviews[input.name]" alt="Aperçu"
          class="rounded-circle border mt-2" style="width: 64px; height: 64px; object-fit: cover;" />
      </div>
      <div v-else-if="input.type === 'radio'" class="mt-2">
        <div class="form-check form-check-inline" v-for="option in input.options" :key="option.value">
          <input class="form-check-input" type="radio" :name="input.name" :value="option.value"
            v-model="formData[input.name]" @blur="validateField(input)" />
          <label class="form-check-label">{{ option.label }}</label>
        </div>
      </div>
      <div v-else-if="input.type === 'checkbox'" class="mt-2">
        <div class="form-check" v-for="option in input.options" :key="option.value">
          <input class="form-check-input" type="checkbox" :name="input.name" :value="option.value"
            v-model="formData[input.name]" @blur="validateField(input)" />
          <label class="form-check-label">{{ option.label }}</label>
        </div>
      </div>
      <div v-if="errors[input.name]" class="invalid-feedback d-block">
        {{ errors[input.name] }}
      </div>
    </div>
    <div v-if="formError" class="alert alert-danger mb-3">
      {{ formError }}
    </div>
    <button type="button" @click="validateAndSubmit" class="btn btn-primary w-100">
      {{ buttonText }}
    </button>
  </form>
</template>
<style scoped>
.bg-white { background: #fff; }
</style>

<script>
export default {
  name: 'FormBase',
  props: {
    fields: Array,
    buttonText: String,
    initialValues: {
      type: Object,
      default: () => ({}),
    },
    validationRules: {
      type: Object,
      default: () => ({}),
    }
  },
  data() {
    return {
      formData: {},
      errors: {},
      formError: '',
      touched: {},
      imagePreviews: {}, // Pour stocker les aperçus d'image
      files: {} // Pour stocker les fichiers sélectionnés
    };
  },
  created() {
    // Initialize form data
    this.fields.forEach((field) => {
      if (field.type === 'checkbox') {
        this.formData[field.name] = [];
      } else {
        this.formData[field.name] = '';
      }
      this.touched[field.name] = false;
    });

    // Then override with initial values if provided
    if (this.initialValues && Object.keys(this.initialValues).length > 0) {
      this.formData = { ...this.formData, ...this.initialValues };
    }
  },

  methods: {
    validateField(field) {
      this.touched[field.name] = true;
      let value = this.formData[field.name];
      const rules = this.validationRules[field.name] || [];

      // Correction pour les radios booléens
      if (field.type === 'radio' && (field.name === 'isAdmin')) {
        if (value === 'true') value = true;
        if (value === 'false') value = false;
      }

      // Clear previous error
      this.errors[field.name] = '';

      // Apply validation rules
      for (const rule of rules) {
        if (rule.required && (value === '' || value === undefined || value === null)) {
          this.errors[field.name] = rule.message || 'This field is required';
          break;
        }

        if (rule.minLength && value.length < rule.minLength) {
          this.errors[field.name] = rule.message || `Minimum length is ${rule.minLength}`;
          break;
        }

        if (rule.pattern && !rule.pattern.test(value)) {
          this.errors[field.name] = rule.message || 'Invalid format';
          break;
        }

        if (rule.custom && typeof rule.custom === 'function') {
          const customError = rule.custom(value);
          if (customError) {
            this.errors[field.name] = customError;
            break;
          }
        }
      }

      return !this.errors[field.name];
    },

    validateForm() {
      let isValid = true;
      this.formError = '';

      // Validate all fields
      for (const field of this.fields) {
        const fieldIsValid = this.validateField(field);
        isValid = isValid && fieldIsValid;
      }

      return isValid;
    },

    validateAndSubmit() {
      if (this.validateForm()) {
        this.submitForm();
      }
    },
    handleFileChange(event, fieldName) {
      const file = event.target.files[0];
      if (file) {
        this.files[fieldName] = file;
        this.formData[fieldName] = file;
        this.imagePreviews[fieldName] = URL.createObjectURL(file);
      } else {
        this.files[fieldName] = null;
        this.imagePreviews[fieldName] = null;
        this.formData[fieldName] = '';
      }
    },

    submitForm() {
      // Si un fichier est présent, on l’inclut dans l’émission de l’événement
      this.$emit('onSubmit', { ...this.formData, files: this.files });
    },

  },
};
</script>

<style scoped>
.form-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: #f8fafc;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.input-error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.form-error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: rgba(239, 68, 68, 0.1);
  border-radius: 0.375rem;
  text-align: center;
}

.submit-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
}

.submit-button:hover {
  background-color: #4338ca;
}

.radio-container,
.checkbox-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.radio-label,
.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-wrapper,
.checkbox-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
}

.radio-input,
.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.radio-custom {
  position: relative;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
}

.radio-input:checked~.radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  background-color: #4f46e5;
}

.checkbox-custom {
  position: relative;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.25rem;
}

.checkbox-input:checked~.checkbox-custom::after {
  content: '';
  position: absolute;
  top: 0.25rem;
  left: 0.4375rem;
  width: 0.375rem;
  height: 0.75rem;
  border: solid #4f46e5;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.option-text {
  font-size: 0.875rem;
}
</style>