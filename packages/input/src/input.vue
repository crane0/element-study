<template>
  <div :class="[
    type === 'textarea' ? 'el-textarea' : 'el-input',
    inputSize ? 'el-input--' + inputSize : '',
    {
      'is-disabled': inputDisabled,
      'is-exceed': inputExceed,
      'el-input-group': $slots.prepend || $slots.append,
      'el-input-group--append': $slots.append,
      'el-input-group--prepend': $slots.prepend,
      'el-input--prefix': $slots.prefix || prefixIcon,
      'el-input--suffix': $slots.suffix || suffixIcon || clearable || showPassword
    }
    ]"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <template v-if="type !== 'textarea'">
      <!-- 前置元素 -->
      <div class="el-input-group__prepend" v-if="$slots.prepend">
        <slot name="prepend"></slot>
      </div>
      <input
        :tabindex="tabindex"
        v-if="type !== 'textarea'"
        class="el-input__inner"
        v-bind="$attrs"
        :type="showPassword ? (passwordVisible ? 'text': 'password') : type"
        :disabled="inputDisabled"
        :readonly="readonly"
        :autocomplete="autoComplete || autocomplete"
        ref="input"
        @compositionstart="handleCompositionStart"
        @compositionupdate="handleCompositionUpdate"
        @compositionend="handleCompositionEnd"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
        :aria-label="label"
      >
      <!-- 前置内容 -->
      <span class="el-input__prefix" v-if="$slots.prefix || prefixIcon">
        <slot name="prefix"></slot>
        <i class="el-input__icon"
           v-if="prefixIcon"
           :class="prefixIcon">
        </i>
      </span>
      <!-- 后置内容 -->
      <span class="el-input__suffix" v-if="getSuffixVisible()">
        <span class="el-input__suffix-inner">
          <template v-if="!showClear || !showPwdVisible || !isWordLimitVisible">
            <slot name="suffix"></slot>
            <i class="el-input__icon"
              v-if="suffixIcon"
              :class="suffixIcon">
            </i>
          </template>
          <i v-if="showClear"
            class="el-input__icon el-icon-circle-close el-input__clear"
            @mousedown.prevent
            @click="clear"
          ></i>
          <i v-if="showPwdVisible"
            class="el-input__icon el-icon-view el-input__clear"
            @click="handlePasswordVisible"
          ></i>
          <span v-if="isWordLimitVisible" class="el-input__count">
            <span class="el-input__count-inner">
              {{ textLength }}/{{ upperLimit }}
            </span>
          </span>
        </span>
        <i class="el-input__icon"
          v-if="validateState"
          :class="['el-input__validateIcon', validateIcon]">
        </i>
      </span>
      <!-- 后置元素 -->
      <div class="el-input-group__append" v-if="$slots.append">
        <slot name="append"></slot>
      </div>
    </template>
    <textarea
      v-else
      :tabindex="tabindex"
      class="el-textarea__inner"
      @compositionstart="handleCompositionStart"
      @compositionupdate="handleCompositionUpdate"
      @compositionend="handleCompositionEnd"
      @input="handleInput"
      ref="textarea"
      v-bind="$attrs"
      :disabled="inputDisabled"
      :readonly="readonly"
      :autocomplete="autoComplete || autocomplete"
      :style="textareaStyle"
      @focus="handleFocus"
      @blur="handleBlur"
      @change="handleChange"
      :aria-label="label"
    >
    </textarea>
    <span v-if="isWordLimitVisible && type === 'textarea'" class="el-input__count">{{ textLength }}/{{ upperLimit }}</span>
  </div>
</template>
<script>
  import emitter from 'element-ui/src/mixins/emitter';
  import Migrating from 'element-ui/src/mixins/migrating';
  import calcTextareaHeight from './calcTextareaHeight';
  import merge from 'element-ui/src/utils/merge';
  import {isKorean} from 'element-ui/src/utils/shared';

  export default {
    name: 'ElInput',

    componentName: 'ElInput',

    mixins: [emitter, Migrating],

    inheritAttrs: false,

    inject: {
      elForm: {
        default: ''
      },
      elFormItem: {
        default: ''
      }
    },

    data() {
      return {
        textareaCalcStyle: {},
        hovering: false,
        focused: false,
        isComposing: false, // 判断输入的值 isKorean
        passwordVisible: false
      };
    },

    props: {
      value: [String, Number],
      size: String,
      resize: String,
      form: String,
      disabled: Boolean,
      readonly: Boolean,
      type: {
        type: String,
        default: 'text'
      },
      autosize: {
        type: [Boolean, Object],
        default: false
      },
      autocomplete: {
        type: String,
        default: 'off'
      },
      /** @Deprecated in next major version */
      autoComplete: {
        type: String,
        validator(val) {
          process.env.NODE_ENV !== 'production' &&
            console.warn('[Element Warn][Input]\'auto-complete\' property will be deprecated in next major version. please use \'autocomplete\' instead.');
          return true;
        }
      },
      validateEvent: { // 输入时，是否触发表单校验
        type: Boolean,
        default: true
      },
      suffixIcon: String,
      prefixIcon: String,
      label: String,
      clearable: {
        type: Boolean,
        default: false
      },
      showPassword: {
        type: Boolean,
        default: false
      },
      showWordLimit: {
        type: Boolean,
        default: false
      },
      tabindex: String
    },

    computed: {
      _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },
      // TODO 验证信息，之后再研究。
      validateState() {
        return this.elFormItem ? this.elFormItem.validateState : '';
      },
      // Form Attributes，表示是否在输入框中显示 校验结果反馈图标。一般是✔️或x
      needStatusIcon() {
        return this.elForm ? this.elForm.statusIcon : false;
      },
      // 验证图标
      validateIcon() {
        return {
          validating: 'el-icon-loading',
          success: 'el-icon-circle-check',
          error: 'el-icon-circle-close'
        }[this.validateState];
      },
      // textarea 内联样式，因为可能需要实时计算 height 和 minHeight。
      textareaStyle() {
        return merge({}, this.textareaCalcStyle, { resize: this.resize });
      },
      inputSize() {
        return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
      },
      inputDisabled() {
        return this.disabled || (this.elForm || {}).disabled;
      },
      // 主要作用在，监听这个属性的逻辑。
      nativeInputValue() {
        return this.value === null || this.value === undefined ? '' : String(this.value);
      },
      // 展示可清空的图标
      showClear() {
        return this.clearable &&
          !this.inputDisabled &&
          !this.readonly &&
          this.nativeInputValue &&
          (this.focused || this.hovering);
      },
      // 展示密码图标（eye）
      showPwdVisible() {
        return this.showPassword &&
          !this.inputDisabled &&
          !this.readonly &&
          (!!this.nativeInputValue || this.focused);
      },
      // 展示文本长度，需要同时指定 maxlength 原生属性，才能展示字数统计。
      isWordLimitVisible() {
        return this.showWordLimit &&
          this.$attrs.maxlength &&
          (this.type === 'text' || this.type === 'textarea') &&
          !this.inputDisabled &&
          !this.readonly &&
          !this.showPassword;
      },
      // 文本最大长度
      upperLimit() {
        return this.$attrs.maxlength;
      },
      textLength() {
        if (typeof this.value === 'number') {
          return String(this.value).length;
        }

        return (this.value || '').length;
      },
      // 当设置 maxlength 后，超出时是无法继续输入的。只有一种情况：当设置的初始值长度超过 maxlenth ，输入框也会显示所有内容。
      // 此时会加样式进行标注，这就是 inputExceed 的作用。
      inputExceed() {
        // show exceed style if length of initial value greater then maxlength
        return this.isWordLimitVisible &&
          (this.textLength > this.upperLimit);
      }
    },

    watch: {
      value(val) {
        this.$nextTick(this.resizeTextarea);
        if (this.validateEvent) {
          this.dispatch('ElFormItem', 'el.form.change', [val]);
        }
      },
      // native input value is set explicitly
      // do not use v-model / :value in template
      // see: https://github.com/ElemeFE/element/issues/14521
      nativeInputValue() {
        this.setNativeInputValue();
      },
      // when change between <input> and <textarea>,
      // update DOM dependent value and styles
      // https://github.com/ElemeFE/element/issues/14857
      type() {
        this.$nextTick(() => {
          this.setNativeInputValue();
          this.resizeTextarea();
          this.updateIconOffset();
        });
      }
    },

    methods: {
      focus() {
        this.getInput().focus();
      },
      blur() {
        this.getInput().blur();
      },
      // 参考 mixin Migrating
      getMigratingConfig() {
        return {
          props: {
            'icon': 'icon is removed, use suffix-icon / prefix-icon instead.',
            'on-icon-click': 'on-icon-click is removed.'
          },
          events: {
            'click': 'click is removed.'
          }
        };
      },
      handleBlur(event) {
        this.focused = false;
        this.$emit('blur', event);
        if (this.validateEvent) {
          this.dispatch('ElFormItem', 'el.form.blur', [this.value]);
        }
      },
      // 无效代码
      select() {
        this.getInput().select();
      },
      // textarea 才可以调整大小
      resizeTextarea() {
        // $isServer 表示当前 vue 实例是否运行在服务器（服务端渲染）
        if (this.$isServer) return;
        const { autosize, type } = this;
        if (type !== 'textarea') return;
        // 不需要自适应高度时，计算最小高度
        if (!autosize) {
          this.textareaCalcStyle = {
            minHeight: calcTextareaHeight(this.$refs.textarea).minHeight
          };
          return;
        }
        const minRows = autosize.minRows;
        const maxRows = autosize.maxRows;

        this.textareaCalcStyle = calcTextareaHeight(this.$refs.textarea, minRows, maxRows);
      },
      // 除了手动输入，其他方式触发DOM更新时，应该设置原生的 value
      setNativeInputValue() {
        const input = this.getInput();
        if (!input) return;
        if (input.value === this.nativeInputValue) return;
        input.value = this.nativeInputValue;
      },
      handleFocus(event) {
        this.focused = true;
        this.$emit('focus', event);
      },
      handleCompositionStart(event) {
        this.$emit('compositionstart', event);
        this.isComposing = true;
      },
      handleCompositionUpdate(event) {
        this.$emit('compositionupdate', event);
        const text = event.target.value;
        const lastCharacter = text[text.length - 1] || '';
        this.isComposing = !isKorean(lastCharacter);
      },
      handleCompositionEnd(event) {
        this.$emit('compositionend', event);
        if (this.isComposing) {
          this.isComposing = false;
          this.handleInput(event);
        }
      },
      handleInput(event) {
        // should not emit input during composition
        // see: https://github.com/ElemeFE/element/issues/10516
        if (this.isComposing) return;

        // hack for https://github.com/ElemeFE/element/issues/8548
        // should remove the following line when we don't support IE
        if (event.target.value === this.nativeInputValue) return;

        this.$emit('input', event.target.value);

        // ensure native input value is controlled
        // see: https://github.com/ElemeFE/element/issues/12850
        this.$nextTick(this.setNativeInputValue);
      },
      handleChange(event) {
        this.$emit('change', event.target.value);
      },
      calcIconOffset(place) {
        let elList = [].slice.call(this.$el.querySelectorAll(`.el-input__${place}`) || []);
        if (!elList.length) return;
        let el = null;
        for (let i = 0; i < elList.length; i++) {
          if (elList[i].parentNode === this.$el) {
            el = elList[i];
            break;
          }
        }
        if (!el) return;
        const pendantMap = {
          suffix: 'append',
          prefix: 'prepend'
        };

        const pendant = pendantMap[place];
        if (this.$slots[pendant]) {
          el.style.transform = `translateX(${place === 'suffix' ? '-' : ''}${this.$el.querySelector(`.el-input-group__${pendant}`).offsetWidth}px)`;
        } else {
          el.removeAttribute('style');
        }
      },
      updateIconOffset() {
        this.calcIconOffset('prefix');
        this.calcIconOffset('suffix');
      },
      clear() {
        this.$emit('input', '');
        this.$emit('change', '');
        this.$emit('clear');
      },
      handlePasswordVisible() {
        this.passwordVisible = !this.passwordVisible;
        this.$nextTick(() => {
          this.focus();
        });
      },
      getInput() {
        return this.$refs.input || this.$refs.textarea;
      },
      // 是否展示后置内容
      getSuffixVisible() {
        return this.$slots.suffix ||
          this.suffixIcon ||
          this.showClear ||
          this.showPassword ||
          this.isWordLimitVisible ||
          (this.validateState && this.needStatusIcon);
      }
    },

    created() {
      // 无效代码，因为当前实例上并没有自定义事件 inputSelect
      this.$on('inputSelect', this.select);
    },

    mounted() {
      this.setNativeInputValue();
      this.resizeTextarea();
      this.updateIconOffset();
    },

    updated() {
      this.$nextTick(this.updateIconOffset);
    }
  };
</script>
