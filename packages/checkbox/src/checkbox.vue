<template>
  <label
    class="el-checkbox"
    :class="[
      border && checkboxSize ? 'el-checkbox--' + checkboxSize : '',
      { 'is-disabled': isDisabled },
      { 'is-bordered': border },
      { 'is-checked': isChecked }
    ]"
    :id="id"
  >
    <span class="el-checkbox__input"
      :class="{
        'is-disabled': isDisabled,
        'is-checked': isChecked,
        'is-indeterminate': indeterminate,
        'is-focus': focus
      }"
      :tabindex="indeterminate ? 0 : false"
      :role="indeterminate ? 'checkbox' : false"
      :aria-checked="indeterminate ? 'mixed' : false"
    >
      <span class="el-checkbox__inner"></span>
      <input
        v-if="trueLabel || falseLabel"
        class="el-checkbox__original"
        type="checkbox"
        :aria-hidden="indeterminate ? 'true' : 'false'"
        :name="name"
        :disabled="isDisabled"
        :true-value="trueLabel"
        :false-value="falseLabel"
        v-model="model"
        @change="handleChange"
        @focus="focus = true"
        @blur="focus = false">
      <input
        v-else
        class="el-checkbox__original"
        type="checkbox"
        :aria-hidden="indeterminate ? 'true' : 'false'"
        :disabled="isDisabled"
        :value="label"
        :name="name"
        v-model="model"
        @change="handleChange"
        @focus="focus = true"
        @blur="focus = false">
    </span>
    <span class="el-checkbox__label" v-if="$slots.default || label">
      <slot></slot>
      <template v-if="!$slots.default">{{label}}</template>
    </span>
  </label>
</template>
<script>
  import Emitter from 'element-ui/src/mixins/emitter';

  export default {
    name: 'ElCheckbox',

    mixins: [Emitter],

    inject: {
      elForm: {
        default: ''
      },
      elFormItem: {
        default: ''
      }
    },

    componentName: 'ElCheckbox',

    data() {
      return {
        selfModel: false,
        focus: false,
        isLimitExceeded: false
      };
    },

    computed: {
      model: {
        get() {
          /* 
            this.store = this._checkboxGroup ? this._checkboxGroup.value : this.value;
            当 this.isGroup 为 true 时，也就是只看 this._checkboxGroup.value 有没有值。

            所以当使用 checkbox-group 时
              却没有为 checkbox-group 绑定 value 时，则判断 checkbox 有没有绑定 value。
            反之，直接判断 checkbox 的 value。
            但 this.selfModel 的作用没有看到（每次修改 model 的值，同时也会修改 selfModel）。
          */
          return this.isGroup
            ? this.store : this.value !== undefined
              ? this.value : this.selfModel;
        },

        set(val) {
          /* 
            在 checkbox-group 中可以添加 min max 属性来设置可勾选的 checkbox 数量。
            此时 val 是数组，表示已勾选的 checkbox 数量。
          */
          if (this.isGroup) {
            this.isLimitExceeded = false;
            (this._checkboxGroup.min !== undefined &&
              val.length < this._checkboxGroup.min &&
              (this.isLimitExceeded = true));

            (this._checkboxGroup.max !== undefined &&
              val.length > this._checkboxGroup.max &&
              (this.isLimitExceeded = true));

            this.isLimitExceeded === false &&
            // 通知 checkbox-group 调用其自身的 input 事件。
            this.dispatch('ElCheckboxGroup', 'input', [val]);
          } else {
            // v-model 默认绑定 input 事件。
            this.$emit('input', val);
            this.selfModel = val;
          }
        }
      },

      isChecked() {
        // 精准判断 this.model 是 boolean。
        // 因为当使用 checkbox-group 时，this.model是数组。
        if ({}.toString.call(this.model) === '[object Boolean]') {
          return this.model;
        } else if (Array.isArray(this.model)) {
          return this.model.indexOf(this.label) > -1;
        // value 传 string 或 number 时，或是不传（在model.get方法中，this.value 为 falsy，取 this.selfModel 的值）。
        } else if (this.model !== null && this.model !== undefined) {
          return this.model === this.trueLabel;
        }
      },

      isGroup() {
        let parent = this.$parent;
        while (parent) {
          if (parent.$options.componentName !== 'ElCheckboxGroup') {
            parent = parent.$parent;
          } else {
            this._checkboxGroup = parent;
            return true;
          }
        }
        return false;
      },

      // 不用 isGroup 判断，为了避免当用了 checkbox-group，但却没有绑定 value 的情况。
      store() {
        return this._checkboxGroup ? this._checkboxGroup.value : this.value;
      },

      /* used to make the isDisabled judgment under max/min props */
      isLimitDisabled() {
        const { max, min } = this._checkboxGroup;
        return !!(max || min) &&
          (this.model.length >= max && !this.isChecked) ||
          (this.model.length <= min && this.isChecked);
      },

      isDisabled() {
        return this.isGroup
          ? this._checkboxGroup.disabled || this.disabled || (this.elForm || {}).disabled || this.isLimitDisabled
          : this.disabled || (this.elForm || {}).disabled;
      },

      _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },

      checkboxSize() {
        const temCheckboxSize = this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
        return this.isGroup
          ? this._checkboxGroup.checkboxGroupSize || temCheckboxSize
          : temCheckboxSize;
      }
    },

    props: {
      value: {},
      label: {},
      indeterminate: Boolean,
      disabled: Boolean,
      checked: Boolean,
      name: String,
      trueLabel: [String, Number], // 当不使用 checkbox-group 时生效。
      falseLabel: [String, Number],
      id: String, /* 当indeterminate为真时，为controls提供相关连的checkbox的id，表明元素间的控制关系*/
      controls: String, /* 当indeterminate为真时，为controls提供相关连的checkbox的id，表明元素间的控制关系*/
      border: Boolean,
      size: String
    },

    methods: {
      // 初始化时，设置需要被 checked 的 checkbox。
      addToStore() {
        if (
          Array.isArray(this.model) &&
          this.model.indexOf(this.label) === -1 // 使用 checkbox-group 时，判断是否存在。
        ) {
          this.model.push(this.label);
        } else {
          this.model = this.trueLabel || true;
        }
      },
      handleChange(ev) {
        if (this.isLimitExceeded) return;
        let value;
        if (ev.target.checked) {
          value = this.trueLabel === undefined ? true : this.trueLabel;
        } else {
          value = this.falseLabel === undefined ? false : this.falseLabel;
        }
        this.$emit('change', value, ev);
        this.$nextTick(() => {
          if (this.isGroup) {
            this.dispatch('ElCheckboxGroup', 'change', [this._checkboxGroup.value]);
          }
        });
      }
    },

    created() {
      this.checked && this.addToStore();
    },
    mounted() { // 为indeterminate元素 添加aria-controls 属性
      if (this.indeterminate) {
        this.$el.setAttribute('aria-controls', this.controls);
      }
    },

    watch: {
      value(value) {
        this.dispatch('ElFormItem', 'el.form.change', value);
      }
    }
  };
</script>
