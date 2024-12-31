<template>
  <div class="arguments-container">
    <!-- Add Argument Button -->
    <div v-if="user" class="argument-form-section">
      <el-button 
        v-if="!userHasArgument" 
        type="primary" 
        @click="showArgumentModal = true"
      >
        <i class="fas fa-plus"></i> Add Your Argument
      </el-button>
      
      <div v-else-if="userHasArgument" class="user-argument">
        <div class="argument-header">
          <span>Your Argument ({{ userArgument.argument_type === 'favor' ? 'In Favor' : 'Against' }})</span>
          <div class="argument-actions">
            <el-button type="text" @click="startEdit"><i class="fas fa-edit"></i></el-button>
            <el-button type="text" class="delete-btn" @click="deleteArgument"><i class="fas fa-trash"></i></el-button>
          </div>
        </div>
        <p>{{ userArgument.content }}</p>
      </div>
    </div>

    <!-- Arguments Display -->
    <div class="arguments-grid">
      <div class="argument-column">
        <div class="argument-section favor">
          <h4>
            <i class="fas fa-thumbs-up"></i>
            Arguments in Favor ({{ favorArguments.length }})
          </h4>
          <div class="arguments-list">
            <div v-for="arg in favorArguments" :key="arg.id" class="argument-card">
              <div class="argument-header">
                <span class="argument-author">{{ arg.userEmail }}</span>
                <span class="argument-date">{{ formatDate(arg.created_at) }}</span>
              </div>
              <p class="argument-content">{{ arg.content }}</p>
            </div>
            <div v-if="!favorArguments.length" class="no-arguments">
              <i class="fas fa-comment-slash"></i>
              <p>No arguments in favor yet</p>
            </div>
          </div>
        </div>
      </div>

      <div class="argument-column">
        <div class="argument-section against">
          <h4>
            <i class="fas fa-thumbs-down"></i>
            Arguments Against ({{ againstArguments.length }})
          </h4>
          <div class="arguments-list">
            <div v-for="arg in againstArguments" :key="arg.id" class="argument-card">
              <div class="argument-header">
                <span class="argument-author">{{ arg.userEmail }}</span>
                <span class="argument-date">{{ formatDate(arg.created_at) }}</span>
              </div>
              <p class="argument-content">{{ arg.content }}</p>
            </div>
            <div v-if="!againstArguments.length" class="no-arguments">
              <i class="fas fa-comment-slash"></i>
              <p>No arguments against yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Argument Modal -->
    <el-dialog
      v-model="showArgumentModal"
      :title="argumentForm.id ? 'Edit Argument' : 'Add Argument'"
      width="50%"
    >
      <el-form :model="argumentForm" label-position="top">
        <el-form-item label="Argument Type" required>
          <el-select 
            v-model="argumentForm.type" 
            placeholder="Select argument type"
            class="argument-type-select"
          >
            <el-option label="In Favor" value="favor" />
            <el-option label="Against" value="against" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="Your Argument" required>
          <el-input
            v-model="argumentForm.content"
            type="textarea"
            :rows="4"
            placeholder="Write your argument..."
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelEdit">Cancel</el-button>
          <el-button 
            type="primary" 
            @click="handleSubmit"
            :loading="isLoading"
          >
            {{ argumentForm.id ? 'Update' : 'Add' }} Argument
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { supabase } from '../supabase'
import { ElMessage } from 'element-plus'

export default defineComponent({
  name: 'ProposalArguments',
  props: {
    proposalId: {
      type: [String, Number],
      required: true
    },
    user: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      favorArguments: [],
      againstArguments: [],
      argumentForm: {
        type: 'favor',
        content: '',
        id: null
      },
      isLoading: false,
      showArgumentModal: false
    }
  },
  computed: {
    userArgument() {
      return [...this.favorArguments, ...this.againstArguments]
        .find(arg => arg.user_id === this.user?.id)
    },
    userHasArgument() {
      return !!this.userArgument
    }
  },
  mounted() {
    this.fetchArguments()
  },
  methods: {
    async fetchArguments() {
      const { data, error } = await supabase
        .from('proposal_arguments')
        .select(`*`)
        .eq('proposal_id', this.proposalId)
        .order('created_at', { ascending: false })
      
      if (error) {
        ElMessage.error('Error fetching arguments')
        return
      }

      const argumentsWithUserInfo = await Promise.all(
        data.map(async (arg) => {
          const { data: userData, error: userError } = await supabase
            .rpc('get_user_info_by_id', {
              user_id: arg.user_id
            })
          return {
            ...arg,
            userEmail: userError ? 'Unknown User' : userData[0].email
          }
        })
      )

      this.favorArguments = argumentsWithUserInfo.filter(arg => arg.argument_type === 'favor')
      this.againstArguments = argumentsWithUserInfo.filter(arg => arg.argument_type === 'against')
      
      // Emit the counts to parent
      this.$emit('arguments-updated', {
        favorCount: this.favorArguments.length,
        againstCount: this.againstArguments.length
      })
    },

    async handleSubmit() {
      if (!this.argumentForm.content.trim()) return

      this.isLoading = true
      try {
        if (this.argumentForm.id) {
          const { error } = await supabase
            .from('proposal_arguments')
            .update({ 
              content: this.argumentForm.content.trim(),
              argument_type: this.argumentForm.type
            })
            .eq('id', this.argumentForm.id)
            .eq('user_id', this.user.id)
            //.eq('argument_type', this.userArgument.argument_type)

          if (error) throw error
          ElMessage.success('Argument updated successfully')
        } else {
          const { error } = await supabase
            .from('proposal_arguments')
            .insert({
              proposal_id: parseInt(this.proposalId),
              user_id: this.user.id,
              argument_type: this.argumentForm.type,
              content: this.argumentForm.content.trim()
            })

          if (error) throw error
          ElMessage.success('Argument added successfully')
        }

        this.resetForm()
        await this.fetchArguments()
        this.showArgumentModal = false
      } catch (error) {
        ElMessage.error(`Error ${this.argumentForm.id ? 'updating' : 'adding'} argument`)
      } finally {
        this.isLoading = false
      }
    },

    startEdit() {
      const currentArg = this.userArgument
      this.argumentForm = {
        type: currentArg.argument_type,
        content: currentArg.content,
        id: currentArg.id
      }
      this.showArgumentModal = true
    },

    cancelEdit() {
      this.resetForm()
      this.showArgumentModal = false
    },

    resetForm() {
      this.argumentForm = {
        type: 'favor',
        content: '',
        id: null
      }
    },

    async deleteArgument() {
      try {
        const { error } = await supabase
          .from('proposal_arguments')
          .delete()
          .eq('id', this.userArgument.id)
          .eq('user_id', this.user.id)

        if (error) throw error

        await this.fetchArguments()
        ElMessage.success('Argument deleted successfully')
      } catch (error) {
        ElMessage.error('Error deleting argument')
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }
})
</script>

<style scoped>
.arguments-container {
  margin-top: 2rem;
}

.arguments-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.argument-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: 100%;
}

.argument-section h4 {
  margin: 0;
  padding: 1rem;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.argument-section.favor h4 i {
  color: #67C23A;
}

.argument-section.against h4 i {
  color: #F56C6C;
}

.arguments-list {
  padding: 1rem;
  max-height: 600px;
  overflow-y: auto;
}

.argument-card {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.argument-card:last-child {
  margin-bottom: 0;
}

.argument-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.argument-author {
  color: #409EFF;
  font-weight: 500;
}

.argument-date {
  color: #909399;
}

.argument-content {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

.no-arguments {
  text-align: center;
  color: #909399;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.no-arguments i {
  font-size: 1.5rem;
}

.delete-btn {
  color: #F56C6C !important; /* Element Plus danger color */
}

.delete-btn:hover {
  color: #f78989 !important;
}
/* Form Styling */
.argument-form-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.argument-type-select {
  width: 100%;
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  margin-top: 1rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .arguments-grid {
    grid-template-columns: 1fr;
  }

  .argument-section {
    margin-bottom: 1rem;
  }

  .arguments-list {
    max-height: 400px;
  }
}
</style> 