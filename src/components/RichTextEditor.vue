<template>
  <div class="rich-text-editor el-textarea">
    <div class="editor-toolbar">
      <el-button-group>
        <el-button @click="execCommand('bold')" :class="{ active: isActive('bold') }">
          <i class="fas fa-bold"></i>
        </el-button>
        <el-button @click="execCommand('italic')" :class="{ active: isActive('italic') }">
          <i class="fas fa-italic"></i>
        </el-button>
        <el-button @click="execCommand('underline')" :class="{ active: isActive('underline') }">
          <i class="fas fa-underline"></i>
        </el-button>
      </el-button-group>

      <el-button-group>
        <el-button @click="execCommand('insertUnorderedList')" :class="{ active: isActive('insertUnorderedList') }">
          <i class="fas fa-list-ul"></i>
        </el-button>
        <el-button @click="execCommand('insertOrderedList')" :class="{ active: isActive('insertOrderedList') }">
          <i class="fas fa-list-ol"></i>
        </el-button>
      </el-button-group>
    </div>

    <div
      class="editor-content"
      contenteditable="true"
      @input="updateContent"
      @paste="handlePaste"
      ref="editorContent"
      :placeholder="placeholder"
    ></div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'RichTextEditor',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Enter text here...'
    }
  },
  mounted() {
    this.$refs.editorContent.innerHTML = this.modelValue
  },
  methods: {
    execCommand(command) {
      document.execCommand(command, false, null)
      this.$refs.editorContent.focus()
    },
    isActive(command) {
      return document.queryCommandState(command)
    },
    updateContent(e) {
      this.$emit('update:modelValue', e.target.innerHTML)
    },
    handlePaste(e) {
      e.preventDefault()
      const text = e.clipboardData.getData('text/plain')
      document.execCommand('insertText', false, text)
    }
  },
  watch: {
    modelValue(newVal) {
      if (this.$refs.editorContent.innerHTML !== newVal) {
        this.$refs.editorContent.innerHTML = newVal
      }
    }
  }
})
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}

.editor-toolbar {
  padding: 8px;
  border-bottom: 1px solid var(--el-border-color);
  display: flex;
  gap: 8px;
  background-color: #f5f7fa;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.editor-content {
  min-height: 200px;
  padding: 12px;
  outline: none;
  overflow-y: auto;
}

.editor-content:empty:before {
  content: attr(placeholder);
  color: #999;
}

:deep(.el-button) {
  padding: 6px 8px;
}

:deep(.el-button.active) {
  background-color: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}
</style> 